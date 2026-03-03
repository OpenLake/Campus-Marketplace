// src/services/authService.js
import api from "./api.js";

const authService = {
  // ========== Google Sign-In ==========
  googleSignIn: async (credential) => {
    try {
      const response = await api.post("/users/google", { credential });
      return response.data; // { requiresDetails?, tempToken?, user?, accessToken? }
    } catch (error) {
      console.error('Google sign-in error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  completeRegistration: async (tempToken, userDetails) => {
    try {
      const response = await api.post("/users/complete-google-signup", {
        tempToken,
        ...userDetails,
      });
      return response.data; // { user, accessToken? }
    } catch (error) {
      console.error('Complete registration error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ========== Email/Password ==========
  login: async (credentials) => {
    try {
      const response = await api.post("/users/login", credentials);
      // Backend sets cookie; response contains user only
      return response.data; // { data: user, message, statusCode }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/users/register", userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post("/users/logout");
      return response.data;
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ========== Session / User ==========
  getCurrentUser: async () => {
    try {
      const response = await api.get("/users/me");
      console.log('Get current user response:', response.data);
      return response.data; // { data: user, ... }
    } catch (error) {
      console.error('Get current user error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  refreshAccessToken: async () => {
    try {
      const response = await api.post("/users/refresh-token");
      return response.data;
    } catch (error) {
      console.error('Refresh token error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ========== Profile Updates ==========
  updateProfile: async (userData) => {
    try {
      const response = await api.put("/users/me", userData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  changePassword: async (passwords) => {
    try {
      const response = await api.put("/users/me/password", passwords);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ========== Email Verification / Password Reset ==========
  verifyEmail: async (token) => {
    try {
      const response = await api.post("/users/verify-email", { token });
      return response.data;
    } catch (error) {
      console.error('Verify email error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/users/forgot-password", { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await api.post("/users/reset-password", { token, password });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
};

export default authService;