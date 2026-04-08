import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import CashierDashboard from "../components/cashier/CashierDashboard";
import CashierPOS from "../components/cashier/CashierPOS";
import CashierTransactions from "../components/cashier/CashierTransactions";
import CashierHistory from "../components/cashier/CashierHistory";
import CashierReports from "../components/cashier/CashierReports";
import CashierProfile from "../components/cashier/CashierProfile";

const CashierRoutes = () => (
  <Routes>
    <Route
      path="/*"
      element={
        <ProtectedRoute>
          <CashierDashboard />
        </ProtectedRoute>
      }
    >
      {/* Default landing page */}
      <Route index element={<CashierPOS />} />

      {/* Nested routes */}
      <Route path="pos" element={<CashierPOS />} />
      <Route path="transactions" element={<CashierTransactions />} />
      <Route path="history" element={<CashierHistory />} />
      <Route path="reports" element={<CashierReports />} />
      <Route path="profile" element={<CashierProfile />} />
    </Route>
  </Routes>
);

export default CashierRoutes;