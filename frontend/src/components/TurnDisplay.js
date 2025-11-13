import React from 'react';

function TurnDisplay({ turn }) {
  return (
    <div>
      <h2>Current Turn</h2>
      {turn ? (
        <div>
          <h1>{turn.number}</h1>
        </div>
      ) : (
        <p>No turn is currently called.</p>
      )}
    </div>
  );
}

export default TurnDisplay;
