import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory,
  faSearch,
  faFilter,
  faUser,
  faClock,
  faEdit,
  faMoneyBillWave,
  faReceipt,
  faCalendarAlt,
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faEye,
  faDownload,
  faRefresh,
  faShoppingCart,
  faPaw,
  faStethoscope,
  faFileMedical,
  faUserMd,
  faClipboardList,
  faPrescription,
  faVial,
  faSyringe,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import "./History.css";

const History = () => {
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [filterAccount, setFilterAccount] = useState("all");

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch history logs from multiple sources
  const fetchHistoryLogs = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch from multiple endpoints to build history
      const [activityLogs, loginLogs, chatbotLogs, inventoryLogs, salesData, appointmentsData] = await Promise.allSettled([
        apiRequest("/admin/activity-logs").catch(() => []),
        apiRequest("/admin/login-logs").catch(() => []),
        apiRequest("/admin/chatbot/logs").catch(() => []),
        apiRequest("/inventory/logs").catch(() => []),
        apiRequest("/cashier/transactions").catch(() => []),
        apiRequest("/admin/appointments").catch(() => [])
      ]);
      
      const historyEntries = [];
      let idCounter = 1;
      
      // Process activity logs (from seeded data)
      if (activityLogs.status === 'fulfilled') {
        const activities = activityLogs.value?.data || activityLogs.value || [];
        activities.forEach(log => {
          historyEntries.push({
            id: idCounter++,
            category: log.category || "general",
            subcategory: log.subcategory || "activity",
            user_name: log.user?.name || log.user_name || "System",
            user_role: log.user?.role || log.user_role || "admin",
            action: log.action || "Activity performed",
            description: log.description || "System activity",
            reference_id: log.reference_id || `ACT-${log.id}`,
            status: "completed",
            created_at: log.created_at,
            metadata: log.metadata || {}
          });
        });
      }
      
      // Process login logs (from seeded data)
      if (loginLogs.status === 'fulfilled') {
        const logs = loginLogs.value?.data || loginLogs.value || [];
        logs.forEach(log => {
          historyEntries.push({
            id: idCounter++,
            category: "login",
            subcategory: log.action === 'logout' ? "logout" : "login",
            user_name: log.user?.name || log.email || "Unknown",
            user_role: log.user?.role || "unknown",
            action: log.action === 'logout' ? "Logged out" : "Logged in",
            description: log.status === 'success' ? "Successful authentication" : `Failed: ${log.failure_reason || 'Invalid credentials'}`,
            reference_id: `LOGIN-${log.id}`,
            status: log.status,
            created_at: log.created_at || log.login_at,
            metadata: { ip_address: log.ip_address, user_agent: log.user_agent }
          });
        });
      }
      
      // Process chatbot logs
      if (chatbotLogs.status === 'fulfilled' && Array.isArray(chatbotLogs.value)) {
        chatbotLogs.value.forEach(log => {
          historyEntries.push({
            id: idCounter++,
            category: "editing",
            subcategory: "chatbot",
            user_name: log.user?.name || "Customer",
            user_role: log.user?.role || "customer",
            action: "Chatbot interaction",
            description: log.message?.substring(0, 100) || "Chat message",
            reference_id: `CHAT-${log.id}`,
            status: "completed",
            created_at: log.created_at,
            metadata: { session_id: log.session_id }
          });
        });
      }
      
      // Process inventory logs
      if (inventoryLogs.status === 'fulfilled' && Array.isArray(inventoryLogs.value)) {
        inventoryLogs.value.forEach(log => {
          historyEntries.push({
            id: idCounter++,
            category: "editing",
            subcategory: "inventory",
            user_name: log.user?.name || "Inventory Staff",
            user_role: "inventory",
            action: `Inventory ${log.action}`,
            description: `${log.inventory_item?.name || 'Item'} - ${log.quantity} units`,
            reference_id: `INV-${log.id}`,
            status: "completed",
            created_at: log.created_at,
            metadata: { item_id: log.inventory_item_id }
          });
        });
      }
      
      // Process sales transactions
      if (salesData.status === 'fulfilled') {
        const sales = Array.isArray(salesData.value) ? salesData.value : (salesData.value?.transactions || []);
        sales.forEach(sale => {
          historyEntries.push({
            id: idCounter++,
            category: "transaction",
            subcategory: "sale",
            user_name: sale.cashier?.name || "Cashier",
            user_role: "cashier",
            action: "Sale completed",
            description: `Transaction #${sale.id}`,
            amount: parseFloat(sale.amount) || 0,
            currency: "PHP",
            reference_id: `SALE-${sale.id}`,
            status: "completed",
            created_at: sale.created_at,
            metadata: { type: sale.type }
          });
        });
      }
      
      // Process appointments
      if (appointmentsData.status === 'fulfilled') {
        const appointments = Array.isArray(appointmentsData.value) ? appointmentsData.value : [];
        appointments.slice(0, 20).forEach(apt => {
          historyEntries.push({
            id: idCounter++,
            category: "editing",
            subcategory: "appointment",
            user_name: apt.customer?.name || "Customer",
            user_role: "customer",
            action: `Appointment ${apt.status}`,
            description: `${apt.service?.name || 'Service'} for ${apt.pet?.name || 'Pet'}`,
            reference_id: `APT-${apt.id}`,
            status: apt.status,
            created_at: apt.scheduled_at || apt.created_at,
            metadata: { pet_name: apt.pet?.name, service: apt.service?.name }
          });
        });
      }
      
      // Sort by date descending
      historyEntries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setHistoryLogs(historyEntries);
      
      if (historyEntries.length === 0) {
        setError("No history data available. Please ensure you have permission to access logs.");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch history logs");
      console.error("Fetch history logs error:", err);
      setHistoryLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryLogs();
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

  // Open detail modal
  const openDetailModal = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  // Close detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedLog(null);
  };

  // Filter history logs
  const filteredHistoryLogs = Array.isArray(historyLogs) ? historyLogs.filter((log) => {
    const matchesSearch = 
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reference_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.account_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || log.category === filterCategory;
    const matchesUser = filterUser === "all" || log.user_id?.toString() === filterUser;
    const matchesAccount = filterAccount === "all" || log.account_id?.toString() === filterAccount;
    const matchesDate = filterDate === "all" || 
      (filterDate === "today" && new Date(log.created_at).toDateString() === new Date().toDateString()) ||
      (filterDate === "week" && (Date.now() - new Date(log.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000) ||
      (filterDate === "month" && (Date.now() - new Date(log.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000);
    
    return matchesSearch && matchesCategory && matchesUser && matchesAccount && matchesDate;
  }) : [];

  // Get unique accounts for filter
  const uniqueAccounts = [...new Set(historyLogs.map(log => log.account_name).filter(Boolean))];

  // Get unique users for filter
  const uniqueUsers = [...new Set(historyLogs.map(log => ({ id: log.user_id, name: log.user_name })).filter(u => u.id))];

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

  // Format amount
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return "N/A";
    return formatCurrency(amount);
  };

  // Get category icon
  const getCategoryIcon = (category, subcategory) => {
    switch (category) {
      case 'transaction':
        switch (subcategory) {
          case 'payment': return faMoneyBillWave;
          case 'sale': return faShoppingCart;
          case 'refund': return faReceipt;
          default: return faMoneyBillWave;
        }
      case 'editing':
        switch (subcategory) {
          case 'profile': return faUser;
          case 'medical_record': return faFileMedical;
          case 'appointment': return faCalendarAlt;
          default: return faEdit;
        }
      case 'login':
        return faClock;
      default:
        return faHistory;
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      transaction: 'success',
      editing: 'warning',
      login: 'info'
    };
    return colors[category] || 'secondary';
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

  // Export history data
  const exportHistory = () => {
    // TODO: Implement export functionality
    showSuccess("Export functionality will be available soon");
  };

  // Refresh data
  const refreshData = () => {
    fetchHistoryLogs();
    showSuccess("History data refreshed");
  };

  return (
    <div className="admin-history">
      <div className="section-header">
        <div className="header-left">
          <h2>
            <FontAwesomeIcon icon={faHistory} /> System History
          </h2>
          <p>View transactions, editing activities, and staff login history across all accounts</p>
        </div>
        <div className="header-actions">
          <button className="action-btn" onClick={refreshData} title="Refresh">
            <FontAwesomeIcon icon={faRefresh} /> Refresh
          </button>
          <button className="action-btn" onClick={exportHistory} title="Export">
            <FontAwesomeIcon icon={faDownload} /> Export
          </button>
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
      <div className="history-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search by user, action, description, reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="transaction">Transactions</option>
              <option value="editing">Editing Activities</option>
              <option value="login">Staff Logins</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="all">All Users</option>
              {uniqueUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-dropdown">
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
            >
              <option value="all">All Accounts</option>
              {uniqueAccounts.map((account, index) => (
                <option key={index} value={account}>
                  {account}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-dropdown">
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

      {/* History Table */}
      <div className="history-table-container">
        {loading ? (
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin /> Loading history logs...
          </div>
        ) : filteredHistoryLogs.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faHistory} size="3x" />
            <h3>No history logs found</h3>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>User</th>
                <th>Account</th>
                <th>Action</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Reference</th>
                <th>Date</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistoryLogs.map((log) => (
                <tr key={log.id} className="history-row">
                  <td className="log-id">#{log.id}</td>
                  <td className="category">
                    <span className={`category-badge ${getCategoryColor(log.category)}`}>
                      <FontAwesomeIcon icon={getCategoryIcon(log.category, log.subcategory)} />
                      {log.category}
                    </span>
                  </td>
                  <td className="user-info">
                    <div className="user-details">
                      <div className="user-name">
                        <FontAwesomeIcon icon={faUser} className="user-icon" />
                        <strong>{log.user_name}</strong>
                      </div>
                      <div className="user-role">
                        <span className={`role-badge ${getRoleBadgeColor(log.user_role)}`}>
                          {log.user_role}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="account">{log.account_name}</td>
                  <td className="action">{log.action}</td>
                  <td className="description">{log.description}</td>
                  <td className="amount">
                    {log.amount !== null && log.amount !== undefined ? (
                      <span className={log.amount < 0 ? 'negative-amount' : 'positive-amount'}>
                        {formatAmount(log.amount)}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="reference">{log.reference_id}</td>
                  <td className="date">{formatDate(log.created_at)}</td>
                  <td className="time">{formatTime(log.created_at)}</td>
                  <td className="actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => openDetailModal(log)}
                      title="View Details"
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

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FontAwesomeIcon icon={getCategoryIcon(selectedLog.category, selectedLog.subcategory)} />
                {selectedLog.action}
              </h3>
              <button className="close-btn" onClick={closeDetailModal}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-item">
                    <label>ID:</label>
                    <span>#{selectedLog.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Category:</label>
                    <span className={`category-badge ${getCategoryColor(selectedLog.category)}`}>
                      {selectedLog.category}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Subcategory:</label>
                    <span>{selectedLog.subcategory}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedLog.status}`}>
                      {selectedLog.status}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>User Information</h4>
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedLog.user_name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedLog.user_email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Role:</label>
                    <span className={`role-badge ${getRoleBadgeColor(selectedLog.user_role)}`}>
                      {selectedLog.user_role}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>IP Address:</label>
                    <span>{selectedLog.ip_address}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Account Information</h4>
                  <div className="detail-item">
                    <label>Account:</label>
                    <span>{selectedLog.account_name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Reference ID:</label>
                    <span>{selectedLog.reference_id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date:</label>
                    <span>{formatDate(selectedLog.created_at)} at {formatTime(selectedLog.created_at)}</span>
                  </div>
                  {selectedLog.amount !== null && selectedLog.amount !== undefined && (
                    <div className="detail-item">
                      <label>Amount:</label>
                      <span className={selectedLog.amount < 0 ? 'negative-amount' : 'positive-amount'}>
                        {formatAmount(selectedLog.amount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="detail-section">
                  <h4>Description</h4>
                  <div className="detail-item">
                    <label>Action:</label>
                    <span>{selectedLog.action}</span>
                  </div>
                  <div className="detail-item">
                    <label>Description:</label>
                    <span>{selectedLog.description}</span>
                  </div>
                </div>

                {selectedLog.metadata && (
                  <div className="detail-section">
                    <h4>Additional Details</h4>
                    <div className="metadata-content">
                      {Object.entries(selectedLog.metadata).map(([key, value]) => (
                        <div key={key} className="metadata-item">
                          <label>{key.replace(/_/g, ' ').toUpperCase()}:</label>
                          <span>
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button className="close-modal-btn" onClick={closeDetailModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
