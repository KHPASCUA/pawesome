import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { notificationApi } from '../../api/notifications';

const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationApi.getUnread();
      setNotifications(data.notifications || []);
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 10 seconds (real-time feel)
    const interval = setInterval(fetchNotifications, 10000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now - notifDate;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    // Navigate to inventory page if inventory-related notification
                    if (notification.related_type === 'inventory' && notification.related_id) {
                      window.location.href = `/inventory/items/${notification.related_id}`;
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <NotificationIcon type={notification.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm">
                        {notification.title}
                      </p>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-100 text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
