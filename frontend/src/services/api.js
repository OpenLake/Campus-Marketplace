// src/services/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track refresh state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is not 401 or already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't retry auth endpoints
    if (originalRequest.url === '/users/refresh-token' || 
        originalRequest.url === '/users/login' || 
        originalRequest.url === '/users/google' ||
        originalRequest.url === '/users/register') {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request while token is refreshing
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          return api(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.log("Attempting to refresh token...");
      const refreshResponse = await api.post("/users/refresh-token");
      
      if (refreshResponse.data.success) {
        console.log("Token refreshed successfully");
        processQueue(null);
        return api(originalRequest);
      } else {
        throw new Error('Refresh failed');
      }
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError.response?.data || refreshError.message);
      processQueue(refreshError);
      
      // Only redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;