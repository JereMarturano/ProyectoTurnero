import React from 'react';
import Card from '../ui/Card';
import { User } from 'lucide-react';

const DoctorSelection = ({ doctors, onSelect }) => {
    // Group doctors by specialty
    const groupedDoctors = doctors.reduce((acc, doctor) => {
        if (!acc[doctor.specialty]) {
            acc[doctor.specialty] = [];
        }
        acc[doctor.specialty].push(doctor);
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            {Object.entries(groupedDoctors).map(([specialty, specialtyDoctors]) => (
                <div key={specialty}>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 border-gray-200">
                        {specialty}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {specialtyDoctors.map((doctor) => (
                            <Card
                                key={doctor.id}
                                className="cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-primary-500 hover:-translate-y-1"
                                onClick={() => onSelect(doctor)}
                            >
                                <div className="flex flex-col items-center text-center space-y-4 p-4">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center border-4 border-primary-50 shadow-sm">
                                        {doctor.image ? (
                                            <img
                                                src={doctor.image}
                                                alt={doctor.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-12 h-12 text-primary-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>
                                        <p className="text-primary-600 font-medium">{doctor.specialty}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DoctorSelection;
