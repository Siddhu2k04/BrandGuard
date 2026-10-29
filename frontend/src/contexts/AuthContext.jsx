import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // Dummy user because login is bypassed
      const dummyUser = { id: 0, email: "demo@example.com", role: "admin" };
      setUser(dummyUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    // Bypass real authentication – always succeed with dummy data
    const dummyAccessToken = "dummy-access-token";
    const dummyRefreshToken = "dummy-refresh-token";
    localStorage.setItem("access_token", dummyAccessToken);
    localStorage.setItem("refresh_token", dummyRefreshToken);

    // Set a dummy user object
    const dummyUser = { id: 0, email: "demo@example.com", role: "admin" };
    setUser(dummyUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const registerCompany = async (data) => {
    try {
      await authAPI.registerCompany(data);
      // Auto-login after registration
      const { access_token, refresh_token } = await authAPI.login(
        data.admin_email,
        data.password,
      );
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Registration failed",
      };
    }
  };

  const registerEmployee = async (data) => {
    try {
      await authAPI.registerEmployee(data);
      // Auto-login after registration
      const { access_token, refresh_token } = await authAPI.login(
        data.email,
        data.password,
      );
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    registerCompany,
    registerEmployee,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
