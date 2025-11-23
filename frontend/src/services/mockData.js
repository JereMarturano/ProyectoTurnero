import { addDays, format, setHours, setMinutes, addMinutes, isBefore, isAfter, startOfDay, getDay } from 'date-fns';

export const DOCTORS = [
    {
        id: 1,
        name: 'Dr. Alejandro Zurita',
        specialty: 'General',
        days: [1, 4, 5], // Mon, Thu, Fri
        hours: { start: 10, end: 18 },
        duration: 45
    },
    {
        id: 2,
        name: 'Dra. Dip Lourdes',
        specialty: 'Inmunóloga',
        days: [0, 1, 2, 3, 4, 5, 6], // All days
        hours: { start: 16, end: 21 },
        duration: 45
    },
    {
        id: 3,
        name: 'Dra. Lopez',
        specialty: 'Ginecóloga',
        days: [1, 3, 5], // Mon, Wed, Fri
        hours: { start: 9, end: 16 },
        duration: 30
    }
];

// In-memory storage for taken slots (simulated backend)
let takenSlots = [];

export const getDoctors = () => DOCTORS;

export const getAvailableSlots = (doctorId, date) => {
    const doctor = DOCTORS.find(d => d.id === doctorId);
    if (!doctor) return [];

    const dayOfWeek = getDay(date);
    if (!doctor.days.includes(dayOfWeek)) return [];

    const slots = [];
    let currentTime = setMinutes(setHours(startOfDay(date), doctor.hours.start), 0);
    const endTime = setMinutes(setHours(startOfDay(date), doctor.hours.end), 0);

    while (isBefore(currentTime, endTime)) {
        const slotTime = format(currentTime, 'HH:mm');
        const isTaken = takenSlots.some(slot =>
            slot.doctorId === doctorId &&
            slot.date === format(date, 'yyyy-MM-dd') &&
            slot.time === slotTime
        );

        if (!isTaken) {
            slots.push(slotTime);
        }

        currentTime = addMinutes(currentTime, doctor.duration);
    }

    return slots;
};

export const bookSlot = (doctorId, date, time, patientData) => {
    const slot = {
        doctorId,
        date: format(date, 'yyyy-MM-dd'),
        time,
        patient: patientData
    };
    takenSlots.push(slot);
    return Promise.resolve({ success: true, slot });
};
