import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';

const Unauthorized = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: 'center',
            py: 5,
            px: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Box
              sx={{
                bgcolor: theme.palette.error.light,
                borderRadius: '50%',
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <LockIcon
                sx={{
                  fontSize: 60,
                  color: theme.palette.error.main,
                }}
              />
            </Box>
          </Box>
          <Typography
            variant="h3"
            sx={{
              marginBottom: 2,
              fontWeight: 600,
            }}
          >
            Access Denied
          </Typography>
          <Typography
            variant="body1"
            sx={{
              marginBottom: 4,
              color: theme.palette.text.secondary,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            size="large"
            sx={{ 
              borderRadius: 2,
              paddingX: 4,
              textTransform: 'none',
              fontWeight: 600,
              mr: 2,
            }}
          >
            Back to Dashboard
          </Button>
          <Button
            component={Link}
            to="/login"
            variant="outlined"
            size="large"
            sx={{ 
              borderRadius: 2,
              paddingX: 4,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Login as Different User
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Unauthorized;
