import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import ManagerDashboard from "../components/manager/ManagerDashboard";
import ManagerStaff from "../components/manager/ManagerStaff";
import ManagerAttendance from "../components/manager/ManagerAttendance";
import ManagerReports from "../components/manager/ManagerReports";
import ManagerProfile from "../components/manager/ManagerProfile";

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
      <Route path="tasks" element={<ManagerReports />} />
      <Route path="history" element={<ManagerAttendance />} />
      <Route path="analytics" element={<ManagerReports />} />
      <Route path="reports" element={<ManagerReports />} />
      <Route path="profile" element={<ManagerProfile />} />
    </Route>
  </Routes>
);

export default ManagerRoutes;
