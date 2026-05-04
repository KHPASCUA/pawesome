import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import InventoryDashboard from "../components/inventory/InventoryDashboard";
import InventoryProducts from "../components/inventory/InventoryProducts";
import InventoryStock from "../components/inventory/InventoryStock_Polished";
import InventoryReports from "../components/inventory/InventoryReports";
import InventoryHistory from "../components/inventory/InventoryHistory_Polished";
import ProfileSettings from "../components/shared/ProfileSettings";
import InventoryManagement from "../components/inventory/InventoryManagement";
import MonthlyInventoryAudit from "../components/inventory/MonthlyInventoryAudit";
import MonthlyAuditReport from "../components/inventory/MonthlyAuditReport";
import AuditAnalyticsDashboard from "../components/inventory/AuditAnalyticsDashboard";

const InventoryRoutes = () => (
  <Routes>
    <Route
      path="/*"
      element={
        <ProtectedRoute>
          <InventoryDashboard />
        </ProtectedRoute>
      }
    >
      <Route index element={<InventoryProducts />} />
      <Route path="products" element={<InventoryProducts />} />
      <Route path="stock" element={<InventoryStock />} />
      <Route path="management" element={<InventoryManagement />} />
      <Route path="history" element={<InventoryHistory />} />
      <Route path="analytics" element={<InventoryReports />} />
      <Route path="reports" element={<InventoryReports />} />
<Route
        path="monthly-audit"
        element={
          <ProtectedRoute>
            <MonthlyInventoryAudit />
          </ProtectedRoute>
        }
      />
      <Route
        path="monthly-audit-report"
        element={
          <ProtectedRoute>
            <MonthlyAuditReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="audit-analytics"
        element={
          <ProtectedRoute>
            <AuditAnalyticsDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="profile" element={<ProfileSettings />} />
    </Route>
  </Routes>
);

export default InventoryRoutes;
