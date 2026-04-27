import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCheck, faTimes, faCircle, faCheckCircle, faExclamationTriangle, faExclamationCircle, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { notificationApi } from "../../api/notifications";
import "./NotificationDropdown.css";

const NotificationIcon = ({ type }) => {
  switch (type) {
    case "success":
      return <FontAwesomeIcon icon={faCheckCircle} className="notif-icon success" />;
    case "warning":
      return <FontAwesomeIcon icon={faExclamationTriangle} className="notif-icon warning" />;
    case "error":
      return <FontAwesomeIcon icon={faExclamationCircle} className="notif-icon error" />;
    default:
      return <FontAwesomeIcon icon={faInfoCircle} className="notif-icon info" />;
  }
};

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
        className="notification-bell-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <FontAwesomeIcon icon={faBell} size="lg" />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <div>
              <h3>Notifications</h3>
              <p>{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="mark-all-btn"
              >
                <FontAwesomeIcon icon={faCheck} size="sm" />
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading && notifications.length === 0 ? (
              <div className="notification-empty">
                <div className="notification-empty-icon">
                  <FontAwesomeIcon icon={faBell} size="2x" />
                </div>
                <h4>Loading...</h4>
              </div>
            ) : error ? (
              <div className="notification-empty">
                <div className="notification-empty-icon">
                  <FontAwesomeIcon icon={faBell} size="2x" />
                </div>
                <h4>Error</h4>
                <p>{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <div className="notification-empty-icon">
                  <FontAwesomeIcon icon={faBell} size="2x" />
                </div>
                <h4>No new notifications</h4>
                <p>You are updated for now.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  className={`notification-item ${!notification.read ? "unread" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-item-icon">
                    <NotificationIcon type={notification.type} />
                  </div>

                  <div className="notification-item-content">
                    <strong>{notification.title}</strong>
                    <span>{notification.message}</span>
                    <small>{getDisplayTime(notification)}</small>
                  </div>

                  {!notification.read && <i className="unread-dot" />}
                </button>
              ))
            )}
          </div>

          <div className="notification-footer">
            <button type="button" onClick={() => setIsOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;