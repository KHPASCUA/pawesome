import { apiRequest } from "./client";

async function request(endpoint, options = {}) {
  return apiRequest(endpoint, options);
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
