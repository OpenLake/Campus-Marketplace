import axios from 'axios';
import Cookies from 'js-cookie';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// frontend/src/services/api.js

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // FIX: If it's a 401 error but NOT from the login route, try to refresh
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url.includes('/users/login') // Added this check
    ) {
      originalRequest._retry = true;
      try {
        const response = await api.post('/users/refresh-token');
        const { accessToken } = response.data.data;
        Cookies.set('accessToken', accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        localStorage.removeItem('user');
        
        // Only redirect if we aren't already on the login page to avoid infinite loops
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    // For login failures (401 on /login route), just return the error
    return Promise.reject(error);
  }
);

export default api;