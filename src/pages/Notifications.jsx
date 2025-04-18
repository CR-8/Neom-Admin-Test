import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  useTheme,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  MenuItem,
  Menu,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Done as DoneIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { useSnackbar } from 'notistack';
import { notificationAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Notifications = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user, isAuthenticated, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const verifyAuth = () => {
    if (!isAuthenticated || !user?.id) {
      enqueueSnackbar('Please log in to view notifications', { variant: 'error' });
      navigate('/login');
      return false;
    }
    return true;
  };

  const fetchNotifications = useCallback(async () => {
    if (!verifyAuth()) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await notificationAPI.getAll();
      if (response?.data?.notifications) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response?.status === 401) {
        enqueueSnackbar('Session expired. Please log in again.', { variant: 'error' });
        logout();
        navigate('/login');
      } else {
        setError('Failed to load notifications. Please try again later.');
        enqueueSnackbar('Failed to load notifications', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, navigate, isAuthenticated, user, logout]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [fetchNotifications, isAuthenticated]);

  const handleMarkAsRead = async (notificationId) => {
    if (!verifyAuth()) return;
    
    try {
      setActionLoading(true);
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      enqueueSnackbar('Notification marked as read', { variant: 'success' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      if (error.response?.status === 401) {
        enqueueSnackbar('Session expired. Please log in again.', { variant: 'error' });
        logout();
        navigate('/login');
      } else {
        enqueueSnackbar('Failed to mark notification as read', { variant: 'error' });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!verifyAuth()) return;
    
    try {
      setActionLoading(true);
      await notificationAPI.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      enqueueSnackbar('Notification deleted', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      if (error.response?.status === 401) {
        enqueueSnackbar('Session expired. Please log in again.', { variant: 'error' });
        logout();
        navigate('/login');
      } else {
        enqueueSnackbar('Failed to delete notification', { variant: 'error' });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!verifyAuth()) return;
    
    try {
      setActionLoading(true);
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      enqueueSnackbar('All notifications marked as read', { variant: 'success' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      if (error.response?.status === 401) {
        enqueueSnackbar('Session expired. Please log in again.', { variant: 'error' });
        logout();
        navigate('/login');
      } else {
        enqueueSnackbar('Failed to mark all as read', { variant: 'error' });
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Please log in to view your notifications.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ p: 3 }}>
      <Card 
        elevation={0} 
        sx={{ 
          mb: 3,
          background: 'linear-gradient(to right, #3a7bd5, #00d2ff)',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Notifications
          </Typography>
          <Typography variant="body1">
            Stay updated with your latest activities and alerts
          </Typography>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card elevation={0} sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">
              All Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip 
                label={`${unreadCount} unread`}
                color="primary"
                size="small"
              />
            )}
          </Stack>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={actionLoading ? <CircularProgress size={20} /> : <DoneIcon />}
              onClick={handleMarkAllAsRead}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Mark all as read'}
            </Button>
          )}
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body1" color="text.secondary" align="center">
                    No notifications
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <Box key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: !notification.read ? theme.palette.primary.main + '10' : 'inherit',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: theme.palette.primary.main + '15',
                    },
                  }}
                  secondaryAction={
                    <>
                      <IconButton
                        edge="end"
                        onClick={(event) => {
                          setAnchorEl(event.currentTarget);
                          setSelectedNotification(notification);
                        }}
                        disabled={actionLoading}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemIcon>
                    <NotificationsIcon color={notification.read ? "disabled" : "primary"} />
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </Typography>
                        {!notification.read && (
                          <Chip
                            label="New"
                            size="small"
                            color="primary"
                            sx={{ height: 20 }}
                          />
                        )}
                      </Stack>
                    }
                  />
                </ListItem>
                <Divider />
              </Box>
            ))
          )}
        </List>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedNotification(null);
        }}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem 
            onClick={() => {
              handleMarkAsRead(selectedNotification.id);
              setAnchorEl(null);
            }}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Mark as read'}
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => {
            handleDelete(selectedNotification.id);
            setAnchorEl(null);
          }} 
          sx={{ color: 'error.main' }}
          disabled={actionLoading}
        >
          {actionLoading ? 'Processing...' : 'Delete'}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Notifications;