import { HubConnectionBuilder } from '@microsoft/signalr';
import axios from 'axios';

const connection = new HubConnectionBuilder()
    .withUrl('http://localhost:5124/turnhub')
    .build();

export const startConnection = async () => {
    try {
        await connection.start();
        console.log('SignalR Connected.');
    } catch (error) {
        console.log('SignalR Connection Error: ', error);
    }
};

const api = axios.create({
    baseURL: 'http://localhost:5124/api',
});

// Add a request interceptor to automatically add the token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

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
        const response = await api.post('/turns/call', {});
        return response.data;
    } catch (error) {
        console.error('Failed to call turn', error);
        throw error;
    }
};

export const finishTurn = async () => {
    try {
        const response = await api.post('/turns/finish', {});
        return response.data;
    } catch (error) {
        console.error('Failed to finish turn', error);
        throw error;
    }
};

export const getCurrentTurn = async () => {
    try {
        const response = await api.get('/turns/status');
        return response.data;
    } catch (error) {
        console.error('Failed to get current turn', error);
        throw error;
    }
}

export { connection };
export default api;
