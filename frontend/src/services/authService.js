import api from "./api.js";

const authService = {
  /**
   * User Login
   * @param {Object} credentials - { email/username, password }
   * @returns {Promise} User data and tokens
   */
  login: async (credentials) => {
    const response = await api.post("/users/login", credentials);

    // Store access token, refresh token, and user data
    if (response.data.data) {
      if (response.data.data.accessToken) {
        localStorage.setItem("accessToken", response.data.data.accessToken);
      }
      if (response.data.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.data.refreshToken);
      }
      if (response.data.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }
    }

    return response.data;
  },

  /**
   * User Registration
   * @param {Object} userData - { name, email, username, password, etc. }
   * @returns {Promise} Registration confirmation
   */
  register: async (userData) => {
    const response = await api.post("/users/register", userData);
    return response.data;
  },

  /**
   * User Logout
   * @returns {Promise} Logout confirmation
   */
  logout: async () => {
    try {
      const response = await api.post("/users/logout");

      // Clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      return response.data;
    } catch (error) {
      // Even if API call fails, clear local data
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      throw error;
    }
  },

  /**
   * Verify Email
   * @param {string} token - Email verification token from URL
   * @returns {Promise} Verification confirmation
   */
  verifyEmail: async (token) => {
    const response = await api.post("/users/verify-email", { token });
    return response.data;
  },

  /**
   * Forgot Password - Request Reset Link
   * @param {string} email - User's email address
   * @returns {Promise} Reset link sent confirmation
   */
  forgotPassword: async (email) => {
    const response = await api.post("/users/forgot-password", { email });
    return response.data;
  },

  /**
   * Reset Password
   * @param {string} token - Password reset token from URL
   * @param {string} password - New password
   * @returns {Promise} Password reset confirmation
   */
  resetPassword: async (token, password) => {
    const response = await api.post("/users/reset-password", {
      token,
      password,
    });
    return response.data;
  },

  /**
   * Get Current User
   * @returns {Promise} Current user data
   */
  getCurrentUser: async () => {
    const response = await api.get("/users/me");

    // Update stored user data
    if (response.data.data) {
      localStorage.setItem("user", JSON.stringify(response.data.data));
    }

    return response.data;
  },

  /**
   * Change Password (for authenticated users)
   * @param {Object} passwords - { oldPassword, newPassword }
   * @returns {Promise} Password change confirmation
   */
  changePassword: async (passwords) => {
    const response = await api.put("/users/me/password", passwords);
    return response.data;
  },
};

export default authService;
