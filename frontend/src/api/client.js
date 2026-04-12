const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      (data && data.message) ||
      (data && data.errors && Object.values(data.errors).flat().join(", ")) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}
