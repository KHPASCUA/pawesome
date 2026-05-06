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

const roleHomeMap = {
  admin: "/admin",
  payroll: "/payroll",
  customer: "/customer",
  receptionist: "/receptionist",
  veterinary: "/veterinary",
  vet: "/veterinary",
  inventory: "/inventory",
  cashier: "/cashier",
  manager: "/manager",
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  console.log("PROTECTED ROUTE CHECK:", {
    pathname: location.pathname,
    token: token ? "exists" : "missing",
    role: role || "missing",
    localStorageKeys: Object.keys(localStorage).filter(k => localStorage.getItem(k))
  });

  if (!token) {
    console.log("PROTECTED ROUTE: No token found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  const firstSegment = location.pathname.split("/").filter(Boolean)[0];
  const allowedRoles = routeRoleMap[firstSegment];

  console.log("PROTECTED ROUTE: Role validation:", {
    firstSegment,
    allowedRoles,
    userRole: role,
    hasAccess: allowedRoles ? allowedRoles.includes(role) : true
  });

  if (allowedRoles && !allowedRoles.includes(role)) {
    console.log("PROTECTED ROUTE: Role access denied, redirecting to:", roleHomeMap[role] || "/login");
    return <Navigate to={roleHomeMap[role] || "/login"} replace />;
  }

  console.log("PROTECTED ROUTE: Access granted, rendering children");
  return children;
};

export default ProtectedRoute;
