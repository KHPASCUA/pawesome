const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000/api";

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
