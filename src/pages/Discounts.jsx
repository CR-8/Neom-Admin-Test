import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  Grid,
  Stack,
  Chip,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import FormBuilder from "../components/common/FormBuilder";
import { useSnackbar } from "notistack";
import DataTable from "../components/common/DataTable";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { discountAPI, productAPI } from "../services/api";
import { format } from "date-fns";

const Discounts = () => {
  const theme = useTheme();
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "percentage", // percentage or fixed
    value: "",
    minPurchase: "",
    maxDiscount: "",
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    applicableProducts: [],
    limitPerUser: 1,
    isActive: true,
    description: "",
    category: "promotional", // promotional, seasonal, bulk
  });
  const [errors, setErrors] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const [isEditing, setIsEditing] = useState(false);

  const columns = [
    { field: "_id", headerName: "ID", width: 120 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "code", headerName: "Code", width: 120 },
    { 
      field: "type", 
      headerName: "Type", 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value === "percentage" ? "Percentage" : "Fixed Amount"} 
          color={params.value === "percentage" ? "primary" : "secondary"}
          size="small"
        />
      )
    },
    { 
      field: "value", 
      headerName: "Value", 
      width: 100,
      renderCell: (params) => (
        <Typography>
          {params.row.type === "percentage" ? `${params.value}%` : `₹${params.value}`}
        </Typography>
      )
    },
    { 
      field: "startDate", 
      headerName: "Start Date", 
      width: 120,
      renderCell: (params) => {
        try {
          // Check if params.value is a valid date
          const date = params.value instanceof Date ? params.value : new Date(params.value);
          return (
            <Typography>
              {!isNaN(date.getTime()) ? format(date, "dd/MM/yy") : "Invalid date"}
            </Typography>
          );
        } catch (error) {
          return <Typography>Invalid date</Typography>;
        }
      }
    },
    { 
      field: "endDate", 
      headerName: "End Date", 
      width: 120,
      renderCell: (params) => {
        try {
          // Check if params.value is a valid date
          const date = params.value instanceof Date ? params.value : new Date(params.value);
          return (
            <Typography>
              {!isNaN(date.getTime()) ? format(date, "dd/MM/yy") : "Invalid date"}
            </Typography>
          );
        } catch (error) {
          return <Typography>Invalid date</Typography>;
        }
      }
    },
    { 
      field: "isActive", 
      headerName: "Status", 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value ? "Active" : "Inactive"} 
          color={params.value ? "success" : "error"}
          size="small"
        />
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 250,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleEdit(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              color="error"
              size="small"
              onClick={() => handleDelete(params.row._id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Details">
            <IconButton
              color="info"
              size="small"
              onClick={() => handleDetailsOpen(params.row)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await discountAPI.getAll();
      if (response && response.data && response.data.data && response.data.data.discounts) {
        const discountsWithId = response.data.data.discounts.map(discount => ({
          ...discount,
          id: discount._id
        }));
        setDiscounts(discountsWithId);
      } else {
        // If the backend doesn't return data yet, use mock data for development
        const mockDiscounts = [
          {
            _id: "disc1",
            id: "disc1",
            name: "Summer Sale",
            code: "SUMMER25",
            type: "percentage",
            value: 25,
            minPurchase: 50,
            maxDiscount: 100,
            startDate: new Date().toISOString(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
            applicableProducts: [],
            limitPerUser: 1,
            isActive: true,
            description: "Summer season discount",
            category: "seasonal",
          },
          {
            _id: "disc2",
            id: "disc2",
            name: "New User",
            code: "WELCOME10",
            type: "percentage",
            value: 10,
            minPurchase: 0,
            maxDiscount: 50,
            startDate: new Date().toISOString(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
            applicableProducts: [],
            limitPerUser: 1,
            isActive: true,
            description: "Welcome discount for new users",
            category: "promotional",
          },
          {
            _id: "disc3",
            id: "disc3",
            name: "Bulk Order",
            code: "BULK20",
            type: "percentage",
            value: 20,
            minPurchase: 200,
            maxDiscount: 0,
            startDate: new Date().toISOString(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            applicableProducts: [],
            limitPerUser: 0,
            isActive: true,
            description: "Discount for bulk orders",
            category: "bulk",
          },
        ];
        setDiscounts(mockDiscounts);
        console.log("Using mock discount data for development");
      }
    } catch (error) {
      console.error("Error fetching discounts:", error);
      enqueueSnackbar("Failed to fetch discounts", { variant: "error" });
      
      // Use mock data if API fails
      const mockDiscounts = [
        {
          _id: "disc1",
          id: "disc1",
          name: "Summer Sale",
          code: "SUMMER25",
          type: "percentage",
          value: 25,
          minPurchase: 50,
          maxDiscount: 100,
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          applicableProducts: [],
          limitPerUser: 1,
          isActive: true,
          description: "Summer season discount",
          category: "seasonal",
        },
        {
          _id: "disc2",
          id: "disc2",
          name: "New User",
          code: "WELCOME10",
          type: "percentage",
          value: 10,
          minPurchase: 0,
          maxDiscount: 50,
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
          applicableProducts: [],
          limitPerUser: 1,
          isActive: true,
          description: "Welcome discount for new users",
          category: "promotional",
        },
        {
          _id: "disc3",
          id: "disc3",
          name: "Bulk Order",
          code: "BULK20",
          type: "percentage",
          value: 20,
          minPurchase: 200,
          maxDiscount: 0,
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          applicableProducts: [],
          limitPerUser: 0,
          isActive: true,
          description: "Discount for bulk orders",
          category: "bulk",
        },
      ];
      setDiscounts(mockDiscounts);
      console.log("Using mock discount data for development");
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      if (response && response.data && response.data.data && response.data.data.products) {
        setProducts(response.data.data.products);
      } else {
        // Mock products if needed
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  const handleOpen = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      code: "",
      type: "percentage",
      value: "",
      minPurchase: "",
      maxDiscount: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      applicableProducts: [],
      limitPerUser: 1,
      isActive: true,
      description: "",
      category: "promotional",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: "",
      code: "",
      type: "percentage",
      value: "",
      minPurchase: "",
      maxDiscount: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      applicableProducts: [],
      limitPerUser: 1,
      isActive: true,
      description: "",
      category: "promotional",
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleDetailsOpen = (discount) => {
    setSelectedDiscount(discount);
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedDiscount(null);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.code.trim()) newErrors.code = "Code is required";
    if (!formData.value || isNaN(formData.value) || Number(formData.value) <= 0) {
      newErrors.value = "Value must be a positive number";
    }
    if (formData.type === "percentage" && Number(formData.value) > 100) {
      newErrors.value = "Percentage cannot exceed 100%";
    }
    if (formData.minPurchase && (isNaN(formData.minPurchase) || Number(formData.minPurchase) < 0)) {
      newErrors.minPurchase = "Min purchase must be a non-negative number";
    }
    if (formData.maxDiscount && (isNaN(formData.maxDiscount) || Number(formData.maxDiscount) < 0)) {
      newErrors.maxDiscount = "Max discount must be a non-negative number";
    }
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    if (formData.limitPerUser && (isNaN(formData.limitPerUser) || Number(formData.limitPerUser) < 0)) {
      newErrors.limitPerUser = "Limit per user must be a non-negative number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
    
    // Clear error when field is updated
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: undefined,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const payload = {
        ...formData,
        value: Number(formData.value),
        minPurchase: formData.minPurchase ? Number(formData.minPurchase) : 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : 0,
        limitPerUser: formData.limitPerUser ? Number(formData.limitPerUser) : 0,
      };
      
      let response;
      if (isEditing) {
        response = await discountAPI.update(formData._id, payload);
        enqueueSnackbar("Discount updated successfully", { variant: "success" });
      } else {
        response = await discountAPI.create(payload);
        enqueueSnackbar("Discount created successfully", { variant: "success" });
      }
      
      fetchDiscounts();
      handleClose();
    } catch (error) {
      console.error("Error saving discount:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to save discount", { variant: "error" });
    }
    setLoading(false);
  };

  const handleEdit = (discount) => {
    setIsEditing(true);
    setFormData({
      ...discount,
      startDate: new Date(discount.startDate),
      endDate: new Date(discount.endDate),
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this discount?")) {
      setLoading(true);
      try {
        await discountAPI.delete(id);
        enqueueSnackbar("Discount deleted successfully", { variant: "success" });
        fetchDiscounts();
      } catch (error) {
        console.error("Error deleting discount:", error);
        enqueueSnackbar("Failed to delete discount", { variant: "error" });
      }
      setLoading(false);
    }
  };

  const formFields = [
    {
      id: "name",
      label: "Discount Name",
      type: "text",
      required: true,
      error: errors.name,
      placeholder: "Enter discount name",
      value: formData.name,
    },
    {
      id: "code",
      label: "Discount Code",
      type: "text",
      required: true,
      error: errors.code,
      placeholder: "Enter discount code",
      value: formData.code,
    },
    {
      id: "type",
      label: "Discount Type",
      type: "select",
      required: true,
      error: errors.type,
      value: formData.type,
      options: [
        { value: "percentage", label: "Percentage" },
        { value: "fixed", label: "Fixed Amount" },
      ],
    },
    {
      id: "value",
      label: formData.type === "percentage" ? "Percentage (%)" : "Amount ($)",
      type: "number",
      required: true,
      error: errors.value,
      value: formData.value,
      min: 0,
      max: formData.type === "percentage" ? 100 : undefined,
    },
    {
      id: "category",
      label: "Category",
      type: "select",
      required: true,
      error: errors.category,
      value: formData.category,
      options: [
        { value: "promotional", label: "Promotional" },
        { value: "seasonal", label: "Seasonal" },
        { value: "bulk", label: "Bulk" },
      ],
    },
    {
      id: "description",
      label: "Description",
      type: "text",
      multiline: true,
      rows: 2,
      error: errors.description,
      value: formData.description,
      placeholder: "Enter discount description",
    },
    {
      id: "minPurchase",
      label: "Minimum Purchase (₹)",
      type: "number",
      error: errors.minPurchase,
      value: formData.minPurchase,
      min: 0,
    },
    {
      id: "maxDiscount",
      label: "Maximum Discount (₹)",
      type: "number",
      error: errors.maxDiscount,
      value: formData.maxDiscount,
      min: 0,
    },
    {
      id: "limitPerUser",
      label: "Usage Limit Per User",
      type: "number",
      error: errors.limitPerUser,
      value: formData.limitPerUser,
      min: 0,
      helperText: "Enter 0 for unlimited",
    },
    {
      id: "isActive",
      label: "Status",
      type: "select",
      value: formData.isActive ? "true" : "false",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
    {
      id: "startDate",
      label: "Start Date",
      type: "date",
      error: errors.startDate,
      value: formData.startDate,
    },
    {
      id: "endDate",
      label: "End Date",
      type: "date",
      error: errors.endDate,
      value: formData.endDate,
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Discounts
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add Discount
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Discount Management
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Create and manage discount codes, promotions, and special offers for your customers.
        </Typography>
        <Box sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={discounts}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 }
              }
            }}
            pageSizeOptions={[5, 10, 25]}
            checkboxSelection
            loading={loading}
          />
        </Box>
      </Paper>

      {/* Add/Edit Discount Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? "Edit Discount" : "Add New Discount"}
        </DialogTitle>
        <DialogContent dividers>
          <FormBuilder 
            fields={formFields} 
            values={formData}
            errors={errors}
            onChange={handleFieldChange}
            submitText=""
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {isEditing ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Discount Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleDetailsClose}
        maxWidth="md"
        fullWidth
      >
        {selectedDiscount && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <LocalOfferIcon sx={{ mr: 1 }} />
                Discount Details
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Stack spacing={2}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        bgcolor: theme.palette.mode === "dark" ? "grey.800" : "grey.100",
                        borderRadius: 1.5,
                        alignSelf: "flex-start",
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {selectedDiscount.code}
                      </Typography>
                      <Chip
                        label={selectedDiscount.isActive ? "Active" : "Inactive"}
                        color={selectedDiscount.isActive ? "success" : "error"}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2">
                        {selectedDiscount.type === "percentage"
                          ? `${selectedDiscount.value}% off`
                          : `₹${selectedDiscount.value} off`}
                      </Typography>
                    </Paper>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Valid Period
                      </Typography>
                      <Typography variant="body2">
                        {(() => {
            try {
              const startDate = new Date(selectedDiscount.startDate);
              const endDate = new Date(selectedDiscount.endDate);
              return (
                (!isNaN(startDate.getTime()) ? format(startDate, "dd/MM/yy") : "Invalid date") + 
                " - " + 
                (!isNaN(endDate.getTime()) ? format(endDate, "dd/MM/yy") : "Invalid date")
              );
            } catch (error) {
              return "Invalid date range";
            }
          })()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Category
                      </Typography>
                      <Chip
                        label={
                          selectedDiscount.category === "promotional"
                            ? "Promotional"
                            : selectedDiscount.category === "seasonal"
                            ? "Seasonal"
                            : "Bulk"
                        }
                        size="small"
                      />
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h4" gutterBottom>
                    {selectedDiscount.name}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedDiscount.description || "No description provided."}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Discount Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Discount ID
                      </Typography>
                      <Typography variant="body1">
                        {selectedDiscount._id}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Discount Type
                      </Typography>
                      <Typography variant="body1">
                        {selectedDiscount.type === "percentage" ? "Percentage" : "Fixed Amount"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Minimum Purchase
                      </Typography>
                      <Typography variant="body1">
                        ₹{selectedDiscount.minPurchase || "0"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Maximum Discount
                      </Typography>
                      <Typography variant="body1">
                        {selectedDiscount.maxDiscount ? `₹${selectedDiscount.maxDiscount}` : "No limit"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Usage Limit Per User
                      </Typography>
                      <Typography variant="body1">
                        {selectedDiscount.limitPerUser ? selectedDiscount.limitPerUser : "Unlimited"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                onClick={() => {
                  handleDetailsClose();
                  handleEdit(selectedDiscount);
                }}
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{ borderRadius: 2, mr: 1 }}
              >
                Edit
              </Button>
              <Button
                onClick={handleDetailsClose}
                variant="contained"
                sx={{ borderRadius: 2 }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Discounts;