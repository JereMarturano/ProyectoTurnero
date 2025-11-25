import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import Button from './ui/Button';
import { getDoctors } from '../services/api';

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: '¡Hola! Soy el asistente virtual de Clinica Marturano. ¿En qué puedo ayudarte hoy?', sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const docs = await getDoctors();
                setDoctors(docs);
            } catch (error) {
                console.error("Error fetching doctors for chat:", error);
            }
        };
        fetchDoctors();
    }, []);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        // Add user message
        const userMessage = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Simulate AI processing
        setTimeout(() => {
            const response = generateResponse(userMessage.text);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: response, sender: 'bot' }]);
            setIsTyping(false);
        }, 1000);
    };

    const generateResponse = (query) => {
        const lowerQuery = query.toLowerCase();

        // Saludos
        if (lowerQuery.match(/\b(hola|buen|buenos|buenas)\b/)) {
            return "¡Hola! ¿Buscas algún especialista en particular o tienes alguna duda sobre nuestros servicios?";
        }

        // Consultas generales
        if (lowerQuery.match(/duda|consulta|pregunta/)) {
            return "¡Claro! Dime cuál es tu duda y trataré de ayudarte. Puedes preguntarme sobre especialidades, médicos, horarios, obras sociales o cómo sacar un turno.";
        }

        // Listado de especialidades
        if (lowerQuery.includes('especialidad')) {
            const specialties = [...new Set(doctors.map(d => d.specialty))];
            return `Nuestras especialidades son: ${specialties.join(', ')}. ¿Te interesa alguna en particular?`;
        }

        // Listado de médicos general
        if (lowerQuery.includes('medico') || lowerQuery.includes('doctor')) {
            return "Contamos con especialistas en Cardiología, Pediatría, Dermatología, Traumatología, Oftalmología, Ginecología y Medicina General. ¿Buscas alguno en especial?";
        }

        // Horarios generales
        if (lowerQuery.includes('horario') || lowerQuery.includes('hora')) {
            return "Nuestros médicos atienden en distintos horarios, generalmente entre las 8:00 y las 20:00. Si buscas un especialista en particular, puedo decirte sus horarios específicos.";
        }

        // Identificar especialidades dinámicamente y por keywords
        const specialties = [...new Set(doctors.map(d => d.specialty))];
        const keywords = {
            'corazon': 'Cardiología',
            'cardio': 'Cardiología',
            'niño': 'Pediatría',
            'bebe': 'Pediatría',
            'pedia': 'Pediatría',
            'piel': 'Dermatología',
            'derma': 'Dermatología',
            'hueso': 'Traumatología',
            'golpe': 'Traumatología',
            'trauma': 'Traumatología',
            'ojo': 'Oftalmología',
            'vista': 'Oftalmología',
            'oftalmo': 'Oftalmología',
            'mujer': 'Ginecología',
            'gineco': 'Ginecología',
            'clinico': 'Medicina General',
            'general': 'Medicina General',
            'familia': 'Medicina General'
        };

        let targetSpecialty = specialties.find(s => lowerQuery.includes(s.toLowerCase()));

        if (!targetSpecialty) {
            for (const [key, value] of Object.entries(keywords)) {
                if (lowerQuery.includes(key)) {
                    targetSpecialty = value;
                    break;
                }
            }
        }

        if (targetSpecialty) {
            const specialtyDoctors = doctors.filter(d => d.specialty === targetSpecialty);
            if (specialtyDoctors.length > 0) {
                return `Para ${targetSpecialty} contamos con: ${specialtyDoctors.map(d => d.name).join(', ')}. ¿Te gustaría reservar con alguno?`;
            }
        }

        // Doctores específicos
        const foundDoctor = doctors.find(d => lowerQuery.includes(d.name.toLowerCase().split(' ').pop().toLowerCase()));
        if (foundDoctor) {
            const daysMap = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo' };
            // Handle schedules if available, otherwise fallback or generic
            if (foundDoctor.schedules && foundDoctor.schedules.length > 0) {
                const daysStr = foundDoctor.schedules.map(s => daysMap[s.dayOfWeek]).filter(Boolean).join(', ');
                // Just showing first schedule time for simplicity or range
                const firstSchedule = foundDoctor.schedules[0];
                // Time is TimeSpan in backend, likely string "HH:mm:ss" in JSON.
                // Let's assume it comes as string.
                return `${foundDoctor.name} es especialista en ${foundDoctor.specialty}. Atiende los días ${daysStr}.`;
            } else {
                return `${foundDoctor.name} es especialista en ${foundDoctor.specialty}.`;
            }
        }

        // Precios / Obras sociales (Simulado)
        if (lowerQuery.includes('precio') || lowerQuery.includes('costo') || lowerQuery.includes('pagar')) {
            return "Los costos varían según la especialidad y tu cobertura médica. Aceptamos la mayoría de las obras sociales y prepagas. Para un valor exacto, por favor consulta en recepción.";
        }

        if (lowerQuery.includes('obra social') || lowerQuery.includes('prepaga')) {
            return "Trabajamos con OSDE, Swiss Medical, Galeno, y muchas más. Puedes cargar los datos de tu obra social al momento de reservar.";
        }

        // Ayuda general
        if (lowerQuery.includes('turno') || lowerQuery.includes('reserva')) {
            return "Para reservar un turno, selecciona primero la especialidad o el médico en la pantalla principal, luego elige el día y horario que te convenga.";
        }

        return "Disculpa, no entendí bien tu consulta. ¿Podrías preguntar de otra forma? Puedo informarte sobre nuestros médicos, especialidades y horarios.";
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-4 right-24 md:bottom-8 md:right-32 z-[90] p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-primary-600'
                    } text-white`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-4 md:bottom-28 md:right-8 z-[90] w-[90vw] md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-fade-in-up" style={{ maxHeight: '600px', height: '70vh' }}>
                    {/* Header */}
                    <div className="bg-primary-600 p-4 flex items-center gap-3 text-white">
                        <div className="bg-white/20 p-2 rounded-full">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold">Asistente Virtual</h3>
                            <p className="text-xs text-primary-100">En línea ahora</p>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user'
                                        ? 'bg-primary-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                                        }`}
                                >
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Escribe tu consulta..."
                            className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                        />
                        <Button type="submit" className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatAssistant;
