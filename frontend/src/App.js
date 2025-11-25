import React, { useState } from 'react';
import { login } from './services/api';
import AdminView from './components/AdminView';
import PublicView from './components/PublicView';
import KioskView from './components/KioskView';
import Layout from './components/Layout';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import { User, Lock, LogIn, Monitor } from 'lucide-react';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('token'));
  const [error, setError] = useState('');
  const [showKiosk, setShowKiosk] = useState(false);
  const [doctorName, setDoctorName] = useState(localStorage.getItem('doctorName') || '');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(username, password);
      setToken(data.token);
      localStorage.setItem('token', data.token);

      // Simulating getting doctor name from login (in a real app, backend should return it)
      // For now, we'll format the username or use a default if it's admin
      let name = username;
      if (username.toLowerCase() === 'cecilia') name = 'Dra. Cecilia Grierson';
      else if (username.toLowerCase() === 'admin') name = 'Administrador';
      else name = `Dr/a. ${username.charAt(0).toUpperCase() + username.slice(1)}`;

      setDoctorName(name);
      localStorage.setItem('doctorName', name);

      setIsAdmin(true);
    } catch (error) {
      setError('Credenciales inválidas. Por favor intente nuevamente.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem('token');
    localStorage.removeItem('doctorName');
    window.location.reload();
  };

  if (showKiosk) {
    return <KioskView onBack={() => setShowKiosk(false)} />;
  }

  if (token) {
    return (
      <Layout>
        {isAdmin ? <AdminView token={token} doctorName={doctorName} onLogout={handleLogout} /> : <PublicView />}
      </Layout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            T
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Iniciar Sesión
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Bienvenido al Sistema de Turnos
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="Ingrese su usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Ingresar
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  O acceder como
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => setShowKiosk(true)}
                className="w-full flex justify-center"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Modo pacientes
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
