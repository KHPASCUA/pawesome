import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faSearch,
  faFilter,
  faUser,
  faComments,
  faClock,
  faEye,
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faCalendarAlt,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import "./ChatbotLogs.css";

const ChatbotLogs = () => {
  const [chatLogs, setChatLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUser, setFilterUser] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [userChats, setUserChats] = useState([]);
  const [showChatModal, setShowChatModal] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);

  // Fetch chat logs summary from database
  const fetchChatLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/admin/chatbot/logs");
      // Ensure data is an array
      setChatLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch chat logs");
      console.error("Fetch chat logs error:", err);
      setChatLogs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatLogs();
  }, []);

  // Show success message
  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  // Show error message
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 5000);
  };

  // Fetch specific user chat history
  const fetchUserChats = async (userId) => {
    try {
      setLoadingChats(true);
      setError("");
      const data = await apiRequest(`/admin/chatbot/logs/user/${userId}`);
      // Ensure data is an array
      setUserChats(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch user chat history");
      console.error("Fetch user chats error:", err);
      setUserChats([]); // Set empty array on error
    } finally {
      setLoadingChats(false);
    }
  };

  // Open user chat modal
  const openUserChats = (user) => {
    setSelectedUser(user);
    setShowChatModal(true);
    fetchUserChats(user.id);
  };

  // Close chat modal
  const closeChatModal = () => {
    setShowChatModal(false);
    setSelectedUser(null);
    setUserChats([]);
  };

  // Filter chat logs
  const filteredChatLogs = Array.isArray(chatLogs) ? chatLogs.filter((log) => {
    const matchesSearch = 
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = filterUser === "all" || log.user_id?.toString() === filterUser;
    const matchesDate = filterDate === "all" || 
      (filterDate === "today" && new Date(log.last_chat_date).toDateString() === new Date().toDateString()) ||
      (filterDate === "week" && (Date.now() - new Date(log.last_chat_date).getTime()) < 7 * 24 * 60 * 60 * 1000) ||
      (filterDate === "month" && (Date.now() - new Date(log.last_chat_date).getTime()) < 30 * 24 * 60 * 60 * 1000);
    
    return matchesSearch && matchesUser && matchesDate;
  }) : [];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString();
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "danger",
      manager: "warning",
      receptionist: "info",
      veterinary: "success",
      cashier: "primary",
      inventory: "secondary",
      payroll: "dark",
      customer: "light",
    };
    return colors[role] || "secondary";
  };

  return (
    <div className="chatbot-logs">
      <div className="section-header">
        <div className="header-left">
          <h2>
            <FontAwesomeIcon icon={faRobot} /> Chatbot Logs
          </h2>
          <p>View and manage user chatbot interactions across all accounts</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="success-message">
          <FontAwesomeIcon icon={faCheckCircle} /> {success}
        </div>
      )}
      {error && (
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
        </div>
      )}

      {/* Filters */}
      <div className="chatlogs-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <FontAwesomeIcon icon={faFilter} />
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="all">All Users</option>
              {Array.isArray(chatLogs) && chatLogs.map((log) => (
                <option key={log.user_id} value={log.user_id}>
                  {log.user_name} ({log.user_username})
                </option>
              ))}
            </select>
          </div>
          <div className="filter-dropdown">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chat Logs Table */}
      <div className="chatlogs-table-container">
        {loading ? (
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin /> Loading chat logs...
          </div>
        ) : filteredChatLogs.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faComments} size="3x" />
            <h3>No chat logs found</h3>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <table className="chatlogs-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>User Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Total Chats</th>
                <th>Last Chat Date</th>
                <th>Last Chat Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChatLogs.map((log) => (
                <tr key={log.user_id} className="chatlog-row">
                  <td className="user-id">#{log.user_id}</td>
                  <td className="user-name">
                    <div className="user-info">
                      <FontAwesomeIcon icon={faUser} className="user-icon" />
                      <strong>{log.user_name}</strong>
                    </div>
                  </td>
                  <td className="user-username">{log.user_username || "N/A"}</td>
                  <td className="user-email">{log.user_email}</td>
                  <td className="user-role">
                    <span className={`role-badge ${getRoleBadgeColor(log.user_role)}`}>
                      {log.user_role}
                    </span>
                  </td>
                  <td className="total-chats">
                    <div className="chat-count">
                      <FontAwesomeIcon icon={faMessage} />
                      <span>{log.total_chats || 0}</span>
                    </div>
                  </td>
                  <td className="last-chat-date">{formatDate(log.last_chat_date)}</td>
                  <td className="last-chat-time">{formatTime(log.last_chat_date)}</td>
                  <td className="chat-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => openUserChats(log)}
                      title="View Chat History"
                      disabled={log.total_chats === 0}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Chat History Modal */}
      {showChatModal && selectedUser && (
        <div className="modal-overlay" onClick={closeChatModal}>
          <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FontAwesomeIcon icon={faComments} /> Chat History: {selectedUser.user_name}
              </h3>
              <button className="close-btn" onClick={closeChatModal}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>

            <div className="modal-body">
              <div className="user-info-summary">
                <div className="info-item">
                  <FontAwesomeIcon icon={faUser} />
                  <span><strong>{selectedUser.user_name}</strong> ({selectedUser.user_username})</span>
                </div>
                <div className="info-item">
                  <FontAwesomeIcon icon={faMessage} />
                  <span>Total Chats: {selectedUser.total_chats || 0}</span>
                </div>
                <div className="info-item">
                  <FontAwesomeIcon icon={faClock} />
                  <span>Last Chat: {formatDate(selectedUser.last_chat_date)} at {formatTime(selectedUser.last_chat_date)}</span>
                </div>
              </div>

              <div className="chat-history-container">
                {loadingChats ? (
                  <div className="loading-container">
                    <FontAwesomeIcon icon={faSpinner} spin /> Loading chat history...
                  </div>
                ) : userChats.length === 0 ? (
                  <div className="empty-state">
                    <FontAwesomeIcon icon={faComments} size="2x" />
                    <h4>No chat history found</h4>
                    <p>This user hasn't had any conversations yet.</p>
                  </div>
                ) : (
                  <div className="chat-messages">
                    {userChats.map((chat, index) => (
                      <div key={chat.id || index} className="chat-message">
                        <div className="message-header">
                          <span className="message-time">
                            <FontAwesomeIcon icon={faClock} />
                            {formatDate(chat.created_at)} at {formatTime(chat.created_at)}
                          </span>
                        </div>
                        <div className="message-content">
                          <div className="user-message">
                            <strong>User:</strong> {chat.user_message}
                          </div>
                          <div className="bot-message">
                            <strong>Bot:</strong> {chat.bot_response}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button className="close-modal-btn" onClick={closeChatModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotLogs;
