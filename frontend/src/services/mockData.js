import { addDays, format, setHours, setMinutes, addMinutes, isBefore, isAfter, startOfDay, getDay } from 'date-fns';

// Mock data removed. Now using API.
// export const DOCTORS = ...

// In-memory storage for taken slots (simulated backend) - keeping for bookSlot if needed temporarily or if bookSlot is still mock
let takenSlots = [];

// export const getDoctors = () => DOCTORS;

// export const isWorkingDay = ...

// export const getAvailableSlots = ...

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
