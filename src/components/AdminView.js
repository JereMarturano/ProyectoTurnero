import React, { useState, useEffect } from 'react';
import { callTurn, finishTurn, getCurrentTurn } from '../services/api';
import TurnDisplay from './TurnDisplay';

function AdminView() {
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
    fetchCurrentTurn();
  }, []);

  const handleCallTurn = async () => {
    try {
      await callTurn();
      fetchCurrentTurn();
    } catch (error) {
      // Handle error
    }
  };

  const handleFinishTurn = async () => {
    try {
      await finishTurn();
      fetchCurrentTurn();
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      <h2>Admin View</h2>
      <button onClick={handleCallTurn}>Call Next Turn</button>
      <button onClick={handleFinishTurn}>Finish Current Turn</button>
      <TurnDisplay turn={currentTurn} />
    </div>
  );
}

export default AdminView;
