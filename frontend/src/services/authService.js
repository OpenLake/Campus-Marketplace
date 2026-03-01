import api from "./api.js";

const authService = {
  // ========== Google Sign-In ==========
  googleSignIn: async (credential) => {
    const response = await api.post("/users/google", { credential });
    return response.data; // { requiresDetails?, tempToken?, user?, accessToken? }
  },

  completeRegistration: async (tempToken, userDetails) => {
    const response = await api.post("/users/complete-google-signup", {
      tempToken,
      ...userDetails,
    });
    return response.data; // { user, accessToken? }
  },

  // ========== Email/Password ==========
  login: async (credentials) => {
    const response = await api.post("/users/login", credentials);
    // Backend sets cookie; response contains user only
    return response.data; // { data: user, message, statusCode }
  },

  register: async (userData) => {
    const response = await api.post("/users/register", userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/users/logout");
    return response.data;
  },

  // ========== Session / User ==========
  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data; // { data: user, ... }
  },

  refreshAccessToken: async () => {
    const response = await api.post("/users/refresh-token");
    return response.data;
  },

  // ========== Profile Updates ==========
  updateProfile: async (userData) => {
    const response = await api.put("/users/me", userData);
    return response.data;
  },

  changePassword: async (passwords) => {
    const response = await api.put("/users/me/password", passwords);
    return response.data;
  },

  // ========== Email Verification / Password Reset ==========
  verifyEmail: async (token) => {
    const response = await api.post("/users/verify-email", { token });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post("/users/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post("/users/reset-password", { token, password });
    return response.data;
  },
};

export default authService;