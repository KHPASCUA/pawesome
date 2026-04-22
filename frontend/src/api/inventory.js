import { apiRequest } from "./client";

/**
 * Builds a query string from filter parameters.
 * @param {Record<string, any>} params - Query parameters
 * @returns {string} Formatted query string
 */
const buildQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) return "";
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

/**
 * Validates an ID parameter.
 * @param {string|number} id - The ID to validate
 * @param {string} paramName - Name of the parameter for error messages
 * @throws {Error} If ID is invalid
 */
const validateId = (id, paramName = "ID") => {
  if (!id || (typeof id !== "string" && typeof id !== "number")) {
    throw new Error(`${paramName} is required and must be a string or number`);
  }
};

/**
 * Validates required data object.
 * @param {Object} data - The data to validate
 * @param {string} operation - Operation name for error messages
 * @throws {Error} If data is invalid
 */
const validateData = (data, operation = "operation") => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`Valid data object is required for ${operation}`);
  }
};

/**
 * Inventory API service for managing inventory items, stock levels, and reports.
 * @namespace inventoryApi
 */
export const inventoryApi = {
  /**
   * Retrieves a paginated list of inventory items with optional filtering.
   * @async
   * @param {Object} [params={}] - Query parameters
   * @param {number} [params.page] - Page number for pagination
   * @param {number} [params.limit] - Items per page
   * @param {string} [params.category] - Filter by category
   * @param {string} [params.status] - Filter by stock status (in_stock, low_stock, out_of_stock)
   * @param {string} [params.search] - Search query for product name or SKU
   * @param {string} [params.sortBy] - Field to sort by
   * @param {string} [params.sortOrder] - Sort order (asc, desc)
   * @returns {Promise<{data: Array, meta: Object}>} Inventory items with pagination metadata
   * @throws {Error} When the request fails
   */
  getItems: async (params = {}) => {
    try {
      const queryString = buildQueryString(params);
      return await apiRequest(`/inventory/items${queryString}`);
    } catch (error) {
      console.error("[InventoryAPI] Failed to fetch items:", error.message);
      throw error;
    }
  },

  /**
   * Retrieves a single inventory item by ID.
   * @async
   * @param {string|number} id - Inventory item ID
   * @returns {Promise<Object>} Inventory item details
   * @throws {Error} When item not found or request fails
   */
  getItem: async (id) => {
    validateId(id, "Item ID");
    try {
      return await apiRequest(`/inventory/items/${id}`);
    } catch (error) {
      console.error(`[InventoryAPI] Failed to fetch item ${id}:`, error.message);
      throw error;
    }
  },

  /**
   * Creates a new inventory item.
   * @async
   * @param {Object} data - Item data
   * @param {string} data.name - Product name
   * @param {string} data.sku - Stock keeping unit
   * @param {string} data.category - Product category
   * @param {number} data.stock_quantity - Initial stock quantity
   * @param {number} data.price - Unit price
   * @param {string} [data.brand] - Product brand
   * @param {string} [data.supplier] - Supplier name
   * @param {string} [data.expiration_date] - Expiration date (ISO format)
   * @returns {Promise<Object>} Created inventory item
   * @throws {Error} When validation fails or request fails
   */
  createItem: async (data) => {
    validateData(data, "create item");
    try {
      return await apiRequest("/inventory/items", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("[InventoryAPI] Failed to create item:", error.message);
      throw error;
    }
  },

  /**
   * Updates an existing inventory item.
   * @async
   * @param {string|number} id - Inventory item ID
   * @param {Object} data - Updated item data
   * @returns {Promise<Object>} Updated inventory item
   * @throws {Error} When item not found, validation fails, or request fails
   */
  updateItem: async (id, data) => {
    validateId(id, "Item ID");
    validateData(data, "update item");
    try {
      return await apiRequest(`/inventory/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`[InventoryAPI] Failed to update item ${id}:`, error.message);
      throw error;
    }
  },

  /**
   * Deletes an inventory item.
   * @async
   * @param {string|number} id - Inventory item ID
   * @returns {Promise<Object>} Deletion confirmation
   * @throws {Error} When item not found or request fails
   */
  deleteItem: async (id) => {
    validateId(id, "Item ID");
    try {
      return await apiRequest(`/inventory/items/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`[InventoryAPI] Failed to delete item ${id}:`, error.message);
      throw error;
    }
  },

  /**
   * Retrieves dashboard statistics for inventory overview.
   * @async
   * @returns {Promise<Object>} Dashboard data including counts, values, and alerts
   * @throws {Error} When the request fails
   */
  getDashboard: async () => {
    try {
      return await apiRequest("/inventory/dashboard");
    } catch (error) {
      console.error("[InventoryAPI] Failed to fetch dashboard:", error.message);
      throw error;
    }
  },

  /**
   * Generates inventory reports with filtering and date ranges.
   * @async
   * @param {Object} [params={}] - Report parameters
   * @param {string} [params.startDate] - Report start date (ISO format)
   * @param {string} [params.endDate] - Report end date (ISO format)
   * @param {string} [params.type] - Report type (summary, detailed, valuation)
   * @param {string} [params.category] - Filter by category
   * @returns {Promise<Object>} Generated report data
   * @throws {Error} When the request fails
   */
  getReports: async (params = {}) => {
    try {
      const queryString = buildQueryString(params);
      return await apiRequest(`/inventory/reports${queryString}`);
    } catch (error) {
      console.error("[InventoryAPI] Failed to fetch reports:", error.message);
      throw error;
    }
  },

  /**
   * Retrieves stock history for audit trails.
   * @async
   * @param {Object} [params={}] - History filter parameters
   * @param {string|number} [params.itemId] - Filter by specific item
   * @param {string} [params.startDate] - History start date
   * @param {string} [params.endDate] - History end date
   * @param {string} [params.action] - Filter by action type (adjustment, sale, restock)
   * @returns {Promise<{data: Array, meta: Object}>} Stock history records
   * @throws {Error} When the request fails
   */
  getStockHistory: async (params = {}) => {
    try {
      const queryString = buildQueryString(params);
      return await apiRequest(`/inventory/history${queryString}`);
    } catch (error) {
      console.error("[InventoryAPI] Failed to fetch stock history:", error.message);
      throw error;
    }
  },

  /**
   * Adjusts stock quantity for an item with reason tracking.
   * @async
   * @param {string|number} id - Inventory item ID
   * @param {number} quantity - Quantity to adjust (positive or negative)
   * @param {string} reason - Reason for the adjustment
   * @returns {Promise<Object>} Updated item with adjustment record
   * @throws {Error} When validation fails or request fails
   */
  adjustStock: async (id, quantity, reason) => {
    validateId(id, "Item ID");
    if (typeof quantity !== "number" || isNaN(quantity)) {
      throw new Error("Quantity must be a valid number");
    }
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      throw new Error("Reason is required for stock adjustment");
    }
    try {
      return await apiRequest(`/inventory/items/${id}/adjust`, {
        method: "POST",
        body: JSON.stringify({
          quantity,
          reason: reason.trim(),
        }),
      });
    } catch (error) {
      console.error(`[InventoryAPI] Failed to adjust stock for item ${id}:`, error.message);
      throw error;
    }
  },

  /**
   * Retrieves low stock alerts for inventory management.
   * @async
   * @returns {Promise<{data: Array, count: number}>} Items below threshold with alert count
   * @throws {Error} When the request fails
   */
  getLowStockAlerts: async () => {
    try {
      return await apiRequest("/inventory/low-stock");
    } catch (error) {
      console.error("[InventoryAPI] Failed to fetch low stock alerts:", error.message);
      throw error;
    }
  },
};

