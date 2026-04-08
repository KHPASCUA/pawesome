import React from "react";
import { Navigate } from "react-router-dom";

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // "admin", "receptionist", "customer"

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to a generic dashboard if role is not allowed
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default RoleProtectedRoute;