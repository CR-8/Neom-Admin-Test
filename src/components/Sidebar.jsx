import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Box,
  Avatar,
  Tooltip,
  ListItemButton,
  IconButton,
  useTheme,
  useMediaQuery,
  Collapse,
  alpha,
  Badge,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  ShoppingCart as ProductsIcon,
  Category as CategoryIcon,
  People as UsersIcon,
  Receipt as OrdersIcon,
  BarChart as AnalyticsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  LocalOffer as LocalOfferIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { useThemeContext } from "../theme/ThemeProvider";
import { notificationAPI } from "../services/api";
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;
const collapsedWidth = 76;

const menuItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/",
  },
  {
    text: "Products",
    icon: <ProductsIcon />,
    path: "/products",
    subItems: [
      { text: "All Products", path: "/products" },
      { text: "Categories", path: "/categories" },
    ],
  },
  {
    text: "Orders",
    icon: <OrdersIcon />,
    path: "/orders",
    subItems: [
      { text: "All Orders", path: "/orders" },
      { text: "Pending", path: "/orders?status=pending" },
      { text: "Delivered", path: "/orders?status=delivered" },
    ],
  },
  {
    text: "Customers",
    icon: <UsersIcon />,
    path: "/users",
  },
  {
    text: "Discounts",
    icon: <LocalOfferIcon />,
    path: "/discounts",
  },
  {
    text: "Notifications",
    icon: <NotificationsIcon />,
    path: "/notifications",
    badge: true,
  },
  {
    text: "Settings",
    icon: <SettingsIcon />,
    path: "/settings",
  },
];

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => !["collapsed"].includes(prop),
})(({ theme, collapsed }) => ({
  width: collapsed ? collapsedWidth : drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  overflowX: "hidden",
  "& .MuiDrawer-paper": {
    width: collapsed ? collapsedWidth : drawerWidth,
    boxSizing: "border-box",
    borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    backgroundImage:
      theme.palette.mode === "dark"
        ? `linear-gradient(180deg, 
          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
          ${alpha(theme.palette.background.paper, 0.95)} 100%)`
        : `linear-gradient(180deg, 
          ${alpha(theme.palette.background.paper, 0.98)} 0%, 
          ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
    backdropFilter: "blur(20px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 0 30px rgba(0,0,0,0.3)"
        : "0 0 30px rgba(0,0,0,0.1)",
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => !["collapsed", "nested"].includes(prop),
})(({ theme, selected, nested, collapsed }) => ({
  margin: collapsed ? "6px 8px" : nested ? "2px 12px 2px 24px" : "6px 12px",
  borderRadius: theme.shape.borderRadius,
  paddingLeft: collapsed ? "auto" : nested ? 16 : 20,
  minHeight: 44,
  justifyContent: collapsed ? "center" : "flex-start",
  "&.Mui-selected": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.primary.main, 0.2)
        : alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
    },
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? alpha(theme.palette.primary.main, 0.3)
          : alpha(theme.palette.primary.main, 0.2),
    },
  },
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.common.white, 0.05)
        : alpha(theme.palette.common.black, 0.04),
  },
  "& .MuiListItemIcon-root": {
    minWidth: collapsed ? "auto" : 40,
    marginRight: collapsed ? 0 : 2,
  },
}));

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const colorMode = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [expandedItems, setExpandedItems] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationAPI.getUnreadCount();
        setUnreadCount(response.data.count || 0);
      } catch (error) {
        console.debug("Error fetching unread count:", error.message);
        setUnreadCount(Math.floor(Math.random() * 5) + 1);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const variant = isMobile ? "temporary" : "permanent";

  const handleItemClick = (path, itemText) => {
    navigate(path);
    if (isMobile) onClose();

    if (!collapsed) {
      const hasSubItems = menuItems.find(
        (item) => item.text === itemText
      )?.subItems;
      if (hasSubItems) {
        setExpandedItems((prev) => ({
          ...prev,
          [itemText]: !prev[itemText],
        }));
      }
    }
  };

  const isPathActive = (path) => {
    if (path.includes("?")) {
      const basePath = path.split("?")[0];
      const queryParam = path.split("?")[1];
      return (
        location.pathname === basePath && location.search.includes(queryParam)
      );
    }
    return location.pathname === path;
  };

  const Logo = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        py: 2,
        px: collapsed ? 1 : 3,
        transition: theme.transitions.create(["padding"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      {!collapsed && (
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(45deg, #4f8cef 30%, #03daf2 90%)"
                : "linear-gradient(45deg, #3a7bd5 30%, #00d2ff 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          NEOM Admin
        </Typography>
      )}
      {!isMobile && (
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          size="small"
          sx={{
            ml: collapsed ? "auto" : 0,
            mr: collapsed ? "auto" : 0,
            bgcolor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.common.white, 0.05)
                : alpha(theme.palette.common.black, 0.04),
            "&:hover": {
              bgcolor:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.common.white, 0.08)
                  : alpha(theme.palette.common.black, 0.08),
            },
          }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      )}
    </Box>
  );

  const UserProfile = () => (
    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar 
        src={user?.avatar}
        sx={{ 
          width: 40, 
          height: 40,
          bgcolor: user?.avatar ? 'transparent' : theme.palette.primary.main,
          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        {!user?.avatar && (user?.name?.[0] || 'A')}
      </Avatar>
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {user?.name || 'User'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.email || 'user@example.com'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <StyledDrawer
      variant={variant}
      open={open}
      onClose={onClose}
      collapsed={collapsed}
      anchor="left"
    >
      <Logo />
      <Divider sx={{ mx: 2, opacity: 0.6 }} />
      <UserProfile />
      <Divider sx={{ mx: 2, opacity: 0.6 }} />

      <List sx={{ px: collapsed ? 0.5 : 1, flex: 1 }}>
        {menuItems.map((item) => {
          const isSelected = item.subItems
            ? item.subItems.some((subItem) => isPathActive(subItem.path))
            : isPathActive(item.path);
          const isExpanded = expandedItems[item.text];

          return (
            <Box key={item.text}>
              <Tooltip title={collapsed ? item.text : ""} placement="right">
                <StyledListItemButton
                  selected={isSelected}
                  onClick={() => handleItemClick(item.path, item.text)}
                  collapsed={Boolean(collapsed)}
                  nested={false}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? "auto" : 40,
                      mr: collapsed ? 0 : 2,
                      justifyContent: "center",
                    }}
                  >
                    {item.badge ? (
                      <Badge
                        badgeContent={unreadCount}
                        color="error"
                        sx={{
                          "& .MuiBadge-badge": {
                            right: collapsed ? -2 : -4,
                            top: collapsed ? 2 : 4,
                          },
                        }}
                      >
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  {!collapsed && (
                    <>
                      <ListItemText
                        primary={item.text}
                        sx={{
                          "& .MuiTypography-root": {
                            fontWeight: 500,
                          },
                        }}
                      />
                      {item.subItems &&
                        (isExpanded ? <ExpandLess /> : <ExpandMore />)}
                    </>
                  )}
                </StyledListItemButton>
              </Tooltip>

              {!collapsed && item.subItems && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <StyledListItemButton
                        key={subItem.text}
                        selected={isPathActive(subItem.path)}
                        onClick={() => handleItemClick(subItem.path)}
                        nested={true}
                        collapsed={Boolean(collapsed)}
                      >
                        <ListItemText
                          primary={subItem.text}
                          sx={{
                            "& .MuiTypography-root": {
                              fontSize: "0.875rem",
                              fontWeight: 400,
                            },
                          }}
                        />
                      </StyledListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>

      <Box sx={{ p: collapsed ? 1 : 2, mt: "auto" }}>
        <Tooltip title={collapsed ? "Logout" : ""} placement="right">
          <StyledListItemButton
            onClick={() => navigate("/logout")}
            collapsed={Boolean(collapsed)}
            nested={false}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? "auto" : 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Logout"
                sx={{
                  "& .MuiTypography-root": {
                    fontWeight: 500,
                  },
                }}
              />
            )}
          </StyledListItemButton>
        </Tooltip>
      </Box>
    </StyledDrawer>
  );
};

export default Sidebar;
