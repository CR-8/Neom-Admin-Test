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
  DialogContentText,
  Fade,
  Slide,
  Alert,
  CircularProgress,
  Tooltip,
  Zoom,
  IconButton,
  CardMedia,
  CardActions,
  CardActionArea,
  Card,
  CardContent,
  InputAdornment,
  TextField,
  Grow,
  ToggleButton,
  ToggleButtonGroup,
  Rating,
  Skeleton,
} from "@mui/material";
import {
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import FormBuilder from "../components/common/FormBuilder";
import { useSnackbar } from "notistack";
import DataTable from "../components/common/DataTable";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { productAPI } from "../services/api";
import { alpha } from "@mui/material/styles";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ImageIcon from '@mui/icons-material/Image';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Add fallback image constant at the top of the file
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF0WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuMWI2NWE3OWI0LCAyMDIyLzA2LzEzLTIyOjAxOjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjQuMCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTA5LTIxVDE1OjE4OjE4KzA1OjMwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIzLTA5LTIxVDE1OjE4OjE4KzA1OjMwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMy0wOS0yMVQxNToxODoxOCswNTozMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowZWRiNTRkYS0xYzEyLWE0NDAtYjM0MC0zNjg5ZjI5ZGFhMTEiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5NDZjYmViOS0xOTk5LWE1NDktOWVhNy1lMmQ4MTU2NGFiMGEiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo2NGY0ZTM5NC05NzE3LTJkNGQtYTk4MS02ZDhiYzM3YWQxMmQiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo2NGY0ZTM5NC05NzE3LTJkNGQtYTk4MS02ZDhiYzM3YWQxMmQiIHN0RXZ0OndoZW49IjIwMjMtMDktMjFUMTU6MTg6MTgrMDU6MzAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNC4wIChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MGVkYjU0ZGEtMWMxMi1hNDQwLWIzNDAtMzY4OWYyOWRhYTExIiBzdEV2dDp3aGVuPSIyMDIzLTA5LTIxVDE1OjE4OjE4KzA1OjMwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjQuMCAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+8njk4QAAAWtJREFUeJzt1bENg0AUBUGMXAIlWHLvlGC5BEqwS4BwvNOsNPr6u+NrjPEFJH2vHgDrCACiBABRAoAoAUCUACBKABAlAIgSAEQJAKIEAFECgCgBQJQAIEoAECUAiBIARB3XGGOMvScAS505s6amXj2Pk+2Z3n9jXoAoAUCUACBKABAlAIgSAEQJAKIEAFECgCgBQJQAIEoAECUAiBIARB0zB849sz8nbjHHfWbf5hN4ASBKABAlAIgSAEQJAKIEAFECgCgBQJQAIEoAECUAiBIARB0zBy797Tf3d+Le2+u/v7MXAKIEAFECgCgBQJQAIEoAECUAiBIARB0rfkS/YnvmzJqaevU8TrZnev+NeQEgSgAQJQCIEgBECQCiBABRAoAoAUCUACBKABAlAIgSAEQJAKIEAFECgCgBQJQAIEoAECUAiBIARB0ATfEPzN5JOPYAAAAASUVORK5CYII=';

const Products = () => {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    images: [],
    thumbnail: "",
    variants: [],
    isActive: true,
    wholesalePrice: "",
  });
  const [errors, setErrors] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    productId: null,
    productName: ''
  });
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const columns = [
    { field: "_id", headerName: "ID", width: 120 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "description", headerName: "Description", width: 340 },
    { field: "price", headerName: "Price", width: 90 },
    { field: "category", headerName: "Category", width: 90 },
    { field: "stock", headerName: "Stock", width: 60 },
    {
      field: "actions",
      headerName: "Actions",
      width: 250,
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          opacity: 0.7,
          transition: 'opacity 0.2s',
          '&:hover': { opacity: 1 }
        }}>
          <Tooltip title="Edit Product" arrow>
            <IconButton
              size="small"
              onClick={() => handleEdit(params.row)}
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Product" arrow>
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row)}
              sx={{
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.2),
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Details" arrow>
            <IconButton
              size="small"
              onClick={() => handleDetailsOpen(params.row)}
              sx={{
                backgroundColor: alpha(theme.palette.info.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.info.main, 0.2),
                }
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const gridColumns = [
    ...columns,
    {
      field: "image",
      headerName: "Image",
      width: 120,
      renderCell: (params) => (
        <CardMedia
          component="img"
          height="60"
          image={(params.row.images && params.row.images.length > 0) ? params.row.images[0].url : "https://via.placeholder.com/150"}
          alt={params.row.name}
          sx={{ borderRadius: 1, objectFit: 'cover' }}
        />
      ),
    },
    {
      field: "rating",
      headerName: "Rating",
      width: 120,
      renderCell: (params) => (
        <Rating value={params.row.rating || 0} readOnly size="small" />
      ),
    },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productAPI.getAll();
      if (response?.data?.data?.products) {
        const productsWithId = response.data.data.products.map(product => ({
          ...product,
          id: product._id,
          price: Number(product.price)
        }));
        setProducts(productsWithId);
      } else {
        setProducts([]);
        enqueueSnackbar("No products found", { variant: "info" });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      enqueueSnackbar("Error fetching products", { variant: "error" });
      setProducts([]);
    }
    setLoading(false);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      images: [],
      thumbnail: "",
      variants: [],
      isActive: true,
      wholesalePrice: "",
    });
    setErrors({});
  };

  const handleDetailsOpen = (product) => {
    setSelectedProduct(product);
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedProduct(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (formData.name && (formData.name.length < 2 || formData.name.length > 100)) {
      newErrors.name = "Name must be between 2 and 100 characters";
    }
    if (!formData.description) newErrors.description = "Description is required";
    if (formData.description && (formData.description.length < 10 || formData.description.length > 1000)) {
      newErrors.description = "Description must be between 10 and 1000 characters";
    }
    if (!formData.price) newErrors.price = "Price is required";
    if (formData.price && formData.price <= 0) newErrors.price = "Price must be greater than 0";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.stock && formData.stock < 0) newErrors.stock = "Stock cannot be negative";
    if (formData.wholesalePrice && formData.wholesalePrice < 0) {
      newErrors.wholesalePrice = "Wholesale price cannot be negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (fieldId, value) => {
    setFormData({
      ...formData,
      [fieldId]: value,
    });
    if (errors[fieldId]) {
      setErrors({
        ...errors,
        [fieldId]: undefined,
      });
    }
  };
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const formattedData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0
      };

      let response;
      if (formData._id) {
        try {
          response = await productAPI.update(formData._id, formattedData);
        } catch (error) {
          if (error.response?.status === 404) {
            await fetchProducts();
            throw new Error("Product not found. Please refresh the page.");
          }
          throw error;
        }
      } else {
        response = await productAPI.create(formattedData);
      }

      enqueueSnackbar(
        `Product ${formData._id ? "updated" : "created"} successfully`,
        { variant: "success" }
      );
      fetchProducts();
      handleClose();
    } catch (error) {
      console.error("Error handling product:", error);
      enqueueSnackbar(error.message || "An error occurred", {
        variant: "error"
      });
    }
  };

  const handleEdit = (product) => {
    setFormData({
      _id: product._id, // Ensure _id is set for updates
      name: product.name,
      description: product.description,
      price: product.price?.toString() || "",
      category: product.category,
      stock: product.stock?.toString() || "",
      images: product.images || [],
      thumbnail: product.thumbnail || "",
      variants: product.variants || [],
      isActive: product.isActive,
      wholesalePrice: product.wholesalePrice?.toString() || "",
    });
    setOpen(true);
  };

  const handleDeleteClick = (product) => {
    setDeleteDialog({
      open: true,
      productId: product._id,
      productName: product.name
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await productAPI.deleteProduct(deleteDialog.productId);
      enqueueSnackbar("Product deleted successfully", { 
        variant: "success",
        TransitionComponent: Slide
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      enqueueSnackbar("Failed to delete product", { 
        variant: "error",
        TransitionComponent: Slide
      });
    } finally {
      setDeleteDialog({ open: false, productId: null, productName: '' });
    }
  };

  const ProductCard = ({ product }) => (
    <Grow in={true}>
      <Card
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <CardActionArea onClick={() => handleDetailsOpen(product)}>
          <CardMedia
            component="img"
            height="200"
            image={(product.images && product.images.length > 0) ? product.images[0].url : FALLBACK_IMAGE}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_IMAGE;
            }}
            sx={{
              p: 2,
              objectFit: 'contain',
              backgroundColor: alpha(theme.palette.background.default, 0.6),
            }}
          />
          <CardContent>
            <Typography gutterBottom variant="h6" noWrap>
              {product.name}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <Typography variant="h6" color="primary" fontWeight="bold">
                ₹{Number(product.price).toFixed(2)}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Rating value={product.rating || 0} readOnly size="small" />
              <Typography variant="caption" color="text.secondary">
                ({product.rating || 0})
              </Typography>
            </Stack>
          </CardContent>
        </CardActionArea>
        <Box sx={{ flexGrow: 1 }} />
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            opacity: 0.7,
            transition: 'opacity 0.2s',
            '&:hover': { opacity: 1 }
          }}>
            <Tooltip title="Edit Product" arrow>
              <IconButton
                size="small"
                onClick={() => handleEdit(product)}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Product" arrow>
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(product)}
                sx={{
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.2),
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            label={`${product.stock} in stock`}
            size="small"
            color={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "error"}
          />
        </CardActions>
      </Card>
    </Grow>
  );

  // Add function to handle image upload
  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    if (!formData._id) {
        enqueueSnackbar("Please save the product first before uploading images", { variant: "info" });
        return;
    }
    
    setLoading(true);
    try {
        const uploadFormData = new FormData();
        
        // Add all selected files
        for (let i = 0; i < files.length; i++) {
            uploadFormData.append('productImages', files[i]);
        }
        
        const response = await productAPI.uploadImage(formData._id, uploadFormData);
        
        // Update the form data with the new images
        setFormData(prev => ({
            ...prev,
            images: response.data.data.images || [],
            thumbnail: prev.thumbnail || response.data.data.thumbnail || ''
        }));
        
        enqueueSnackbar("Images uploaded successfully", { variant: "success" });
    } catch (error) {
        console.error("Error uploading images:", error);
        enqueueSnackbar(error.response?.data?.message || "Failed to upload images", { variant: "error" });
    } finally {
        setLoading(false);
    }
};
  // Add function to handle image deletion
  const handleDeleteImage = async (imageId) => {
    if (!formData._id || !imageId) return;
    
    setLoading(true);
    try {
      await productAPI.deleteImage(formData._id, imageId);
      
      // Update the form data to remove the deleted image
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img._id !== imageId)
      }));
      
      enqueueSnackbar("Image deleted successfully", { variant: "success" });
    } catch (error) {
      console.error("Error deleting image:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to delete image", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

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
            Products Management
          </Typography>
          <Typography variant="body1">
            Manage your product inventory, prices, and details efficiently.
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ 
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Products Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            placeholder="Search products..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 250,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newValue) => newValue && setViewMode(newValue)}
            aria-label="view mode"
          >
            <ToggleButton value="grid" aria-label="grid view">
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ListViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={{
              borderRadius: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              }
            }}
          >
            Add Product
          </Button>
        </Stack>
      </Box>

      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {loading ? (
            Array.from(new Array(8)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card sx={{ height: '100%', borderRadius: 2 }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : products.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No products found
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleOpen}
                  sx={{ mt: 2 }}
                >
                  Add Your First Product
                </Button>
              </Paper>
            </Grid>
          ) : (
            products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <ProductCard product={product} />
              </Grid>
            ))
          )}
        </Grid>
      ) : (
        <Paper sx={{ height: 'calc(100vh - 250px)', width: "100%", borderRadius: 2 }}>
          <DataGrid
            rows={products}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25]}
            checkboxSelection
            disableSelectionOnClick
            loading={loading}
            getRowId={(row) => row._id}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderColor: alpha(theme.palette.divider, 0.1),
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: alpha(theme.palette.background.default, 0.6),
                borderRadius: 2,
              },
            }}
          />
        </Paper>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {formData._id ? "Edit Product" : "Add Product"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <FormBuilder
                fields={[
                  {
                    id: "name",
                    type: "text",
                    label: "Name",
                    required: true,
                    gridSize: 12,
                  },
                  {
                    id: "description",
                    type: "text",
                    label: "Description",
                    required: true,
                    multiline: true,
                    rows: 4,
                    gridSize: 12,
                  },
                  {
                    id: "price",
                    type: "number",
                    label: "Price",
                    required: true,
                    gridSize: 6,
                  },
                  {
                    id: "stock",
                    type: "number",
                    label: "Stock",
                    required: true,
                    gridSize: 6,
                  },
                  {
                    id: "category",
                    type: "text",
                    label: "Category",
                    required: true,
                    gridSize: 12,
                  },
                ]}
                values={formData}
                errors={errors}
                onChange={handleFieldChange}
                loading={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Box sx={{ 
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                mb: 2
              }}>
                <Typography variant="subtitle1" gutterBottom>
                  Product Images
                </Typography>
                
                {formData._id ? (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <input
                        accept="image/*"
                        id="product-image-upload"
                        type="file"
                        multiple
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="product-image-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<CloudUploadIcon />}
                          fullWidth
                          sx={{ mb: 1 }}
                        >
                          Upload Images
                        </Button>
                      </label>
                      
                      <Typography variant="caption" color="text.secondary">
                        Upload JPG, PNG or WebP images (max 5MB each)
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      maxHeight: '300px', 
                      overflowY: 'auto',
                      pr: 1
                    }}>
                      {formData.images && formData.images.length > 0 ? (
                        <Grid container spacing={1}>
                          {formData.images.map((image, index) => (
                            <Grid item xs={6} key={image._id || index}>
                              <Box
                                sx={{
                                  position: 'relative',
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                  height: 100,
                                  bgcolor: 'background.default'
                                }}
                              >
                                <Box
                                  component="img"
                                  src={image.url || FALLBACK_IMAGE}
                                  alt={image.name || `Product image ${index + 1}`}
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                  onError={(e) => {
                                    e.target.src = FALLBACK_IMAGE;
                                  }}
                                />
                                
                                <IconButton
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    top: 2,
                                    right: 2,
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    '&:hover': {
                                      bgcolor: 'error.main'
                                    },
                                    width: 24,
                                    height: 24
                                  }}
                                  onClick={() => handleDeleteImage(image._id)}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 3,
                            bgcolor: 'background.default',
                            borderRadius: 1
                          }}
                        >
                          <ImageIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary" align="center">
                            No images uploaded yet
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </>
                ) : (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Save the product first to enable image uploads
                  </Alert>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{
              borderRadius: 2,
              minWidth: 100,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : formData._id ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, productId: null, productName: '' })}
        TransitionComponent={Zoom}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ color: theme.palette.error.main }}>
          Delete Product?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deleteDialog.productName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, productId: null, productName: '' })}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleDetailsClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ 
          elevation: 0,
          sx: { borderRadius: 2 }
        }}
      >
        {selectedProduct && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                Product Details
              </Typography>
            </DialogTitle>
            <Divider />
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box 
                    component="img"
                    src={(selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images[0].url : FALLBACK_IMAGE}
                    alt={selectedProduct.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                    sx={{ 
                      width: '100%', 
                      borderRadius: 2,
                      mb: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  />
                  <Stack spacing={1}>
                    <Chip 
                      label={selectedProduct.category} 
                      color="primary" 
                      sx={{ 
                        borderRadius: 1.5,
                        alignSelf: 'flex-start',
                      }}
                    />
                    <Typography variant="h6" fontWeight="bold">
                      ₹{Number(selectedProduct.price).toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: parseInt(selectedProduct.stock) > 25 
                            ? theme.palette.success.main 
                            : parseInt(selectedProduct.stock) > 10 
                              ? theme.palette.warning.main 
                              : theme.palette.error.main,
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2">
                        {selectedProduct.stock} items in stock
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h4" gutterBottom>
                    {selectedProduct.name}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedProduct.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Product Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Product ID
                      </Typography>
                      <Typography variant="body1">
                        {selectedProduct._id}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Category
                      </Typography>
                      <Typography variant="body1">
                        {selectedProduct.category}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Price
                      </Typography>
                      <Typography variant="body1">
                        ₹{Number(selectedProduct.price).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Stock
                      </Typography>
                      <Typography variant="body1">
                        {selectedProduct.stock} units
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
                  handleEdit(selectedProduct); // Pass the full product object
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

export default Products;
