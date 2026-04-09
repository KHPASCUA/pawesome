import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public
import LandingPage from "../components/landing/LandingPage";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import Dashboard from "../components/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";

// Module routes
import AdminRoutes from "./AdminRoutes";
import PayrollRoutes from "./PayrollRoutes";
import CustomerRoutes from "./CustomerRoutes";
import ReceptionistRoutes from "./ReceptionistRoutes";
import VetRoutes from "./VetRoutes";
import InventoryRoutes from "./InventoryRoutes";
import CashierRoutes from "./CashierRoutes";
import ManagerRoutes from "./ManagerRoutes";

const AppRoutes = () => (
  <Router>
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Module routes — render components directly */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/payroll/*" element={<PayrollRoutes />} />
      <Route path="/customer/*" element={<CustomerRoutes />} />
      <Route path="/receptionist/*" element={<ReceptionistRoutes />} />
      <Route path="/vet/*" element={<VetRoutes />} />
      <Route path="/inventory/*" element={<InventoryRoutes />} />
      <Route path="/cashier/*" element={<CashierRoutes />} />
      <Route path="/manager/*" element={<ManagerRoutes />} />
    </Routes>
  </Router>
);

export default AppRoutes;