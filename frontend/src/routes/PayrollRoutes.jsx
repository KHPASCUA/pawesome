import React from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminPayroll from "../components/admin/AdminPayroll";
import PayrollReports from "../components/admin/PayrollReports";
import EmployeeSalaryManagement from "../components/admin/EmployeeSalaryManagement";

const PayrollRoutes = () => (
  <Routes>
    <Route
      index
      element={
        <ProtectedRoute>
          <AdminPayroll />
        </ProtectedRoute>
      }
    />
    <Route
      path="reports"
      element={
        <ProtectedRoute>
          <PayrollReports />
        </ProtectedRoute>
      }
    />
    <Route
      path="salaries"
      element={
        <ProtectedRoute>
          <EmployeeSalaryManagement />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/payroll" replace />} />
  </Routes>
);

export default PayrollRoutes;
