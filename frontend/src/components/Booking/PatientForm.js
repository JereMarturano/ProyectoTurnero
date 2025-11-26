import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Timer, AlertCircle } from 'lucide-react';

const PatientForm = ({ onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        dni: '',
        sex: '',
        email: '',
        phone: ''
    });
    const [errors, setErrors] = useState({});
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onCancel(); // Timeout
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onCancel]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'El nombre es obligatorio';
        else if (/\d/.test(formData.name)) newErrors.name = 'El nombre no debe contener números';

        if (!formData.surname) newErrors.surname = 'El apellido es obligatorio';
        else if (/\d/.test(formData.surname)) newErrors.surname = 'El apellido no debe contener números';

        if (!formData.dni) newErrors.dni = 'El DNI es obligatorio';
        else if (!/^\d{7,8}$/.test(formData.dni)) newErrors.dni = 'El DNI debe tener 7 u 8 dígitos numéricos';

        if (!formData.sex) newErrors.sex = 'El sexo es obligatorio';

        if (!formData.email) {
            newErrors.email = 'El email es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.phone) newErrors.phone = 'El teléfono es obligatorio';
        else if (!/^\d{8,15}$/.test(formData.phone)) newErrors.phone = 'El teléfono debe tener entre 8 y 15 dígitos numéricos';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (loading) return;
        if (validate()) {
            onSubmit(formData);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between bg-orange-50 p-4 rounded-lg border border-orange-200 text-orange-800">
                <div className="flex items-center space-x-2">
                    <Timer className="w-5 h-5" />
                    <span className="font-medium">Tiempo restante para completar:</span>
                </div>
                <span className="text-xl font-bold font-mono">{formatTime(timeLeft)}</span>
            </div>

            <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Datos del Paciente</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 ${errors.name ? 'border-red-500' : ''}`}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Apellido</label>
                            <input
                                type="text"
                                name="surname"
                                value={formData.surname}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 ${errors.surname ? 'border-red-500' : ''}`}
                            />
                            {errors.surname && <p className="mt-1 text-sm text-red-600">{errors.surname}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">DNI</label>
                            <input
                                type="text"
                                name="dni"
                                value={formData.dni}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 ${errors.dni ? 'border-red-500' : ''}`}
                            />
                            {errors.dni && <p className="mt-1 text-sm text-red-600">{errors.dni}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sexo</label>
                            <select
                                name="sex"
                                value={formData.sex}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 ${errors.sex ? 'border-red-500' : ''}`}
                            >
                                <option value="">Seleccionar...</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                                <option value="O">Otro</option>
                            </select>
                            {errors.sex && <p className="mt-1 text-sm text-red-600">{errors.sex}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 ${errors.email ? 'border-red-500' : ''}`}
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 ${errors.phone ? 'border-red-500' : ''}`}
                            />
                            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Procesando...' : 'Confirmar Turno'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default PatientForm;
