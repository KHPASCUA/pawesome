import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory,
  faSearch,
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
  faFileMedical,
  faShieldAlt,
  faChartLine,
  faLock,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import "./History.css";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

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

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 5000);
  };

  const fetchHistoryLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        activityLogs,
        loginLogs,
        chatbotLogs,
        inventoryLogs,
        salesData,
        appointmentsData,
      ] = await Promise.allSettled([
        apiRequest("/admin/activity-logs").catch(() => []),
        apiRequest("/admin/login-logs").catch(() => []),
        apiRequest("/admin/chatbot/logs").catch(() => []),
        apiRequest("/inventory/logs").catch(() => []),
        apiRequest("/cashier/transactions").catch(() => []),
        apiRequest("/admin/appointments").catch(() => []),
      ]);

      const historyEntries = [];
      let idCounter = 1;

      if (activityLogs.status === "fulfilled") {
        const activities = activityLogs.value?.data || activityLogs.value || [];
        activities.forEach((log) => {
          historyEntries.push({
            id: idCounter++,
            category: log.category || "general",
            subcategory: log.subcategory || "activity",
            user_name: log.user?.name || log.user_name || "System",
            user_email: log.user?.email || log.user_email || "N/A",
            user_role: log.user?.role || log.user_role || "admin",
            account_name: log.account_name || "System",
            action: log.action || "Activity performed",
            description: log.description || "System activity",
            reference_id: log.reference_id || `ACT-${log.id || idCounter}`,
            status: log.status || "completed",
            created_at: log.created_at || new Date().toISOString(),
            metadata: log.metadata || {},
          });
        });
      }

      if (loginLogs.status === "fulfilled") {
        const logs = loginLogs.value?.data || loginLogs.value || [];
        logs.forEach((log) => {
          historyEntries.push({
            id: idCounter++,
            category: "login",
            subcategory: log.action === "logout" ? "logout" : "login",
            user_name: log.user?.name || log.email || "Unknown User",
            user_email: log.email || log.user?.email || "N/A",
            user_role: log.user?.role || "unknown",
            account_name: log.account_name || "Authentication",
            action: log.action === "logout" ? "Logged out" : "Logged in",
            description:
              log.status === "success"
                ? "Successful authentication"
                : `Failed: ${log.failure_reason || "Invalid credentials"}`,
            reference_id: `LOGIN-${log.id || idCounter}`,
            status: log.status || "completed",
            created_at: log.created_at || log.login_at || new Date().toISOString(),
            metadata: {
              ip_address: log.ip_address || "N/A",
              user_agent: log.user_agent || "N/A",
            },
          });
        });
      }

      if (chatbotLogs.status === "fulfilled" && Array.isArray(chatbotLogs.value)) {
        chatbotLogs.value.forEach((log) => {
          historyEntries.push({
            id: idCounter++,
            category: "editing",
            subcategory: "chatbot",
            user_name: log.user?.name || "Customer",
            user_email: log.user?.email || "N/A",
            user_role: log.user?.role || "customer",
            account_name: "Chatbot",
            action: "Chatbot interaction",
            description: log.message?.substring(0, 100) || "Chat message",
            reference_id: `CHAT-${log.id || idCounter}`,
            status: "completed",
            created_at: log.created_at || new Date().toISOString(),
            metadata: {
              session_id: log.session_id || "N/A",
            },
          });
        });
      }

      if (inventoryLogs.status === "fulfilled" && Array.isArray(inventoryLogs.value)) {
        inventoryLogs.value.forEach((log) => {
          historyEntries.push({
            id: idCounter++,
            category: "editing",
            subcategory: "inventory",
            user_name: log.user?.name || "Inventory Staff",
            user_email: log.user?.email || "N/A",
            user_role: "inventory",
            account_name: "Inventory",
            action: `Inventory ${log.action || "updated"}`,
            description: `${log.inventory_item?.name || "Item"} - ${
              log.quantity || 0
            } units`,
            reference_id: `INV-${log.id || idCounter}`,
            status: "completed",
            created_at: log.created_at || new Date().toISOString(),
            metadata: {
              item_id: log.inventory_item_id || "N/A",
            },
          });
        });
      }

      if (salesData.status === "fulfilled") {
        const sales = Array.isArray(salesData.value)
          ? salesData.value
          : salesData.value?.transactions || [];

        sales.forEach((sale) => {
          historyEntries.push({
            id: idCounter++,
            category: "transaction",
            subcategory: "sale",
            user_name: sale.cashier?.name || "Cashier",
            user_email: sale.cashier?.email || "N/A",
            user_role: "cashier",
            account_name: "Cashier",
            action: "Sale completed",
            description: `Transaction #${sale.id}`,
            amount: parseFloat(sale.amount) || 0,
            currency: "PHP",
            reference_id: `SALE-${sale.id || idCounter}`,
            status: "completed",
            created_at: sale.created_at || new Date().toISOString(),
            metadata: {
              type: sale.type || "sale",
            },
          });
        });
      }

      if (appointmentsData.status === "fulfilled") {
        const appointments = Array.isArray(appointmentsData.value)
          ? appointmentsData.value
          : appointmentsData.value?.data || [];

        appointments.slice(0, 20).forEach((apt) => {
          historyEntries.push({
            id: idCounter++,
            category: "editing",
            subcategory: "appointment",
            user_name: apt.customer?.name || "Customer",
            user_email: apt.customer?.email || "N/A",
            user_role: "customer",
            account_name: "Appointments",
            action: `Appointment ${apt.status || "updated"}`,
            description: `${apt.service?.name || "Service"} for ${
              apt.pet?.name || "Pet"
            }`,
            reference_id: `APT-${apt.id || idCounter}`,
            status: apt.status || "completed",
            created_at: apt.scheduled_at || apt.created_at || new Date().toISOString(),
            metadata: {
              pet_name: apt.pet?.name || "N/A",
              service: apt.service?.name || "N/A",
            },
          });
        });
      }

      historyEntries.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setHistoryLogs(historyEntries);

      if (historyEntries.length === 0) {
        setError("No history data available. Please check your backend logs.");
      }
    } catch (err) {
      console.error("Fetch history logs error:", err);
      setError(err.message || "Failed to fetch history logs");
      setHistoryLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryLogs();
  }, []);

  const filteredHistoryLogs = useMemo(() => {
    return Array.isArray(historyLogs)
      ? historyLogs.filter((log) => {
          const keyword = searchTerm.toLowerCase();

          const matchesSearch =
            log.user_name?.toLowerCase().includes(keyword) ||
            log.user_email?.toLowerCase().includes(keyword) ||
            log.action?.toLowerCase().includes(keyword) ||
            log.description?.toLowerCase().includes(keyword) ||
            log.reference_id?.toLowerCase().includes(keyword) ||
            log.account_name?.toLowerCase().includes(keyword);

          const matchesCategory =
            filterCategory === "all" || log.category === filterCategory;

          const matchesUser =
            filterUser === "all" || log.user_name === filterUser;

          const matchesAccount =
            filterAccount === "all" || log.account_name === filterAccount;

          const createdDate = new Date(log.created_at);
          const now = Date.now();

          const matchesDate =
            filterDate === "all" ||
            (filterDate === "today" &&
              createdDate.toDateString() === new Date().toDateString()) ||
            (filterDate === "week" &&
              now - createdDate.getTime() < 7 * 24 * 60 * 60 * 1000) ||
            (filterDate === "month" &&
              now - createdDate.getTime() < 30 * 24 * 60 * 60 * 1000);

          return (
            matchesSearch &&
            matchesCategory &&
            matchesUser &&
            matchesAccount &&
            matchesDate
          );
        })
      : [];
  }, [historyLogs, searchTerm, filterCategory, filterUser, filterDate, filterAccount]);

  const uniqueAccounts = useMemo(() => {
    return [...new Set(historyLogs.map((log) => log.account_name).filter(Boolean))];
  }, [historyLogs]);

  const uniqueUsers = useMemo(() => {
    return [...new Set(historyLogs.map((log) => log.user_name).filter(Boolean))];
  }, [historyLogs]);

  const stats = useMemo(() => {
    return {
      total: filteredHistoryLogs.length,
      transactions: filteredHistoryLogs.filter((l) => l.category === "transaction")
        .length,
      editing: filteredHistoryLogs.filter((l) => l.category === "editing").length,
      logins: filteredHistoryLogs.filter((l) => l.category === "login").length,
      today: filteredHistoryLogs.filter(
        (l) => new Date(l.created_at).toDateString() === new Date().toDateString()
      ).length,
    };
  }, [filteredHistoryLogs]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return "N/A";
    return formatCurrency(amount);
  };

  const getCategoryIcon = (category, subcategory) => {
    switch (category) {
      case "transaction":
        if (subcategory === "sale") return faShoppingCart;
        if (subcategory === "payment") return faMoneyBillWave;
        if (subcategory === "refund") return faReceipt;
        return faMoneyBillWave;

      case "editing":
        if (subcategory === "medical_record") return faFileMedical;
        if (subcategory === "appointment") return faCalendarAlt;
        return faEdit;

      case "login":
        return faLock;

      default:
        return faHistory;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      transaction: "success",
      editing: "warning",
      login: "info",
      general: "secondary",
    };

    return colors[category] || "secondary";
  };

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

  const openDetailModal = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedLog(null);
  };

  const refreshData = async () => {
    await fetchHistoryLogs();
    showSuccess("History data refreshed");
  };

  const exportHistory = () => {
    try {
      if (!filteredHistoryLogs.length) {
        showError("No history data to export");
        return;
      }

      const headers = [
        "ID",
        "Category",
        "User",
        "Role",
        "Account",
        "Action",
        "Description",
        "Amount",
        "Reference",
        "Date",
        "Time",
        "Status",
      ];

      const rows = filteredHistoryLogs.map((log) => [
        log.id,
        log.category,
        log.user_name,
        log.user_role,
        log.account_name || "N/A",
        log.action,
        log.description,
        log.amount ?? "N/A",
        log.reference_id,
        formatDate(log.created_at),
        formatTime(log.created_at),
        log.status,
      ]);

      const csvContent = [headers, ...rows]
        .map((row) =>
          row
            .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", `system-history-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      showSuccess("History exported successfully");
    } catch (err) {
      console.error(err);
      showError("Failed to export history");
    }
  };

  return (
    <motion.div
      className="admin-history"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="section-header enhanced"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="header-left">
          <div className="history-kicker">
            <FontAwesomeIcon icon={faShieldAlt} />
            Audit Trail Center
          </div>

          <h2>
            <FontAwesomeIcon icon={faHistory} className="header-icon" />
            System History
            <span className="history-badge">{stats.total} entries</span>
          </h2>

          <p>
            Monitor transactions, editing activities, logins, and system actions
            across all accounts.
          </p>
        </div>

        <div className="header-actions">
          <button className="action-btn refresh" onClick={refreshData}>
            <FontAwesomeIcon icon={faRefresh} />
            Refresh
          </button>

          <button className="action-btn export" onClick={exportHistory}>
            <FontAwesomeIcon icon={faDownload} />
            Export CSV
          </button>
        </div>
      </motion.div>

      <motion.div
        className="history-stats-grid"
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.08 }}
      >
        <motion.div className="stat-card total" variants={fadeUp}>
          <div className="stat-icon">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Activities</div>
          </div>
        </motion.div>

        <motion.div className="stat-card transactions" variants={fadeUp}>
          <div className="stat-icon">
            <FontAwesomeIcon icon={faMoneyBillWave} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.transactions}</div>
            <div className="stat-label">Transactions</div>
          </div>
        </motion.div>

        <motion.div className="stat-card editing" variants={fadeUp}>
          <div className="stat-icon">
            <FontAwesomeIcon icon={faEdit} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.editing}</div>
            <div className="stat-label">Editing Activities</div>
          </div>
        </motion.div>

        <motion.div className="stat-card logins" variants={fadeUp}>
          <div className="stat-icon">
            <FontAwesomeIcon icon={faLock} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.logins}</div>
            <div className="stat-label">Staff Logins</div>
          </div>
        </motion.div>

        <motion.div className="stat-card today" variants={fadeUp}>
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCalendarAlt} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.today}</div>
            <div className="stat-label">Today</div>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {success && (
          <motion.div
            className="success-message"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <FontAwesomeIcon icon={faCheckCircle} />
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <FontAwesomeIcon icon={faExclamationTriangle} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="history-controls"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.1 }}
      >
        <div className="search-filter-group">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search user, action, description, reference..."
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
              <option value="general">General</option>
            </select>
          </div>

          <div className="filter-dropdown">
            <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
              <option value="all">All Users</option>
              {uniqueUsers.map((user) => (
                <option key={user} value={user}>
                  {user}
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
              {uniqueAccounts.map((account) => (
                <option key={account} value={account}>
                  {account}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-dropdown">
            <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="history-table-container"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.18 }}
      >
        {loading ? (
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin />
            <p>Loading history logs...</p>
          </div>
        ) : filteredHistoryLogs.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faClipboardList} className="empty-icon" />
            <h3>No history logs found</h3>
            <p>Try adjusting your filters or refresh the history records.</p>
          </div>
        ) : (
          <div className="history-table-scroll">
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
                {filteredHistoryLogs.map((log, index) => (
                  <motion.tr
                    key={`${log.reference_id}-${log.id}`}
                    className="history-row"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.015 }}
                  >
                    <td className="log-id">#{log.id}</td>

                    <td>
                      <span className={`category-badge ${getCategoryColor(log.category)}`}>
                        <FontAwesomeIcon
                          icon={getCategoryIcon(log.category, log.subcategory)}
                        />
                        {log.category}
                      </span>
                    </td>

                    <td className="user-info">
                      <div className="user-details">
                        <div className="user-name">
                          <FontAwesomeIcon icon={faUser} className="user-icon" />
                          <strong>{log.user_name || "N/A"}</strong>
                        </div>

                        <div className="user-role">
                          <span className={`role-badge ${getRoleBadgeColor(log.user_role)}`}>
                            {log.user_role || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="account">{log.account_name || "N/A"}</td>
                    <td className="action">{log.action || "N/A"}</td>
                    <td className="description">{log.description || "N/A"}</td>

                    <td className="amount">
                      {log.amount !== null && log.amount !== undefined ? (
                        <span
                          className={
                            Number(log.amount) < 0 ? "negative-amount" : "positive-amount"
                          }
                        >
                          {formatAmount(log.amount)}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </td>

                    <td className="reference">{log.reference_id || "N/A"}</td>
                    <td className="date">{formatDate(log.created_at)}</td>
                    <td className="time">{formatTime(log.created_at)}</td>

                    <td className="actions">
                      <button
                        className="table-action-btn view-btn"
                        onClick={() => openDetailModal(log)}
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showDetailModal && selectedLog && (
          <motion.div
            className="modal-overlay"
            onClick={closeDetailModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="detail-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="modal-header">
                <h3>
                  <FontAwesomeIcon
                    icon={getCategoryIcon(selectedLog.category, selectedLog.subcategory)}
                  />
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
                      <span
                        className={`category-badge ${getCategoryColor(
                          selectedLog.category
                        )}`}
                      >
                        {selectedLog.category}
                      </span>
                    </div>

                    <div className="detail-item">
                      <label>Subcategory:</label>
                      <span>{selectedLog.subcategory || "N/A"}</span>
                    </div>

                    <div className="detail-item">
                      <label>Status:</label>
                      <span className={`status-badge ${selectedLog.status}`}>
                        {selectedLog.status || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>User Information</h4>

                    <div className="detail-item">
                      <label>Name:</label>
                      <span>{selectedLog.user_name || "N/A"}</span>
                    </div>

                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedLog.user_email || "N/A"}</span>
                    </div>

                    <div className="detail-item">
                      <label>Role:</label>
                      <span
                        className={`role-badge ${getRoleBadgeColor(
                          selectedLog.user_role
                        )}`}
                      >
                        {selectedLog.user_role || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Account Information</h4>

                    <div className="detail-item">
                      <label>Account:</label>
                      <span>{selectedLog.account_name || "N/A"}</span>
                    </div>

                    <div className="detail-item">
                      <label>Reference ID:</label>
                      <span>{selectedLog.reference_id || "N/A"}</span>
                    </div>

                    <div className="detail-item">
                      <label>Date:</label>
                      <span>
                        {formatDate(selectedLog.created_at)} at{" "}
                        {formatTime(selectedLog.created_at)}
                      </span>
                    </div>

                    {selectedLog.amount !== null && selectedLog.amount !== undefined && (
                      <div className="detail-item">
                        <label>Amount:</label>
                        <span
                          className={
                            Number(selectedLog.amount) < 0
                              ? "negative-amount"
                              : "positive-amount"
                          }
                        >
                          {formatAmount(selectedLog.amount)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="detail-section">
                    <h4>Description</h4>

                    <div className="detail-item">
                      <label>Action:</label>
                      <span>{selectedLog.action || "N/A"}</span>
                    </div>

                    <div className="detail-item">
                      <label>Description:</label>
                      <span>{selectedLog.description || "N/A"}</span>
                    </div>
                  </div>

                  {selectedLog.metadata && (
                    <div className="detail-section full">
                      <h4>Additional Details</h4>

                      <div className="metadata-content">
                        {Object.entries(selectedLog.metadata).map(([key, value]) => (
                          <div key={key} className="metadata-item">
                            <label>{key.replace(/_/g, " ").toUpperCase()}:</label>
                            <span>
                              {typeof value === "object"
                                ? JSON.stringify(value, null, 2)
                                : String(value)}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default History;
