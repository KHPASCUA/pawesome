import { apiRequest } from "./client";

export const inventoryApi = {
  // Get all inventory items
  getItems: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/inventory/items?${queryString}`);
  },

  // Get single inventory item
  getItem: async (id) => {
    return apiRequest(`/inventory/items/${id}`);
  },

  // Create new inventory item
  createItem: async (data) => {
    return apiRequest("/inventory/items", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update inventory item
  updateItem: async (id, data) => {
    return apiRequest(`/inventory/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete inventory item
  deleteItem: async (id) => {
    return apiRequest(`/inventory/items/${id}`, {
      method: "DELETE",
    });
  },

  // Get inventory dashboard data
  getDashboard: async () => {
    return apiRequest("/inventory/dashboard");
  },

  // Get inventory reports
  getReports: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/inventory/reports?${queryString}`);
  },

  // Get stock history
  getStockHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/inventory/history?${queryString}`);
  },

  // Adjust stock quantity
  adjustStock: async (id, quantity, reason) => {
    return apiRequest(`/inventory/items/${id}/adjust`, {
      method: "POST",
      body: JSON.stringify({ quantity, reason }),
    });
  },

  // Get low stock alerts
  getLowStockAlerts: async () => {
    return apiRequest("/inventory/low-stock");
  },
};
