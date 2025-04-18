import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Stack,
  Switch,
  FormGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Tab,
  Tabs,
  Card,
  CardContent,
  Divider,
  Avatar,
  useTheme,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  alpha,
  CircularProgress,
  Tooltip,
  Fade,
  Zoom,
  IconButton,
  Collapse,
  useMediaQuery,
} from "@mui/material";
import {
  Person as PersonIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Palette as ThemeIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  CloudUpload as CloudUploadIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useThemeContext } from "../theme/ThemeProvider";
import { userAPI } from "../services/api";
import { styled } from '@mui/system';
import { useAuth } from "../contexts/AuthContext";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[3],
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': { 
    opacity: 0.8,
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[6]
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  textTransform: 'none',
  padding: '10px 24px',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition: 'all 0.3s ease',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      }
    }
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 12,
  transition: 'all 0.3s ease',
  '&:hover': {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    }
  }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.8)
    : alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 8px 24px -4px ${alpha(theme.palette.common.black, 0.3)}`
      : `0 8px 24px -4px ${alpha(theme.palette.common.black, 0.1)}`
  }
}));

const AvatarUpload = ({ user, onAvatarUpdate }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated, user: authUser } = useAuth();
  
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        enqueueSnackbar('Please upload a valid image file (JPEG, PNG, GIF or WebP)', { variant: 'error' });
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        enqueueSnackbar('Image file size should be less than 5MB', { variant: 'error' });
        return;
    }
    
    // Use the user ID from auth context if available, otherwise use the passed user prop
    const userId = authUser?.id || user?.id;
    
    if (!isAuthenticated || !userId) {
        console.error('Auth state:', { isAuthenticated, userId, authUser, user });
        enqueueSnackbar('Authentication error. Please try logging in again.', { variant: 'error' });
        return;
    }
    
    setLoading(true);
    try {
        const formData = new FormData();
        formData.append('avatar', file);
        
        const response = await userAPI.uploadAvatar(userId, formData);
        
        if (response?.data?.data?.avatar) {
            onAvatarUpdate(response.data.data.avatar);
            enqueueSnackbar('Avatar uploaded successfully', { variant: 'success' });
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        console.error('Error uploading avatar:', error);
        enqueueSnackbar(
            error.response?.data?.message || 
            error.message || 
            'Failed to upload avatar. Please try again.',
            { variant: 'error' }
        );
    } finally {
        setLoading(false);
    }
  };
  
  return (
    <Box sx={{ textAlign: 'center', mb: 3 }}>
      <input
        accept="image/*"
        id="avatar-upload"
        type="file"
        style={{ display: 'none' }}
        onChange={handleAvatarUpload}
      />
      <label htmlFor="avatar-upload">
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <StyledAvatar
            src={user?.avatar}
            alt={user?.name || 'User avatar'}
          />
          {loading && (
            <CircularProgress
              size={30}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-15px',
                marginLeft: '-15px'
              }}
            />
          )}
          <Box
            sx={{
              position: 'absolute',
              bottom: -5,
              right: -5,
              bgcolor: theme.palette.primary.main,
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme.shadows[3],
              border: `2px solid ${theme.palette.background.paper}`
            }}
          >
            <CloudUploadIcon sx={{ color: 'white', fontSize: 18 }} />
          </Box>
        </Box>
      </label>
      <Typography variant="subtitle2" sx={{ mt: 2 }}>
        Click to upload avatar
      </Typography>
    </Box>
  );
};

const Settings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { colorMode } = useThemeContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user: authUser, isAuthenticated } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  
  // Get user data from localStorage
  const getUserFromStorage = () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData || userData === 'undefined') return null;
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  const [user, setUser] = useState(() => {
    // First try to get from auth context, then fallback to localStorage
    return authUser || getUserFromStorage() || {
      id: '',
      name: '',
      email: '',
      avatar: '',
    };
  });

  useEffect(() => {
    // Update user state when auth context changes
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  const [profile, setProfile] = useState(() => {
    const user = getUserFromStorage();
    return {
      fullName: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "",
      bio: user?.bio || ""
    };
  });

  const [preferences, setPreferences] = useState({
    language: localStorage.getItem('language') || 'english',
    timezone: localStorage.getItem('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: localStorage.getItem('dateFormat') || 'MM/DD/YYYY',
    timeFormat: localStorage.getItem('timeFormat') || '12h'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: localStorage.getItem('emailNotifications') !== 'false',
    orderUpdates: localStorage.getItem('orderUpdates') !== 'false',
    productAlerts: localStorage.getItem('productAlerts') !== 'false',
    securityAlerts: localStorage.getItem('securityAlerts') !== 'false',
    newsletterSubscription: localStorage.getItem('newsletterSubscription') === 'true'
  });

  const [displaySettings, setDisplaySettings] = useState({
    darkMode: theme.palette.mode === 'dark',
    compactMode: localStorage.getItem('compactMode') === 'true',
    fontSize: localStorage.getItem('fontSize') || 'medium',
    animationsEnabled: localStorage.getItem('animationsEnabled') !== 'false'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = (section) => {
    const newErrors = {};
    
    switch(section) {
      case 'profile':
        if (!profile.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!profile.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profile.email)) {
          newErrors.email = 'Invalid email address';
        }
        if (profile.phone && !/^\+?[1-9]\d{1,14}$/.test(profile.phone)) {
          newErrors.phone = 'Invalid phone number';
        }
        break;
        
      case 'preferences':
        if (!preferences.language) newErrors.language = 'Language is required';
        if (!preferences.timezone) newErrors.timezone = 'Timezone is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSaveSettings = async (section) => {
    if (!validateForm(section)) return;
    
    setIsSubmitting(true);
    try {
      switch (section) {
        case 'profile':
          const currentUser = getUserFromStorage();
          if (!currentUser?.id) {
            enqueueSnackbar('User ID not found. Please log in again.', { variant: 'error' });
            setIsSubmitting(false);
            return;
          }
          
          const response = await userAPI.update(currentUser.id, {
            name: profile.fullName,
            email: profile.email,
            phone: profile.phone,
            bio: profile.bio
          });
          
          if (response?.data?.user) {
            // Update localStorage with the complete user data from the response
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser(response.data.user);
            setProfile({
              fullName: response.data.user.name || "",
              email: response.data.user.email || "",
              phone: response.data.user.phone || "",
              role: response.data.user.role || "",
              bio: response.data.user.bio || ""
            });
          }
          break;
  
        case 'preferences':
          // Save preferences to localStorage
          Object.entries(preferences).forEach(([key, value]) => {
            localStorage.setItem(key, value);
          });
          break;
  
        case 'notifications':
          // Save notification settings to localStorage
          Object.entries(notificationSettings).forEach(([key, value]) => {
            localStorage.setItem(key, value);
          });
          break;
  
        case 'display':
          // Save display settings to localStorage
          Object.entries(displaySettings).forEach(([key, value]) => {
            if (key !== 'darkMode') { // darkMode is handled by ThemeProvider
              localStorage.setItem(key, value);
            }
          });
          break;
      }
  
      enqueueSnackbar(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`, {
        variant: 'success'
      });
    } catch (error) {
      console.error(`Error saving ${section} settings:`, error);
      enqueueSnackbar(error.response?.data?.message || `Failed to save ${section} settings`, {
        variant: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpdate = (avatarUrl) => {
    setUser(prev => ({ ...prev, avatar: avatarUrl }));
    
    // Update local storage
    const userData = getUserFromStorage();
    if (userData) {
      userData.avatar = avatarUrl;
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const handleSectionToggle = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderValidationIcon = (field) => {
    if (!errors[field]) return null;
    return (
      <Tooltip title={errors[field]} arrow>
        <ErrorIcon color="error" sx={{ ml: 1 }} />
      </Tooltip>
    );
  };

  const renderSuccessIcon = (field) => {
    if (errors[field]) return null;
    return (
      <Tooltip title="Valid" arrow>
        <CheckCircleIcon color="success" sx={{ ml: 1 }} />
      </Tooltip>
    );
  };

  // Add dark mode toggle to display settings
  const handleThemeToggle = () => {
    colorMode.toggleColorMode();
    setDisplaySettings(prev => ({
      ...prev,
      darkMode: !prev.darkMode
    }));
  };

  const tabs = [
    {
      label: "Profile",
      icon: <PersonIcon />,
      content: (
        <Fade in={true} timeout={500}>
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
              User Profile
              <Tooltip title="Update your personal information" arrow>
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <AvatarUpload user={user} onAvatarUpdate={handleAvatarUpdate} />
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Upload a new avatar
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    JPG, PNG or GIF, max 5MB
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                  <StyledTextField
                    fullWidth
                    label="Full Name"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                    disabled={isSubmitting}
                    InputProps={{
                      endAdornment: (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {renderValidationIcon('fullName')}
                          {renderSuccessIcon('fullName')}
                        </Box>
                      )
                    }}
                  />
                  <StyledTextField
                    fullWidth
                    label="Email"
                    value={profile.email}
                    type="email"
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={isSubmitting}
                    InputProps={{
                      endAdornment: (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {renderValidationIcon('email')}
                          {renderSuccessIcon('email')}
                        </Box>
                      )
                    }}
                  />
                  <StyledTextField
                    fullWidth
                    label="Phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    disabled={isSubmitting}
                    InputProps={{
                      endAdornment: (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {renderValidationIcon('phone')}
                          {renderSuccessIcon('phone')}
                        </Box>
                      )
                    }}
                  />
                  <StyledTextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <StyledButton
                    variant="contained"
                    onClick={() => handleSaveSettings('profile')}
                    sx={{ alignSelf: 'flex-start' }}
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                  </StyledButton>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )
    },
    {
      label: "Preferences",
      icon: <LanguageIcon />,
      content: (
        <Fade in={true} timeout={500}>
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
              Regional Preferences
              <Tooltip title="Set your language and regional settings" arrow>
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <StyledSelect
                    value={preferences.language}
                    label="Language"
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    error={!!errors.language}
                    disabled={isSubmitting}
                  >
                    <MenuItem value="english">English</MenuItem>
                    <MenuItem value="spanish">Spanish</MenuItem>
                    <MenuItem value="french">French</MenuItem>
                  </StyledSelect>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Time Zone</InputLabel>
                  <StyledSelect
                    value={preferences.timezone}
                    label="Time Zone"
                    onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                    error={!!errors.timezone}
                    disabled={isSubmitting}
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">Eastern Time</MenuItem>
                    <MenuItem value="Asia/Kolkata">India Standard Time</MenuItem>
                  </StyledSelect>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <StyledSelect
                    value={preferences.dateFormat}
                    label="Date Format"
                    onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                  >
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </StyledSelect>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Time Format</InputLabel>
                  <StyledSelect
                    value={preferences.timeFormat}
                    label="Time Format"
                    onChange={(e) => setPreferences({ ...preferences, timeFormat: e.target.value })}
                  >
                    <MenuItem value="12h">12 Hour</MenuItem>
                    <MenuItem value="24h">24 Hour</MenuItem>
                  </StyledSelect>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <StyledButton
                  variant="contained"
                  onClick={() => handleSaveSettings('preferences')}
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {isSubmitting ? 'Saving...' : 'Save Preferences'}
                </StyledButton>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )
    },
    {
      label: "Notifications",
      icon: <NotificationsIcon />,
      content: (
        <Fade in={true} timeout={500}>
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
              Notification Settings
              <Tooltip title="Manage your notification preferences" arrow>
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      emailNotifications: e.target.checked
                    })}
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.orderUpdates}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      orderUpdates: e.target.checked
                    })}
                  />
                }
                label="Order Updates"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.productAlerts}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      productAlerts: e.target.checked
                    })}
                  />
                }
                label="Product Alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.securityAlerts}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      securityAlerts: e.target.checked
                    })}
                  />
                }
                label="Security Alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.newsletterSubscription}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      newsletterSubscription: e.target.checked
                    })}
                  />
                }
                label="Newsletter Subscription"
              />
              <StyledButton
                variant="contained"
                onClick={() => handleSaveSettings('notifications')}
                sx={{ alignSelf: 'flex-start' }}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? 'Saving...' : 'Save Notification Settings'}
              </StyledButton>
            </Stack>
          </Box>
        </Fade>
      )
    },
    {
      label: "Display",
      icon: <ThemeIcon />,
      content: (
        <Fade in={true} timeout={500}>
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
              Display Settings
              <Tooltip title="Customize your display preferences" arrow>
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Stack spacing={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={displaySettings.darkMode}
                    onChange={handleThemeToggle}
                    icon={<LightModeIcon />}
                    checkedIcon={<DarkModeIcon />}
                  />
                }
                label={`${displaySettings.darkMode ? 'Dark' : 'Light'} Mode`}
              />
              <StyledButton
                variant="contained"
                onClick={() => handleSaveSettings('display')}
                sx={{ alignSelf: 'flex-start' }}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? 'Saving...' : 'Save Display Settings'}
              </StyledButton>
            </Stack>
          </Box>
        </Fade>
      )
    }
  ];

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {!isAuthenticated && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please log in to access settings
        </Alert>
      )}
      <StyledPaper 
        elevation={0} 
        sx={{ 
          mb: 3,
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.8)}, ${alpha(theme.palette.primary.main, 0.6)})`
            : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
          color: 'white',
          p: 4,
          borderRadius: 3,
          boxShadow: theme.shadows[4],
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Settings
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Customize your account preferences and settings
        </Typography>
      </StyledPaper>

      <StyledPaper elevation={0}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant={isMobile ? "fullWidth" : "scrollable"}
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              transition: 'all 0.3s ease',
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                transform: 'translateY(-2px)',
              },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              backgroundColor: theme.palette.primary.main,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>

        {tabs.map((tab, index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            {tab.content}
          </TabPanel>
        ))}
      </StyledPaper>
    </Box>
  );
};

export default Settings;

