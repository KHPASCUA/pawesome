const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");
  
  console.log(`API Request: ${API_URL}${path}`);
  console.log('Request options:', options);
  
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    let data = null;
    const text = await response.text();
    console.log('Response text:', text);
    
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
  } catch (error) {
    console.error('Network error:', error);
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to server. Please check if the backend server is running.');
    }
    throw error;
  }
}
