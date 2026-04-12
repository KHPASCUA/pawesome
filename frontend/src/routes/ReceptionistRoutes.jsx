import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import ReceptionistDashboard from "../components/receptionist/ReceptionistDashboard";
import ReceptionistChatbot from "../components/receptionist/ReceptionistChatbot";
import HotelBookings from "../components/receptionist/HotelBookings";
import VetAppointments from "../components/receptionist/VetAppointments";
import Grooming from "../components/receptionist/Grooming";
import ReceptionistBookings from "../components/receptionist/ReceptionistBookings";
import CustomerManagement from "../components/receptionist/CustomerManagement";
import CustomersProfile from "../components/receptionist/CustomersProfile";
import ReceptionistProfile from "../components/receptionist/ReceptionistProfile";
import AppointmentList from "../components/receptionist/AppointmentList";
import CheckInForm from "../components/receptionist/CheckInForm";
import CheckOutForm from "../components/receptionist/CheckOutForm";
import Reports from "../components/receptionist/Reports";

const ReceptionistRoutes = () => (
  <Routes>
    <Route
      path="/*"
      element={
        <ProtectedRoute>
          <ReceptionistDashboard />
        </ProtectedRoute>
      }
    >
      <Route index element={<AppointmentList />} />
      <Route path="appointments" element={<AppointmentList />} />
      <Route path="checkin" element={<CheckInForm />} />
      <Route path="checkout" element={<CheckOutForm />} />
      <Route path="chatbot" element={<ReceptionistChatbot />} />
      {/* Booking sub-routes */}
      <Route path="bookings" element={<ReceptionistBookings />} />
      <Route path="bookings/hotel" element={<HotelBookings />} />
      <Route path="bookings/vet" element={<VetAppointments />} />
      <Route path="bookings/grooming" element={<Grooming />} />
      <Route path="customers" element={<CustomerManagement />} />
      <Route path="customer-profile" element={<CustomersProfile />} />
      <Route path="profile" element={<ReceptionistProfile />} />
      <Route path="reports" element={<Reports />} />
    </Route>
  </Routes>
);

export default ReceptionistRoutes;