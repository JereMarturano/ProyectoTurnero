import { addDays, format, setHours, setMinutes, addMinutes, isBefore, isAfter, startOfDay, getDay } from 'date-fns';

export const DOCTORS = [
    // Existing Doctors
    {
        id: 1,
        name: 'Dr. Alejandro Zurita',
        specialty: 'Medicina General',
        days: [1, 4, 5], // Mon, Thu, Fri
        hours: { start: 10, end: 18 },
        duration: 45,
        image: '/doc_male_1.png'
    },
    {
        id: 3,
        name: 'Dra. Lopez',
        specialty: 'Ginecología',
        days: [1, 3, 5], // Mon, Wed, Fri
        hours: { start: 9, end: 16 },
        duration: 30,
        image: '/doc_female_1.png'
    },
    // New Fantasy Doctors - Cardiología
    {
        id: 4,
        name: 'Dr. Ricardo Favaloro',
        specialty: 'Cardiología',
        days: [1, 2, 3, 4, 5],
        hours: { start: 8, end: 14 },
        duration: 30,
        image: '/doc_male_2.png'
    },
    {
        id: 5,
        name: 'Dra. Cecilia Grierson',
        specialty: 'Cardiología',
        days: [2, 4, 6],
        hours: { start: 14, end: 20 },
        duration: 40,
        image: '/doc_female_1.png'
    },
    {
        id: 6,
        name: 'Dr. Esteban Laureano',
        specialty: 'Cardiología',
        days: [1, 3, 5],
        hours: { start: 10, end: 16 },
        duration: 30,
        image: '/doc_male_1.png'
    },
    // Pediatría
    {
        id: 7,
        name: 'Dra. Gabriela Mistral',
        specialty: 'Pediatría',
        days: [1, 2, 3, 4, 5],
        hours: { start: 9, end: 15 },
        duration: 20,
        image: '/doc_female_1.png'
    },
    {
        id: 8,
        name: 'Dr. René Favaloro',
        specialty: 'Pediatría',
        days: [1, 3, 5],
        hours: { start: 15, end: 19 },
        duration: 30,
        image: '/doc_male_2.png'
    },
    {
        id: 9,
        name: 'Dra. Julieta Lanteri',
        specialty: 'Pediatría',
        days: [2, 4, 6],
        hours: { start: 10, end: 14 },
        duration: 20,
        image: '/doc_female_1.png'
    },
    // Dermatología
    {
        id: 10,
        name: 'Dr. Pedro Mallo',
        specialty: 'Dermatología',
        days: [1, 3, 5],
        hours: { start: 14, end: 18 },
        duration: 15,
        image: '/doc_male_1.png'
    },
    {
        id: 11,
        name: 'Dra. Alicia Moreau',
        specialty: 'Dermatología',
        days: [2, 4],
        hours: { start: 9, end: 13 },
        duration: 20,
        image: '/doc_female_1.png'
    },
    {
        id: 12,
        name: 'Dr. Salvador Mazza',
        specialty: 'Dermatología',
        days: [1, 2, 3, 4, 5],
        hours: { start: 16, end: 20 },
        duration: 15,
        image: '/doc_male_2.png'
    },
    // Traumatología
    {
        id: 13,
        name: 'Dr. Ramón Carrillo',
        specialty: 'Traumatología',
        days: [1, 3, 5],
        hours: { start: 8, end: 12 },
        duration: 30,
        image: '/doc_male_1.png'
    },
    {
        id: 14,
        name: 'Dra. Elvira Rawson',
        specialty: 'Traumatología',
        days: [2, 4, 6],
        hours: { start: 14, end: 19 },
        duration: 30,
        image: '/doc_female_1.png'
    },
    {
        id: 15,
        name: 'Dr. Bernardo Houssay',
        specialty: 'Traumatología',
        days: [1, 2, 3, 4, 5],
        hours: { start: 10, end: 16 },
        duration: 40,
        image: '/doc_male_2.png'
    },
    // Oftalmología
    {
        id: 16,
        name: 'Dra. Petrona Eyle',
        specialty: 'Oftalmología',
        days: [1, 3, 5],
        hours: { start: 9, end: 13 },
        duration: 20,
        image: '/doc_female_1.png'
    },
    {
        id: 17,
        name: 'Dr. Luis Agote',
        specialty: 'Oftalmología',
        days: [2, 4],
        hours: { start: 15, end: 19 },
        duration: 20,
        image: '/doc_male_1.png'
    },
    {
        id: 18,
        name: 'Dr. Cosme Argerich',
        specialty: 'Oftalmología',
        days: [1, 2, 3, 4, 5],
        hours: { start: 10, end: 14 },
        duration: 15,
        image: '/doc_male_2.png'
    }
];

// In-memory storage for taken slots (simulated backend)
let takenSlots = [];

export const getDoctors = () => DOCTORS;

export const isWorkingDay = (doctorId, date) => {
    const doctor = DOCTORS.find(d => d.id === doctorId);
    if (!doctor) return false;
    const dayOfWeek = getDay(date);
    return doctor.days.includes(dayOfWeek);
};

export const getAvailableSlots = (doctorId, date) => {
    const doctor = DOCTORS.find(d => d.id === doctorId);
    if (!doctor) return [];

    if (!isWorkingDay(doctorId, date)) return [];

    const slots = [];
    let currentTime = setMinutes(setHours(startOfDay(date), doctor.hours.start), 0);
    const endTime = setMinutes(setHours(startOfDay(date), doctor.hours.end), 0);
    const now = new Date();
    const isToday = format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

    while (isBefore(currentTime, endTime)) {
        const slotTime = format(currentTime, 'HH:mm');
        const isTaken = takenSlots.some(slot =>
            slot.doctorId === doctorId &&
            slot.date === format(date, 'yyyy-MM-dd') &&
            slot.time === slotTime
        );

        if (!isTaken) {
            // If it's today, only add slots that are in the future
            if (!isToday || isAfter(currentTime, now)) {
                slots.push(slotTime);
            }
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
