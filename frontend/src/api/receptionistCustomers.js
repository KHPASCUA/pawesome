import { apiRequest } from "./client";

async function request(endpoint, options = {}) {
  return apiRequest(endpoint, options);
}

export const receptionistCustomerApi = {
  getCustomers: () => request("/customers"),

  getCustomerBookings: (customerId) =>
    request(`/bookings?customer_id=${customerId}`),

  createBooking: (payload) =>
    request("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateBookingStatus: (bookingId, status) =>
    request(`/bookings/${bookingId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};
