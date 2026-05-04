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
   * Retrieves inventory items via PUBLIC endpoint (available to all authenticated users)
   * Used by Customer Store and Cashier POS for read-only access
   * @async
   * @param {Object} [params={}] - Query parameters
   * @param {string} [params.category] - Filter by category
   * @param {string} [params.search] - Search query
   * @param {boolean} [params.in_stock_only] - Only return in-stock items
   * @returns {Promise<{items: Array, count: number, timestamp: string}>} Public inventory items
   * @throws {Error} When the request fails
   */
  getPublicItems: async (params = {}) => {
    try {
      const queryString = buildQueryString(params);
      return await apiRequest(`/inventory/public/items${queryString}`);
    } catch (error) {
      console.error("[InventoryAPI] Failed to fetch public items:", error.message);
      throw error;
    }
  },

  /**
   * Retrieves sellable products for POS and Customer Store
   * Only returns items that are sellable and have stock > 0
   * @async
   * @returns {Promise<{success: boolean, products: Array, count: number}>} Sellable products
   * @throws {Error} When the request fails
   */
  getSellable: async () => {
    try {
      return await apiRequest("/inventory/sellable");
    } catch (error) {
      console.error("[InventoryAPI] Failed to fetch sellable items:", error.message);
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
   * @param {number} data.stock - Initial stock quantity (or use 'quantity' for frontend compatibility)
   * @param {number} data.price - Unit price
   * @param {string} [data.brand] - Product brand
   * @param {string} [data.supplier] - Supplier name
   * @param {string} [data.expiration_date] - Expiration date (ISO format)
   * @param {boolean} [data.add_stock] - Optional, for API consistency with update method
   * @returns {Promise<Object>} Created inventory item with stock_action info
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
   * @param {number} [data.stock] - New stock value (replaces by default)
   * @param {number} [data.quantity] - Alternative to stock field
   * @param {boolean} [data.add_stock] - If true, ADDS to existing stock (50 + 25 = 75).
   *                                     Only replaces automatically if item HAS expiry date AND is expired.
   *                                     Items without expiry always add when this flag is true.
   * @returns {Promise<Object>} Updated inventory item with stock_action info
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
   * Adds stock to an existing item (50 + 25 = 75).
   * Only replaces if item HAS expiry date AND is expired.
   * Items without expiry dates always add stock.
   * @async
   * @param {string|number} id - Inventory item ID
   * @param {number} quantity - Amount to add
   * @param {string} [reason] - Reason for adding stock
   * @returns {Promise<Object>} Updated inventory item
   * @throws {Error} When item not found or request fails
   */
  addStock: async (id, quantity, reason = "Stock restock") => {
    validateId(id, "Item ID");
    if (typeof quantity !== "number" || quantity <= 0) {
      throw new Error("Quantity must be a positive number");
    }
    try {
      return await apiRequest(`/inventory/items/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          stock: quantity,
          add_stock: true, // This tells backend to ADD, not replace
          reason: reason,
        }),
      });
    } catch (error) {
      console.error(`[InventoryAPI] Failed to add stock for item ${id}:`, error.message);
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
   * @param {string} type - Adjustment type: "add", "remove", or "set"
   * @param {number} quantity - Quantity value (adjustment amount for add/remove, final value for set)
   * @param {string} reason - Reason for the adjustment
   * @returns {Promise<Object>} Updated item with adjustment record
   * @throws {Error} When validation fails or request fails
   */
  adjustStock: async (id, type, quantity, reason = "Manual stock adjustment") => {
    validateId(id, "Item ID");

    if (!["add", "remove", "set"].includes(type)) {
      throw new Error("Type must be 'add', 'remove', or 'set'");
    }

    if (typeof quantity !== "number" || isNaN(quantity) || quantity < 0) {
      throw new Error("Quantity must be a valid positive number");
    }

    try {
      return await apiRequest(`/inventory/${id}/stock`, {
        method: "POST",
        body: JSON.stringify({
          type,
          quantity: Number(quantity),
          reason,
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

  /**
   * Creates a reorder request for low stock items.
   * @async
   * @param {Object} payload - Reorder request data
   * @param {string|number} payload.item_id - Inventory item ID
   * @param {string} payload.item_name - Product name
   * @param {string} payload.sku - Product SKU
   * @param {number} payload.suggested_quantity - Suggested reorder quantity
   * @param {number} payload.current_stock - Current stock level
   * @param {number} payload.reorder_level - Reorder threshold
   * @param {string} payload.priority - Priority level (critical, high, low)
   * @param {string} payload.status - Request status
   * @returns {Promise<Object>} Created reorder request confirmation
   * @throws {Error} When validation fails or request fails
   */
  createReorderRequest: async (payload) => {
    try {
      return await apiRequest("/inventory/reorder-requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("[InventoryAPI] Failed to create reorder request:", error.message);
      throw error;
    }
  },

  /**
   * Creates a notification for inventory alerts (low stock, out of stock).
   * @async
   * @param {Object} payload - Notification data
   * @param {string} payload.title - Notification title
   * @param {string} payload.message - Notification message
   * @param {string} payload.type - Notification type (danger, warning, info)
   * @param {string} payload.module - Source module (inventory)
   * @param {string|number} payload.item_id - Related inventory item ID
   * @param {string} [payload.priority] - Priority level (high, medium, low)
   * @returns {Promise<Object>} Created notification
   * @throws {Error} When notification creation fails
   */
  createInventoryNotification: async (payload) => {
    try {
      return await apiRequest("/notifications", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("[InventoryAPI] Failed to create notification:", error.message);
      throw error;
    }
  },

  // ==========================================
  // BATCH MANAGEMENT API
  // ==========================================

  /**
   * Get all batches for an inventory item.
   * @async
   * @param {string|number} itemId - Inventory item ID
   * @returns {Promise<Object>} Item batches with expiration info
   * @throws {Error} When request fails
   */
  getItemBatches: async (itemId) => {
    validateId(itemId, "Item ID");
    try {
      return await apiRequest(`/inventory/items/${itemId}/batches`);
    } catch (error) {
      console.error(`[InventoryAPI] Failed to get batches for item ${itemId}:`, error.message);
      throw error;
    }
  },

  /**
   * Add a new batch to an inventory item.
   * @async
   * @param {string|number} itemId - Inventory item ID
   * @param {Object} batchData - Batch data
   * @param {string} batchData.batch_no - Batch number
   * @param {string} batchData.received_date - Received date (YYYY-MM-DD)
   * @param {string} [batchData.expiration_date] - Expiration date (YYYY-MM-DD)
   * @param {number} batchData.quantity - Batch quantity
   * @param {string} [batchData.notes] - Batch notes
   * @returns {Promise<Object>} Created batch
   * @throws {Error} When validation fails or request fails
   */
  addBatch: async (itemId, batchData) => {
    validateId(itemId, "Item ID");
    validateData(batchData, "add batch");
    try {
      return await apiRequest(`/inventory/items/${itemId}/batches`, {
        method: "POST",
        body: JSON.stringify(batchData),
      });
    } catch (error) {
      console.error(`[InventoryAPI] Failed to add batch for item ${itemId}:`, error.message);
      throw error;
    }
  },

  /**
   * Dispose of an expired or damaged batch.
   * @async
   * @param {string|number} batchId - Batch ID
   * @param {string} [reason] - Disposal reason
   * @returns {Promise<Object>} Disposal confirmation
   * @throws {Error} When request fails
   */
  disposeBatch: async (batchId, reason = "Expired") => {
    validateId(batchId, "Batch ID");
    try {
      return await apiRequest(`/inventory/batches/${batchId}/dispose`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
    } catch (error) {
      console.error(`[InventoryAPI] Failed to dispose batch ${batchId}:`, error.message);
      throw error;
    }
  },

  /**
   * Adjust batch stock quantity.
   * @async
   * @param {string|number} batchId - Batch ID
   * @param {number} newQuantity - New quantity value
   * @param {string} [reason] - Adjustment reason
   * @returns {Promise<Object>} Updated batch
   * @throws {Error} When request fails
   */
  adjustBatchStock: async (batchId, newQuantity, reason = "Manual adjustment") => {
    validateId(batchId, "Batch ID");
    try {
      return await apiRequest(`/inventory/batches/${batchId}/adjust`, {
        method: "POST",
        body: JSON.stringify({ quantity: newQuantity, reason }),
      });
    } catch (error) {
      console.error(`[InventoryAPI] Failed to adjust batch ${batchId}:`, error.message);
      throw error;
    }
  },
};

