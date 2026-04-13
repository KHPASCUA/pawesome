import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import VetDashboard from "../components/veterinary/VetDashboard";
import VetAppointments from "../components/veterinary/VetAppointments";
import VetHistory from "../components/veterinary/VetHistory";
import VetCustomerProfiles from "../components/veterinary/VetCustomerProfiles";
import VetReports from "../components/veterinary/VetReports";
import VetReceipt from "../components/veterinary/VetReceipt";
import VetProfile from "../components/veterinary/VetProfile";

const VetRoutes = () => (
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
      <Route path="profile" element={<VetProfile />} />
    </Route>
  </Routes>
);

export default VetRoutes;