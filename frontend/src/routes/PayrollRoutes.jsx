import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminPayroll from "../components/admin/AdminPayroll";
import PayrollReports from "../components/admin/PayrollReports";
import EmployeeSalaryManagement from "../components/admin/EmployeeSalaryManagement";

const PayrollRoutes = () => (
  <Routes>
    <Route
      path="/*"
      element={
        <ProtectedRoute>
          <AdminPayroll />
        </ProtectedRoute>
      }
    >
      {/* Default landing page */}
      <Route index element={<AdminPayroll />} />

      {/* Nested routes */}
      <Route path="reports" element={<PayrollReports />} />
      <Route path="salaries" element={<EmployeeSalaryManagement />} />
    </Route>
  </Routes>
);

export default PayrollRoutes;