import axios from 'axios';
import toast from 'react-hot-toast';

// Domain-to-API mapping so one build serves the correct API host for
// whichever domain it's accessed from (wine.fahmiefendy.dev vs thewinecorner.id).
const API_HOST_BY_HOSTNAME = {
    'wine.fahmiefendy.dev': 'https://api-wine.fahmiefendy.dev',
    'thewinecorner.id': 'https://api.thewinecorner.id',
    'www.thewinecorner.id': 'https://api.thewinecorner.id',
};

export const getApiBaseUrl = () => {
    const mapped = API_HOST_BY_HOSTNAME[window.location.hostname];
    return mapped || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
});

// Request interceptor to add the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let sessionExpiredNotified = false;

// Response interceptor to handle errors (like 401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401 && localStorage.getItem('adminToken')) {
            // Token expired or invalid — clear it and let React Router (ProtectedRoute) handle the redirect.
            localStorage.removeItem('adminToken');

            if (!sessionExpiredNotified) {
                sessionExpiredNotified = true;
                toast.error('Your session has expired. Please log in again.');
                setTimeout(() => { sessionExpiredNotified = false; }, 5000);
            }

            if (window.location.pathname !== '/admin/login') {
                window.dispatchEvent(new CustomEvent('auth:expired'));
            }
        }
        return Promise.reject(error);
    }
);

export default api;
