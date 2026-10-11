import axios from 'axios';

// Resolve API base URL:
// - If VITE_API_URL is configured (e.g., custom Render environment variable), uses that.
// - In production builds without VITE_API_URL, automatically defaults to the deployed Render backend:
//   https://quizpilot-1cdj.onrender.com/api
// - In local development, defaults to '/api' to use Vite dev proxy
export const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    let cleanUrl = envUrl.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(cleanUrl) && !cleanUrl.startsWith('/')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }

  // Fallback for live production deployment if VITE_API_URL was not set in Render dashboard
  if (import.meta.env.PROD || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
    return 'https://quizpilot-1cdj.onrender.com/api';
  }

  return '/api';
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
