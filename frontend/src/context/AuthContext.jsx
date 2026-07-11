import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check login status on page refresh
  const checkUserStatus = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/auth/profile');
      setUser(data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, []);

  // Login action
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const { data } = await api.post('/api/auth/login', { email, password });
      setUser(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Signup action
  const signup = async (name, email, password) => {
    try {
      setError(null);
      setLoading(true);
      const { data } = await api.post('/api/auth/register', { name, email, password });
      setUser(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Logout action
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Update profile
  const updateProfile = async (name, email, password) => {
    try {
      setError(null);
      const { data } = await api.put('/api/auth/profile', { name, email, password });
      setUser(prev => ({ ...prev, ...data }));
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Profile update failed';
      throw new Error(msg);
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await api.put('/api/auth/change-password', { currentPassword, newPassword });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Change password failed';
      throw new Error(msg);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const { data } = await api.post('/api/auth/forgot-password', { email });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset request failed';
      throw new Error(msg);
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      const { data } = await api.post(`/api/auth/reset-password/${token}`, { password });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed';
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
