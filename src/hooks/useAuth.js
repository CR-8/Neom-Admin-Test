import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { authAPI } from '../services/api';

// Create auth context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Get user profile
        const response = await authAPI.getProfile();
        setUser(response.data);
      } catch (err) {
        console.error('Auth check error:', err);
        // Clear tokens if auth check fails
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(credentials);
      const { user, accessToken, refreshToken } = response.data;
      
      // Save tokens
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Set user
      setUser(user);
      setLoading(false);
      
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  }, []);
  
  // Logout function
  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear user and tokens
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setLoading(false);
    }
  }, []);
  
  // Update profile function
  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.data);
      setLoading(false);
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      setLoading(false);
      throw err;
    }
  }, []);
  
  // Change password function
  const changePassword = useCallback(async (passwordData) => {
    setLoading(true);
    setError(null);
    
    try {
      await authAPI.changePassword(passwordData);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed');
      setLoading(false);
      throw err;
    }
  }, []);
  
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;