import { createContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService.js";
import { tokenManager } from "../utils/tokenManager.js";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Manages global authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Check if user is authenticated on mount
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check authentication status
   */
  const checkAuth = async () => {
    try {
      const token = tokenManager.getToken();
      const storedUser = tokenManager.getUser();

      if (token && storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      tokenManager.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   */
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register new user
   * @param {Object} userData - Registration data
   */
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      tokenManager.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Update user data
   * @param {Object} userData - Updated user data
   */
  const updateUser = (userData) => {
    setUser(userData);
    tokenManager.setUser(userData);
  };

  /**
   * Check if user has a specific role
   * @param {string} role - Role to check
   * @returns {boolean}
   */
  const hasRole = useCallback(
    (role) => {
      return user?.roles?.includes(role) || false;
    },
    [user]
  );

  /**
   * Check if user has any of the specified roles
   * @param {Array<string>} roles - Roles to check
   * @returns {boolean}
   */
  const hasAnyRole = useCallback(
    (roles) => {
      return roles.some((role) => user?.roles?.includes(role)) || false;
    },
    [user]
  );

  /**
   * Check if user can create listings
   * @returns {boolean}
   */
  const canCreateListing = useCallback(() => {
    const allowedRoles = [
      "student",
      "vendor_admin",
      "club_admin",
      "admin",
      "moderator",
    ];
    return hasAnyRole(allowedRoles);
  }, [hasAnyRole]);

  /**
   * Check if user is admin or moderator
   * @returns {boolean}
   */
  const isAdminOrModerator = useCallback(() => {
    return hasAnyRole(["admin", "moderator"]);
  }, [hasAnyRole]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    hasRole,
    hasAnyRole,
    canCreateListing,
    isAdminOrModerator,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
