export const API_URL = "http://localhost:8000";

export const USE_MOCK_DATA = false;

const AUTH_TOKEN_KEYS = ["token", "access_token", "authToken", "customerToken", "adminToken", "clientToken"];

const getToken = () => {
  return AUTH_TOKEN_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
};

export const clearAuthStorage = () => {
  AUTH_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  ["role", "name", "username", "email", "user", "adminUser"].forEach((key) =>
    localStorage.removeItem(key)
  );
};

const normalizeEndpoint = (endpoint) => {
  console.log("API_URL:", API_URL);
  console.log("Endpoint:", endpoint);
  
  if (!endpoint) return API_URL;

  if (endpoint.startsWith("http")) {
    return endpoint;
  }

  const fullUrl = `${API_URL}/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  console.log("Full URL:", fullUrl);
  
  return fullUrl;
};

const parseResponseText = (text) => {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { message: text };
  }
};

/**
 * Supports both:
 * apiRequest("/auth/login", "POST", payload)
 * apiRequest("/auth/login", { method: "POST", body: JSON.stringify(payload) })
 */
export const apiRequest = async (endpoint, methodOrOptions = "GET", data = null, extraOptions = {}) => {
  const token = getToken();
  const url = normalizeEndpoint(endpoint);

  let method = "GET";
  let body = null;
  let customHeaders = {};
  let options = {};

  if (typeof methodOrOptions === "string") {
    method = methodOrOptions.toUpperCase();
    body = data;
    options = extraOptions || {};
    customHeaders = options.headers || {};
  } else if (typeof methodOrOptions === "object" && methodOrOptions !== null) {
    method = (methodOrOptions.method || "GET").toUpperCase();
    body = methodOrOptions.body || data;
    options = methodOrOptions;
    customHeaders = methodOrOptions.headers || {};
  }

  const isFormData = body instanceof FormData;

  const headers = {
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  const config = {
    ...options,
    method,
    headers,
  };

  if (body !== null && body !== undefined) {
    config.body = isFormData || typeof body === "string" ? body : JSON.stringify(body);
  }

  delete config.params;

  try {
    // Debug Authorization header for all requests
    console.log("API REQUEST DEBUG:", {
      url: url,
      method: config.method,
      hasAuthHeader: !!config.headers.Authorization,
      authHeader: config.headers.Authorization ? "Bearer [token]" : "missing",
      tokenFromStorage: localStorage.getItem("token") ? "exists" : "missing"
    });

    const response = await fetch(url, config);
    const text = await response.text();
    const result = parseResponseText(text);

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);
    console.log("Response text:", text);

    if (response.status === 401) {
      throw new Error("Your session expired or you are not logged in. Please log in again.");
    }

    if (response.status === 403) {
      throw new Error("You are not allowed to access this page.");
    }

    if (!response.ok) {
      const message =
        result?.message ||
        result?.error ||
        Object.values(result?.errors || {}).flat().join(" ") ||
        "Request failed.";

      throw new Error(message);
    }

    return result;
  } catch (error) {
    console.error("Network/API error:", error);
    throw error;
  }
};

export const uploadProfilePhoto = async (endpoint, formData) => {
  return apiRequest(endpoint, "POST", formData);
};
