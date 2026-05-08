import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCalendarAlt,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faSpinner,
  faExclamationTriangle,
  faDownload,
  faEye,
  faSort,
  faPaw,
  faHotel,
  faCut,
  faStethoscope,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { useTheme } from "../../utils/theme";
import "./ReceptionistHistory.css";

const ReceptionistHistory = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("approvals");
  const [orderApprovals, setOrderApprovals] = useState([]);
  const [serviceApprovals, setServiceApprovals] = useState([]);
  const [schedulingHistory, setSchedulingHistory] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Safe data normalization
  const normalizeList = (result, keys = []) => {
    if (Array.isArray(result)) return result;
    
    for (const key of keys) {
      if (Array.isArray(result?.[key])) return result[key];
    }
    
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.items)) return result.items;
    if (Array.isArray(result?.approvals)) return result.approvals;
    if (Array.isArray(result?.history)) return result.history;
    if (Array.isArray(result?.requests)) return result.requests;
    
    return [];
  };

  const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric", 
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: "pending",
      approved: "approved",
      rejected: "rejected",
      completed: "completed",
      cancelled: "cancelled",
      scheduled: "scheduled",
      confirmed: "confirmed",
      in_progress: "in-progress",
    };
    return statusMap[status?.toLowerCase()] || "pending";
  };

  // Fetch order approval history
  const fetchOrderApprovals = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const response = await apiRequest("/receptionist/orders/approval-history");
      const approvalsData = normalizeList(response, ["data", "approvals", "history"]);
      
      setOrderApprovals(approvalsData);
      setError("");
    } catch (err) {
      console.error("Failed to fetch order approvals:", err);
      setError(err.message || "Failed to load order approval history");
      setOrderApprovals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch service approval history
  const fetchServiceApprovals = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const response = await apiRequest("/receptionist/requests/approval-history");
      const approvalsData = normalizeList(response, ["data", "approvals", "history"]);
      
      setServiceApprovals(approvalsData);
      setError("");
    } catch (err) {
      console.error("Failed to fetch service approvals:", err);
      setError(err.message || "Failed to load service approval history");
      setServiceApprovals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch scheduling history
  const fetchSchedulingHistory = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const response = await apiRequest("/receptionist/scheduling/history");
      const schedulingData = normalizeList(response, ["data", "history", "schedules"]);
      
      setSchedulingHistory(schedulingData);
      setError("");
    } catch (err) {
      console.error("Failed to fetch scheduling history:", err);
      setError(err.message || "Failed to load scheduling history");
      setSchedulingHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch rejected requests
  const fetchRejectedRequests = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const response = await apiRequest("/receptionist/requests/rejected-history");
      const rejectedData = normalizeList(response, ["data", "rejected", "history"]);
      
      setRejectedRequests(rejectedData);
      setError("");
    } catch (err) {
      console.error("Failed to fetch rejected requests:", err);
      setError(err.message || "Failed to load rejected requests history");
      setRejectedRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case "approvals":
        fetchOrderApprovals();
        break;
      case "services":
        fetchServiceApprovals();
        break;
      case "scheduling":
        fetchSchedulingHistory();
        break;
      case "rejected":
        fetchRejectedRequests();
        break;
      default:
        break;
    }
  }, [activeTab, fetchOrderApprovals, fetchServiceApprovals, fetchSchedulingHistory, fetchRejectedRequests]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = [];
    switch (activeTab) {
      case "approvals":
        data = orderApprovals;
        break;
      case "services":
        data = serviceApprovals;
        break;
      case "scheduling":
        data = schedulingHistory;
        break;
      case "rejected":
        data = rejectedRequests;
        break;
      default:
        data = [];
        break;
    }

    if (!data) return [];

    // Apply search filter
    const filtered = data.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const searchableFields = [
        item.id,
        item.order_id,
        item.request_id,
        item.customer_name,
        item.customer,
        item.pet_name,
        item.service_type,
        item.status,
        item.approved_by,
        item.rejected_by,
        item.total_amount,
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchableFields.includes(searchLower);
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.created_at || a.approved_at || a.rejected_at || a.scheduled_at || 0);
        const dateB = new Date(b.created_at || b.approved_at || b.rejected_at || b.scheduled_at || 0);
        return dateB - dateA;
      }
      if (sortBy === "customer") {
        const customerA = (a.customer_name || a.customer || "").toLowerCase();
        const customerB = (b.customer_name || b.customer || "").toLowerCase();
        return customerA.localeCompare(customerB);
      }
      return 0;
    });
  }, [activeTab, orderApprovals, serviceApprovals, schedulingHistory, rejectedRequests, searchTerm, sortBy]);

  const getServiceIcon = (serviceType) => {
    const type = String(serviceType || "").toLowerCase();
    if (type.includes("hotel") || type.includes("boarding")) return faHotel;
    if (type.includes("groom")) return faCut;
    if (type.includes("vet") || type.includes("medical")) return faStethoscope;
    return faPaw;
  };

  const handleRefresh = () => {
    switch (activeTab) {
      case "approvals":
        fetchOrderApprovals({ silent: true });
        break;
      case "services":
        fetchServiceApprovals({ silent: true });
        break;
      case "scheduling":
        fetchSchedulingHistory({ silent: true });
        break;
      case "rejected":
        fetchRejectedRequests({ silent: true });
        break;
      default:
        break;
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert("Export feature coming soon!");
  };

  if (loading) {
    return (
      <div className="receptionist-history loading">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner" />
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`receptionist-history ${theme}`}>
      <div className="history-header">
        <div className="header-content">
          <h1>Receptionist History</h1>
          <p>View your approval actions, scheduling history, and rejected requests</p>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FontAwesomeIcon icon={faSpinner} spin={refreshing} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button className="export-btn" onClick={handleExport}>
            <FontAwesomeIcon icon={faDownload} />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      )}

      <div className="history-tabs">
        <button 
          className={`tab-btn ${activeTab === "approvals" ? "active" : ""}`}
          onClick={() => setActiveTab("approvals")}
        >
          <FontAwesomeIcon icon={faCheckCircle} />
          Order Approvals
        </button>
        <button 
          className={`tab-btn ${activeTab === "services" ? "active" : ""}`}
          onClick={() => setActiveTab("services")}
        >
          <FontAwesomeIcon icon={faClipboardCheck} />
          Service Approvals
        </button>
        <button 
          className={`tab-btn ${activeTab === "scheduling" ? "active" : ""}`}
          onClick={() => setActiveTab("scheduling")}
        >
          <FontAwesomeIcon icon={faCalendarAlt} />
          Scheduling
        </button>
        <button 
          className={`tab-btn ${activeTab === "rejected" ? "active" : ""}`}
          onClick={() => setActiveTab("rejected")}
        >
          <FontAwesomeIcon icon={faTimesCircle} />
          Rejected
        </button>
      </div>

      <div className="history-toolbar">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="toolbar-controls">
          <label>
            <FontAwesomeIcon icon={faSort} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Sort by Date</option>
              <option value="customer">Sort by Customer</option>
            </select>
          </label>
        </div>
        <div className="result-count">
          Showing <strong>{filteredData.length}</strong> records
        </div>
      </div>

      <div className="history-content">
        {filteredData.length === 0 ? (
          <div className="empty-state">
            <FontAwesomeIcon icon={faClipboardCheck} />
            <h3>No history found</h3>
            <p>
              {searchTerm 
                ? "Try adjusting your search terms." 
                : `Your ${activeTab} history will appear here once you have records.`
              }
            </p>
          </div>
        ) : (
          <div className="history-list">
            {filteredData.map((record) => (
              <div key={record.id} className="history-card">
                <div className="card-header">
                  <div className="record-info">
                    <span className="record-id">#{record.id}</span>
                    <span className={`status-badge ${getStatusBadgeClass(record.status)}`}>
                      {record.status}
                    </span>
                  </div>
                  <div className="record-date">
                    <FontAwesomeIcon icon={faClock} />
                    {formatDate(record.approved_at || record.rejected_at || record.scheduled_at || record.created_at)} 
                    {" "}
                    {formatTime(record.approved_at || record.rejected_at || record.scheduled_at || record.created_at)}
                  </div>
                </div>
                <div className="card-body">
                  <div className="record-details">
                    <div className="detail-row">
                      <span>Customer:</span>
                      <strong>{record.customer_name || record.customer || "N/A"}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Type:</span>
                      <div className="service-type">
                        <FontAwesomeIcon icon={getServiceIcon(record.service_type)} />
                        {record.service_type || record.type || "General"}
                      </div>
                    </div>
                    {record.pet_name && (
                      <div className="detail-row">
                        <span>Pet:</span>
                        <strong>{record.pet_name}</strong>
                      </div>
                    )}
                    {record.total_amount && (
                      <div className="detail-row">
                        <span>Amount:</span>
                        <strong>{formatCurrency(record.total_amount)}</strong>
                      </div>
                    )}
                    {(record.approved_by || record.rejected_by) && (
                      <div className="detail-row">
                        <span>Action By:</span>
                        <strong>{record.approved_by || record.rejected_by}</strong>
                      </div>
                    )}
                    {record.rejection_reason && (
                      <div className="detail-row">
                        <span>Reason:</span>
                        <span className="rejection-reason">{record.rejection_reason}</span>
                      </div>
                    )}
                    {record.remarks && (
                      <div className="detail-row">
                        <span>Remarks:</span>
                        <span className="remarks">{record.remarks}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-footer">
                  <button 
                    className="view-btn"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>History Record Details</h3>
              <button onClick={() => setSelectedRecord(null)}>×</button>
            </div>
            <div className="modal-body">
              <pre>{JSON.stringify(selectedRecord, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistHistory;
