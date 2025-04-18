import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import "../styles/auth.css";

// Material UI imports
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
  Divider,
  FormControlLabel,
  Checkbox,
  useTheme,
  alpha,
} from "@mui/material";
import {
  LockOutlined as LockOutlinedIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";

const Login = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  // Check for saved redirect path
  const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
  
  // Get the redirect path from location state, sessionStorage, or use dashboard as default
  const from = location.state?.from?.pathname || savedRedirect || "/";
  
  // Clean up the redirect from sessionStorage once we've used it
  useEffect(() => {
    if (savedRedirect) {
      sessionStorage.removeItem('redirectAfterLogin');
    }
  }, [savedRedirect]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create a completely isolated axios instance for login to avoid interceptor interference
      const loginAxios = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Make the login request with the isolated instance
      const response = await loginAxios.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      // Correctly destructure the response data based on the API structure
      const { token, data: { user } } = response.data;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set axios default headers for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Show success message
      toast.success('Login successful!');

      // Get the redirect path from session storage or default to dashboard
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
      
      // Clear the redirect path from session storage
      sessionStorage.removeItem('redirectAfterLogin');
      
      // Use a small timeout to ensure the success message is visible
      setTimeout(() => {
        // Use window.location.replace for a hard redirect
        window.location.replace(redirectPath);
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: 
          theme.palette.mode === "dark"
            ? `radial-gradient(circle at 50% 50%, ${theme.palette.grey[900]}, ${theme.palette.background.default} 80%)`
            : `radial-gradient(circle at 50% 100%, ${alpha(theme.palette.primary.light, 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.5)} 40%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
        backgroundSize: "cover",
        position: "relative",
        padding: { xs: 2, sm: 4 },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23${theme.palette.mode === "dark" ? "ffffff" : "000000"}' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          zIndex: 0,
        }
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: "16px",
            background: theme.palette.mode === "dark" 
              ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.8)})`
              : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.97)}, ${alpha(theme.palette.background.paper, 0.93)})`,
            backdropFilter: "blur(10px)",
            position: "relative",
            overflow: "hidden",
            boxShadow: theme.palette.mode === "dark"
              ? `0 10px 30px -10px ${alpha(theme.palette.common.black, 0.5)}, 
                 0 5px 10px ${alpha(theme.palette.primary.dark, 0.1)}`
              : `0 10px 40px -10px ${alpha(theme.palette.common.black, 0.2)}, 
                 0 6px 16px -8px ${alpha(theme.palette.primary.main, 0.15)}`,
            transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: theme.palette.mode === "dark"
                ? `0 15px 40px -10px ${alpha(theme.palette.common.black, 0.6)}, 
                   0 10px 20px ${alpha(theme.palette.primary.dark, 0.15)}`
                : `0 20px 50px -15px ${alpha(theme.palette.common.black, 0.25)}, 
                   0 12px 25px -10px ${alpha(theme.palette.primary.main, 0.2)}`,
            }
          }}
        >
          {/* Animated gradient border */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, 
                ${theme.palette.primary.main}, 
                ${theme.palette.secondary.main}, 
                ${theme.palette.primary.light}, 
                ${theme.palette.primary.main})`,
              backgroundSize: "300% 100%",
              animation: "gradientBorder 6s ease infinite",
              "@keyframes gradientBorder": {
                "0%, 100%": {
                  backgroundPosition: "0% 50%"
                },
                "50%": {
                  backgroundPosition: "100% 50%"
                }
              }
            }}
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Avatar
              sx={{
                m: 1,
                bgcolor: "transparent",
                width: 70,
                height: 70,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05) rotate(5deg)",
                  boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.6)}`,
                }
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 36, color: theme.palette.common.white }} />
            </Avatar>
            <Typography 
              component="h1" 
              variant="h4" 
              fontWeight="700"
              sx={{ 
                mt: 2,
                background: theme.palette.mode === "dark" 
                  ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.light})`
                  : `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                textShadow: theme.palette.mode === "dark" 
                  ? `0 2px 4px ${alpha(theme.palette.common.black, 0.5)}`
                  : "none",
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ 
                mt: 1,
                maxWidth: "80%",
                fontWeight: 400,
              }}
            >
              Enter your credentials to access your dashboard
            </Typography>
          </Box>

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
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === "dark" 
                    ? alpha(theme.palette.background.default, 0.5)
                    : alpha(theme.palette.background.default, 0.8),
                  '&:hover': {
                    backgroundColor: theme.palette.mode === "dark" 
                      ? alpha(theme.palette.background.default, 0.7)
                      : alpha(theme.palette.background.default, 1),
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
                  },
                  transition: "all 0.2s ease-in-out",
                }
              }}
              sx={{ mb: 2.5 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              id="password"
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
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
                      onClick={handleTogglePassword}
                      edge="end"
                      sx={{ 
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          color: theme.palette.primary.main
                        }
                      }}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === "dark" 
                    ? alpha(theme.palette.background.default, 0.5)
                    : alpha(theme.palette.background.default, 0.8),
                  '&:hover': {
                    backgroundColor: theme.palette.mode === "dark" 
                      ? alpha(theme.palette.background.default, 0.7)
                      : alpha(theme.palette.background.default, 1),
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
                  },
                  transition: "all 0.2s ease-in-out",
                }
              }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1.5,
                mb: 1,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    value="remember"
                    color="primary"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                    sx={{
                      '&.Mui-checked': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    Remember me
                  </Typography>
                }
              />
              <Link
                to="/forgot-password"
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    textDecoration: "underline",
                  }
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2.5,
                py: 1.5,
                borderRadius: "10px",
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                letterSpacing: 0.5,
                position: "relative",
                overflow: "hidden",
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.6)}`,
                  transform: "translateY(-2px)",
                },
                "&:active": {
                  transform: "translateY(1px)",
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(120deg, transparent 30%, ${alpha(theme.palette.common.white, 0.2)} 50%, transparent 70%)`,
                  transition: "all 0.5s ease",
                },
                "&:hover::before": {
                  left: "100%",
                },
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress size={24} sx={{ mr: 1.5, color: "white" }} />
                  <Typography variant="body1">Logging in...</Typography>
                </Box>
              ) : (
                "Sign In"
              )}
            </Button>

            <Divider 
              sx={{ 
                my: 3,
                "&::before, &::after": {
                  borderColor: alpha(theme.palette.divider, 0.5),
                },
              }}
            >
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  px: 1, 
                  fontWeight: 500,
                  color: theme.palette.mode === "dark" 
                    ? theme.palette.grey[400]
                    : theme.palette.grey[600],
                }}
              >
                OR
              </Typography>
            </Divider>

            <Box sx={{ textAlign: "center", mt: 1 }}>
              <Typography variant="body1" color="text.secondary">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                    position: "relative",
                    display: "inline-block",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      width: 0,
                      height: "2px",
                      bottom: -2,
                      left: 0,
                      background: theme.palette.primary.main,
                      transition: "width 0.3s ease",
                    },
                    "&:hover::after": {
                      width: "100%",
                    },
                  }}
                >
                  Create an account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;