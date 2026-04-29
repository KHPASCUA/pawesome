import React, { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheckCircle,
  faInfoCircle,
  faExclamationTriangle,
  faTimesCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { notificationApi } from "../../api/notifications";
import "./NotificationDropdown.css";

const NotificationDropdown = ({ role = "manager" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);

    try {
      const res = await notificationApi.getAll(role);

      setNotifications(res.data || []);
      setUnreadCount(res.unread_count || 0);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    await notificationApi.markAsRead(id);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await notificationApi.markAllAsRead(role);
    fetchNotifications();
  };

  const getIcon = (type) => {
    if (type === "success") return faCheckCircle;
    if (type === "warning") return faExclamationTriangle;
    if (type === "danger" || type === "error") return faTimesCircle;
    return faInfoCircle;
  };

  return (
    <div className="notification-dropdown">
      <button
        className="icon-btn notification-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FontAwesomeIcon icon={faBell} />

        {unreadCount > 0 && (
          <span className="notification-badge pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Notifications</h3>

            {unreadCount > 0 && (
              <button className="clear-all" onClick={markAllAsRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notifications-list">
            {loading ? (
              <div className="notification-empty">
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <FontAwesomeIcon icon={faBell} />
                <span>No notifications yet</span>
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  className={`notification-item ${item.type} ${
                    !item.is_read ? "unread" : ""
                  }`}
                  onClick={() => markAsRead(item.id)}
                >
                  <span className="notification-icon">
                    <FontAwesomeIcon icon={getIcon(item.type)} />
                  </span>

                  <span className="notification-content">
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                    <small className="notification-time">
                      {new Date(item.created_at).toLocaleString()}
                    </small>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;