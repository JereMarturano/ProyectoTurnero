import React, { useState, useEffect } from 'react';
import { callTurn, finishTurn, getCurrentTurn } from '../services/api';
import TurnDisplay from './TurnDisplay';
import Card from './ui/Card';
import Button from './ui/Button';
import { Megaphone, CheckCircle, RefreshCw, LogOut } from 'lucide-react';

function AdminView({ token }) {
  const [currentTurn, setCurrentTurn] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCurrentTurn = async () => {
    try {
      const turn = await getCurrentTurn();
      setCurrentTurn(turn);
    } catch (error) {
      setCurrentTurn(null);
    }
  };

  useEffect(() => {
    fetchCurrentTurn();
    const interval = setInterval(fetchCurrentTurn, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCallTurn = async () => {
    setLoading(true);
    try {
      await callTurn(token);
      await fetchCurrentTurn();
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleFinishTurn = async () => {
    setLoading(true);
    try {
      await finishTurn(token);
      await fetchCurrentTurn();
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-500">Gestione los turnos desde aquí</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <LogOut className="w-4 h-4 mr-2" />
          Salir
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col items-center justify-center p-8 space-y-6 bg-white">
          <h2 className="text-lg font-medium text-gray-900">Turno Actual</h2>
          <div className="p-8 bg-gray-50 rounded-2xl w-full flex justify-center border border-gray-100">
            <TurnDisplay turn={currentTurn} />
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Actualizando automáticamente
          </div>
        </Card>

        <Card className="p-8 space-y-6">
          <h2 className="text-lg font-medium text-gray-900">Acciones</h2>
          <div className="space-y-4">
            <Button
              onClick={handleCallTurn}
              disabled={loading}
              className="w-full py-4 text-lg flex items-center justify-center"
            >
              <Megaphone className="w-6 h-6 mr-3" />
              Llamar Siguiente Turno
            </Button>

            <Button
              onClick={handleFinishTurn}
              variant="secondary"
              disabled={loading || !currentTurn}
              className="w-full py-4 text-lg flex items-center justify-center"
            >
              <CheckCircle className="w-6 h-6 mr-3" />
              Finalizar Turno Actual
            </Button>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Estadísticas de Hoy</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">-</div>
                <div className="text-xs text-blue-600">Atendidos</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">-</div>
                <div className="text-xs text-green-600">Pendientes</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminView;
