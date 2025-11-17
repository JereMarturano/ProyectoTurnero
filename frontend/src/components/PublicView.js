import React, { useState, useEffect } from 'react';
import { getCurrentTurn } from '../services/api';
import connection, { startConnection } from '../services/signalr';
import TurnDisplay from './TurnDisplay';

function PublicView() {
  const [currentTurn, setCurrentTurn] = useState(null);
  const [error, setError] = useState(null);

    const fetchCurrentTurn = async () => {
        try {
            setError(null);

            // La función 'getCurrentTurn' ya devuelve el dato (o null)
            const turn = await getCurrentTurn();

            // NO hagas esto: setCurrentTurn(turn.data);
            // Haz esto:
            setCurrentTurn(turn); // <-- Asigna 'turn' directamente

        } catch (error) {
            console.error("Error in fetchCurrentTurn:", error.message);
            setError(error.message);
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
    <div>
      <h2>Public View</h2>
      <TurnDisplay turn={currentTurn} />
    </div>
  );
}

export default PublicView;
