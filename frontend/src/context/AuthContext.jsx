import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('helpnear_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate existing token on boot
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('helpnear_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.getMe();
        if (response.success && response.user) {
          setUser(response.user);
          setToken(storedToken);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Initial session validation failed:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await api.login({ email, password });
      if (data.token) {
        localStorage.setItem('helpnear_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async ({ name, email, password, role }) => {
    setError(null);
    try {
      const data = await api.register({ name, email, password, role });
      if (data.token) {
        localStorage.setItem('helpnear_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('helpnear_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
