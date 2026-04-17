import { apiRequest } from "../api/client";

export async function fetchChatbotWelcome() {
  return apiRequest("/chatbot/welcome");
}

export async function sendChatbotMessage(message, options = {}) {
  return apiRequest("/chatbot/message", {
    method: "POST",
    body: JSON.stringify({
      message,
      channel: options.channel || "web",
    }),
  });
}

export async function fetchBookingOptions() {
  return apiRequest("/chatbot/workflow/booking-options");
}

export async function createChatbotBooking(payload) {
  return apiRequest("/chatbot/workflow/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function lookupChatbotAppointments(query) {
  return apiRequest("/chatbot/workflow/appointments/lookup", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export async function searchChatbotInventory(query) {
  return apiRequest("/chatbot/workflow/inventory/search", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

// Hotel Booking Workflow APIs
export async function fetchHotelOptions() {
  return apiRequest("/chatbot/workflow/hotel-options");
}

export async function checkHotelAvailability(checkIn, checkOut, roomType = null) {
  const params = new URLSearchParams({ check_in: checkIn, check_out: checkOut });
  if (roomType) params.append("room_type", roomType);
  return apiRequest(`/chatbot/workflow/hotel/availability?${params.toString()}`);
}

export async function createChatbotHotelBooking(payload) {
  return apiRequest("/chatbot/workflow/hotel-bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
