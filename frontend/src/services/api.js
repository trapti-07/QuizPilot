import axios from 'axios';

// Resolve API base URL:
// - In production, uses import.meta.env.VITE_API_URL (e.g. deployed Render backend)
// - In local development without VITE_API_URL, defaults to '/api' to use Vite dev proxy
// - Automatically normalizes trailing slashes and ensures '/api' is present exactly once
export const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || !envUrl.trim()) {
    return '/api';
  }
  const cleanUrl = envUrl.trim().replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

export const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('quizpilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle session expiration or unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't loop redirect if already on login or register
      const isAuthRoute = window.location.pathname === '/login' || window.location.pathname === '/register';
      if (!isAuthRoute) {
        localStorage.removeItem('quizpilot_token');
        localStorage.removeItem('quizpilot_user');
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
