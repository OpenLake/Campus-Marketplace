import { createContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService.js";
import { tokenManager } from "../utils/tokenManager.js";
import toast from "react-hot-toast";

export const AuthContext = createContext(null);

const TESTING_MODE = false; // set to false for production

export const AuthProvider = ({ children } = {}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tempToken, setTempToken] = useState(null); // for Google new users

  useEffect(() => {
    checkAuth();
  }, []);
const checkAuth = async () => {
  try {
    if (TESTING_MODE) {
      setLoading(false);
      return;
    }

    const response = await authService.getCurrentUser();
    console.log("Raw /me response:", response);

    // Look directly on the response first, then fall back to response.data
    const userData = 
      response?.user || 
      response?.data?.user || 
      response?.data || 
      response;

    console.log("Extracted userData:", userData);

    if (userData && typeof userData === 'object' && !Array.isArray(userData)) {
      setUser(userData);
      setIsAuthenticated(true);
      tokenManager.setUser(userData);
    } else {
      setUser(null);
      setIsAuthenticated(false);
      tokenManager.clearAuth();
    }
  } catch (error) {
    console.error("Auth check failed:", error);
    setUser(null);
    setIsAuthenticated(false);
    tokenManager.clearAuth();
  } finally {
    setLoading(false);
  }
};
  // Google Sign-In
  const handleGoogleSignIn = async (credential) => {
    try {
      const data = await authService.googleSignIn(credential);
      if (data.requiresDetails) {
        setTempToken(data.tempToken);
        return { requiresDetails: true };
      } else {
        const userData = data.user || data.data?.user;
        tokenManager.setUser(userData);
        setUser(userData);
        setIsAuthenticated(true);
        toast.success(`Welcome back, ${userData.first_name || "User"}!`);
        return { success: true, user: userData };
      }
    } catch (error) {
      toast.error(error.message || "Google sign-in failed");
      return { error: error.message };
    }
  };

  const completeRegistration = async (userDetails) => {
    try {
      const data = await authService.completeRegistration(tempToken, userDetails);
      const userData = data.user || data.data?.user;
      tokenManager.setUser(userData);
      setUser(userData);
      setIsAuthenticated(true);
      setTempToken(null);
      toast.success("Registration complete!");
      return { success: true, user: userData };
    } catch (error) {
      toast.error(error.message || "Registration failed");
      return { error: error.message };
    }
  };

  // Email/Password login
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const userData = response.data?.user || response.data?.data;
      tokenManager.setUser(userData);
      setUser(userData);
      setIsAuthenticated(true);
      toast.success("Login successful!");
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const newUser = response.data?.user || response.data?.data;
      tokenManager.setUser(newUser);
      setUser(newUser);
      setIsAuthenticated(true);
      toast.success("Registration successful!");
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (!TESTING_MODE) {
        await authService.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      tokenManager.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
      setTempToken(null);
      toast.success("Logged out");
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    tokenManager.setUser(userData);
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      const userData = response.data?.data || response.data;
      setUser(userData);
      tokenManager.setUser(userData);
      return userData;
    } catch (error) {
      console.error("Refresh user failed:", error);
      throw error;
    }
  };

  const hasRole = useCallback((role) => user?.roles?.includes(role) || false, [user]);
  const hasAnyRole = useCallback((roles) => roles.some((role) => user?.roles?.includes(role)), [user]);

  const value = {
    user,
    loading,
    isAuthenticated,
    tempToken,
    handleGoogleSignIn,
    completeRegistration,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    checkAuth,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};