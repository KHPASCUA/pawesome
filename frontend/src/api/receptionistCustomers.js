const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000/api";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("adminToken")
  );
}

async function request(endpoint, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
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
