import { apiRequest } from "./client";

export const petsApi = {
  getPets: async () => {
    return apiRequest("/pets");
  },

  getPet: async (id) => {
    return apiRequest(`/pets/${id}`);
  },

  createPet: async (data) => {
    return apiRequest("/pets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updatePet: async (id, data) => {
    return apiRequest(`/pets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deletePet: async (id) => {
    return apiRequest(`/pets/${id}`, {
      method: "DELETE",
    });
  },
};
