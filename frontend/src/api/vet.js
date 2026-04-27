import { apiRequest } from "./client";

export const vetApi = {
  getAppointments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/customer/vet?${queryString}`);
  },

  getAppointment: async (id) => {
    return apiRequest(`/customer/vet/${id}`);
  },

  createAppointment: async (data) => {
    return apiRequest("/customer/vet", {
      method: "POST",
      body: JSON.stringify({
        petId: data.petId,
        petName: data.petName,
        service: data.service,
        date: data.date,
        concern: data.concern,
      }),
    });
  },

  updateStatus: async (id, status) => {
    return apiRequest(`/vet/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  deleteAppointment: async (id) => {
    return apiRequest(`/vet/${id}`, {
      method: "DELETE",
    });
  },
};
