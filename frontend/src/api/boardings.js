import { apiRequest } from "./client";

export const boardingApi = {
  // Get all boarding reservations
  getBoardings: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/boardings?${queryString}`);
  },

  // Get single boarding
  getBoarding: async (id) => {
    return apiRequest(`/boardings/${id}`);
  },

  // Create new reservation
  createBoarding: async (data) => {
    return apiRequest("/boardings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update reservation
  updateBoarding: async (id, data) => {
    return apiRequest(`/boardings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete reservation
  deleteBoarding: async (id) => {
    return apiRequest(`/boardings/${id}`, {
      method: "DELETE",
    });
  },

  // Get available rooms for dates
  getAvailableRooms: async (checkIn, checkOut, size, type) => {
    const params = new URLSearchParams({ check_in: checkIn, check_out: checkOut });
    if (size) params.append("size", size);
    if (type) params.append("type", type);
    return apiRequest(`/boardings/available-rooms?${params}`);
  },

  // Get current boarders
  getCurrentBoarders: async () => {
    return apiRequest("/boardings/current-boarders");
  },

  // Get today's activity
  getTodayActivity: async () => {
    return apiRequest("/boardings/today-activity");
  },

  // Confirm reservation
  confirmBoarding: async (id) => {
    return apiRequest(`/boardings/${id}/confirm`, {
      method: "POST",
    });
  },

  // Check in guest
  checkIn: async (id) => {
    return apiRequest(`/boardings/${id}/check-in`, {
      method: "POST",
    });
  },

  // Check out guest
  checkOut: async (id) => {
    return apiRequest(`/boardings/${id}/check-out`, {
      method: "POST",
    });
  },

  // Cancel reservation
  cancelBoarding: async (id) => {
    return apiRequest(`/boardings/${id}/cancel`, {
      method: "POST",
    });
  },

  // Get occupancy stats
  getOccupancyStats: async (month) => {
    return apiRequest(`/boardings/occupancy-stats?month=${month}`);
  },
};

// Hotel Room Management (Admin/Manager only)
export const hotelRoomApi = {
  // Get all rooms
  getRooms: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/hotel-rooms?${queryString}`);
  },

  // Get single room
  getRoom: async (id) => {
    return apiRequest(`/hotel-rooms/${id}`);
  },

  // Create room
  createRoom: async (data) => {
    return apiRequest("/hotel-rooms", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update room
  updateRoom: async (id, data) => {
    return apiRequest(`/hotel-rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete room
  deleteRoom: async (id) => {
    return apiRequest(`/hotel-rooms/${id}`, {
      method: "DELETE",
    });
  },

  // Set room status
  setRoomStatus: async (id, status) => {
    return apiRequest(`/hotel-rooms/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
  },
};
