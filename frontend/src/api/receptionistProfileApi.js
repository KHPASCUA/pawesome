import { apiRequest } from "./client";

async function request(endpoint, options = {}) {
  return apiRequest(endpoint, options);
}

export const receptionistProfileApi = {
  getCustomers: () => request("/receptionist/customers"),
  getPets: () => request("/receptionist/pets"),

  createCustomer: (payload) =>
    request("/receptionist/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createPet: (payload) =>
    request("/receptionist/pets", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
