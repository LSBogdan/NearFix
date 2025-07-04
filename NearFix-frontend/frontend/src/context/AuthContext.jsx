import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { API_CONFIG, ENDPOINTS, STORAGE_KEYS, ERROR_MESSAGES } from '../config';
import api, { handleApiError } from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshProfilePhotoUrl = useCallback(async () => {
    if (!user?.email) return false;
    
    try {
      const response = await api.get(ENDPOINTS.AUTH.PROFILE_PHOTO_REFRESH);
      
      if (response.data.profilePhotoUrl) {
        const updatedUser = { ...user, profilePhotoUrl: response.data.profilePhotoUrl };
        setUser(updatedUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh profile photo URL:', error);
      return false;
    }
  }, [user]);

  // Refresh profile photo URL every 24 hours
  useEffect(() => {
    if (user?.email) {
      const refreshInterval = setInterval(refreshProfilePhotoUrl, 24 * 60 * 60 * 1000);
      return () => clearInterval(refreshInterval);
    }
  }, [user?.email, refreshProfilePhotoUrl]);

  const validateAndRefreshToken = useCallback(async () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    
    if (!token || !refreshToken || !userData) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      // Set initial user data while we validate
      const parsedUserData = JSON.parse(userData);
      setUser(parsedUserData);
      setIsAuthenticated(true);

      // Try to refresh the token
      const response = await api.post(ENDPOINTS.AUTH.REFRESH, {
        refreshToken
      });

      if (response.data.token && response.data.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    validateAndRefreshToken();
  }, [validateAndRefreshToken]);

  const login = async (email, password) => {
    try {
      const response = await api.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      const { 
        token, 
        refreshToken, 
        email: userEmail, 
        role, 
        profilePhotoUrl, 
        firstName, 
        lastName, 
        phoneNumber 
      } = response.data;

      const userData = { 
        email: userEmail, 
        role,
        profilePhotoUrl,
        firstName,
        lastName,
        phoneNumber
      };

      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      // Refresh profile photo URL immediately after login
      await refreshProfilePhotoUrl();
      
      return { success: true };
    } catch (error) {
      // Handle invalid credentials specifically
      if (error.response?.status === 403) {
        return { 
          success: false, 
          error: 'Invalid email or password. Please try again.'
        };
      }
      
      // Handle other errors with the default error handler
      return { 
        success: false, 
        error: handleApiError(error)
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post(ENDPOINTS.AUTH.REGISTER, userData);
      
      const { 
        token, 
        refreshToken, 
        email, 
        role, 
        profilePhotoUrl, 
        firstName, 
        lastName, 
        phoneNumber 
      } = response.data;

      const newUserData = { 
        email, 
        role,
        profilePhotoUrl,
        firstName,
        lastName,
        phoneNumber
      };

      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUserData));
      
      setUser(newUserData);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: handleApiError(error)
      };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
    refreshProfilePhotoUrl
  };

  return (
    <AuthContext.Provider value={value}>
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