import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import ManagerDashboard from "../components/manager/ManagerDashboard";
import ManagerStaff from "../components/manager/ManagerStaff";
import ManagerAttendance from "../components/manager/ManagerAttendance";
import ManagerReports from "../components/manager/ManagerReports";

const ManagerRoutes = () => (
  <Routes>
    <Route
      path="/*"
      element={
        <ProtectedRoute>
          <ManagerDashboard />
        </ProtectedRoute>
      }
    >
      {/* Default landing page */}
      <Route index element={<ManagerStaff />} />

      {/* Nested routes */}
      <Route path="staff" element={<ManagerStaff />} />
      <Route path="attendance" element={<ManagerAttendance />} />
      <Route path="reports" element={<ManagerReports />} />
    </Route>
  </Routes>
);

export default ManagerRoutes;