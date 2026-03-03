// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService.js";
import { tokenManager } from "../utils/tokenManager.js";
import toast from "react-hot-toast";

export const AuthContext = createContext(null);

const TESTING_MODE = false;

export const AuthProvider = ({ children } = {}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tempToken, setTempToken] = useState(null);

  // Only check auth once when app loads
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
      console.log("Auth check response:", response);

      if (response?.success && response?.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        tokenManager.setUser(response.user);
      } else if (response?.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        tokenManager.setUser(response.user);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        tokenManager.clearAuth();
      }
    } catch (error) {
      console.log("Not authenticated:", error.message);
      setUser(null);
      setIsAuthenticated(false);
      tokenManager.clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (credential) => {
    try {
      const data = await authService.googleSignIn(credential);
      console.log("Google sign-in response:", data);
      
      if (data.requiresDetails) {
        setTempToken(data.tempToken);
        return { requiresDetails: true };
      } else {
        const userData = data.user || data.data?.user || data.data;
        tokenManager.setUser(userData);
        setUser(userData);
        setIsAuthenticated(true);
        toast.success(`Welcome back, ${userData.first_name || "User"}!`);
        return { success: true, user: userData };
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error(error.message || "Google sign-in failed");
      return { error: error.message };
    }
  };

  const completeRegistration = async (userDetails) => {
    try {
      const data = await authService.completeRegistration(tempToken, userDetails);
      console.log("Complete registration response:", data);
      
      const userData = data.user || data.data?.user || data.data;
      tokenManager.setUser(userData);
      setUser(userData);
      setIsAuthenticated(true);
      setTempToken(null);
      toast.success("Registration complete!");
      return { success: true, user: userData };
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed");
      return { error: error.message };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      console.log("Login response:", response);
      
      const userData = response.data?.user || response.data?.data || response.data;
      tokenManager.setUser(userData);
      setUser(userData);
      setIsAuthenticated(true);
      toast.success("Login successful!");
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      console.log("Register response:", response);
      
      const newUser = response.data?.user || response.data?.data || response.data;
      tokenManager.setUser(newUser);
      setUser(newUser);
      setIsAuthenticated(true);
      toast.success("Registration successful!");
      return response;
    } catch (error) {
      console.error("Register error:", error);
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
      
      // Redirect to login
      window.location.href = '/login';
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    tokenManager.setUser(userData);
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      console.log("Refresh user response:", response);
      
      const userData = response.user || response.data?.user || response.data;
      setUser(userData);
      tokenManager.setUser(userData);
      return userData;
    } catch (error) {
      console.error("Refresh user failed:", error);
      throw error;
    }
  };

  const hasRole = useCallback((role) => {
    if (!user) return false;
    return user.role === role || user.roles?.includes(role) || false;
  }, [user]);
  
  const hasAnyRole = useCallback((roles) => {
    if (!user) return false;
    return roles.some(role => user.role === role || user.roles?.includes(role));
  }, [user]);

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