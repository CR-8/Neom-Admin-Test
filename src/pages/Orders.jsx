import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  Card,
  CardContent,
  TextField as MuiTextField, // Rename TextField to avoid conflict
  InputAdornment,
  Divider,
  Avatar,
  Stack,
  Tab,
  Tabs,
  useTheme,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon,
  LocalShipping as ShippingIcon,
  Inventory as PackageIcon,
  DoneAll as DeliveredIcon,
  Pending as PendingIcon,
  NoteAdd as NoteAddIcon,
  Home as ShippingAddressIcon,
  Payment as PaymentIcon,
  MoneyOff as RefundIcon,  // <-- new import for refund action
  // Add these new icons:
  Assessment as ReportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notes as NotesIcon,
  Message as MessageIcon,
  PhoneForwarded as CallIcon,
  Email as EmailIcon,
  Archive as ArchiveIcon,
  Replay as ResendIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  // Additional action icons:
  Assignment as InvoiceIcon,
  Timeline as TrackIcon,
  History as HistoryIcon,
  Autorenew as ProcessIcon,
  Sync as SyncIcon,
  NotificationImportant as AlertIcon,
  AttachMoney as MoneyIcon,
  Info as InfoIcon,
  Help as HelpIcon,
  ReceiptLong as ReceiptIcon
} from "@mui/icons-material";
import { orderAPI } from "../services/api";
import { useSnackbar } from "notistack";

// Rename MUI TextField to avoid conflict with the state variable
const TextField = MuiTextField; 

const Orders = () => {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tabValue, setTabValue] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [orderNotes, setOrderNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  // Add state for action loading and confirmation dialog
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    orderId: null,
    newStatus: null,
    title: '',
    message: ''
  });
  // Add a new state for refund confirmation dialog
  const [refundDialog, setRefundDialog] = useState({
    open: false,
    orderId: null,
    title: 'Confirm Refund',
    message: 'Are you sure you want to refund this order? This action cannot be undone.'
  });

  // Add the handleRefundConfirm function definition after refundDialog state declaration
  const handleRefundConfirm = (orderId) => {
    console.log("Opening refund confirmation for order:", orderId);
    setRefundDialog({
      ...refundDialog,
      open: true,
      orderId
    });
  };

  // Also add the processRefund function that will be called from the dialog
  const processRefund = async (orderId) => {
    try {
      setActionLoading(true);
      console.log("Processing refund for order:", orderId);
      
      // Check admin status first
      let currentUser = {};
      try {
        const userData = localStorage.getItem("user");
        if (userData && userData !== "undefined") {
          currentUser = JSON.parse(userData);
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
      
      const adminRole = currentUser?.role?.toLowerCase() === "admin";
      if (!adminRole) {
        throw new Error("Only administrators can refund orders");
      }
      
      // Call the API with additional debugging
      const response = await orderAPI.refundOrder(orderId);
      console.log("Refund response:", response.data);
      
      enqueueSnackbar("Order refunded successfully", { variant: "success" });
      
      // Update the local state to reflect the refunded status
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { 
            ...order, 
            orderStatus: "refunded",
            paymentInfo: {
              ...order.paymentInfo,
              refundStatus: "refunded"
            }
          } : order
        )
      );
      
      // If the refunded order is currently selected, update the selection too
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => ({
          ...prev,
          orderStatus: "refunded",
          paymentInfo: {
            ...prev.paymentInfo,
            refundStatus: "refunded"
          }
        }));
      }
      
      // Refresh the orders list
      fetchOrders();
    } catch (error) {
      console.error("Error refunding order:", error);
      enqueueSnackbar(
        error.response?.data?.message || error.message || "Failed to refund order", 
        { variant: "error" }
      );
    } finally {
      setActionLoading(false);
      setRefundDialog(prev => ({...prev, open: false}));
    }
  };

  // Add helper function to calculate order totals
  const calculateOrderTotals = (order) => {
    const items = order?.items || [];
    const itemsTotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    const shipping = order?.shippingPrice ?? (order?.shipping ?? 0);
    const tax = order?.taxPrice ?? (order?.tax ?? 0);
    const discount = order?.discount ?? 0;
    const grandTotal = itemsTotal + shipping + tax - discount;
    return {
      itemsTotal,
      shipping,
      tax,
      discount,
      grandTotal,
    };
  };

  // Status tabs
  const statusTabs = [
    { value: "all", label: "All", count: 0 },
    { value: "ready", label: "Ready to Ship", count: 0 },
    { value: "processing", label: "Processing", count: 0 },
    { value: "shipped", label: "Shipped", count: 0 },
    { value: "delivered", label: "Delivered", count: 0 },
    { value: "canceled", label: "Canceled", count: 0 },
    { value: "refunded", label: "Refunded", count: 0 }
  ];

  // Add this helper function near the top of the component
  const getAdminStatus = () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData || userData === "undefined" || userData === "null") {
        console.warn("No user data found in localStorage");
        return false;
      }
      
      const parsedUser = JSON.parse(userData);
      const role = parsedUser?.role;
      
      // Case insensitive comparison with null check
      const isAdmin = 
        role && 
        typeof role === 'string' && 
        role.toLowerCase() === 'admin';
      
      console.log("Admin status check:", {
        userData,
        parsedUser,
        role,
        isAdmin
      });
      
      return isAdmin;
    } catch (error) {
      console.error("Error determining admin status:", error);
      return false;
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const adminStatus = getAdminStatus();
      setIsAdmin(adminStatus);
      console.log('Admin status:', adminStatus);
      
      // Store user data
      try {
        const userData = localStorage.getItem('user');
        if (userData && userData !== 'undefined') {
          const currentUser = JSON.parse(userData);
          setUser(currentUser);
        }
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
      }

      const response = await (adminStatus ? orderAPI.getAllAdmin : orderAPI.getAll)({
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });
      
      if (response && response.data) {
        const mappedOrders = response.data.orders.map(order => ({
          ...order,
          orderStatus: order.orderStatus || 'unknown'
        }));
        
        setOrders(mappedOrders);
        setTotalPages(response.data.totalPages || 1);
        setTotalOrders(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      enqueueSnackbar(error.response?.data?.message || "Failed to fetch orders", { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportClick = (event) => {
    // Only show export menu if user is admin
    if (!getAdminStatus()) {
      enqueueSnackbar("Only administrators can export orders", { variant: 'error' });
      return;
    }
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExport = async (format) => {
    setExporting(true);
    handleExportClose();

    try {
      // Use the exportOrders method from the orderAPI with current filters
      const blob = await orderAPI.exportOrders({
        format,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename with current date
      const date = new Date().toISOString().split('T')[0];
      link.download = `orders-export-${date}.${format}`;
      
      // Append to the document, click, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Release the URL object
      window.URL.revokeObjectURL(url);
      
      enqueueSnackbar(`Orders exported successfully as ${format.toUpperCase()}`, { 
        variant: 'success' 
      });
    } catch (error) {
      console.error("Error exporting orders:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to export orders", { 
        variant: 'error' 
      });
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, statusFilter, searchTerm]);

  const handleChangePage = (event, newPage) => {
    // The newPage is 0-based, but we'll convert it to 1-based in the fetchOrders function
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing rows per page
  };

  const handleViewOrder = async (orderId) => {
    try {
      setLoading(true);
      setOrderNotes([]); // Clear previous notes

      const response = await (isAdmin ? orderAPI.getByIdAdmin : orderAPI.getById)(orderId);
      
      if (response && response.data && response.data.order) {
        const order = response.data.order;
        const calculatedTotals = calculateOrderTotals(order); // Calculate totals

        const processedOrder = {
          ...order,
          orderStatus: order.orderStatus || 'unknown',
          // Use calculated totals
          itemsTotal: calculatedTotals.itemsTotal,
          shipping: calculatedTotals.shipping,
          tax: calculatedTotals.tax,
          discount: calculatedTotals.discount,
          total: calculatedTotals.grandTotal, // Use grandTotal for the main 'total' display
          items: order.items || [],
          user: order.user || { name: 'N/A', email: 'N/A' },
          shippingAddress: order.shippingAddress || {},
          paymentInfo: order.paymentInfo || {},
          paymentMethod: order.paymentMethod || 'N/A',
        };
        
        setSelectedOrder(processedOrder);
        setOpenDialog(true);

        // Fetch notes if admin
        if (isAdmin) {
          // ... fetch notes code ...
        }
      } else {
        // ... existing error handling ...
      }
    } catch (error) {
      // ... existing error handling ...
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
    setOrderNotes([]); // Clear notes on close
    setNewNote(""); // Clear new note input
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setActionLoading(true);
      
      // Validate inputs
      if (!orderId || !newStatus) {
        throw new Error("Invalid order ID or status");
      }

      // Get current user data and check admin status
      let currentUser = {};
      try {
        const userData = localStorage.getItem("user");
        if (!userData || userData === "undefined" || userData === "null") {
          throw new Error("User data not found");
        }
        currentUser = JSON.parse(userData);
      } catch (e) {
        throw new Error("Error accessing user data");
      }

      // Check admin role
      const isAdmin = currentUser?.role?.toLowerCase() === "admin";
      if (!isAdmin) {
        throw new Error("Only administrators can update order status");
      }

      // Call the appropriate API based on the status
      const response = newStatus === "canceled" 
        ? await orderAPI.cancelOrder(orderId)
        : await orderAPI.updateStatus(orderId, newStatus);

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );

      // Update selected order if it's the one being updated
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
      }

      // Show success message
      enqueueSnackbar(`Order status updated to ${newStatus}`, {
        variant: "success",
        autoHideDuration: 3000,
      });

      // Refresh orders list
      fetchOrders();
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || error.message || "Failed to update order status",
        { variant: "error", autoHideDuration: 5000 }
      );
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, orderId: null, newStatus: null, title: "", message: "" });
    }
  };

  // Add confirmation dialog handler
  const handleStatusUpdateConfirm = (orderId, newStatus) => {
    const statusMessages = {
      processing: 'process this order',
      delivered: 'mark this order as delivered',
      canceled: 'cancel this order'
    };

    setConfirmDialog({
      open: true,
      orderId,
      newStatus,
      title: 'Confirm Status Update',
      message: `Are you sure you want to ${statusMessages[newStatus] || 'update the status of this order'}?`
    });
  };

  const getStatusColor = (status) => {
    if (!status) return "default";
    switch (status.toLowerCase()) {
      case "ready":
        return "primary";
      case "processing":
        return "info";
      case "shipped":
        return "warning";
      case "delivered":
        return "success";
      case "canceled":
        return "error";
      case "refunded":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return <PendingIcon />;
    switch (status.toLowerCase()) {
      case "ready":
        return <PackageIcon />;
      case "processing":
        return <PendingIcon />;
      case "shipped":
        return <ShippingIcon />;
      case "delivered":
        return <DeliveredIcon />;
      case "canceled":
        return <RejectIcon />;
      case "refunded":
        return <RefundIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setStatusFilter(statusTabs[newValue].value);
    // Reset to first page when changing tabs
    setPage(0);
  };

  // Calculate counts for each status
  const statusCounts = orders.reduce((acc, order) => {
    // Use orderStatus instead of status
    const status = order.orderStatus || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, {});
  
  // Update status tabs with counts
  const updatedStatusTabs = statusTabs.map(tab => ({
    ...tab,
    count: statusCounts[tab.value] || 0
  }));

  // Filter orders based on search term for client-side filtering
  // Note: The main filtering is done on the server via API params
  const filteredOrders = orders.filter(order => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order._id.toLowerCase().includes(searchLower) ||
        order.user?.name.toLowerCase().includes(searchLower) ||
        order.user?.email.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });
  const handlePrintOrder = () => {
    if (!selectedOrder) return;
  
    // Use calculated totals from selectedOrder state
    const { itemsTotal, shipping, tax, discount, total } = selectedOrder;
  
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order #${selectedOrder._id}</title>
          <style>
            body { font-family: 'Roboto', sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; color: #3a7bd5; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .details-section { border: 1px solid #eee; padding: 15px; border-radius: 4px; }
            .details-section h2 { margin-top: 0; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 14px; }
            .items-table th { background-color: #f2f2f2; }
            .items-table td:last-child, .items-table th:last-child { text-align: right; }
            .summary { margin-top: 20px; border: 1px solid #eee; padding: 15px; border-radius: 4px; }
            .summary h2 { margin-top: 0; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
            .summary-row.total { font-weight: bold; font-size: 1.1em; color: #3a7bd5; border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px; }
            @media print { .no-print { display: none; } }
          </style>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </head>
        <body>
          <div class="header">
            <h1>Order #${selectedOrder._id}</h1>
            <p>Date: ${selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}</p>
            <p>Status: ${selectedOrder.orderStatus || 'Unknown'}</p>
          </div>

          <div class="details-grid">
            <div class="details-section customer-info">
              <h2>Customer Information</h2>
              <p>Name: ${selectedOrder.user?.name || 'N/A'}</p>
              <p>Email: ${selectedOrder.user?.email || 'N/A'}</p>
            </div>
            <div class="details-section shipping-info">
              <h2>Shipping Address</h2>
              <p>${selectedOrder.shippingAddress?.street || ''}<br>
                 ${selectedOrder.shippingAddress?.city || ''}, ${selectedOrder.shippingAddress?.state || ''} ${selectedOrder.shippingAddress?.zip || ''}<br>
                 ${selectedOrder.shippingAddress?.country || ''}
              </p>
            </div>
          </div>

          <div class="order-items">
            <h2>Order Items</h2>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${selectedOrder.items && selectedOrder.items.length > 0 
                  ? selectedOrder.items.map(item => `
                    <tr>
                      <td>${item.product?.name || 'Unknown Product'}</td>
                      <td>₹${item.price?.toFixed(2) || '0.00'}</td>
                      <td>${item.quantity || 0}</td>
                      <td>₹${((item.quantity || 0) * (item.price || 0))?.toFixed(2) || '0.00'}</td>
                    </tr>
                  `).join('') 
                  : '<tr><td colspan="4" style="text-align: center;">No items found</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="summary">
            <h2>Order Summary</h2>
            <div class="summary-row">
              <span>Items Total:</span>
              <span>₹${itemsTotal?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="summary-row">
              <span>Shipping:</span>
              <span>₹${shipping?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="summary-row">
              <span>Tax:</span>
              <span>₹${tax?.toFixed(2) || '0.00'}</span>
            </div>
            ${discount > 0 ? `
            <div class="summary-row">
              <span>Discount:</span>
              <span>- ₹${discount?.toFixed(2) || '0.00'}</span>
            </div>` : ''}
            <div class="summary-row total">
              <span>Grand Total:</span>
              <span>₹${total?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="summary-row">
              <span>Payment Method:</span>
              <span>${selectedOrder.paymentMethod || 'N/A'}</span>
            </div>
            <div class="summary-row">
              <span>Payment Status:</span>
              <span>${selectedOrder.paymentInfo?.status || 'N/A'}</span>
            </div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
  };
  
  // Add new refund handler
  const handleRefundOrder = async (orderId) => {
    try {
      setActionLoading(true);
      console.log("Refunding order:", orderId);
      
      // Check admin status first
      let currentUser = {};
      try {
        const userData = localStorage.getItem("user");
        if (userData && userData !== "undefined") {
          currentUser = JSON.parse(userData);
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
      
      const adminRole = currentUser?.role?.toLowerCase() === "admin";
      if (!adminRole) {
        throw new Error("Only administrators can refund orders");
      }
      
      // Call the API with additional debugging
      const response = await orderAPI.refundOrder(orderId);
      console.log("Refund response:", response.data);
      
      enqueueSnackbar("Order refunded successfully", { variant: "success" });
      
      // Update the local state to reflect the refunded status
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { 
            ...order, 
            orderStatus: "refunded",
            paymentInfo: {
              ...order.paymentInfo,
              refundStatus: "refunded"
            }
          } : order
        )
      );
      
      // If the refunded order is currently selected, update the selection too
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => ({
          ...prev,
          orderStatus: "refunded",
          paymentInfo: {
            ...prev.paymentInfo,
            refundStatus: "refunded"
          }
        }));
      }
      
      // Refresh the orders list
      fetchOrders();
    } catch (error) {
      console.error("Error refunding order:", error);
      enqueueSnackbar(
        error.response?.data?.message || error.message || "Failed to refund order", 
        { variant: "error" }
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box>
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
            {isAdmin ? "Orders Management" : "My Orders"}
          </Typography>
          <Typography variant="body1">
            {isAdmin 
              ? "Monitor orders, update status, and manage customer purchases." 
              : "View and manage your order history."}
          </Typography>
        </CardContent>
      </Card>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <TextField
          placeholder="Search orders..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            width: { xs: '100%', md: '320px' },
            bgcolor: 'background.paper',
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {isAdmin && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportClick}
            disabled={exporting}
            sx={{ borderRadius: 2 }}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        )}
      </Box>
      <Paper 
        elevation={0} 
        sx={{ 
          width: "100%", 
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          mb: 3,
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              minWidth: 120, 
              fontWeight: 500,
            }
          }}
        >
          {updatedStatusTabs.map((tab, index) => (
            <Tab 
              key={tab.value} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {tab.label}
                  <Chip 
                    label={tab.count} 
                    size="small" 
                    sx={{ 
                      ml: 1, 
                      height: 20, 
                      fontSize: '0.75rem',
                      bgcolor: index === tabValue ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.08)',
                      color: index === tabValue ? 'white' : 'inherit'
                    }} 
                  />
                </Box>
              } 
            />
          ))}
        </Tabs>
      </Paper>
      <Paper 
        elevation={0} 
        sx={{ 
          width: "100%", 
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}
      >
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 650, sm: 800 } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1">No orders found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const calculatedTotals = calculateOrderTotals(order);
                  return (
                    <TableRow key={order._id || Math.random()}>
                      <TableCell>{order._id || 'N/A'}</TableCell>
                      <TableCell>
                        {order.user ? (
                          <>
                            <Typography variant="body2">{order.user.name || 'N/A'}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {order.user.email || 'N/A'}
                            </Typography>
                          </>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        ₹{calculatedTotals.grandTotal.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.orderStatus || 'Unknown'}
                          color={getStatusColor(order.orderStatus)}
                          size="small"
                          icon={getStatusIcon(order.orderStatus)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'nowrap' }}>
                          <IconButton
                            onClick={() => handleViewOrder(order._id)}
                            color="primary"
                            size="small"
                            title="View Order Details"
                            sx={{
                              border: '1px solid #1976d2',
                              margin: '0 2px',
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          
                          {isAdmin && (
                            <>
                              {/* Process order button - shown for ready orders */}
                              {order.orderStatus === "ready" && (
                                <IconButton
                                  onClick={() => handleStatusUpdateConfirm(order._id, "processing")}
                                  color="primary"
                                  size="small"
                                  title="Process Order"
                                  sx={{
                                    border: '1px solid #1976d2',
                                    margin: '0 2px',
                                  }}
                                >
                                  <ProcessIcon fontSize="small" />
                                </IconButton>
                              )}
                              
                              {/* Ship order button - shown for processing orders */}
                              {order.orderStatus === "processing" && (
                                <IconButton
                                  onClick={() => handleStatusUpdateConfirm(order._id, "shipped")}
                                  color="info"
                                  size="small"
                                  title="Mark as Shipped"
                                  sx={{
                                    border: '1px solid #0288d1',
                                    margin: '0 2px',
                                  }}
                                >
                                  <ShippingIcon fontSize="small" />
                                </IconButton>
                              )}
                              
                              {/* Deliver order button - shown for shipped orders */}
                              {order.orderStatus === "shipped" && (
                                <IconButton
                                  onClick={() => handleStatusUpdateConfirm(order._id, "delivered")}
                                  color="success"
                                  size="small"
                                  title="Mark as Delivered"
                                  sx={{
                                    border: '1px solid #2e7d32',
                                    margin: '0 2px',
                                  }}
                                >
                                  <DeliveredIcon fontSize="small" />
                                </IconButton>
                              )}
                              
                              {/* Cancel order button - shown for orders not canceled, delivered or refunded */}
                              {!["canceled", "delivered", "refunded"].includes(order.orderStatus) && (
                                <IconButton
                                  onClick={() => handleStatusUpdateConfirm(order._id, "canceled")}
                                  color="error"
                                  size="small"
                                  title="Cancel Order"
                                  sx={{
                                    border: '1px solid #d32f2f',
                                    margin: '0 2px',
                                  }}
                                >
                                  <RejectIcon fontSize="small" />
                                </IconButton>
                              )}
                              
                              {/* Refund button - shown for delivered orders not already refunded */}
                              {order.orderStatus === "delivered" && 
                                (!order.paymentInfo?.refundStatus || order.paymentInfo.refundStatus !== "refunded") && (
                                <IconButton
                                  onClick={() => handleRefundConfirm(order._id)}
                                  color="secondary"
                                  size="small"
                                  title="Refund Order"
                                  sx={{
                                    border: '1px solid #9c27b0',
                                    margin: '0 2px',
                                  }}
                                >
                                  <RefundIcon fontSize="small" />
                                </IconButton>
                              )}
                              
                              {/* Print order button */}
                              <IconButton
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setTimeout(handlePrintOrder, 100);
                                }}
                                color="default"
                                size="small"
                                title="Print Order"
                                sx={{
                                  border: '1px solid #bdbdbd',
                                  margin: '0 2px',
                                }}
                              >
                                <PrintIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalOrders}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
      {/* Order Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg" // Wider dialog
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{ pb: 1 }}> {/* Reduced bottom padding */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">
                  Order #{selectedOrder._id || 'N/A'}
                </Typography>
                <Chip
                  icon={getStatusIcon(selectedOrder.orderStatus)}
                  label={selectedOrder.orderStatus || 'Unknown'}
                  color={getStatusColor(selectedOrder.orderStatus)}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}> {/* Reduced spacing */}
                {/* Customer Info */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
                    Customer
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                      {selectedOrder.user?.name ? selectedOrder.user.name.charAt(0) : '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="500">{selectedOrder.user?.name || 'N/A'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        <EmailIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                        {selectedOrder.user?.email || 'N/A'}
                      </Typography>
                      {selectedOrder.user?.phone && (
                        <Typography variant="body2" color="text.secondary">
                          <CallIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                          {selectedOrder.user.phone}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
                {/* Shipping Info */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>Shipping Address</Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'start' }}>
                      <ShippingAddressIcon color="action" sx={{ mr: 1, mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2">{selectedOrder.shippingAddress?.street || ''}</Typography>
                        <Typography variant="body2">
                          {selectedOrder.shippingAddress?.city || ''}, {selectedOrder.shippingAddress?.state || ''} {selectedOrder.shippingAddress?.zip || ''}
                        </Typography>
                        <Typography variant="body2">{selectedOrder.shippingAddress?.country || ''}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                {/* Payment Info */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>Payment</Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                       <PaymentIcon color="action" sx={{ mr: 1 }} />
                       <Typography variant="body2">Method: {selectedOrder.paymentMethod || 'N/A'}</Typography>
                     </Box>
                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
                       <Chip
                         size="small"
                         label={`Status: ${selectedOrder.paymentInfo?.status || 'N/A'}`}
                         color={selectedOrder.paymentInfo?.status === 'paid' ? 'success' : 'warning'}
                         sx={{ ml: 3 }} // Indent status
                       />
                     </Box>
                     {selectedOrder.paymentInfo?.razorpayPaymentId && (
                       <Typography variant="caption" display="block" sx={{ ml: 3, mt: 0.5 }} color="text.secondary">
                         ID: {selectedOrder.paymentInfo.razorpayPaymentId}
                       </Typography>
                     )}
                  </Paper>
                </Grid>
                {/* Order Items */}
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" gutterBottom>
                    <CartIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
                    Order Items
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                          selectedOrder.items.map((item) => (
                            <TableRow key={item._id}>
                              <TableCell>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                  <Avatar
                                    src={item.product?.image || "https://via.placeholder.com/40"}
                                    alt={item.product?.name || "Product"}
                                    sx={{ width: 40, height: 40, mr: 2 }}
                                  />
                                  <Typography variant="body2">
                                    {item.product?.name || "Unknown Product"}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>₹{item.price !== undefined ? item.price.toFixed(2) : '0.00'}</TableCell>
                              <TableCell>{item.quantity || 0}</TableCell>
                              <TableCell align="right" sx={{ pr: 0 }}>
                                ₹{(item.quantity && item.price) ? (item.quantity * item.price).toFixed(2) : '0.00'}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              <Typography variant="body2">No items found</Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                {/* Order Summary */}
                <Grid item xs={12} md={4}>
                   <Typography variant="subtitle1" gutterBottom>Order Summary</Typography>
                   <Paper variant="outlined" sx={{ p: 2 }}>
                     <Grid container spacing={1}>
                       <Grid item xs={6}><Typography variant="body2" color="text.secondary">Items Total:</Typography></Grid>
                       <Grid item xs={6}><Typography variant="body2" align="right">₹ {selectedOrder.itemsTotal?.toFixed(2) || '0.00'}</Typography></Grid>
                       <Grid item xs={6}><Typography variant="body2" color="text.secondary">Shipping:</Typography></Grid>
                       <Grid item xs={6}><Typography variant="body2" align="right">₹ {selectedOrder.shipping?.toFixed(2) || '0.00'}</Typography></Grid>
                       <Grid item xs={6}><Typography variant="body2" color="text.secondary">Tax:</Typography></Grid>
                       <Grid item xs={6}><Typography variant="body2" align="right">₹ {selectedOrder.tax?.toFixed(2) || '0.00'}</Typography></Grid>
                       {selectedOrder.discount > 0 && (
                         <>
                           <Grid item xs={6}><Typography variant="body2" color="text.secondary">Discount:</Typography></Grid>
                           <Grid item xs={6}><Typography variant="body2" align="right" sx={{ color: 'success.main' }}>- ₹ {selectedOrder.discount?.toFixed(2) || '0.00'}</Typography></Grid>
                         </>
                       )}
                       <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                       <Grid item xs={6}><Typography variant="subtitle2" fontWeight="bold">Grand Total:</Typography></Grid>
                       <Grid item xs={6}><Typography variant="subtitle2" align="right" fontWeight="bold">₹ {selectedOrder.total?.toFixed(2) || '0.00'}</Typography></Grid>
                     </Grid>
                   </Paper>
                </Grid>
                {/* Order Notes Section (Admin only) */}
                {isAdmin && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Order Notes
                    </Typography>
                    <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto', mb: 2 }}>
                      <List dense>
                        {orderNotes.length > 0 ? (
                          orderNotes.map((note) => (
                            <ListItem key={note._id} divider>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: theme.palette.secondary.light, width: 32, height: 32 }}>
                                  {note.createdBy?.name ? note.createdBy.name.charAt(0) : 'A'}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={note.note}
                                secondary={
                                  <>
                                    <Typography component="span" variant="body2" color="text.primary">
                                      {note.createdBy?.name || 'Admin'}
                                    </Typography>
                                    {" — "}{new Date(note.createdAt).toLocaleString()}
                                  </>
                                }
                              />
                            </ListItem>
                          ))
                        ) : (
                          <ListItem>
                            <ListItemText primary="No notes added yet." />
                          </ListItem>
                        )}
                      </List>
                    </Paper>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      variant="outlined"
                      placeholder="Add an internal note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      disabled={addingNote}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleAddNote}
                              disabled={!newNote.trim() || addingNote}
                              edge="end"
                              color="primary"
                            >
                              {addingNote ? <CircularProgress size={24} /> : <NoteAddIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button 
                startIcon={<RejectIcon />}
                onClick={handleCloseDialog} 
                disabled={actionLoading}
              >
                Close
              </Button>
              
              <Button 
                startIcon={<PrintIcon />} 
                onClick={handlePrintOrder}
                color="primary"
                variant="outlined"
                disabled={actionLoading}
              >
                Print
              </Button>
              
              <Button 
                startIcon={<EmailIcon />} 
                onClick={() => {
                  enqueueSnackbar("Email functionality will be implemented soon", { 
                    variant: 'info' 
                  });
                }}
                color="primary"
                variant="outlined"
                disabled={actionLoading}
              >
                Email
              </Button>
            
              {isAdmin && (
                <Button 
                  startIcon={<InvoiceIcon />} 
                  onClick={() => {
                    enqueueSnackbar("Invoice download feature will be implemented soon", { 
                      variant: 'info' 
                    });
                  }}
                  color="primary"
                  variant="outlined"
                  disabled={actionLoading}
                >
                  Invoice
                </Button>
              )}
              
              {/* Status update buttons */}
              {isAdmin && selectedOrder.orderStatus === "ready" && (
                <Button
                  startIcon={<ProcessIcon />}
                  color="primary"
                  variant="contained"
                  onClick={() => handleStatusUpdateConfirm(selectedOrder._id, "processing")}
                  disabled={actionLoading}
                >
                  Process Order
                </Button>
              )}
              
              {isAdmin && selectedOrder.orderStatus === "processing" && (
                <Button
                  startIcon={<ShippingIcon />}
                  color="info"
                  variant="contained"
                  onClick={() => handleStatusUpdateConfirm(selectedOrder._id, "shipped")}
                  disabled={actionLoading}
                >
                  Mark as Shipped
                </Button>
              )}
              
              {isAdmin && selectedOrder.orderStatus === "shipped" && (
                <Button
                  startIcon={<DeliveredIcon />}
                  color="success"
                  variant="contained"
                  onClick={() => handleStatusUpdateConfirm(selectedOrder._id, "delivered")}
                  disabled={actionLoading}
                >
                  Mark as Delivered
                </Button>
              )}
              
              {isAdmin && !['canceled', 'delivered', 'refunded'].includes(selectedOrder.orderStatus) && (
                <Button
                  color="error"
                  variant="contained"
                  startIcon={<RejectIcon />}
                  onClick={() => handleStatusUpdateConfirm(selectedOrder._id, "canceled")}
                  disabled={actionLoading}
                >
                  Cancel Order
                </Button>
              )}
              
              {isAdmin && selectedOrder.orderStatus === "delivered" &&
              (!selectedOrder.paymentInfo?.refundStatus || selectedOrder.paymentInfo.refundStatus !== 'refunded') && (
                <Button
                  startIcon={<RefundIcon />}
                  color="secondary"
                  variant="contained"
                  onClick={() => handleRefundConfirm(selectedOrder._id)}
                  disabled={actionLoading}
                >
                  Refund Order
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleUpdateStatus(confirmDialog.orderId, confirmDialog.newStatus);
              setConfirmDialog({ ...confirmDialog, open: false });
            }}
            color="primary"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} color="inherit" /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Add the refund confirmation dialog */}
      <Dialog
        open={refundDialog.open}
        onClose={() => setRefundDialog({...refundDialog, open: false})}
      >
        <DialogTitle>{refundDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{refundDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setRefundDialog({...refundDialog, open: false})}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => processRefund(refundDialog.orderId)}
            color="secondary"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Refund'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;