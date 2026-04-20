import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

const VetDashboard = lazy(() => import("../components/veterinary/VetDashboard"));
const VetAppointments = lazy(() => import("../components/veterinary/VetAppointments"));
const VetHistory = lazy(() => import("../components/veterinary/VetHistory"));
const VetCustomerProfiles = lazy(() => import("../components/veterinary/VetCustomerProfiles"));
const VetReports = lazy(() => import("../components/veterinary/VetReports"));
const VetReceipt = lazy(() => import("../components/veterinary/VetReceipt"));
const VetProfile = lazy(() => import("../components/veterinary/VetProfile"));
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
        <Route path="history" element={<VetHistory history={[]} />} />
        <Route path="customer-profiles" element={<VetCustomerProfiles />} />
        <Route path="reports" element={<VetReports appointments={[]} />} />
        <Route path="receipt" element={<VetReceipt receipt={{}} />} />
        <Route path="current-boarders" element={<VetCurrentBoarders />} />
        <Route path="profile" element={<VetProfile />} />
      </Route>
    </Routes>
  </Suspense>
);

export default VetRoutes;