import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const routeRoleMap = {
  admin: ["admin"],
  customer: ["customer"],
  receptionist: ["receptionist"],
  cashier: ["cashier"],
  inventory: ["inventory"],
  manager: ["manager"],
  payroll: ["payroll"],
  veterinary: ["veterinary", "vet"],
  vet: ["veterinary", "vet"],
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const firstSegment = location.pathname.split("/").filter(Boolean)[0];
  const allowedRoles = routeRoleMap[firstSegment];

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
