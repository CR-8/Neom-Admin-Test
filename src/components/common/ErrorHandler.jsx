import { useState, useEffect } from 'react';
import { Alert, Snackbar, Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const ErrorHandler = ({ error, onRetry, fullPage = false }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (error) {
      setOpen(true);
    }
  }, [error]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const getErrorMessage = () => {
    if (!error) return 'An error occurred';
    
    if (error.response) {
      // Server responded with a status code that falls out of the range of 2xx
      return error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      // The request was made but no response was received
      return 'No response from server. Please check your connection.';
    } else if (error.message) {
      // Something happened in setting up the request that triggered an Error
      return error.message;
    }
    
    return 'An unexpected error occurred';
  };
  
  if (fullPage) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 500,
            border: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight="medium">
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {getErrorMessage()}
          </Typography>
          {onRetry && (
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              sx={{ mt: 2, borderRadius: 2 }}
            >
              Try Again
            </Button>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert
        onClose={handleClose}
        severity="error"
        variant="filled"
        sx={{ width: '100%' }}
      >
        {getErrorMessage()}
      </Alert>
    </Snackbar>
  );
};

export default ErrorHandler;
