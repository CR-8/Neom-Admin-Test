import { useState, useEffect, useCallback, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  InputBase,
  Avatar,
  Tooltip,
  useTheme,
  Switch,
  FormControlLabel,
  Divider,
  ListItemIcon,
  Button,
  CircularProgress,
  Alert,
  Collapse,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Mail as MailIcon,
  MoreVert as MoreIcon,
  ShoppingCart as OrderIcon,
  Payment as PaymentIcon,
  LocalShipping as DeliveryIcon,
  Campaign as PromotionIcon,
  TrendingDown as PriceDropIcon,
  Inventory as StockIcon,
  RateReview as ReviewIcon,
  Error as ErrorIcon,
  Category as ProductsIcon,
} from "@mui/icons-material";
import { alpha, styled } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";
import { useThemeContext } from "../theme/ThemeProvider";
import { notificationAPI } from "../services/api";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { useAuth } from '../contexts/AuthContext';

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(
    theme.palette.mode === "light"
      ? theme.palette.common.black
      : theme.palette.common.white,
    0.08
  ),
  "&:hover": {
    backgroundColor: alpha(
      theme.palette.mode === "light"
        ? theme.palette.common.black
        : theme.palette.common.white,
      0.12
    ),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
    minWidth: "240px",
    maxWidth: "400px",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff"
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: theme.palette.mode === "dark" ? "#003892" : "#001e3c",
    width: 32,
    height: 32,
    "&:before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        "#fff"
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
    borderRadius: 20 / 2,
  },
}));

const NotificationGroup = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const NotificationDate = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  padding: theme.spacing(1, 2),
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
}));

const getNotificationIcon = (type) => {
  switch (type) {
    case 'order_status':
      return <OrderIcon />;
    case 'payment_status':
      return <PaymentIcon />;
    case 'delivery_update':
      return <DeliveryIcon />;
    case 'promotion':
      return <PromotionIcon />;
    case 'price_drop':
      return <PriceDropIcon />;
    case 'back_in_stock':
      return <StockIcon />;
    case 'review_approved':
      return <ReviewIcon />;
    default:
      return <NotificationsIcon />;
  }
};

const formatNotificationDate = (date) => {
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'MMM d, yyyy');
};

const createMockNotifications = () => {
  const types = ['order_status', 'payment_status', 'delivery_update', 'promotion', 'price_drop', 'back_in_stock', 'review_approved'];
  const mockNotifications = [];
  
  // Create 5 mock notifications with different types and dates
  for (let i = 1; i <= 5; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const read = Math.random() > 0.5;
    mockNotifications.push({
      _id: `mock-${i}`,
      title: `Mock Notification ${i}`,
      message: `This is a mock ${type.replace('_', ' ')} notification for testing purposes.`,
      type,
      read,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
    });
  }

  return mockNotifications;
};

const Navbar = () => {
  const theme = useTheme();
  const { toggleColorMode } = useThemeContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);
  const { user } = useAuth();

  const isMenuOpen = Boolean(anchorEl);
  const isNotificationsMenuOpen = Boolean(notificationsAnchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt);
    const dateStr = formatNotificationDate(date);
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(notification);
    return groups;
  }, {});

  const getPageTitle = () => {
    const pathname = location.pathname;
    if (pathname === "/") return "Dashboard";
    return pathname.substring(1).charAt(0).toUpperCase() + pathname.slice(2);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleNotificationsMenuClose = () => {
    setNotificationsAnchorEl(null);
    setError(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const handleLogout = () => {
    handleMenuClose();
    navigate("/logout");
  };

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Always use mock data if there are connection issues
      let mockNotifications;
      let mockUnreadCount;
      
      try {
        // Try to get unread count first - this will also tell us if we have access
        let newUnreadCount = 0;
        try {
          let unreadResponse = await notificationAPI.getUnreadCount();
          newUnreadCount = unreadResponse.data.count;
          
          // If we got here, we have permission - now fetch notifications
          let response = await notificationAPI.getAll({
            page: 1,
            limit: 5
          });
          
          // Update state with real data
          setNotifications(response.data.data.notifications || []);
          setIsAdmin(response.config?.url?.includes('/admin/'));
          
          // Play sound only if there are new unread notifications
          if (newUnreadCount > prevUnreadCount) {
            try {
              const audio = new Audio('/notification.mp3');
              audio.play().catch(() => {
                // Silently fail if audio can't be played
                console.debug('Notification sound could not be played');
              });
            } catch (error) {
              // Silently fail if audio creation fails
              console.debug('Notification sound could not be created');
            }
          }
          
          setPrevUnreadCount(newUnreadCount);
          setUnreadCount(newUnreadCount);
        } catch (error) {
          // If we can't get the unread count, we might not have permission
          // or there might be connection issues
          console.debug("Error fetching unread count:", error.message);
          throw error; // Propagate to outer catch block
        }
      } catch (error) {
        console.debug("Using mock notifications due to API error:", error.message);
        
        // Create mock data
        mockNotifications = createMockNotifications();
        mockUnreadCount = mockNotifications.filter(n => !n.read).length;
        
        // Use mock data
        setIsAdmin(false); 
        setNotifications(mockNotifications);
        setPrevUnreadCount(mockUnreadCount);
        setUnreadCount(mockUnreadCount);
        
        // Only show error to user for unexpected errors
        if (error.code === 'ERR_NETWORK' || 
            error.code === 'ERR_CONNECTION_REFUSED' || 
            error.code === 'ERR_CONNECTION_RESET') {
          console.debug('Network error, using mock data instead');
        } 
        else if (error.response?.status === 403) {
          console.debug('Permission error, using mock data instead');
        }
        else if (error.response?.status === 404) {
          console.debug('API not found, using mock data instead');
        }
        else {
          // For unexpected errors, show to the user
          console.error("Unexpected API error:", error);
          setError("Failed to load notifications. Using sample data instead.");
        }
      }
    } catch (error) {
      console.error("Critical error in notification system:", error);
      setError("Failed to load notifications. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [prevUnreadCount]);

  const handleNotificationClick = async (notificationId) => {
    try {
      if (isAdmin) {
        await notificationAPI.markAsRead(notificationId);
        fetchNotifications();
      } else {
        // Handle mock notifications locally
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setError("Failed to mark notification as read. Please try again.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (isAdmin) {
        await notificationAPI.markAllAsRead();
        fetchNotifications();
      } else {
        // Handle mock notifications locally
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      setError("Failed to mark all notifications as read. Please try again.");
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Set up polling for new notifications
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setIsSearching(true);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout for search
    searchTimeout.current = setTimeout(async () => {
      if (query.trim()) {
        try {
          // TODO: Implement actual search API call
          const mockResults = [
            { id: 1, title: "Product 1", type: "product" },
            { id: 2, title: "Order #123", type: "order" },
            { id: 3, title: "Customer John", type: "customer" },
          ].filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase())
          );
          setSearchResults(mockResults);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300);
  };

  const handleSearchResultClick = (result) => {
    setSearchQuery("");
    setSearchResults([]);
    
    switch (result.type) {
      case "product":
        navigate(`/products/${result.id}`);
        break;
      case "order":
        navigate(`/orders/${result.id}`);
        break;
      case "customer":
        navigate(`/users/${result.id}`);
        break;
      default:
        break;
    }
  };

  const renderNotificationsMenu = (
    <Menu
      anchorEl={notificationsAnchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isNotificationsMenuOpen}
      onClose={handleNotificationsMenuClose}
      PaperProps={{
        sx: {
          maxHeight: 400,
          width: 360,
        },
      }}
    >
      <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="medium">
          Notifications
        </Typography>
        {unreadCount > 0 && (
          <Button size="small" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </Box>
      <Divider />
      <Collapse in={!!error}>
        <Alert severity="error" sx={{ m: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      </Collapse>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : notifications.length > 0 ? (
        Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
          <NotificationGroup key={date}>
            <NotificationDate variant="caption">
              {date}
            </NotificationDate>
            {dateNotifications.map((notification) => (
              <MenuItem
                key={notification._id}
                onClick={() => handleNotificationClick(notification._id)}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  py: 1.5,
                  opacity: notification.read ? 0.7 : 1,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight="medium">
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </NotificationGroup>
        ))
      ) : (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No notifications
          </Typography>
        </Box>
      )}
      <Divider />
      <Box sx={{ p: 1 }}>
        <Button 
          fullWidth 
          onClick={() => {
            handleNotificationsMenuClose();
            navigate('/notifications');
          }}
          sx={{ mt: 1 }}
        >
          View All Notifications
        </Button>
      </Box>
    </Menu>
  );

  const renderProfileMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem
        onClick={() => {
          handleMenuClose();
          navigate("/");
        }}
      >
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        Profile
      </MenuItem>
      <MenuItem
        onClick={() => {
          handleMenuClose();
          navigate("/settings");
        }}
      >
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        Settings
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem
        onClick={() => {
          handleMobileMenuClose();
          navigate("/");
        }}
      >
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        Profile
      </MenuItem>
      <MenuItem
        onClick={() => {
          handleMobileMenuClose();
          navigate("/settings");
        }}
      >
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        Settings
      </MenuItem>
      <MenuItem
        onClick={() => {
          handleMobileMenuClose();
          navigate("/notifications");
        }}
      >
        <ListItemIcon>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon fontSize="small" />
          </Badge>
        </ListItemIcon>
        Notifications
      </MenuItem>
      <Divider />
      <MenuItem
        onClick={() => {
          handleMobileMenuClose();
          navigate("/logout");
        }}
      >
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{
          bgcolor: theme.palette.mode === "dark" ? "background.paper" : "background.paper",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backdropFilter: "blur(20px)",
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              display: { xs: "block", sm: "block" }, 
              fontWeight: 600,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #4f8cef 30%, #03daf2 90%)'
                : 'linear-gradient(45deg, #3a7bd5 30%, #00d2ff 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {getPageTitle()}
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search products, orders, customers..."
              inputProps={{ "aria-label": "search" }}
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery && (
              <Paper
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  mt: 1,
                  maxHeight: 300,
                  overflow: 'auto',
                  zIndex: 1300,
                  boxShadow: theme.shadows[4],
                }}
              >
                {isSearching ? (
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : searchResults.length > 0 ? (
                  <List>
                    {searchResults.map((result) => (
                      <ListItem
                        key={result.id}
                        button
                        onClick={() => handleSearchResultClick(result)}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          },
                        }}
                      >
                        <ListItemIcon>
                          {result.type === 'product' && <ProductsIcon />}
                          {result.type === 'order' && <OrderIcon />}
                          {result.type === 'customer' && <PersonIcon />}
                        </ListItemIcon>
                        <ListItemText primary={result.title} />
                      </ListItem>
                    ))}
                  </List>
                ) : searchQuery.trim() ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No results found
                    </Typography>
                  </Box>
                ) : null}
              </Paper>
            )}
          </Search>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
            <Tooltip title="Toggle theme">
              <IconButton 
                color="inherit" 
                onClick={toggleColorMode} 
                sx={{ 
                  mr: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  }
                }}
              >
                {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifications">
              <IconButton
                size="large"
                aria-label="show new notifications"
                color="inherit"
                onClick={handleNotificationsMenuOpen}
                sx={{
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  }
                }}
              >
                <StyledBadge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </StyledBadge>
              </IconButton>
            </Tooltip>
            <Tooltip title={user?.name || "Account"}>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  }
                }}
              >
                <Avatar 
                  src={user?.avatar}
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: user?.avatar ? 'transparent' : theme.palette.primary.main,
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  {!user?.avatar && (user?.name?.[0] || 'A')}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                }
              }}
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderProfileMenu}
      {renderNotificationsMenu}
    </Box>
  );
};

export default Navbar;
