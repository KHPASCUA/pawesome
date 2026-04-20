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

  // Mock data structure ready for backend connection
  const mockHistoryData = [
    {
      id: 1,
      category: "transaction",
      subcategory: "payment",
      user_id: 5,
      user_name: "Dr. Sarah Johnson",
      user_role: "veterinary",
      user_email: "sarah@pawesome.com",
      account_id: 1,
      account_name: "Main Clinic Account",
      action: "Payment received for consultation",
      description: "Customer payment for pet consultation - Golden Retriever",
      amount: 150.00,
      currency: "PHP",
      reference_id: "PAY-2026-001",
      status: "completed",
      ip_address: "192.168.1.100",
      created_at: "2026-04-12T14:30:00Z",
      metadata: {
        customer_name: "John Smith",
        pet_name: "Max",
        pet_type: "Dog",
        service_type: "Consultation"
      }
    },
    {
      id: 2,
      category: "transaction",
      subcategory: "sale",
      user_id: 8,
      user_name: "Mike Chen",
      user_role: "cashier",
      user_email: "mike@pawesome.com",
      account_id: 1,
      account_name: "Main Clinic Account",
      action: "Product sale completed",
      description: "Sale of pet food and accessories",
      amount: 75.50,
      currency: "PHP",
      reference_id: "SALE-2026-042",
      status: "completed",
      ip_address: "192.168.1.101",
      created_at: "2026-04-12T13:45:00Z",
      metadata: {
        items: [
          { name: "Premium Dog Food", quantity: 2, price: 25.00 },
          { name: "Pet Toy", quantity: 1, price: 25.50 }
        ]
      }
    },
    {
      id: 3,
      category: "editing",
      subcategory: "profile",
      user_id: 3,
      user_name: "Emily Davis",
      user_role: "receptionist",
      user_email: "emily@pawesome.com",
      account_id: 1,
      account_name: "Main Clinic Account",
      action: "Profile updated",
      description: "Updated customer profile information",
      reference_id: "CUST-0042",
      status: "completed",
      ip_address: "192.168.1.102",
      created_at: "2026-04-12T12:20:00Z",
      metadata: {
        changed_fields: ["phone", "address", "emergency_contact"],
        old_values: { phone: "555-0123", address: "123 Old St" },
        new_values: { phone: "555-0124", address: "123 New St" }
      }
    },
    {
      id: 4,
      category: "editing",
      subcategory: "medical_record",
      user_id: 2,
      user_name: "Dr. James Wilson",
      user_role: "veterinary",
      user_email: "james@pawesome.com",
      account_id: 1,
      account_name: "Main Clinic Account",
      action: "Medical record updated",
      description: "Updated vaccination records for patient",
      reference_id: "MED-0089",
      status: "completed",
      ip_address: "192.168.1.103",
      created_at: "2026-04-12T11:15:00Z",
      metadata: {
        pet_name: "Bella",
        pet_type: "Cat",
        vaccination_type: "Rabies",
        next_due: "2027-04-12"
      }
    },
    {
      id: 5,
      category: "login",
      subcategory: "staff_login",
      user_id: 1,
      user_name: "Admin User",
      user_role: "admin",
      user_email: "admin@pawesome.com",
      account_id: 1,
      account_name: "Main Clinic Account",
      action: "Staff login successful",
      description: "Admin logged into system",
      reference_id: "LOGIN-001",
      status: "completed",
      ip_address: "192.168.1.105",
      created_at: "2026-04-12T09:00:00Z",
      metadata: {
        login_method: "password",
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        session_duration: "2h 30m"
      }
    },
    {
      id: 6,
      category: "transaction",
      subcategory: "refund",
      user_id: 8,
      user_name: "Mike Chen",
      user_role: "cashier",
      user_email: "mike@pawesome.com",
      account_id: 1,
      account_name: "Main Clinic Account",
      action: "Refund processed",
      description: "Refund for cancelled appointment",
      amount: -50.00,
      currency: "PHP",
      reference_id: "REF-2026-003",
      status: "completed",
      ip_address: "192.168.1.101",
      created_at: "2026-04-12T10:30:00Z",
      metadata: {
        original_transaction_id: "PAY-2026-099",
        refund_reason: "Appointment cancelled"
      }
    },
    {
      id: 7,
      category: "editing",
      subcategory: "appointment",
      user_id: 3,
      user_name: "Emily Davis",
      user_role: "receptionist",
      user_email: "emily@pawesome.com",
      account_id: 1,
      account_name: "Main Clinic Account",
      action: "Appointment rescheduled",
      description: "Customer appointment rescheduled to new time",
      reference_id: "APT-2026-156",
      status: "completed",
      ip_address: "192.168.1.102",
      created_at: "2026-04-12T08:45:00Z",
      metadata: {
        customer_name: "Alice Johnson",
        pet_name: "Luna",
        old_datetime: "2026-04-12T14:00:00Z",
        new_datetime: "2026-04-13T10:00:00Z"
      }
    },
    {
      id: 8,
      category: "login",
      subcategory: "staff_login",
      user_id: 2,
      user_name: "Dr. James Wilson",
      user_role: "veterinary",
      user_email: "james@pawesome.com",
      account_id: 2,
      account_name: "Branch Office Account",
      action: "Staff login successful",
      description: "Veterinary staff logged into branch system",
      reference_id: "LOGIN-002",
      status: "completed",
      ip_address: "192.168.2.105",
      created_at: "2026-04-12T08:00:00Z",
      metadata: {
        login_method: "password",
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        session_duration: "4h 15m"
      }
    }
  ];

  // Fetch history logs from database (ready for backend connection)
  const fetchHistoryLogs = async () => {
    try {
      setLoading(true);
      setError("");
      
      // TODO: Replace with actual API call
      // const data = await apiRequest("/admin/history");
      
      // Using mock data for now
      setTimeout(() => {
        setHistoryLogs(Array.isArray(mockHistoryData) ? mockHistoryData : []);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError(err.message || "Failed to fetch history logs");
      console.error("Fetch history logs error:", err);
      setHistoryLogs([]); // Set empty array on error
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
