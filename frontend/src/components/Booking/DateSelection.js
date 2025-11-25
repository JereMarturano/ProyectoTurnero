import React, { useState, useEffect } from 'react';
import { format, addDays, startOfToday, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAvailableSlots as getAvailableSlotsApi } from '../../services/api';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

const DateSelection = ({ doctor, onSelectSlot, onBack }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [slots, setSlots] = useState([]);

    // Helper to check if a date is a working day for the doctor
    const isWorkingDay = (date) => {
        if (!doctor || !doctor.schedules) return false;
        const dayOfWeek = getDay(date);
        // doctor.schedules is an array of Schedule objects.
        // Schedule object has dayOfWeek property.
        // Assuming backend returns dayOfWeek as int (0-6) matching JS.
        return doctor.schedules.some(s => s.dayOfWeek === dayOfWeek);
    };

    // Find first available day
    useEffect(() => {
        if (doctor && !selectedDate) {
            const today = startOfToday();
            for (let i = 0; i < 14; i++) {
                const date = addDays(today, i);
                if (isWorkingDay(date)) {
                    setSelectedDate(date);
                    break;
                }
            }
        }
    }, [doctor, selectedDate]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (doctor && selectedDate) {
                try {
                    // Format date for API if needed, or pass Date object if api.js handles it.
                    // api.js expects date to be passed to params.
                    // Let's pass ISO string to be safe.
                    const dateStr = format(selectedDate, 'yyyy-MM-dd');
                    const available = await getAvailableSlotsApi(doctor.id, dateStr);
                    setSlots(available);
                } catch (error) {
                    console.error("Error fetching slots:", error);
                    setSlots([]);
                }
            }
        };
        fetchSlots();
    }, [doctor, selectedDate]);

    // Generate next 14 days
    const dates = Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Seleccione Fecha y Hora</h2>
                <Button variant="ghost" onClick={onBack}>Cambiar Doctor</Button>
            </div>

            <Card className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                    <CalendarIcon className="w-5 h-5 text-primary-600" />
                    <span className="font-medium">Fechas Disponibles</span>
                </div>
                <div className="flex space-x-4 overflow-x-auto pb-4">
                    {dates.map((date) => {
                        const isAvailable = isWorkingDay(date);
                        const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');

                        return (
                            <button
                                key={date.toString()}
                                onClick={() => isAvailable && setSelectedDate(date)}
                                disabled={!isAvailable}
                                className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg border transition-colors ${isSelected
                                    ? 'bg-primary-600 text-white border-primary-600'
                                    : isAvailable
                                        ? 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 cursor-pointer'
                                        : 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
                                    }`}
                            >
                                <span className="text-xs uppercase">{format(date, 'EEE', { locale: es })}</span>
                                <span className="text-lg font-bold">{format(date, 'd')}</span>
                            </button>
                        );
                    })}
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <span className="font-medium">Horarios Disponibles</span>
                </div>
                {slots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {slots.map((slot) => (
                            <button
                                key={slot}
                                onClick={() => onSelectSlot(selectedDate, slot)}
                                className="py-2 px-4 rounded-md bg-white border border-gray-200 hover:border-primary-500 hover:text-primary-600 transition-colors text-sm font-medium"
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        {selectedDate
                            ? "No hay turnos disponibles para esta fecha."
                            : "Seleccione una fecha disponible."}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DateSelection;
