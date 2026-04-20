import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

const ReceptionistDashboard = lazy(() => import("../components/receptionist/ReceptionistDashboard"));
const ReceptionistChatbot = lazy(() => import("../components/receptionist/ReceptionistChatbot"));
const HotelBookings = lazy(() => import("../components/receptionist/HotelBookings"));
const VetAppointments = lazy(() => import("../components/receptionist/VetAppointments"));
const Grooming = lazy(() => import("../components/receptionist/Grooming"));
const ReceptionistBookings = lazy(() => import("../components/receptionist/ReceptionistBookings"));
const CustomerManagement = lazy(() => import("../components/receptionist/CustomerManagement"));
const CustomersProfile = lazy(() => import("../components/receptionist/CustomersProfile"));
const ReceptionistProfile = lazy(() => import("../components/receptionist/ReceptionistProfile"));
const AppointmentList = lazy(() => import("../components/receptionist/AppointmentList"));
const CheckInForm = lazy(() => import("../components/receptionist/CheckInForm"));
const CheckOutForm = lazy(() => import("../components/receptionist/CheckOutForm"));
const Reports = lazy(() => import("../components/receptionist/Reports"));

const RouteLoading = () => (
  <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
);

const ReceptionistRoutes = () => (
  <Suspense fallback={<RouteLoading />}>
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
  </Suspense>
);

export default ReceptionistRoutes;