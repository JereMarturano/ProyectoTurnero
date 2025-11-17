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
console.error('Failed to get current turn', error); // Keep the original log
if (error.response) {
// The request was made and the server responded with a status code
// that falls out of the range of 2xx
console.error('Server responded with an error:', error.response.status, error.response.data);
// You might want to throw a more specific error or return a specific error state
throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
} else if (error.request) {
// The request was made but no response was received
// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
// http.ClientRequest in node.js
console.error('No response received from server:', error.request);
throw new Error('Network error: No response from server. Please check your internet connection.');
} else {
// Something else happened in setting up the request that triggered an Error
console.error('Error setting up the request:', error.message);
throw new Error(`Request setup error: ${error.message}`);
}
}
}


export default api;
