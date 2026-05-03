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
import ProfileSettings from "../components/shared/ProfileSettings";
import CustomerPayments from "../components/customers/CustomerPayments";
import HotelForm from "../components/customers/HotelForm";
import GroomingForm from "../components/customers/GroomingForm";
import VetForm from "../components/customers/VetForm";
import CustomerBookingForm from "../components/customers/CustomerBookingForm";
import CustomerRequestStatus from "../components/customers/CustomerRequestStatus";

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
      <Route path="booking" element={<CustomerBookingForm />} />
      <Route path="requests" element={<CustomerRequestStatus />} />
      <Route path="pets" element={<CustomerPets />} />
      <Route path="hotel" element={<HotelForm />} />
      <Route path="grooming" element={<GroomingForm />} />
      <Route path="vet" element={<VetForm />} />
      <Route path="store" element={<CustomerStore />} />
      <Route path="chatbot" element={<CustomerChatbot />} />
      <Route path="userinfo" element={<CustomerUserInfo />} />
      <Route path="profile" element={<ProfileSettings />} />
      <Route path="history" element={<CustomerReports />} />

      {/* Nested under reports */}
      <Route path="reports" element={<CustomerReports />}>
        <Route path="payments" element={<CustomerPayments />} />
      </Route>
    </Route>
  </Routes>
);

export default CustomerRoutes;
