import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('elearning_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('elearning_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('elearning_token');
      if (storedToken) {
        try {
          const profile = await authApi.getCurrentUser();
          setUser(profile);
          localStorage.setItem('elearning_user', JSON.stringify(profile));
        } catch (err) {
          // Token expired or invalid
          localStorage.removeItem('elearning_token');
          localStorage.removeItem('elearning_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    const authToken = data.accessToken;
    const userData = {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.fullName,
      role: data.user.role,
    };

    localStorage.setItem('elearning_token', authToken);
    localStorage.setItem('elearning_user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('elearning_token');
    localStorage.removeItem('elearning_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
      }}
    >
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
