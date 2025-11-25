import React, { useState, useEffect } from 'react';
import { callTurn, finishTurn, getCurrentTurn, getTurnStats } from '../services/api';
import TurnDisplay from './TurnDisplay';
import Card from './ui/Card';
import Button from './ui/Button';
import { Megaphone, CheckCircle, RefreshCw, LogOut } from 'lucide-react';

function AdminView({ token }) {
  const [currentTurn, setCurrentTurn] = useState(null);
  const [stats, setStats] = useState({ attended: 0, pending: 0 });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [turn, statsData] = await Promise.all([
        getCurrentTurn(),
        getTurnStats()
      ]);
      setCurrentTurn(turn);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCallTurn = async () => {
    setLoading(true);
    try {
      await callTurn(token);
      await fetchData();
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
      await fetchData();
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
        <Card className="flex flex-col p-8 space-y-6 bg-white">
          <h2 className="text-lg font-medium text-gray-900">Turno Actual</h2>

          {currentTurn ? (
            <div className="space-y-6 w-full">
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-600 font-medium mb-1">Estás atendiendo a:</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {currentTurn.patientName} {currentTurn.patientSurname}
                </h3>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">DNI</span>
                    <span className="font-medium text-gray-900">{currentTurn.patientDni}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Hora del Turno</span>
                    <span className="font-medium text-gray-900">
                      {currentTurn.date ? new Date(currentTurn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Sexo</span>
                    <span className="font-medium text-gray-900">{currentTurn.patientSex || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Teléfono</span>
                    <span className="font-medium text-gray-900">{currentTurn.patientPhone || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Estado del horario:</span>
                <ScheduleAdherence scheduledTime={currentTurn.date} />
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-lg">No hay turno en curso</p>
              <p className="text-sm mt-1">Llame al siguiente turno para comenzar</p>
            </div>
          )}

          <div className="flex items-center justify-center text-sm text-gray-500 pt-4">
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
                <div className="text-2xl font-bold text-blue-600">{stats.attended}</div>
                <div className="text-xs text-blue-600">Atendidos</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.pending}</div>
                <div className="text-xs text-green-600">Pendientes</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ScheduleAdherence({ scheduledTime }) {
  const [diff, setDiff] = useState(0);

  useEffect(() => {
    if (!scheduledTime) return;

    const calculateDiff = () => {
      const now = new Date();
      const scheduled = new Date(scheduledTime);
      // Diff in minutes
      const diffInMinutes = Math.floor((now - scheduled) / 60000);
      setDiff(diffInMinutes);
    };

    calculateDiff();
    const interval = setInterval(calculateDiff, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [scheduledTime]);

  const formatTime = (minutes) => {
    const absMinutes = Math.abs(minutes);
    const h = Math.floor(absMinutes / 60);
    const m = absMinutes % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m`;
  };

  if (diff < -5) {
    // More than 5 mins early (negative diff means now < scheduled)
    // Wait, if now is 9:50 and scheduled is 10:00, diff is -10.
    // So I am EARLY. "Venis adelantando turnos".
    return (
      <div className="text-green-600 font-medium bg-green-100 px-3 py-1 rounded-full text-sm">
        Venís adelantando turnos: {formatTime(diff)}
      </div>
    );
  } else if (diff > 5) {
    // More than 5 mins late (positive diff means now > scheduled)
    return (
      <div className="text-red-600 font-medium bg-red-100 px-3 py-1 rounded-full text-sm">
        Tiempo atrasado: {formatTime(diff)}
      </div>
    );
  } else {
    return (
      <div className="text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full text-sm">
        A tiempo
      </div>
    );
  }
}

export default AdminView;
