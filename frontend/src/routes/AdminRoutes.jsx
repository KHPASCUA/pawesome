import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// Core admin modules - lazy loaded
const AdminDashboard = lazy(() => import("../components/admin/AdminDashboard"));
const AdminReports = lazy(() => import("../components/admin/AdminReports"));
const ManageUsers = lazy(() => import("../components/admin/ManageUsers"));
const CreateUser = lazy(() => import("../components/admin/CreateUser"));
const History = lazy(() => import("../components/admin/History"));
const Attendance = lazy(() => import("../components/admin/Attendance"));
const AdminProfile = lazy(() => import("../components/admin/AdminProfile"));
const ChatbotLogs = lazy(() => import("../components/admin/ChatbotLogs"));
const AdminSettings = lazy(() => import("../components/admin/AdminSettings"));

// Payroll modules - lazy loaded
const AdminPayroll = lazy(() => import("../components/admin/AdminPayroll"));
const EmployeeSalaryManagement = lazy(() => import("../components/admin/EmployeeSalaryManagement"));
const PayrollReports = lazy(() => import("../components/admin/PayrollReports"));

// Loading fallback component
const RouteLoading = () => (
  <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
);

const AdminRoutes = () => (
  <Suspense fallback={<RouteLoading />}>
    <Routes>
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        {/* Default index route → dashboard overview */}
        <Route index element={<AdminReports />} />

        {/* Core admin routes */}
        <Route path="profile" element={<AdminProfile />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="users/create" element={<CreateUser />} />
        <Route path="reports" element={<AdminReports />}>
          <Route path="attendance" element={<Attendance />} /> {/* nested */}
        </Route>
        <Route path="history" element={<History />} />
        <Route path="chatbot" element={<ChatbotLogs />} />
        <Route path="settings" element={<AdminSettings />} />

        {/* Payroll routes */}
        <Route path="payroll" element={<AdminPayroll />} />
        <Route path="payroll/salaries" element={<EmployeeSalaryManagement />} />
        <Route path="payroll/reports" element={<PayrollReports />} />
      </Route>
    </Routes>
  </Suspense>
);

export default AdminRoutes;
