import React, { useState } from 'react';
import './App.css';
import { login } from './services/api';
import AdminView from './components/AdminView';
import PublicView from './components/PublicView';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      setToken(data.token);
      console.log('Token:', data.token);
      if (username === 'admin') {
        setIsAdmin(true);
      }
    } catch (error) {
      // Handle login error
    }
  };

  return (
    <div className="App">
      {token ? (
        <div>
          {isAdmin ? <AdminView token={token} /> : <PublicView />}
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <h2>Login</h2>
          <label>
            Username
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit">Login</button>
        </form>
      )}
    </div>
  );
}

export default App;
