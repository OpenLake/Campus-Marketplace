// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService.js";
import { tokenManager } from "../utils/tokenManager.js";
import toast from "react-hot-toast";

export const AuthContext = createContext(null);

const IS_DEV_MODE = import.meta.env.VITE_APP_MODE === "dev";

export const AuthProvider = ({ children } = {}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tempToken, setTempToken] = useState(null);

  const normalizeUser = (userData) => {
    if (!userData) return null;
    const id = userData._id || userData.user_id || userData.id;
    return {
      ...userData,
      _id: id,
      user_id: id,
      id: id,
      roles: userData.roles || (userData.role ? [userData.role] : [])
    };
  };

  const setUserAndToken = (userData) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    if (normalized) {
      tokenManager.setUser(normalized);
    } else {
      tokenManager.clearAuth();
    }
  };

  // Only check auth once when app loads
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 1. Try to fetch the real current user first to preserve logged-in sessions across reloads
      try {
        const response = await authService.getCurrentUser();
        const userData = response?.user || response?.data?.user || response?.data;
        if (userData) {
          setUserAndToken(userData);
          setIsAuthenticated(true);
          return;
        }
      } catch (err) {
        console.log("No active real session found, checking dev mode fallback...");
      }

      // 2. If no real session, check dev mode fallback
      if (IS_DEV_MODE) {
        setUserAndToken({
          _id: "dev-admin-id",
          email: "dev-admin@campus.com",
          first_name: "Dev",
          last_name: "Admin",
          role: "admin",
          roles: ["admin"],
          is_verified: true,
          avatar: "https://via.placeholder.com/150",
        });
        setIsAuthenticated(true);
        return;
      }

      setUserAndToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      setUserAndToken(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (credential) => {
    try {
      const data = await authService.googleSignIn(credential);

      if (data.requiresDetails) {
        setTempToken(data.tempToken);
        return { requiresDetails: true };
      } else {
        const userData = data.user || data.data?.user || data.data;
        setUserAndToken(userData);
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

      const userData = data.user || data.data?.user || data.data;
      setUserAndToken(userData);
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

      const userData = response.user || response.data?.user || response.data?.data || response.data || response;
      setUserAndToken(userData);
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

      const newUser = response.user || response.data?.user || response.data?.data || response.data || response;
      setUserAndToken(newUser);
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
      if (!IS_DEV_MODE) {
        await authService.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      tokenManager.clearAuth();
      setUserAndToken(null);
      setIsAuthenticated(false);
      setTempToken(null);
      toast.success("Logged out");

      // Redirect to login
      window.location.href = '/login';
    }
  };

  const updateUser = (userData) => {
    setUserAndToken(userData);
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();

      const userData = response.user || response.data?.user || response.data;
      setUserAndToken(userData);
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
    isTestMode: IS_DEV_MODE,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};