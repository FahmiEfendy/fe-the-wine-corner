import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
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
