import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import Button from './ui/Button';
import { DOCTORS } from '../services/mockData';

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: '¡Hola! Soy el asistente virtual de Clinica Marturano. ¿En qué puedo ayudarte hoy?', sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

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

        // Especialidades
        if (lowerQuery.includes('cardiolog') || lowerQuery.includes('corazon')) {
            const cardios = DOCTORS.filter(d => d.specialty === 'Cardiología');
            return `Contamos con excelentes cardiólogos: ${cardios.map(d => d.name).join(', ')}. ¿Te gustaría reservar con alguno?`;
        }
        if (lowerQuery.includes('pediatra') || lowerQuery.includes('niño') || lowerQuery.includes('bebe')) {
            const peds = DOCTORS.filter(d => d.specialty === 'Pediatría');
            return `Para los más pequeños tenemos a: ${peds.map(d => d.name).join(', ')}.`;
        }
        if (lowerQuery.includes('dermatolog') || lowerQuery.includes('piel')) {
            const derms = DOCTORS.filter(d => d.specialty === 'Dermatología');
            return `Nuestros especialistas en piel son: ${derms.map(d => d.name).join(', ')}.`;
        }
        if (lowerQuery.includes('traumatolog') || lowerQuery.includes('hueso') || lowerQuery.includes('golpe')) {
            const traums = DOCTORS.filter(d => d.specialty === 'Traumatología');
            return `En traumatología atienden: ${traums.map(d => d.name).join(', ')}.`;
        }
        if (lowerQuery.includes('oftalmolog') || lowerQuery.includes('ojo') || lowerQuery.includes('vista')) {
            const oftal = DOCTORS.filter(d => d.specialty === 'Oftalmología');
            return `Para cuidar tu visión tenemos a: ${oftal.map(d => d.name).join(', ')}.`;
        }

        // Doctores específicos
        const foundDoctor = DOCTORS.find(d => lowerQuery.includes(d.name.toLowerCase().split(' ').pop().toLowerCase()));
        if (foundDoctor) {
            const daysMap = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo' };
            const daysStr = foundDoctor.days.map(d => daysMap[d]).join(', ');
            return `${foundDoctor.name} es especialista en ${foundDoctor.specialty}. Atiende los días ${daysStr} de ${foundDoctor.hours.start}:00 a ${foundDoctor.hours.end}:00.`;
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
