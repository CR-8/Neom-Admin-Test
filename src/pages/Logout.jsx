import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear local storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Remove authorization header
        delete axios.defaults.headers.common["Authorization"];

        // Show success message
        toast.success("Logged out successfully");

        // Force a page reload to ensure App.jsx re-evaluates authentication state
        window.location.href = "/login";
      } catch (error) {
        console.error("Logout error:", error);
        toast.error("Error during logout");
        window.location.href = "/login";
      }
    };

    performLogout();
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      Logging out...
    </div>
  );
};

export default Logout;
