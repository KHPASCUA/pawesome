import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import InventoryDashboard from "../components/inventory/InventoryDashboard";
import InventoryProducts from "../components/inventory/InventoryProducts";
import InventoryStock from "../components/inventory/InventoryStock";
import InventoryReports from "../components/inventory/InventoryReports";
import InventoryHistory from "../components/inventory/InventoryHistory";

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
      <Route path="history" element={<InventoryHistory />} />
      <Route path="reports" element={<InventoryReports />} />
    </Route>
  </Routes>
);

export default InventoryRoutes;
