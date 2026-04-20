import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCheck, faTimes, faCircle } from "@fortawesome/free-solid-svg-icons";
import { notificationApi } from "../../api/notifications";
import "./NotificationDropdown.css";

const NotificationDropdown = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const initialFetchDone = useRef(false);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationApi.getNotifications();
      if (response.notifications) {
        setNotifications(response.notifications);
        setUnreadCount(response.unread_count || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchNotifications();
      initialFetchDone.current = true;
    }

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await notificationApi.markAsRead(notification.id);
        // Update local state
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationApi.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case "success": return "#22c55e";
      case "warning": return "#f59e0b";
      case "error": return "#ef4444";
      default: return "#3b82f6";
    }
  };

  const getDisplayTime = (notification) => {
    if (notification.time) return notification.time;
    if (!notification.created_at) return "Just now";

    const createdAt = new Date(notification.created_at).getTime();
    const diff = Date.now() - createdAt;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`notification-container ${className}`} ref={dropdownRef}>
      <button 
        className="icon-btn notification-btn" 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <FontAwesomeIcon icon={faBell} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read"
                  onClick={handleMarkAllAsRead}
                  title="Mark all as read"
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
              )}
              <button 
                className="close-dropdown"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>

          <div className="notification-list">
            {loading && notifications.length === 0 ? (
              <div className="notification-empty">
                <p>Loading...</p>
              </div>
            ) : error ? (
              <div className="notification-empty">
                <FontAwesomeIcon icon={faBell} className="empty-icon" />
                <p>{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <FontAwesomeIcon icon={faBell} className="empty-icon" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? "unread" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div 
                    className="notification-dot"
                    style={{ color: getIconColor(notification.type) }}
                  >
                    <FontAwesomeIcon icon={faCircle} />
                  </div>
                  <div className="notification-content">
                    <h4 className="notification-title">{notification.title}</h4>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{getDisplayTime(notification)}</span>
                  </div>
                  {!notification.read && <div className="unread-indicator" />}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button className="clear-all-btn" onClick={handleClearAll}>
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
