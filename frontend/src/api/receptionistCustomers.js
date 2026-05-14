import { apiRequest } from "./client";
import { normalizeList } from "../utils/normalizeList";

async function request(endpoint, options = {}) {
  return apiRequest(endpoint, options);
}

export const receptionistCustomerApi = {
  getCustomers: () => request("/customers"),

  getCustomerBookings: (customerId) =>
    Promise.all([
      request(`/receptionist/appointment/list?customer_id=${customerId}`).catch(() => null),
      request(`/receptionist/boarding-requests?customer_id=${customerId}`).catch(() => null),
      request(`/grooming?customer_id=${customerId}`).catch(() => null),
    ]).then(([appointments, boardings, groomings]) => ({
      bookings: [
        ...normalizeList(appointments, ["appointments", "data"]).map((item) => ({
          ...item,
          booking_type: "veterinary",
        })),
        ...normalizeList(boardings, ["boardings", "data"]).map((item) => ({
          ...item,
          booking_type: "hotel",
        })),
        ...normalizeList(groomings, ["groomings", "appointments", "data"]).map((item) => ({
          ...item,
          booking_type: "grooming",
        })),
      ],
    })),

  createBooking: (payload) => {
    if (payload.booking_type === "hotel") {
      return request("/boardings", {
        method: "POST",
        body: JSON.stringify({
          customer_id: payload.customer_id,
          pet_id: payload.pet_id,
          room_type: payload.room_type,
          check_in: payload.appointment_date,
          check_out: payload.appointment_date,
          notes: payload.notes,
          status: payload.status || "pending",
        }),
      });
    }

    if (payload.booking_type === "grooming") {
      return request("/grooming", {
        method: "POST",
        body: JSON.stringify({
          customer_id: payload.customer_id,
          pet_id: payload.pet_id,
          service: payload.service,
          scheduled_at: `${payload.appointment_date}T${payload.appointment_time || "10:00"}:00`,
          special_requests: payload.notes,
          status: payload.status || "pending",
        }),
      });
    }

    return request("/receptionist/appointments", {
      method: "POST",
      body: JSON.stringify({
        customer_id: payload.customer_id,
        pet_id: payload.pet_id,
        service: payload.service,
        scheduled_at: `${payload.appointment_date}T${payload.appointment_time || "10:00"}:00`,
        notes: payload.notes,
        status: payload.status || "pending",
      }),
    });
  },

  updateBookingStatus: (bookingId, status) =>
    request(`/appointments/${bookingId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
