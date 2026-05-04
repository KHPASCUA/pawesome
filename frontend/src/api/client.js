export const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === "true" || localStorage.getItem("use_mock_data") === "true";

// Mock data for testing
const MOCK_DATA = {
  "/cashier/dashboard": {
    today_sales: 15000,
    today_transactions: 45,
    pending_payments: 3,
    sales_by_type: [
      { type: "cash", total: 8000, count: 30 },
      { type: "card", total: 5000, count: 12 },
      { type: "gcash", total: 2000, count: 3 },
    ],
    low_stock_items: [
      { id: 1, name: "Dog Food Premium", sku: "DOG001", stock: 5, threshold: 10 },
      { id: 2, name: "Cat Treats", sku: "CAT002", stock: 3, threshold: 10 },
    ],
    top_selling_products: [
      { id: 1, name: "Dog Food Premium", units_sold: 25, revenue: 5000 },
      { id: 2, name: "Cat Food Standard", units_sold: 20, revenue: 4000 },
    ],
    pending_orders: [
      { id: "ORD001", customer: "John Doe", total: 500, waiting_time: "5 min" },
      { id: "ORD002", customer: "Jane Smith", total: 750, waiting_time: "10 min" },
    ],
  },
  "/products/search": [
    { id: 1, name: "Dog Food Premium", sku: "DOG001", price: 200, stock: 50 },
    { id: 2, name: "Cat Food Standard", sku: "CAT001", price: 150, stock: 30 },
    { id: 3, name: "Pet Shampoo", sku: "PET001", price: 100, stock: 20 },
  ],
  "/products/barcode/123456": {
    product: { id: 1, name: "Dog Food Premium", sku: "DOG001", price: 200, stock: 50 },
  },
  "/customers/search": [
    { id: 1, name: "John Doe", phone: "09123456789", email: "john@email.com", pets_count: 2, loyalty_points: 500 },
    { id: 2, name: "Jane Smith", phone: "09876543210", email: "jane@email.com", pets_count: 1, loyalty_points: 300 },
  ],
  "/customers/1/purchases": {
    transactions: [
      { id: "TRX001", date: "2024-01-15", amount: 500 },
      { id: "TRX002", date: "2024-01-10", amount: 750 },
    ],
  },
  "/cashier/transactions/search": [
    { id: "TRX001", customer: "John Doe", payment_type: "cash", amount: 500, date: "2024-01-15" },
    { id: "TRX002", customer: "Jane Smith", payment_type: "card", amount: 750, date: "2024-01-16" },
  ],
  "/gift-cards/GC123/balance": { balance: 500 },
};

export async function apiRequest(path, options = {}, customBaseUrl = null) {
  const token = localStorage.getItem("token");
  const baseUrl = customBaseUrl || API_URL;

  // Mock mode for testing without backend
  if (USE_MOCK_DATA) {
    console.log(`[MOCK MODE] API Request: ${path}`);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network delay

    // Handle POST requests with mock responses
    if (options.method === "POST") {
      if (path === "/cashier/refund") {
        return { success: true, refund_id: "REF001" };
      }
      if (path === "/cashier/multi-payment") {
        return { success: true, transaction_id: "TRX001" };
      }
      if (path === "/cashier/apply-discount") {
        return { success: true, discount_amount: 30, new_total: 270 };
      }
      if (path === "/cashier/handover") {
        return { success: true };
      }
      if (path === "/cashier/void") {
        return { success: true };
      }
      if (path === "/customers") {
        return { id: 3, name: "New Customer" };
      }
    }

    // Handle GET requests with mock data
    for (const mockPath in MOCK_DATA) {
      if (path.startsWith(mockPath)) {
        console.log(`[MOCK MODE] Returning mock data for: ${path}`);
        return MOCK_DATA[mockPath];
      }
    }

    // Default mock response
    console.log(`[MOCK MODE] No mock data for: ${path}, returning empty response`);
    return {};
  }

  // Real API mode
  console.log(`API Request: ${baseUrl}${path}`);
  console.log("Request options:", options);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    let data = null;
    const text = await response.text();
    console.log("Response text:", text);

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = text;
      }
    }

    if (!response.ok) {
      let message = data?.message;

      // Handle errors in various formats
      if (!message && data?.errors) {
        if (Array.isArray(data.errors)) {
          // Format: { errors: ["msg1", "msg2"] }
          message = data.errors.join(", ");
        } else if (typeof data.errors === "object") {
          // Format: { errors: { field: ["msg1"], field2: ["msg2"] } }
          message = Object.values(data.errors)
            .flat()
            .join(", ");
        }
      }

      throw new Error(message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Network error:", error);
    if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
      throw new Error(
        "Network error: Unable to connect to server. Please check if the backend server is running."
      );
    }
    throw error;
  }
}

export async function uploadProfilePhoto(file) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("photo", file);

  const response = await fetch(`${API_URL}/auth/profile-photo`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to upload profile photo");
  }

  return response.json();
}

export { USE_MOCK_DATA };
