import { apiRequest } from "./client";

export const notificationApi = {
  // Get all notifications
  getNotifications: async (unreadOnly = false) => {
    const params = unreadOnly ? "?unread=1" : "";
    return apiRequest(`/notifications${params}`);
  },

  // Get unread count only
  getUnreadCount: async () => {
    return apiRequest("/notifications/unread-count");
  },

  // Create notification (admin use)
  createNotification: async (notificationData) => {
    return apiRequest("/notifications", {
      method: "POST",
      body: JSON.stringify(notificationData),
    });
  },

  // Mark single notification as read
  markAsRead: async (id) => {
    return apiRequest(`/notifications/${id}/read`, {
      method: "POST",
    });
  },

  // Mark all as read
  markAllAsRead: async () => {
    return apiRequest("/notifications/mark-all-read", {
      method: "POST",
    });
  },

  // Clear all notifications
  clearAll: async () => {
    return apiRequest("/notifications/clear-all", {
      method: "POST",
    });
  },

  // Delete single notification
  deleteNotification: async (id) => {
    return apiRequest(`/notifications/${id}`, {
      method: "DELETE",
    });
  },
};
