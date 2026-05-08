import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCalendarAlt,
  faChartLine,
  faMoneyBillWave,
  faBox,
  faUsers,
  faClipboardList,
  faSpinner,
  faExclamationTriangle,
  faDownload,
  faEye,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { useTheme } from "../../utils/theme";
import "./ManagerHistory.css";

const ManagerHistory = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("sales");
  const [salesHistory, setSalesHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [customerHistory, setCustomerHistory] = useState([]);
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
    if (Array.isArray(result?.history)) return result.history;
    if (Array.isArray(result?.reports)) return result.reports;
    if (Array.isArray(result?.records)) return result.records;
    
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

  // Fetch sales report history
  const fetchSalesHistory = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const response = await apiRequest("/manager/reports/sales/history");
      const salesData = normalizeList(response, ["data", "history", "reports"]);
      
      setSalesHistory(salesData);
      setError("");
    } catch (err) {
      console.error("Failed to fetch sales history:", err);
      setError(err.message || "Failed to load sales history");
      setSalesHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch payment report history
  const fetchPaymentHistory = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const response = await apiRequest("/manager/reports/payments/history");
      const paymentData = normalizeList(response, ["data", "history", "reports"]);
      
      setPaymentHistory(paymentData);
      setError("");
    } catch (err) {
      console.error("Failed to fetch payment history:", err);
      setError(err.message || "Failed to load payment history");
      setPaymentHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch inventory report history
  const fetchInventoryHistory = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const response = await apiRequest("/manager/reports/inventory/history");
      const inventoryData = normalizeList(response, ["data", "history", "reports"]);
      
      setInventoryHistory(inventoryData);
      setError("");
    } catch (err) {
      console.error("Failed to fetch inventory history:", err);
      setError(err.message || "Failed to load inventory history");
      setInventoryHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch service report history
  const fetchServiceHistory = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const response = await apiRequest("/manager/reports/services/history");
      const serviceData = normalizeList(response, ["data", "history", "reports"]);
      
      setServiceHistory(serviceData);
      setError("");
    } catch (err) {
      console.error("Failed to fetch service history:", err);
      setError(err.message || "Failed to load service history");
      setServiceHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch customer activity history
  const fetchCustomerHistory = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const response = await apiRequest("/manager/reports/customers/history");
      const customerData = normalizeList(response, ["data", "history", "reports"]);
      
      setCustomerHistory(customerData);
      setError("");
    } catch (err) {
      console.error("Failed to fetch customer history:", err);
      setError(err.message || "Failed to load customer history");
      setCustomerHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case "sales":
        fetchSalesHistory();
        break;
      case "payments":
        fetchPaymentHistory();
        break;
      case "inventory":
        fetchInventoryHistory();
        break;
      case "services":
        fetchServiceHistory();
        break;
      case "customers":
        fetchCustomerHistory();
        break;
      default:
        break;
    }
  }, [activeTab, fetchSalesHistory, fetchPaymentHistory, fetchInventoryHistory, fetchServiceHistory, fetchCustomerHistory]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = [];
    switch (activeTab) {
      case "sales":
        data = salesHistory;
        break;
      case "payments":
        data = paymentHistory;
        break;
      case "inventory":
        data = inventoryHistory;
        break;
      case "services":
        data = serviceHistory;
        break;
      case "customers":
        data = customerHistory;
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
        item.report_id,
        item.period,
        item.month,
        item.year,
        item.total_amount,
        item.total_sales,
        item.total_revenue,
        item.summary,
        item.description,
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchableFields.includes(searchLower);
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.created_at || a.report_date || a.period_start || 0);
        const dateB = new Date(b.created_at || b.report_date || b.period_start || 0);
        return dateB - dateA;
      }
      if (sortBy === "amount") {
        const amountA = Number(a.total_amount || a.total_sales || a.total_revenue || 0);
        const amountB = Number(b.total_amount || b.total_sales || b.total_revenue || 0);
        return amountB - amountA;
      }
      return 0;
    });
  }, [activeTab, salesHistory, paymentHistory, inventoryHistory, serviceHistory, customerHistory, searchTerm, sortBy]);

  const handleRefresh = () => {
    switch (activeTab) {
      case "sales":
        fetchSalesHistory({ silent: true });
        break;
      case "payments":
        fetchPaymentHistory({ silent: true });
        break;
      case "inventory":
        fetchInventoryHistory({ silent: true });
        break;
      case "services":
        fetchServiceHistory({ silent: true });
        break;
      case "customers":
        fetchCustomerHistory({ silent: true });
        break;
      default:
        break;
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert("Export feature coming soon!");
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case "sales": return faMoneyBillWave;
      case "payments": return faMoneyBillWave;
      case "inventory": return faBox;
      case "services": return faClipboardList;
      case "customers": return faUsers;
      default: return faChartLine;
    }
  };

  const getTabLabel = (tab) => {
    switch (tab) {
      case "sales": return "Sales Reports";
      case "payments": return "Payment Reports";
      case "inventory": return "Inventory Reports";
      case "services": return "Service Reports";
      case "customers": return "Customer Activity";
      default: return "Reports";
    }
  };

  if (loading) {
    return (
      <div className="manager-history loading">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner" />
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`manager-history ${theme}`}>
      <div className="history-header">
        <div className="header-content">
          <h1>Manager History</h1>
          <p>View read-only reports and monitoring history across all departments</p>
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
        {["sales", "payments", "inventory", "services", "customers"].map((tab) => (
          <button 
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            <FontAwesomeIcon icon={getTabIcon(tab)} />
            {getTabLabel(tab)}
          </button>
        ))}
      </div>

      <div className="history-toolbar">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder={`Search ${getTabLabel(activeTab)}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="toolbar-controls">
          <label>
            <FontAwesomeIcon icon={faSort} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
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
            <FontAwesomeIcon icon={faChartLine} />
            <h3>No history found</h3>
            <p>
              {searchTerm 
                ? "Try adjusting your search terms." 
                : `${getTabLabel(activeTab)} history will appear here once reports are generated.`
              }
            </p>
          </div>
        ) : (
          <div className="history-list">
            {filteredData.map((record) => (
              <div key={record.id} className="history-card">
                <div className="card-header">
                  <div className="report-info">
                    <span className="report-id">#{record.id}</span>
                    <span className="report-period">{record.period || record.month || "N/A"}</span>
                  </div>
                  <div className="report-date">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    {formatDate(record.created_at || record.report_date)} {formatTime(record.created_at || record.report_date)}
                  </div>
                </div>
                <div className="card-body">
                  <div className="report-details">
                    <div className="detail-row">
                      <span>Report Type:</span>
                      <strong>{getTabLabel(activeTab)}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Period:</span>
                      <strong>{record.period || `${record.month} ${record.year}` || "N/A"}</strong>
                    </div>
                    {(record.total_amount || record.total_sales || record.total_revenue) && (
                      <div className="detail-row">
                        <span>Total Amount:</span>
                        <strong>{formatCurrency(record.total_amount || record.total_sales || record.total_revenue || 0)}</strong>
                      </div>
                    )}
                    {record.summary && (
                      <div className="detail-row">
                        <span>Summary:</span>
                        <span className="report-summary">{record.summary}</span>
                      </div>
                    )}
                    {record.description && (
                      <div className="detail-row">
                        <span>Description:</span>
                        <span className="report-description">{record.description}</span>
                      </div>
                    )}
                    {record.generated_by && (
                      <div className="detail-row">
                        <span>Generated By:</span>
                        <strong>{record.generated_by}</strong>
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
              <h3>Report Details</h3>
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

export default ManagerHistory;
