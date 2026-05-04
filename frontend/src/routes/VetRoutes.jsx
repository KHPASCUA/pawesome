import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

const VetDashboard = lazy(() => import("../components/veterinary/VetDashboard_PinkGlass"));
const VetAppointments = lazy(() => import("../components/veterinary/VetAppointments_PinkGlass"));
const VetNewAppointment = lazy(() => import("../components/veterinary/VetNewAppointment_PinkGlass"));
const VetEditAppointment = lazy(() => import("../components/veterinary/VetEditAppointment_PinkGlass"));
const VetHistory = lazy(() => import("../components/veterinary/VetHistory"));
const VetCustomerProfiles = lazy(() => import("../components/veterinary/VetCustomerProfiles.jsx"));
const VetReports = lazy(() => import("../components/veterinary/VetReports"));
const VetReceipt = lazy(() => import("../components/veterinary/VetReceipt"));
const ProfileSettings = lazy(() => import("../components/shared/ProfileSettings"));
const VetCurrentBoarders = lazy(() => import("../components/veterinary/VetCurrentBoarders"));

const RouteLoading = () => (
  <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
);

const VetRoutes = () => (
  <Suspense fallback={<RouteLoading />}>
    <Routes>
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <VetDashboard />
          </ProtectedRoute>
        }
      >
        {/* Default landing page */}
        <Route index element={<VetAppointments />} />

        {/* Nested routes */}
        <Route path="appointments" element={<VetAppointments />} />
        <Route path="appointments/new" element={<VetNewAppointment />} />
        <Route path="appointments/:id/edit" element={<VetEditAppointment />} />
        <Route path="history" element={<VetHistory />} />
        <Route path="customer-profiles" element={<VetCustomerProfiles />} />
        <Route path="reports" element={<VetReports />} />
        <Route path="receipt" element={<VetReceipt />} />
        <Route path="current-boarders" element={<VetCurrentBoarders />} />
        <Route path="profile" element={<ProfileSettings />} />
      </Route>
    </Routes>
  </Suspense>
);

export default VetRoutes;