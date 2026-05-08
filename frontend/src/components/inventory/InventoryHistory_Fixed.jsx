import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCalendarAlt,
  faBox,
  faWarehouse,
  faClipboardList,
  faSpinner,
  faExclamationTriangle,
  faDownload,
  faEye,
  faSort,
  faPlus,
  faMinus,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import { useTheme } from "../../utils/theme";
import "./InventoryHistory.css";

const InventoryHistory = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("stock");
  const [stockHistory, setStockHistory] = useState([]);
  const [auditHistory, setAuditHistory] = useState([]);
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);
  const [restockHistory, setRestockHistory] = useState([]);
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
    if (Array.isArray(result?.logs)) return result.logs;
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

  const getActionBadgeClass = (action) => {
    const actionMap = {
      "stock in": "stock-in",
      "stock_out": "stock-out",
      "stock out": "stock-out",
      "adjustment": "adjustment",
      "restock": "restock",
      "sale": "sale",
      "return": "return",
      "damage": "damage",
      "expired": "expired",
    };
    return actionMap[action?.toLowerCase()] || "adjustment";
  };

  // Fetch stock movement history
  const fetchStockHistory = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const response = await apiRequest("/inventory/stock/history");
      const stockData = normalizeList(response, ["data", "history", "logs"]);
      
      setStockHistory(stockData);
      setError("");
    } catch (err) {
      console.error("Failed to fetch stock history:", err);
      setError(err.message || "Failed to load stock history");
      setStockHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch monthly audit history
  const fetchAuditHistory = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const response = await apiRequest("/inventory/audit/history");
      const auditData = normalizeList(response, ["data", "history", "audits"]);
      
      setAuditHistory(auditData);
      setError("");
    } catch (err) {
      console.error("Failed to fetch audit history:", err);
      setError(err.message || "Failed to load audit history");
      setAuditHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch adjustment history
  const fetchAdjustmentHistory = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const response = await apiRequest("/inventory/adjustments/history");
      const adjustmentData = normalizeList(response, ["data", "history", "adjustments"]);
      
      setAdjustmentHistory(adjustmentData);
      setError("");
    } catch (err) {
      console.error("Failed to fetch adjustment history:", err);
      setError(err.message || "Failed to load adjustment history");
      setAdjustmentHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch restock history
  const fetchRestockHistory = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const response = await apiRequest("/inventory/restock/history");
      const restockData = normalizeList(response, ["data", "history", "restocks"]);
      
      setRestockHistory(restockData);
      setError("");
    } catch (err) {
      console.error("Failed to fetch restock history:", err);
      setError(err.message || "Failed to load restock history");
      setRestockHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case "stock":
        fetchStockHistory();
        break;
      case "audit":
        fetchAuditHistory();
        break;
      case "adjustments":
        fetchAdjustmentHistory();
        break;
      case "restock":
        fetchRestockHistory();
        break;
      default:
        break;
    }
  }, [activeTab, fetchStockHistory, fetchAuditHistory, fetchAdjustmentHistory, fetchRestockHistory]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = [];
    switch (activeTab) {
      case "stock":
        data = stockHistory;
        break;
      case "audit":
        data = auditHistory;
        break;
      case "adjustments":
        data = adjustmentHistory;
        break;
      case "restock":
        data = restockHistory;
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
        item.product_id,
        item.product_name,
        item.product,
        item.action,
        item.quantity,
        item.stock_before,
        item.stock_after,
        item.reason,
        item.performed_by,
        item.supplier,
        item.batch_number,
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchableFields.includes(searchLower);
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.created_at || a.date || a.timestamp || 0);
        const dateB = new Date(b.created_at || b.date || b.timestamp || 0);
        return dateB - dateA;
      }
      if (sortBy === "quantity") {
        const quantityA = Number(a.quantity || 0);
        const quantityB = Number(b.quantity || 0);
        return quantityB - quantityA;
      }
      return 0;
    });
  }, [activeTab, stockHistory, auditHistory, adjustmentHistory, restockHistory, searchTerm, sortBy]);

  const getActionIcon = (action) => {
    const actionLower = String(action || "").toLowerCase();
    if (actionLower.includes("in") || actionLower.includes("restock")) return faPlus;
    if (actionLower.includes("out") || actionLower.includes("sale")) return faMinus;
    return faEdit;
  };

  const handleRefresh = () => {
    switch (activeTab) {
      case "stock":
        fetchStockHistory({ silent: true });
        break;
      case "audit":
        fetchAuditHistory({ silent: true });
        break;
      case "adjustments":
        fetchAdjustmentHistory({ silent: true });
        break;
      case "restock":
        fetchRestockHistory({ silent: true });
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
      case "stock": return faBox;
      case "audit": return faClipboardList;
      case "adjustments": return faEdit;
      case "restock": return faPlus;
      default: return faWarehouse;
    }
  };

  const getTabLabel = (tab) => {
    switch (tab) {
      case "stock": return "Stock Movements";
      case "audit": return "Monthly Audits";
      case "adjustments": return "Adjustments";
      case "restock": return "Restock Records";
      default: return "History";
    }
  };

  if (loading) {
    return (
      <div className="inventory-history loading">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner" />
          <p>Loading inventory history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`inventory-history ${theme}`}>
      <div className="history-header">
        <div className="header-content">
          <h1>Inventory History</h1>
          <p>View stock movements, audits, adjustments, and restock records</p>
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
        {["stock", "audit", "adjustments", "restock"].map((tab) => (
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
              <option value="quantity">Sort by Quantity</option>
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
            <FontAwesomeIcon icon={faWarehouse} />
            <h3>No history found</h3>
            <p>
              {searchTerm 
                ? "Try adjusting your search terms." 
                : `${getTabLabel(activeTab)} history will appear here once records are generated.`
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
                    <span className={`action-badge ${getActionBadgeClass(record.action)}`}>
                      <FontAwesomeIcon icon={getActionIcon(record.action)} />
                      {record.action || "Unknown"}
                    </span>
                  </div>
                  <div className="record-date">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    {formatDate(record.created_at || record.date)} {formatTime(record.created_at || record.date)}
                  </div>
                </div>
                <div className="card-body">
                  <div className="record-details">
                    <div className="detail-row">
                      <span>Product:</span>
                      <strong>{record.product_name || record.product || "N/A"}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Quantity:</span>
                      <strong className={`quantity ${getActionBadgeClass(record.action)}`}>
                        {record.quantity > 0 ? '+' : ''}{record.quantity}
                      </strong>
                    </div>
                    {(record.stock_before !== undefined || record.stock_after !== undefined) && (
                      <div className="detail-row">
                        <span>Stock Change:</span>
                        <span>
                          {record.stock_before} → {record.stock_after}
                        </span>
                      </div>
                    )}
                    {record.reason && (
                      <div className="detail-row">
                        <span>Reason:</span>
                        <span className="reason-text">{record.reason}</span>
                      </div>
                    )}
                    {record.performed_by && (
                      <div className="detail-row">
                        <span>Performed By:</span>
                        <strong>{record.performed_by}</strong>
                      </div>
                    )}
                    {record.supplier && (
                      <div className="detail-row">
                        <span>Supplier:</span>
                        <strong>{record.supplier}</strong>
                      </div>
                    )}
                    {record.batch_number && (
                      <div className="detail-row">
                        <span>Batch:</span>
                        <strong>{record.batch_number}</strong>
                      </div>
                    )}
                    {activeTab === "audit" && (
                      <>
                        <div className="detail-row">
                          <span>Audit Period:</span>
                          <strong>{record.period || record.month || "N/A"}</strong>
                        </div>
                        <div className="detail-row">
                          <span>Status:</span>
                          <strong>{record.status || "N/A"}</strong>
                        </div>
                      </>
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
              <h3>Inventory Record Details</h3>
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

export default InventoryHistory;
