import { createContext, useMemo, useState, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Color tokens
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode
          primary: {
            main: '#3a7bd5',
            light: '#63a4ff',
            dark: '#0056a3',
            contrastText: '#fff',
          },
          secondary: {
            main: '#00bcd4',
            light: '#62efff',
            dark: '#008ba3',
            contrastText: '#fff',
          },
          success: {
            main: '#4caf50',
            light: '#81c784',
            dark: '#388e3c',
            contrastText: '#fff',
          },
          error: {
            main: '#f44336',
            light: '#e57373',
            dark: '#d32f2f',
            contrastText: '#fff',
          },
          warning: {
            main: '#ff9800',
            light: '#ffb74d',
            dark: '#f57c00',
            contrastText: 'rgba(0, 0, 0, 0.87)',
          },
          info: {
            main: '#2196f3',
            light: '#64b5f6',
            dark: '#1976d2',
            contrastText: '#fff',
          },
          background: {
            default: '#f5f7fa',
            paper: '#ffffff',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
          },
          divider: 'rgba(0, 0, 0, 0.12)',
        }
      : {
          // Dark mode
          primary: {
            main: '#4f8cef',
            light: '#83b4ff',
            dark: '#2c5fbc',
            contrastText: '#fff',
          },
          secondary: {
            main: '#03daf2',
            light: '#5ff6ff',
            dark: '#00a0b7',
            contrastText: '#000',
          },
          success: {
            main: '#66bb6a',
            light: '#98ee99',
            dark: '#338a3e',
            contrastText: 'rgba(0, 0, 0, 0.87)',
          },
          error: {
            main: '#ef5350',
            light: '#ff867c',
            dark: '#b61827',
            contrastText: '#fff',
          },
          warning: {
            main: '#ffa726',
            light: '#ffd95b',
            dark: '#c77800',
            contrastText: 'rgba(0, 0, 0, 0.87)',
          },
          info: {
            main: '#29b6f6',
            light: '#73e8ff',
            dark: '#0086c3',
            contrastText: 'rgba(0, 0, 0, 0.87)',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
          },
          divider: 'rgba(255, 255, 255, 0.12)',
        }),
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light' 
            ? '0 2px 10px rgba(0, 0, 0, 0.05)'
            : '0 2px 10px rgba(0, 0, 0, 0.2)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light' 
            ? '0 2px 10px rgba(0, 0, 0, 0.05)'
            : '0 2px 10px rgba(0, 0, 0, 0.2)',
          borderRadius: 12,
        },
      },
    },
  },
});

// Context
const ThemeContext = createContext({
  toggleColorMode: () => {},
  mode: 'light',
});

// Hook to use the theme context
export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Safely get theme mode from localStorage with error handling
  const getStoredThemeMode = () => {
    try {
      return localStorage.getItem('themeMode');
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
      return null;
    }
  };

  // Check if dark mode is saved in localStorage
  const storedMode = getStoredThemeMode();
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const defaultMode = storedMode || (prefersDarkMode ? 'dark' : 'light');
  
  const [mode, setMode] = useState(defaultMode);

  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    },
    mode,
  }), [mode]);

  // Apply the theme settings
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  // Save theme preference to localStorage with error handling
  useEffect(() => {
    try {
      localStorage.setItem('themeMode', mode);
    } catch (error) {
      console.warn('Failed to save theme preference to localStorage:', error);
    }
  }, [mode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      if (!getStoredThemeMode()) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
