// src/services/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Essential: sends cookies with every request
  headers: {
    "Content-Type": "application/json",
  },
});

// Remove the redirect interceptor – just reject the error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optionally handle token refresh here later, but for now just reject
    return Promise.reject(error);
  }
);

export default api;