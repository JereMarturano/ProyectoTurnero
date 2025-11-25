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
        // Format date as yyyy-MM-dd for the query param if needed, or ISO string.
        // The backend expects DateTime, so ISO string or just yyyy-MM-dd should work.
        // Let's use ISO string but maybe just the date part if the backend ignores time or handles it.
        // Actually, let's pass the date object or string as is, axios handles it.
        // But to be safe and match backend expectation of just date, let's format it.
        // However, I don't have date-fns imported here. I'll pass it as is and let the caller format or rely on axios.
        // Better yet, let's assume the caller passes a Date object or string.
        const response = await api.get(`/doctors/${doctorId}/slots`, {
            params: { date }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to get available slots', error);
        throw error;
    }
};


export default api;
