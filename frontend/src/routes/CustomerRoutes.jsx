import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import CustomerDashboard from "../components/customers/CustomerDashboard";

// Core customer modules
import CustomerReports from "../components/customers/CustomerReports";
import CustomerBookings from "../components/customers/CustomerBookings";
import CustomerPets from "../components/customers/CustomerPets";
import CustomerStore from "../components/customers/CustomerStore";
import CustomerChatbot from "../components/customers/CustomerChatbot";
import CustomerUserInfo from "../components/customers/CustomerUserInfo";
import CustomerProfile from "../components/customers/CustomerProfile";
import CustomerPayments from "../components/customers/CustomerPayments";

const CustomerRoutes = () => (
  <Routes>
    <Route
      path="/*"
      element={
        <ProtectedRoute>
          <CustomerDashboard />
        </ProtectedRoute>
      }
    >
      {/* Default index route → dashboard overview */}
      <Route index element={<CustomerReports />} />

      {/* Core customer routes */}
      <Route path="bookings" element={<CustomerBookings />} />
      <Route path="pets" element={<CustomerPets />} />
      <Route path="store" element={<CustomerStore />} />
      <Route path="chatbot" element={<CustomerChatbot />} />
      <Route path="userinfo" element={<CustomerUserInfo />} />
      <Route path="profile" element={<CustomerProfile />} />

      {/* Nested under reports */}
      <Route path="reports" element={<CustomerReports />}>
        <Route path="payments" element={<CustomerPayments />} />
      </Route>
    </Route>
  </Routes>
);

export default CustomerRoutes;