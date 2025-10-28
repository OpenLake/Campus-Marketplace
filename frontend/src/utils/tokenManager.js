const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

export const tokenManager = {
  /**
   * Get access token from localStorage
   * @returns {string|null} Access token or null
   */
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Set access token in localStorage
   * @param {string} token - JWT access token
   */
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Remove access token from localStorage
   */
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Get user data from localStorage
   * @returns {Object|null} User object or null
   */
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Set user data in localStorage
   * @param {Object} user - User object
   */
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Remove user data from localStorage
   */
  removeUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Clear all auth data
   */
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if token exists
   */
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};
