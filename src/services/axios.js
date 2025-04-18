import axios from "axios";
import { toast } from "react-toastify";

// Get API port from environment or fallback to 6000
const API_PORT = import.meta.env.PORT || 6000;

// Create axios instance
const instance = axios.create({
  baseURL: `http://localhost:${API_PORT}/api`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
          const response = await axios.post(
            `${
              process.env.REACT_APP_API_URL || `http://localhost:${API_PORT}`
            }/api/admin/auth/refresh-token`,
            { refreshToken }
          );

          const { accessToken } = response.data;

          // Update token in localStorage
          localStorage.setItem("token", accessToken);

          // Update Authorization header
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Retry original request
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

        // If we're not already on the login page, redirect
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    // Handle error messages
    const errorMessage =
      error.response?.data?.message || "Something went wrong";

    // Don't show toast for 401 errors (handled by auth redirect)
    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default instance;
