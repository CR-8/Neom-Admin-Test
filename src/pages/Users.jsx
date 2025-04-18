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
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Divider,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import FormBuilder from "../components/common/FormBuilder";
import { useSnackbar } from "notistack";
import { userAPI, authAPI } from "../services/api";
import ErrorHandler from "../components/common/ErrorHandler";
import { format } from "date-fns";

// Mock data for when API is completely down
const mockUsers = [
  { 
    id: "1", 
    _id: "1",
    name: "John Doe", 
    email: "john@example.com", 
    role: "admin",
    isEmailVerified: true,
    createdAt: "2023-01-15T10:00:00.000Z"
  },
  { 
    id: "2", 
    _id: "2",
    name: "Jane Smith", 
    email: "jane@example.com", 
    role: "user",
    isEmailVerified: true,
    createdAt: "2023-02-20T11:30:00.000Z"
  },
  { 
    id: "3", 
    _id: "3",
    name: "Bob Johnson", 
    email: "bob@example.com", 
    role: "user",
    isEmailVerified: false,
    createdAt: "2023-03-10T09:15:00.000Z"
  },
  { 
    id: "4", 
    _id: "4",
    name: "Alice Brown", 
    email: "alice@example.com", 
    role: "user",
    isEmailVerified: true,
    createdAt: "2023-04-05T14:20:00.000Z"
  },
  { 
    id: "5", 
    _id: "5",
    name: "Charlie Wilson", 
    email: "charlie@example.com", 
    role: "user",
    isEmailVerified: false,
    createdAt: "2023-05-18T16:45:00.000Z"
  }
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const { enqueueSnackbar } = useSnackbar();

  const columns = [
    { 
      field: "id", 
      headerName: "ID", 
      width: 220,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <span>{params.value.substring(0, 8)}...</span>
        </Tooltip>
      ),
    },
    { 
      field: "name", 
      headerName: "Name", 
      width: 200,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 'medium' }}>
          {params.value}
        </Box>
      ),
    },
    { 
      field: "email", 
      headerName: "Email", 
      width: 250,
    },
    { 
      field: "role", 
      headerName: "Role", 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === "admin" ? "primary" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "isEmailVerified",
      headerName: "Verified",
      width: 130,
      renderCell: (params) => (
        params.value ? 
        <Chip icon={<CheckCircleIcon />} label="Verified" color="success" size="small" /> : 
        <Chip icon={<CancelIcon />} label="Not Verified" color="error" size="small" />
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 180,
      valueFormatter: (params) => {
        try {
          return format(new Date(params.value), 'MMM dd, yyyy');
        } catch (error) {
          return 'N/A';
        }
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleViewDetails(params.row)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit User">
            <IconButton
              size="small"
              color="secondary"
              onClick={() => handleEdit(params.row)}
              sx={{ mx: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteConfirmation(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    // Initialize with mock data immediately to avoid empty table
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    // Then try to fetch actual data
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await userAPI.getAll();
      
      // Handle different possible response structures
      let userData = [];
      
      if (response.data && response.data.data && response.data.data.users) {
        // Backend API structure: { status, data: { users: [...] } }
        userData = response.data.data.users;
      } else if (response.data && Array.isArray(response.data)) {
        // Simple array response: [user1, user2, ...]
        userData = response.data;
      } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
        // Another possible structure: { users: [...] }
        userData = response.data.users;
      } else {
        // Fallback to empty array if structure is unknown
        console.warn("Unknown users data structure:", response.data);
        userData = [];
      }
      
      // Ensure each user has an id property for DataGrid
      const formattedUsers = userData.map(user => ({
        ...user,
        id: user._id || user.id // Use _id if available, fallback to id
      }));
      
      // Only update if we got actual data
      if (formattedUsers.length > 0) {
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setApiError(error);
      
      // Keep using the mock data set in useEffect
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setFormData({
      name: "",
      email: "",
      role: "user",
      password: "",
    });
    setErrors({});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: "",
      email: "",
      role: "user",
      password: "",
    });
    setErrors({});
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      
      // Create a copy of form data to avoid mutation
      const userData = { ...formData };
      
      if (formData.id) {
        // For updates, use the original endpoint
        response = await userAPI.update(formData.id, userData);
        enqueueSnackbar("User updated successfully", { variant: "success" });
      } else {
        // For new user creation, use the auth/admin endpoint
        // This endpoint creates verified users directly
        const registrationData = {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role || 'user',
          // No need for isEmailVerified/bypassVerification as the endpoint handles it
        };

        // Log what we're sending to help with debugging
        console.log("Creating user with data:", registrationData);
        
        try {
          // First try the admin creation endpoint that requires admin authentication
          response = await userAPI.create(registrationData);
          console.log("User creation response:", response);
          enqueueSnackbar("User created successfully", { variant: "success" });
        } catch (adminError) {
          if (adminError.response?.status === 404 || adminError.response?.status === 403) {
            // If admin endpoint fails, fall back to the regular registration with OTP bypass
            console.log("Falling back to regular registration with OTP bypass");
            response = await authAPI.register({
              ...registrationData,
              isEmailVerified: true,
              createdBy: 'admin',
              bypassVerification: true
            });
            console.log("User registration response:", response);
            enqueueSnackbar("User created successfully", { variant: "success" });
          } else {
            // Re-throw other errors
            throw adminError;
          }
        }
      }
      
      // Log the response to help debug
      console.log("API response:", response);
      
      handleClose();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      
      // Enhanced error handling with better feedback for validation failures
      let errorMessage = "Failed to save user";
      
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        
        // Check for different error formats
        if (error.response.data?.error?.errors) {
          // Mongoose validation errors
          const validationErrors = error.response.data.error.errors;
          const newErrors = {};
          
          // Map validation errors to form fields
          Object.keys(validationErrors).forEach(field => {
            newErrors[field] = validationErrors[field].message || 'Invalid value';
          });
          
          setErrors(newErrors);
          errorMessage = "Please correct the validation errors";
        }
        else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } 
        else if (error.response.data?.errors) {
          setErrors(error.response.data.errors);
          errorMessage = "Please correct the form errors";
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your connection.";
      }
      
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    // Clone the user object to avoid modifying the original data
    const userToEdit = { ...user };
    
    // Set the form data, omitting the password field for existing users
    setFormData({
      id: userToEdit.id,
      name: userToEdit.name || "",
      email: userToEdit.email || "",
      role: userToEdit.role || "user",
    });
    
    setErrors({});
    setOpen(true);
  };

  const handleDeleteConfirmation = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async (id) => {
    setDeleteDialogOpen(false);
    setLoading(true);
    
    try {
      const response = await userAPI.delete(id);
      console.log("Delete response:", response);
      
      enqueueSnackbar("User deleted successfully", { 
        variant: "success",
        autoHideDuration: 3000,
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to delete user",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" }, 
          justifyContent: "space-between", 
          alignItems: { xs: "stretch", sm: "center" }, 
          mb: 3 
        }}>
          <Typography variant="h5" component="h1" sx={{ mb: { xs: 2, sm: 0 } }}>
            Users Management
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              placeholder="Search users..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery("")}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", sm: 250 } }}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchUsers}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpen}
            >
              Add User
            </Button>
          </Box>
        </Box>

        {apiError ? (
          <ErrorHandler error={apiError} onRetry={fetchUsers} fullPage />
        ) : (
          <Paper sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={filteredUsers}
              columns={columns}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              rowsPerPageOptions={[5, 10, 25, 50]}
              components={{ Toolbar: GridToolbar }}
              disableSelectionOnClick
              loading={loading}
              getRowId={(row) => row.id}
              sx={{
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  fontWeight: 'bold',
                },
              }}
            />
          </Paper>
        )}
      </Paper>

      {/* Add/Edit User Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1
        }}>
          {formData.id ? "Edit User" : "Add User"}
          <IconButton size="small" onClick={handleClose} aria-label="close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <FormBuilder
            fields={[
              {
                id: "name",
                type: "text",
                label: "Name",
                required: true,
                gridSize: 12,
                placeholder: "Enter user's full name",
              },
              {
                id: "email",
                type: "email",
                label: "Email",
                required: true,
                gridSize: 12,
                placeholder: "Enter user's email address"
              },
              {
                id: "role",
                type: "select",
                label: "Role",
                required: true,
                options: [
                  { value: "user", label: "User" },
                ],
                gridSize: 12,
              },
              ...(!formData.id
                ? [
                    {
                      id: "password",
                      type: "password",
                      label: "Password",
                      required: true,
                      gridSize: 12,
                      placeholder: "Enter a secure password"
                    },
                  ]
                : []),
            ]}
            values={formData}
            errors={errors}
            onChange={handleFieldChange}
            onSubmit={handleSubmit}
            submitText={formData.id ? "Update User" : "Create User"}
            loading={loading}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button 
            onClick={handleClose}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            startIcon={formData.id ? <EditIcon /> : <AddIcon />}
            disabled={loading}
          >
            {loading ? 
              <CircularProgress size={24} color="inherit" /> : 
              (formData.id ? "Update User" : "Create User")
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {userToDelete && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Are you sure you want to delete user "{userToDelete.name}"? This action cannot be undone.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleDelete(userToDelete?.id)}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View User Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center' 
        }}>
          User Details
          <IconButton size="small" onClick={() => setViewDialogOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {selectedUser && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Basic Information
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {selectedUser.name}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {selectedUser.email}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Role
                      </Typography>
                      <Chip 
                        label={selectedUser.role} 
                        color={selectedUser.role === "admin" ? "primary" : "default"} 
                        size="small"
                      />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Email Verification
                      </Typography>
                      {selectedUser.isEmailVerified ? (
                        <Chip icon={<CheckCircleIcon />} label="Verified" color="success" size="small" />
                      ) : (
                        <Chip icon={<CancelIcon />} label="Not Verified" color="error" size="small" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Account Details
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        User ID
                      </Typography>
                      <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                        {selectedUser.id}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Created At
                      </Typography>
                      <Typography variant="body1">
                        {selectedUser.createdAt ? format(new Date(selectedUser.createdAt), 'PPPp') : 'N/A'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            variant="outlined"
          >
            Close
          </Button>
          <Button 
            onClick={() => {
              setViewDialogOpen(false);
              handleEdit(selectedUser);
            }}
            color="primary"
            variant="contained"
            startIcon={<EditIcon />}
          >
            Edit User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
