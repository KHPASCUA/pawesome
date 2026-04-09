import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname.startsWith("/admin") && role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  if (location.pathname.startsWith("/customer") && role !== "customer") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;