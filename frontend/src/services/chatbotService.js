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
