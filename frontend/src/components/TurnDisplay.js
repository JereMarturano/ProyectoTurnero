import React from 'react';

function TurnDisplay({ turn, className = '' }) {
  if (!turn) {
    return (
      <div className={`text-center text-gray-400 ${className}`}>
        <p className="text-xl">Esperando...</p>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="text-6xl font-black text-primary-600 tracking-tighter">
        {turn.number}
      </div>
      {turn.status && (
        <div className="mt-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
          {turn.status}
        </div>
      )}
    </div>
  );
}

export default TurnDisplay;
