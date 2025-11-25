import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5124/api',
});

export const login = async (username, password) => {
    try {
        const response = await api.post('/auth/login', { username, password });
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

export const callTurn = async (token) => {
    try {
        const response = await api.post('/turns/call', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to call turn', error);
        throw error;
    }
};

export const finishTurn = async (token) => {
    try {
        const response = await api.post('/turns/finish', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to finish turn', error);
        throw error;
    }
};

export const getCurrentTurn = async () => {
    try {
        const response = await api.get('/turns/status');
        console.log(`${response} response `);
        console.log(`${response.data} response data`);
        return response.data;
    } catch (error) {
        console.error('Failed to get current turn', error);
        throw error;
    }
}

export const getDoctors = async () => {
    try {
        const response = await api.get('/doctors');
        return response.data;
    } catch (error) {
        console.error('Failed to get doctors', error);
        throw error;
    }
};

export const getAvailableSlots = async (doctorId, date) => {
    try {
        const response = await api.get(`/doctors/${doctorId}/slots`, {
            params: { date }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to get available slots', error);
        throw error;
    }
};

export const createTurn = async (turnData) => {
    try {
        const response = await api.post('/turns', turnData);
        return response.data;
    } catch (error) {
        console.error('Failed to create turn', error);
        throw error;
    }
};

export const getTurnStats = async () => {
    try {
        const response = await api.get('/turns/stats');
        return response.data;
    } catch (error) {
        console.error('Failed to get turn stats', error);
        throw error;
    }
};

export default api;
