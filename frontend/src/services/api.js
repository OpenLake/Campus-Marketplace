// frontend/src/services/api.js

import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. If we are on the login page OR registering, just let the error go through.
    if (originalRequest.url.includes('/login') || originalRequest.url.includes('/register')) {
      return Promise.reject(error);
    }

    // 2. If it's a 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Check if a refresh token actually exists before trying to call the API
      const hasRefreshToken = Cookies.get('refreshToken');
      
      if (!hasRefreshToken) {
        // If no refresh token exists, don't even try. Just clear and go to login.
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        const response = await api.post('/users/refresh-token');
        const { accessToken } = response.data.data;
        Cookies.set('accessToken', accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, nuclear clean up
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;