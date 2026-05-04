import { API_URL } from "./client";

const API_BASE_URL =
  API_URL.replace(/\/$/, "");

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("authToken");
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

export const groomingApi = {
  getAppointments: () => request("/grooming"),

  createAppointment: (payload) =>
    request("/grooming", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateStatus: (id, status) =>
    request(`/grooming/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};
