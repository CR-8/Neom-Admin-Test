import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Avatar,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { authAPI } from '../services/api';
import { alpha, styled } from '@mui/material/styles';

const StyledCard = styled(Paper)(({ theme }) => ({
  maxWidth: 400,
  width: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  backdropFilter: 'blur(20px)',
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.8)
    : alpha(theme.palette.background.paper, 0.9),
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  }
}));

const Login = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', { email: formData.email });
      const response = await authAPI.login(formData);
      console.log('Full login response:', JSON.stringify(response, null, 2));
      
      // Check if we have a valid response with data
      if (response?.data) {
        const { token, data } = response.data;
        
        if (!token || !data?.user) {
          console.error('Missing data in response:', {
            token: !!token,
            user: !!data?.user,
            availableKeys: Object.keys(response.data)
          });
          throw new Error('Invalid response format: missing token or user data');
        }
        
        const userData = data.user;
        console.log('Extracted auth data:', { token, userData });
        
        // Check if user has admin role
        if (userData.role !== 'admin') {
          throw new Error('Access denied. Only admin users can access this dashboard.');
        }
        
        // Store auth data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Auth data stored successfully');
        
        enqueueSnackbar('Login successful!', { variant: 'success' });
        navigate('/');
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(45deg, ${alpha('#000', 0.1)}, ${alpha('#000', 0.2)})`,
        p: 3,
      }}
    >
      <StyledCard elevation={3}>
        <Box sx={{ p: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Avatar
              sx={{
                m: 1,
                bgcolor: 'primary.main',
                width: 56,
                height: 56,
              }}
            >
              <PersonIcon fontSize="large" />
            </Avatar>
            <Typography component="h1" variant="h5" fontWeight="bold">
              Admin Login
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 1 }}
            >
              Enter your credentials to access the admin dashboard
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                bgcolor: alpha('#d32f2f', 0.1),
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              id="password"
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
                }
              }}
            >
              {loading ? (
                <>
                  <CircularProgress
                    size={24}
                    sx={{ mr: 1, color: 'white' }}
                  />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>
        </Box>
      </StyledCard>
    </Box>
  );
};

export default Login;
