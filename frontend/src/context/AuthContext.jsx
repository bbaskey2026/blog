// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on app start
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Get stored token and user data
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('userData');

        console.log('Initializing auth...');
        console.log('Stored token:', storedToken ? 'Found' : 'Not found');
        console.log('Stored user:', storedUser ? 'Found' : 'Not found');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Verify token is not expired (if your token has expiration)
          if (isTokenValid(storedToken)) {
            setToken(storedToken);
            setUser(parsedUser);
            console.log('Auth restored successfully');
          } else {
            console.log('Token expired, clearing storage');
            clearAuthData();
          }
        } else {
          console.log('No valid auth data found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Helper function to check if token is valid
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      // If your JWT has expiration, decode and check
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Check if token has exp field and if it's not expired
      if (payload.exp && payload.exp < currentTime) {
        return false;
      }
      
      return true;
    } catch (error) {
      // If token parsing fails, consider it invalid
      console.error('Error parsing token:', error);
      return false;
    }
  };

  // Clear all auth data
  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setToken(null);
    setUser(null);
  };

  // Login function
  const login = (authData) => {
    try {
      console.log('Login called with data:', authData);
      
      // Extract token and user from response
      const { token: authToken, user: userData, ...otherData } = authData;
      
      // Handle different response structures
      let finalToken = authToken || authData.accessToken || authData.authToken;
      let finalUser = userData || authData.user || authData;
      
      // If user data is nested, extract it
      if (finalUser.user) {
        finalUser = finalUser.user;
      }
      
      // Remove token from user object if it exists there
      if (finalUser.token) {
        finalToken = finalToken || finalUser.token;
        delete finalUser.token;
      }

      console.log('Final token:', finalToken ? 'Set' : 'Missing');
      console.log('Final user:', finalUser);

      if (!finalToken) {
        throw new Error('No token received from login response');
      }

      // Store in localStorage
      localStorage.setItem('authToken', finalToken);
      localStorage.setItem('userData', JSON.stringify(finalUser));
      
      // Update state
      setToken(finalToken);
      setUser(finalUser);
      
      console.log('Login successful');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      clearAuthData();
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    try {
      console.log('Logout called');
      clearAuthData();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear even if error occurs
      clearAuthData();
    }
  };

  // Update user data
  const updateUser = (updatedUserData) => {
    try {
      const newUserData = { ...user, ...updatedUserData };
      localStorage.setItem('userData', JSON.stringify(newUserData));
      setUser(newUserData);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(user && token && isTokenValid(token));
  };

  // Get auth header for API calls
  const getAuthHeader = () => {
    if (token && isTokenValid(token)) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
    return {};
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    getAuthHeader,
    clearAuthData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
