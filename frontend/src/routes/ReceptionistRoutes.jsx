import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import ReceptionistDashboard from "../components/receptionist/ReceptionistDashboard";
import ReceptionistChatbot from "../components/receptionist/ReceptionistChatbot";
import HotelBookings from "../components/receptionist/HotelBookings";
import VetAppointments from "../components/receptionist/VetAppointments";
import Grooming from "../components/receptionist/Grooming";
import CustomerManagement from "../components/receptionist/CustomerManagement";
import AppointmentList from "../components/receptionist/AppointmentList";
import CheckInForm from "../components/receptionist/CheckInForm";
import CheckOutForm from "../components/receptionist/CheckOutForm";

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
      <Route path="bookings/hotel" element={<HotelBookings />} />
      <Route path="bookings/vet" element={<VetAppointments />} />
      <Route path="bookings/grooming" element={<Grooming />} />
      <Route path="customers" element={<CustomerManagement />} />
      <Route path="customer-profile" element={<CustomerManagement />} />
      <Route path="profile" element={<AppointmentList />} />
      <Route path="reports" element={<AppointmentList />} />
    </Route>
  </Routes>
);

export default ReceptionistRoutes;