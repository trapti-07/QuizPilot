import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('quizpilot_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('quizpilot_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('quizpilot_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('[AuthContext] Token validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('quizpilot_token', res.token);
        localStorage.setItem('quizpilot_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await authService.register(userData);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('quizpilot_token', res.token);
        localStorage.setItem('quizpilot_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('quizpilot_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.warn('Failed to refresh user', err);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await authService.updateProfile(profileData);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('quizpilot_user', JSON.stringify(res.user));
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Profile update failed';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('quizpilot_token');
    localStorage.removeItem('quizpilot_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
