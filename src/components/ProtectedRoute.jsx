import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const ProtectedRoute = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // Check if user is authenticated and has admin role
  if (!token || !user || user.role !== 'admin') {
    enqueueSnackbar('Access denied. Only admin users can access this dashboard.', { 
      variant: 'error',
      autoHideDuration: 3000
    });
    
    // Clear any existing auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
