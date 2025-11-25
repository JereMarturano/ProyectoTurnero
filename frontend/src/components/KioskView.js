import React, { useState, useEffect } from 'react';
import { getDoctors as getDoctorsApi, createTurn as createTurnApi } from '../services/api';
import { bookSlot } from '../services/mockData'; // Keeping mock for reference if needed, but unused now
import DoctorSelection from './Booking/DoctorSelection';
import DateSelection from './Booking/DateSelection';
import PatientForm from './Booking/PatientForm';
import Card from './ui/Card';
import Button from './ui/Button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Signature from './ui/Signature';
import ChatAssistant from './ChatAssistant';
import emailjs from '@emailjs/browser';

function KioskView({ onBack }) {
    const [step, setStep] = useState('doctors'); // doctors, date, form, success
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingData, setBookingData] = useState(null);
    const [doctors, setDoctors] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                const docs = await getDoctorsApi();
                setDoctors(docs);
                setError(null);
            } catch (error) {
                console.error("Error fetching doctors:", error);
                setError("No se pudieron cargar los profesionales. Por favor, intente nuevamente.");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const handleDoctorSelect = (doctor) => {
        setSelectedDoctor(doctor);
        setStep('date');
    };

    const handleSlotSelect = (date, time) => {
        setSelectedSlot({ date, time });
        setStep('form');
    };

    const handleFormSubmit = async (patientData) => {
        try {
            // Prepare data for the backend
            const turnData = {
                doctorId: selectedDoctor.id,
                date: selectedSlot.date, // Backend expects DateTime
                time: selectedSlot.time,
                patientName: patientData.name,
                patientSurname: patientData.surname,
                patientDni: patientData.dni,
                patientSex: patientData.sex,
                patientEmail: patientData.email,
                patientPhone: patientData.phone,
                status: 0 // Waiting
            };

            await createTurnApi(turnData);

            // Intentar enviar correo electrónico
            try {
                const templateParams = {
                    to_name: patientData.name + ' ' + patientData.surname,
                    to_email: patientData.email,
                    email: patientData.email,
                    doctor: selectedDoctor.name,
                    fecha: selectedSlot.date.toLocaleDateString(),
                    hora: selectedSlot.time,
                    clinic_name: "Clinica Marturano"
                };

                // Envío real de correo con EmailJS
                await emailjs.send('SimulacionTurneroJ', 'template_tmqjfq5', templateParams, 'J-7wHsULyTlL0baxe');

                console.log('✅ Correo de confirmación enviado exitosamente a:', patientData.email);

            } catch (emailError) {
                console.error('Error al intentar enviar el correo:', emailError);
                // No bloqueamos el flujo si falla el correo, pero lo registramos
            }

            setBookingData({ ...patientData, doctor: selectedDoctor, slot: selectedSlot });
            setStep('success');
        } catch (error) {
            console.error('Booking failed', error);
            setError("Hubo un error al reservar el turno. Por favor, intente nuevamente.");
        }
    };

    const handleReset = () => {
        setStep('doctors');
        setSelectedDoctor(null);
        setSelectedSlot(null);
        setBookingData(null);
    };

    return (
        <div className="min-h-screen bg-primary-50 flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {step !== 'success' && (
                            <Button variant="ghost" onClick={step === 'doctors' ? onBack : () => setStep(prev => prev === 'form' ? 'date' : 'doctors')}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        )}
                        <span className="text-xl font-bold text-gray-900">
                            {step === 'doctors' && 'Seleccione un Profesional'}
                            {step === 'date' && `Turno con ${selectedDoctor?.name} `}
                            {step === 'form' && 'Complete sus Datos'}
                            {step === 'success' && '¡Turno Confirmado!'}
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {step === 'doctors' && (
                    <>
                        {loading && (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                            </div>
                        )}

                        {error && (
                            <div className="text-center py-12">
                                <p className="text-red-500 text-lg mb-4">{error}</p>
                                <Button onClick={() => window.location.reload()}>Reintentar</Button>
                            </div>
                        )}

                        {!loading && !error && doctors.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No hay profesionales disponibles en este momento.</p>
                            </div>
                        )}

                        {!loading && !error && doctors.length > 0 && (
                            <DoctorSelection doctors={doctors} onSelect={handleDoctorSelect} />
                        )}
                    </>
                )}

                {step === 'date' && (
                    <DateSelection
                        doctor={selectedDoctor}
                        onSelectSlot={handleSlotSelect}
                        onBack={() => setStep('doctors')}
                    />
                )}

                {step === 'form' && (
                    <PatientForm
                        onSubmit={handleFormSubmit}
                        onCancel={() => setStep('date')}
                    />
                )}

                {step === 'success' && (
                    <div className="max-w-md mx-auto">
                        <Card className="text-center py-12 px-6 shadow-xl">
                            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Turno Reservado!</h1>
                            <p className="text-gray-500 mb-8">
                                Se ha enviado un comprobante a {bookingData?.email}
                            </p>

                            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Profesional</span>
                                    <span className="font-medium text-gray-900">{selectedDoctor?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Fecha</span>
                                    <span className="font-medium text-gray-900">{selectedSlot?.date.toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Hora</span>
                                    <span className="font-medium text-gray-900">{selectedSlot?.time}</span>
                                </div>
                            </div>

                            <Button onClick={handleReset} className="w-full">
                                Volver al Inicio
                            </Button>
                        </Card>
                    </div>
                )}
            </main>
            <Signature />
            <ChatAssistant />
        </div>
    );
}

export default KioskView;
