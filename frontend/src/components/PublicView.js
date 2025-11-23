import React, { useState, useEffect } from 'react';
import { getCurrentTurn } from '../services/api';
import connection, { startConnection } from '../services/signalr';
import TurnDisplay from './TurnDisplay';
import Card from './ui/Card';
import { Calendar, Clock, Info } from 'lucide-react';

function PublicView() {
  const [currentTurn, setCurrentTurn] = useState(null);

  const fetchCurrentTurn = async () => {
    try {
      const turn = await getCurrentTurn();
      setCurrentTurn(turn);
    } catch (error) {
      setCurrentTurn(null);
    }
  };

  useEffect(() => {
    startConnection();

    connection.on('ReceiveTurnUpdate', () => {
      fetchCurrentTurn();
    });

    fetchCurrentTurn();

    return () => {
      connection.off('ReceiveTurnUpdate');
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Turno Actual</h1>
        <p className="text-gray-500">Siga el estado de su turno en tiempo real</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Turn Display */}
        <Card className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-primary-50 to-white border-primary-100">
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="p-4 bg-primary-100 rounded-full">
              <Clock className="w-12 h-12 text-primary-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-primary-900 mb-2">Llamando a</h3>
              <div className="text-5xl font-bold text-primary-600 tracking-tight">
                <TurnDisplay turn={currentTurn} />
              </div>
            </div>
            {currentTurn && (
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
                En atención
              </div>
            )}
          </div>
        </Card>

        {/* Info / Sidebar */}
        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-100">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900">Información Importante</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Por favor, aguarde a ser llamado por pantalla. Si tiene dudas, acérquese a recepción.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <h4 className="font-medium text-gray-900">Horarios de Atención</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Lunes a Viernes</span>
                <span className="font-medium">8:00 - 20:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sábados</span>
                <span className="font-medium">9:00 - 13:00</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PublicView;
