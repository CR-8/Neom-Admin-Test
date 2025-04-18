import React from "react";
import { Box, Container } from "@mui/material";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarOpen ? 240 : 0}px)` },
          ml: { sm: sidebarOpen ? "240px" : 0 },
          transition: "margin 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
        }}
      >
        <Box sx={{ height: 64 }} /> {/* Toolbar spacer */}
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </Box>
  );
};

export default Layout;
