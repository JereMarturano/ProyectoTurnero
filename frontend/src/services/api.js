import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5124/api', // This should be your backend URL
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login failed', error);
    throw error;
  }
};

export const getNextTurn = async () => {
    try {
        const response = await api.post('/turns/next');
        return response.data;
    } catch (error) {
        console.error('Failed to get next turn', error);
        throw error;
    }
};

export const callTurn = async () => {
    try {
        const response = await api.post('/turns/call');
        return response.data;
    } catch (error) {
        console.error('Failed to call turn', error);
        throw error;
    }
};

export const finishTurn = async () => {
    try {
        const response = await api.post('/turns/finish');
        return response.data;
    } catch (error) {
        console.error('Failed to finish turn', error);
        throw error;
    }
};

export const getCurrentTurn = async () => {
    try {
        const response = await api.get('/turns/current');
        return response.data;
    } catch (error) {
        console.error('Failed to get current turn', error);
        throw error;
    }
}


export default api;
