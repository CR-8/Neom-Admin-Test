import { ImportExportRounded } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

// Add diagnostic function for auth debugging
const debugAuth = () => {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.group('Auth Debug Info');
    console.log('Token exists:', !!token);
    if (token) console.log('Token length:', token.length);
    
    console.log('User data exists:', !!user);
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        console.log('User role:', parsedUser?.role);
        console.log('User email:', parsedUser?.email);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
    console.groupEnd();
    
    return { token, user };
  } catch (err) {
    console.error('Debug auth error:', err);
    return { token: null, user: null };
  }
};

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://13.232.180.68:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await api.post('/auth/refresh-token');
        const { token } = response.data;
        
        // Update token in localStorage
        localStorage.setItem('token', token);
        
        // Update the Authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, logout the user
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Export the api instance as default
export default api;

// Auth related API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyOTP: (otpData) => api.post('/auth/verify-otp', otpData),
  resendOTP: (emailData) => api.post('/auth/resend-otp', emailData),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh-token'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  }
};

// User related API calls
export const userAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  create: (userData) => api.post('/auth/admin', userData),
  update: (id, userData) => api.patch(`/admin/users/${id}`, userData),
  delete: (id) => api.delete(`/admin/users/${id}`),
  updateStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  resetPassword: (email) => api.post('/auth/reset-password', { email }),
  exportUsers: (format = 'csv') => api.get(`/admin/users/export?format=${format}`, {
    responseType: 'blob'
  }),
  getCurrentUser: () => api.get('/users/me'),
  uploadAvatar: (userId, formData) => api.patch(`/users/${userId}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

// Customer related API calls
export const customerAPI = {
  getAll: (params) => api.get('/admin/customers', { params }),
  getById: (id) => api.get(`/admin/customers/${id}`),
  create: (customerData) => api.post('/admin/customers', customerData),
  update: (id, customerData) => api.put(`/admin/customers/${id}`, customerData),
  delete: (id) => api.delete(`/admin/customers/${id}`),
  updateStatus: (id, status) => api.patch(`/admin/customers/${id}/status`, { status }),
  getAddresses: (id) => api.get(`/admin/customers/${id}/addresses`),
  addAddress: (id, addressData) => api.post(`/admin/customers/${id}/addresses`, addressData),
  updateAddress: (customerId, addressId, addressData) => api.put(`/admin/customers/${customerId}/addresses/${addressId}`, addressData),
  deleteAddress: (customerId, addressId) => api.delete(`/admin/customers/${customerId}/addresses/${addressId}`),
  getOrderHistory: (customerId, params) => api.get(`/admin/customers/${customerId}/orders`, { params }),
  updateLoyaltyPoints: (customerId, points, reason) => api.post(`/admin/customers/${customerId}/loyalty-points`, { points, reason }),
  getSegments: () => api.get('/admin/customers/segments'),
  getBySegment: (segment, params) => api.get(`/admin/customers/segments/${segment}`, { params }),
  exportCustomers: (format = 'csv', params) => api.get(`/admin/customers/export?format=${format}`, {
    params,
    responseType: 'blob'
  })
};

// Product related API calls
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.patch(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  updateStatus: (id, status) => api.patch(`/products/${id}/status`, { status }),
  uploadImage: async (productId, formData) => {
    try {
      // First, upload to Cloudinary through our backend
      const uploadResponse = await api.post(`/upload/cloudinary`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Then, associate the Cloudinary URL with the product
      if (uploadResponse.data.data && uploadResponse.data.data.url) {
        const imageUpdateResponse = await api.patch(`/products/${productId}/images`, {
          imageUrl: uploadResponse.data.data.url,
          publicId: uploadResponse.data.data.public_id
        });
        return imageUpdateResponse;
      }
      
      throw new Error('Failed to get image URL from upload');
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  },
  deleteImage: async (productId, imageId) => {
    return api.delete(`/products/${productId}/images/${imageId}`);
  },
};

// Category related API calls
export const categoryAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
  getChildren: (id) => api.get(`/categories/${id}/children`),
  getProducts: (id, params) => api.get(`/categories/${id}/products`, { params }),
  getPath: (id) => api.get(`/categories/${id}/path`),
  moveTo: (id, newParentId) => api.patch(`/categories/${id}/move`, { parentId: newParentId }),
  bulkUpdateStatus: (categoryIds, isActive) => api.patch('/categories/bulk-status', { categoryIds, isActive }),
  reorderCategories: (parentId, orderedIds) => api.post('/categories/reorder', { parentId, orderedIds }),
  uploadImage: (categoryId, formData) => api.post(`/categories/${categoryId}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  rebuildAncestors: () => api.post('/categories/rebuild-ancestors')
};

// Tax related API calls
export const taxAPI = {
  getAll: (params) => api.get('/taxes', { params }),
  getById: (id) => api.get(`/taxes/${id}`),
  create: (taxData) => api.post('/taxes', taxData),
  update: (id, taxData) => api.put(`/taxes/${id}`, taxData),
  delete: (id) => api.delete(`/taxes/${id}`),
  updateRate: (id, newRate, effectiveFrom, reason) => api.patch(`/taxes/${id}/rate`, { 
    rate: newRate, 
    effectiveFrom, 
    reason 
  }),
  setExemption: (id, isExempted, reason) => api.patch(`/taxes/${id}/exemption`, { 
    isExempted, 
    reason 
  }),
  addSpecialCondition: (id, conditionData) => api.post(`/taxes/${id}/special-conditions`, conditionData),
  deactivateSpecialCondition: (taxId, conditionId) => api.patch(`/taxes/${taxId}/special-conditions/${conditionId}`, {
    isActive: false
  }),
  getTaxHistory: (params) => api.get('/taxes/history', { params }),
  calculateTax: (amount, options) => api.post('/taxes/calculate', { amount, ...options }),
  getApplicableTaxes: (options) => api.get('/taxes/applicable', { params: options })
};

// Review related API calls
export const reviewAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  getById: (id) => api.get(`/reviews/${id}`),
  create: (reviewData) => api.post('/reviews', reviewData),
  update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/reviews/${id}`),
  moderate: (id, status, notes) => api.patch(`/reviews/${id}/moderate`, { status, notes }),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
  removeHelpful: (id) => api.delete(`/reviews/${id}/helpful`),
  report: (id, reason) => api.post(`/reviews/${id}/report`, { reason }),
  getProductReviews: (productId, params) => api.get(`/products/${productId}/reviews`, { params }),
  getPendingReviews: (params) => api.get('/reviews/pending', { params }),
  getReportedReviews: (params) => api.get('/reviews/reported', { params }),
  uploadImages: (reviewId, formData) => api.post(`/reviews/${reviewId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  deleteImage: (reviewId, imageIndex) => api.delete(`/reviews/${reviewId}/images/${imageIndex}`)
};

// Notification related API calls
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getById: (id) => api.get(`/notifications/${id}`),
  create: (notificationData) => api.post('/notifications', notificationData),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  createOrderStatusNotification: (userId, orderId, status) => api.post('/notifications/order-status', {
    userId,
    orderId,
    status
  }),
  batchCreate: (notifications) => api.post('/notifications/batch', { notifications }),
  deleteExpired: () => api.delete('/notifications/expired')
};

// Order related API calls
export const orderAPI = {
  getAllAdmin: (params) => api.get('/admin/orders', { params }),
  getAll: (params) => api.get('/orders', { params }),
  getByIdAdmin: (id) => api.get(`/admin/orders/${id}`),
  getById: (id) => api.get(`/orders/${id}`),
  
  // Update status with better error handling
  updateStatus: (orderId, newStatus) => {
    console.log(`[orderAPI] Updating order ${orderId} status to ${newStatus}`);
    debugAuth();
    
    // Include debugging info in the request
    return api.patch(`/admin/orders/${orderId}/status`, { 
      status: newStatus,
      _debug: { 
        role: JSON.parse(localStorage.getItem('user') || '{}')?.role || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
  },
  
  cancelOrder: (orderId) => {
    console.log(`[orderAPI] Canceling order ${orderId}`);
    return api.patch(`/orders/${orderId}/cancel`, { 
      reason: "Canceled from admin dashboard"
    });
  },
  
  // Use admin endpoint correctly for refunding orders and add reason
  refundOrder: (orderId) => {
    console.log(`[orderAPI] Refunding order ${orderId}`);
    debugAuth();
    
    return api.post(`/admin/orders/${orderId}/refund`, {
      reason: "Refund issued from admin dashboard",
      _debug: { 
        role: JSON.parse(localStorage.getItem('user') || '{}')?.role || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
  },
  
  exportOrders: (params) =>
    api.get("/orders/export", { params, responseType: "blob" }),
};

// Analytics related API calls
export const analyticsAPI = {
  // Dashboard overview
  getDashboardOverview: (period = 'weekly', params = {}) => api.get('/analytics/dashboard/overview', { 
    params: { period, ...params }
  }),
  
  getDashboardStats: (period = 'weekly', params = {}) => api.get('/analytics/dashboard/stats', { 
    params: { period, ...params }
  }),
  
  getDashboardTrends: (period = 'weekly', params = {}) => api.get('/analytics/dashboard/trends', { 
    params: { period, ...params }
  }),
  
  generateDashboardReport: (period = 'weekly', format = 'pdf', params = {}) => api.get('/analytics/dashboard/report', { 
    params: { period, format, ...params },
    responseType: 'blob'
  }),

  // Product analytics
  getTopProducts: (period = 'weekly', params = {}) => api.get('/analytics/products/top', { 
    params: { period, ...params }
  }),
  
  getProductAnalytics: (period = 'weekly', params = {}) => api.get('/analytics/products/performance', { 
    params: { period, ...params }
  }),
  
  getCategoryDistribution: (period = 'weekly', params = {}) => api.get('/analytics/products/category-distribution', { 
    params: { period, ...params }
  }),

  // Sales analytics
  getSalesOverview: (period = 'weekly', params = {}) => api.get('/analytics/sales/overview', { 
    params: { period, ...params }
  }),
  
  getSalesTrends: (period = 'weekly', params = {}) => api.get('/analytics/sales/trends', { 
    params: { period, ...params }
  }),
  
  getSalesByCategory: (period = 'weekly', params = {}) => api.get('/analytics/sales/categories', { 
    params: { period, ...params }
  }),
  
  getSalesByRegion: (period = 'weekly', params = {}) => api.get('/analytics/sales/regions', { 
    params: { period, ...params }
  }),
  
  getRevenueByCategory: (period = 'weekly', params = {}) => api.get('/analytics/revenue/categories', { 
    params: { period, ...params }
  }),

  // User analytics
  getUserAnalytics: (period = 'weekly', params = {}) => api.get('/analytics/users/overview', { 
    params: { period, ...params }
  }),
  
  getUserActivity: (period = 'weekly', params = {}) => api.get('/analytics/users/activity', { 
    params: { period, ...params }
  }),
  
  getCustomerSegments: (period = 'weekly', params = {}) => api.get('/analytics/customers/segments', { 
    params: { period, ...params }
  }),
  
  getCustomerRetention: (period = 'weekly', params = {}) => api.get('/analytics/customers/retention', { 
    params: { period, ...params }
  }),

  // Order analytics
  getOrderStatusDistribution: (period = 'weekly', params = {}) => api.get('/analytics/orders/status', { 
    params: { period, ...params }
  }),
  
  getOrderTrends: (period = 'weekly', params = {}) => api.get('/analytics/orders/trends', { 
    params: { period, ...params }
  }),

  // Payment analytics
  getPaymentMethods: (period = 'weekly', params = {}) => api.get('/analytics/payments/methods', { 
    params: { period, ...params }
  }),
  
  getPaymentTrends: (period = 'weekly', params = {}) => api.get('/analytics/payments/trends', { 
    params: { period, ...params }
  }),

  // Report generation
  generateReport: (period = 'weekly', format = 'pdf', params = {}) => api.get('/analytics/reports/generate', { 
    params: { period, format, ...params },
    responseType: 'blob'
  }),
  
  exportReport: (period = 'weekly', format = 'csv', params = {}) => api.get('/analytics/reports/export', { 
    params: { period, format, ...params },
    responseType: 'blob'
  }),

  // Analytics management (admin only)
  upsertAnalytics: (data) => api.post('/analytics', data),
  updateAnalytics: (id, data) => api.patch(`/analytics/${id}`, data),
  deleteAnalytics: (id) => api.delete(`/analytics/${id}`),

  // Tracking
  trackView: (data) => api.post('/analytics/track/view', data),
  trackSales: (data) => api.post('/analytics/track/sales', data),
  trackUserActivity: (data) => api.post('/analytics/track/activity', data)
};

// Update dashboardAPI to use analyticsAPI
export const dashboardAPI = {
  getStats: analyticsAPI.getDashboardStats,
  getAnalytics: analyticsAPI.getDashboardOverview,
  generateReport: analyticsAPI.generateDashboardReport,
  getTrends: analyticsAPI.getDashboardTrends
};

// Discount related API calls 
export const discountAPI = {
  getAll: (params) => api.get('/admin/discounts', { params }),
  getById: (id) => api.get(`/admin/discounts/${id}`),
  create: (discountData) => api.post('/admin/discounts', discountData),
  update: (id, discountData) => api.patch(`/admin/discounts/${id}`, discountData),
  delete: (id) => api.delete(`/admin/discounts/${id}`),
  updateStatus: (id, status) => api.patch(`/admin/discounts/${id}/status`, { status }),
  getBulkDiscounts: () => api.get('/admin/discounts/bulk'),
  getPromotionalDiscounts: () => api.get('/admin/discounts/promotional'),
  getSeasonalDiscounts: () => api.get('/admin/discounts/seasonal'),
  exportDiscounts: (format = 'csv') => api.get(`/admin/discounts/export?format=${format}`, {
    responseType: 'blob'
  })
};

// Backup related API calls
export const backupAPI = {
  createBackup: (options) => api.post('/admin/backup', options),
  getBackups: () => api.get('/admin/backup'),
  downloadBackup: (backupId) => api.get(`/admin/backup/${backupId}/download`, { responseType: 'blob' }),
  restoreBackup: (backupId) => api.post(`/admin/backup/${backupId}/restore`),
  deleteBackup: (backupId) => api.delete(`/admin/backup/${backupId}`),
  scheduleBackup: (schedule) => api.post('/admin/backup/schedule', schedule),
  getBackupSchedule: () => api.get('/admin/backup/schedule')
};

// OTP related API calls
export const otpAPI = {
  generate: (phone) => api.post('/auth/otp/generate', { phone }),
  verify: (phone, otp) => api.post('/auth/otp/verify', { phone, otp }),
  resend: (phone) => api.post('/auth/otp/resend', { phone })
};