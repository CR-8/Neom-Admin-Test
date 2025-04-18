import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Avatar,
  IconButton,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useTheme,
  alpha,
  CircularProgress,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  useMediaQuery,
  Alert,
  Stack,
  FormControl,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Badge,
  Drawer,
  ListItemIcon,
  ListItemButton,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  FormGroup,
  FormLabel,
  Slider,
  Rating,
  LinearProgress,
  Skeleton,
  AlertTitle,
  Snackbar,
  Fade,
  Zoom,
  Grow,
  Slide,
  useScrollTrigger,
  AppBar,
  Toolbar,
  MenuList,
} from "@mui/material";
import {
  People as UsersIcon,
  ShoppingCart as OrdersIcon,
  Inventory as ProductsIcon,
  AttachMoney as RevenueIcon,
  ArrowForward as ArrowForwardIcon,
  DateRange as DateRangeIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  Description as CsvIcon,
  Code as JsonIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  KeyboardArrowLeft as ChevronLeftIcon,
  KeyboardArrowRight as ChevronRightIcon,
  KeyboardArrowUp as ChevronUpIcon,
  KeyboardArrowDown as ChevronDownIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  ExitToApp as ExitToAppIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  ShowChart as ShowChartIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  InsertChart as LineChartIcon,
  ScatterPlot as ScatterPlotIcon,
  BubbleChart as BubbleChartIcon,
  Radar as RadarIcon,
  DonutLarge as DonutLargeIcon,
  DonutSmall as DonutSmallIcon,
} from "@mui/icons-material";
import axios from "axios";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap,
  Sankey,
  Funnel,
  FunnelChart,
  RadialBarChart,
  RadialBar,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  Brush,
  ErrorBar,
  Label,
  LabelList,
  Sector,
  Surface,
  ZAxis,
  DefaultTooltipContent,
} from "recharts";
import { useSnackbar } from "notistack";
import StatsCard from "../components/widgets/StatsCard";
import { analyticsAPI, dashboardAPI } from "../services/api";
import ErrorHandler from "../components/common/ErrorHandler";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency } from "../utils/formatters";
import DashboardCharts from "../components/charts/DashboardCharts";
import { fetchAndCalculateAnalytics, exportAnalyticsData } from "../data/analyticsData";

// Define a basic logger if it's not available
const logger = {
  info: (message, data) => console.log(`INFO: ${message}`, data || ""),
  debug: (message, data) => console.log(`DEBUG: ${message}`, data || ""),
  warn: (message, data) => console.warn(`WARN: ${message}`, data || ""),
  error: (message, data) => console.error(`ERROR: ${message}`, data || ""),
  forceLog: (message, data) => {
    console.log(
      `%c FORCE LOG: ${message}`,
      "background: #ff0000; color: white; font-size: 16px",
      data || ""
    );
  },
};

// Immediately log that the Dashboard module is being loaded
logger.info("Dashboard component module loading");
console.log("DIRECT LOG: Dashboard component is being loaded");

// Force a console output to verify logging is working
alert("Debug mode enabled. Check console for logs.");

// Colors for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
];

const TIME_RANGES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    usersTrend: 0,
    ordersTrend: 0,
    productsTrend: 0,
    revenueTrend: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [timeRange, setTimeRange] = useState(TIME_RANGES[1].value);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportMenuAnchor, setReportMenuAnchor] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { currentUser } = useAuth();
  const [analyticsData, setAnalyticsData] = useState({
    salesTrend: [],
    categoryDistribution: [],
    topProducts: [],
    customerSegments: [],
    revenueByCategory: [],
    orderStatusDistribution: [],
    customerRetention: [],
    productPerformance: [],
    salesByRegion: [],
    paymentMethods: [],
  });

  const [customDateRange, setCustomDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Add immediate debug log at component initialization
  logger.info("Dashboard component initialized");
  console.log("DIRECT LOG: Dashboard component initialized");

  // Debug state changes
  useEffect(() => {
    logger.info("Stats state updated", stats);
    console.log("DIRECT LOG - Current stats:", stats);
  }, [stats]);

  useEffect(() => {
    logger.info("Sales data updated", { count: salesData?.length });
    console.log("DIRECT LOG - Current sales data:", salesData);
  }, [salesData]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch analytics data with real API calculations
      const analyticsData = await fetchAndCalculateAnalytics(timeRange, customDateRange);
      
      // Update all states with data
      setStats(analyticsData.stats);
      setSalesData(analyticsData.salesTrend);
      setTopProducts(analyticsData.topProducts);
      setCategoryDistribution(analyticsData.categoryDistribution);
      setAnalyticsData(analyticsData);
      
      // Log successful data fetch
      console.log("Dashboard data loaded successfully");
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
      enqueueSnackbar("Error loading dashboard data", { variant: "error" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange, customDateRange, enqueueSnackbar]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle time range change
  const handleTimeRangeChange = useCallback(
    (event, newValue) => {
      if (newValue !== timeRange) {
        setTimeRange(newValue);
        setRefreshing(true);
      }
    },
    [timeRange]
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle export
  const handleExport = useCallback((format) => {
    try {
      // Implementation will depend on your export needs
      enqueueSnackbar(`Exporting data as ${format.toUpperCase()}`, { 
        variant: "info" 
      });
      
      // Call export function and handle the result
      // This would integrate with your exportAnalyticsData function
      // from analyticsData.js
      
    } catch (error) {
      console.error("Export error:", error);
      enqueueSnackbar("Export failed", { variant: "error" });
    }
  }, [enqueueSnackbar]);

  // Show loading state
  if (loading && !refreshing) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {/* Header Section */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1">
          Dashboard Overview
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outlined"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            variant="outlined"
            onClick={(e) => setReportMenuAnchor(e.currentTarget)}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Time Range Selector */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={timeRange}
          onChange={handleTimeRangeChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              minWidth: 100,
              textTransform: "none",
            },
          }}
        >
          {TIME_RANGES.map((range) => (
            <Tab
              key={range.value}
              value={range.value}
              label={range.label}
              disabled={refreshing}
            />
          ))}
        </Tabs>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 140,
              background: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <UsersIcon sx={{ color: "primary.main", mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Total Users
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
              {stats.totalUsers}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="body2"
                sx={{
                  color: stats.usersTrend >= 0 ? "success.main" : "error.main",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {stats.usersTrend >= 0 ? (
                  <ArrowUpwardIcon fontSize="small" />
                ) : (
                  <ArrowDownwardIcon fontSize="small" />
                )}
                {Math.abs(stats.usersTrend)}%
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                vs last period
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 140,
              background: alpha(theme.palette.secondary.main, 0.1),
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <OrdersIcon sx={{ color: "secondary.main", mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Total Orders
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
              {stats.totalOrders}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="body2"
                sx={{
                  color: stats.ordersTrend >= 0 ? "success.main" : "error.main",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {stats.ordersTrend >= 0 ? (
                  <ArrowUpwardIcon fontSize="small" />
                ) : (
                  <ArrowDownwardIcon fontSize="small" />
                )}
                {Math.abs(stats.ordersTrend)}%
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                vs last period
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 140,
              background: alpha(theme.palette.info.main, 0.1),
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <ProductsIcon sx={{ color: "info.main", mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Total Products
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
              {stats.totalProducts}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="body2"
                sx={{
                  color:
                    stats.productsTrend >= 0 ? "success.main" : "error.main",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {stats.productsTrend >= 0 ? (
                  <ArrowUpwardIcon fontSize="small" />
                ) : (
                  <ArrowDownwardIcon fontSize="small" />
                )}
                {Math.abs(stats.productsTrend)}%
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                vs last period
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 140,
              background: alpha(theme.palette.success.main, 0.1),
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <RevenueIcon sx={{ color: "success.main", mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Total Revenue
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
              {formatCurrency(stats.totalRevenue)}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="body2"
                sx={{
                  color:
                    stats.revenueTrend >= 0 ? "success.main" : "error.main",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {stats.revenueTrend >= 0 ? (
                  <ArrowUpwardIcon fontSize="small" />
                ) : (
                  <ArrowDownwardIcon fontSize="small" />
                )}
                {Math.abs(stats.revenueTrend)}%
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                vs last period
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <DashboardCharts
        salesData={salesData}
        categoryData={categoryDistribution}
        loading={loading}
        timeRange={timeRange}
      />

      {/* Additional Analytics Section */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Top Products Table */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Products
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Sales</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">{product.sales}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(product.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {analyticsData.salesTrend.slice(0, 5).map((activity, index) => (
                <ListItem key={index} divider={index < 4}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <OrdersIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${activity.orders} orders processed`}
                    secondary={activity.date}
                  />
                  <Typography variant="body2" color="primary">
                    {formatCurrency(activity.revenue)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Export Menu */}
      <Menu
        anchorEl={reportMenuAnchor}
        open={Boolean(reportMenuAnchor)}
        onClose={() => setReportMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setReportMenuAnchor(null); /* Handle PDF export */
          }}
        >
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          Export as PDF
        </MenuItem>
        <MenuItem
          onClick={() => {
            setReportMenuAnchor(null); /* Handle CSV export */
          }}
        >
          <ListItemIcon>
            <CsvIcon fontSize="small" />
          </ListItemIcon>
          Export as CSV
        </MenuItem>
        <MenuItem
          onClick={() => {
            setReportMenuAnchor(null); /* Handle JSON export */
          }}
        >
          <ListItemIcon>
            <JsonIcon fontSize="small" />
          </ListItemIcon>
          Export as JSON
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default React.memo(Dashboard);
