import React, { useState, useEffect } from 'react';
import { getCurrentTurn } from '../services/api';
import connection, { startConnection } from '../services/signalr';
import TurnDisplay from './TurnDisplay';

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
    <div>
      <h2>Public View</h2>
      <TurnDisplay turn={currentTurn} />
    </div>
  );
}

export default PublicView;
