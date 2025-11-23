import React from 'react';
import Card from '../ui/Card';
import { User } from 'lucide-react';

const DoctorSelection = ({ doctors, onSelect }) => {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
                <Card
                    key={doctor.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-primary-500"
                    onClick={() => onSelect(doctor)}
                >
                    <div className="flex flex-col items-center text-center space-y-4 p-4">
                        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-10 h-10 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>
                            <p className="text-primary-600 font-medium">{doctor.specialty}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default DoctorSelection;
