import React, { useState, useEffect } from 'react';
import { format, addDays, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAvailableSlots } from '../../services/mockData';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

const DateSelection = ({ doctor, onSelectSlot, onBack }) => {
    const [selectedDate, setSelectedDate] = useState(startOfToday());
    const [slots, setSlots] = useState([]);

    useEffect(() => {
        if (doctor && selectedDate) {
            const available = getAvailableSlots(doctor.id, selectedDate);
            setSlots(available);
        }
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
                    {dates.map((date) => (
                        <button
                            key={date.toString()}
                            onClick={() => setSelectedDate(date)}
                            className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg border transition-colors ${format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                                    ? 'bg-primary-600 text-white border-primary-600'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                                }`}
                        >
                            <span className="text-xs uppercase">{format(date, 'EEE', { locale: es })}</span>
                            <span className="text-lg font-bold">{format(date, 'd')}</span>
                        </button>
                    ))}
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
                        No hay turnos disponibles para esta fecha.
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DateSelection;
