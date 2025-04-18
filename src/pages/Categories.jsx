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
  DialogContentText,
  Slide,
  Zoom,
  useTheme,
  Card,
  CardContent,
  IconButton,
  alpha,
  TextField,
  InputAdornment,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import FormBuilder from "../components/common/FormBuilder";
import { useSnackbar } from "notistack";
import { categoryAPI } from "../services/api";
import {
  EditOutlined as EditIcon,
  DeleteOutline as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

const Categories = () => {
  const theme = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    categoryId: null,
    categoryName: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "name", headerName: "Name", width: 200,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value}
        </Typography>
      )
    },
    { field: "description", headerName: "Description", width: 400,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {params.value}
        </Typography>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          opacity: 0.7,
          transition: 'opacity 0.2s',
          '&:hover': { opacity: 1 }
        }}>
          <Tooltip title="Edit Category" arrow>
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
          <Tooltip title="Delete Category" arrow>
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
        </Box>
      ),
    },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryAPI.getAll();
      const categoriesWithId = response.data.data.map(category => ({
        ...category,
        id: category._id
      }));
      setCategories(categoriesWithId);
    } catch (error) {
      console.error("Error fetching categories:", error);
      enqueueSnackbar("Failed to fetch categories", { variant: "error" });
    }
    setLoading(false);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: "",
      description: "",
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.description)
      newErrors.description = "Description is required";
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
      const response = formData.id 
        ? await categoryAPI.update(formData.id, formData)
        : await categoryAPI.create(formData);

      if (response.data) {
        enqueueSnackbar(
          `Category ${formData.id ? "updated" : "created"} successfully`,
          { variant: "success" }
        );
        fetchCategories();
        handleClose();
      }
    } catch (error) {
      console.error("Error handling category:", error);
      enqueueSnackbar(
        error.response?.data?.message || "An error occurred",
        { variant: "error" }
      );
    }
  };

  const handleEdit = (category) => {
    setFormData(category);
    setOpen(true);
  };

  const handleDeleteClick = (category) => {
    setDeleteDialog({
      open: true,
      categoryId: category.id,
      categoryName: category.name
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await categoryAPI.delete(deleteDialog.categoryId);
      enqueueSnackbar("Category deleted successfully", { 
        variant: "success",
        TransitionComponent: Slide 
      });
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      enqueueSnackbar("Failed to delete category", { 
        variant: "error",
        TransitionComponent: Slide
      });
    } finally {
      setDeleteDialog({ open: false, categoryId: null, categoryName: '' });
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
            Categories Management
          </Typography>
          <Typography variant="body1">
            Manage your product categories and subcategories efficiently.
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <TextField
          placeholder="Search categories..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
          Add Category
        </Button>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          height: 'calc(100vh - 250px)', 
          width: "100%", 
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <DataGrid
          rows={categories}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 25]}
          checkboxSelection
          disableSelectionOnClick
          loading={loading}
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {formData.id ? "Edit Category" : "Add Category"}
        </DialogTitle>
        <DialogContent>
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
            ]}
            values={formData}
            errors={errors}
            onChange={handleFieldChange}
            onSubmit={handleSubmit}
            loading={loading}
          />
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
            ) : formData.id ? (
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
        onClose={() => setDeleteDialog({ open: false, categoryId: null, categoryName: '' })}
        TransitionComponent={Zoom}
        PaperProps={{
          elevation: 0,
          sx: { borderRadius: 2, p: 1 }
        }}
      >
        <DialogTitle sx={{ color: theme.palette.error.main }}>
          Delete Category?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deleteDialog.categoryName}"? This will also affect all products in this category.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, categoryId: null, categoryName: '' })}
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
    </Box>
  );
};

export default Categories;
