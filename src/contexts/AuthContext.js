import React, { createContext, useContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import { userAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = sessionStorage.getItem('token');
      if (token) {
        try {
          // Verify token is not expired
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp > currentTime) {
            // Token is valid, fetch user profile
            const profileResponse = await userAPI.getProfile();
            setUser(profileResponse.data);
          } else {
            // Token expired, clear it
            sessionStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          sessionStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for logout in other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};