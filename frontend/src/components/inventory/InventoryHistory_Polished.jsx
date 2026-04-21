import React, { useState, useEffect, useMemo } from "react";
import { inventoryHistory as demoHistory } from "./inventoryData";
import { inventoryApi } from "../../api/inventory";
import "./InventoryHistory_Polished.css";

const InventoryHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  // Fetch history from API
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await inventoryApi.getStockHistory();
        const apiHistory = response.history || response.data || [];
        
        if (apiHistory.length > 0) {
          setHistory(apiHistory);
          setUsingDemoData(false);
        } else {
          // API returned empty - use demo for presentation
          setHistory(demoHistory);
          setUsingDemoData(true);
        }
      } catch (err) {
        console.error("History API failed, using demo:", err);
        setHistory(demoHistory);
        setUsingDemoData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Get unique actions for filter
  const actions = useMemo(() => {
    const uniqueActions = [...new Set(history.map(h => h.action))];
    return uniqueActions.filter(Boolean);
  }, [history]);

  // Filter history
  const filteredHistory = useMemo(() => {
    return history.filter(event => {
      const matchesSearch = 
        (event.product?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (event.user?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (event.note?.toLowerCase() || "").includes(search.toLowerCase());
      
      const matchesAction = filterAction === "all" || event.action === filterAction;
      
      return matchesSearch && matchesAction;
    });
  }, [history, search, filterAction]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalEvents = history.length;
    const additions = history.filter(h => h.action?.toLowerCase().includes("add") || h.quantity > 0).length;
    const removals = history.filter(h => h.action?.toLowerCase().includes("remove") || h.action?.toLowerCase().includes("sale") || h.quantity < 0).length;
    const adjustments = history.filter(h => h.action?.toLowerCase().includes("adjust")).length;
    
    return { totalEvents, additions, removals, adjustments };
  }, [history]);

  // Get action badge style
  const getActionBadge = (action, quantity) => {
    const actionLower = (action || "").toLowerCase();
    
    if (actionLower.includes("add") || actionLower.includes("restock") || quantity > 0) {
      return { class: "action-add", icon: "📥", label: "Stock In" };
    }
    if (actionLower.includes("remove") || actionLower.includes("sale") || quantity < 0) {
      return { class: "action-remove", icon: "📤", label: "Stock Out" };
    }
    if (actionLower.includes("adjust")) {
      return { class: "action-adjust", icon: "⚖️", label: "Adjusted" };
    }
    return { class: "action-default", icon: "📝", label: action || "Updated" };
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="inventory-history-page polished">
      {/* Header */}
      <div className="history-header">
        <div className="header-title">
          <h2>Stock Movement History</h2>
          <p>Track all inventory changes, restocks, and transactions</p>
          {usingDemoData && <span className="demo-badge">Demo Mode</span>}
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={() => alert("Export feature coming soon!")}>
            📥 Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="history-stats">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalEvents}</span>
            <span className="stat-label">Total Events</span>
          </div>
        </div>
        <div className="stat-card additions">
          <div className="stat-icon">📥</div>
          <div className="stat-info">
            <span className="stat-value">{stats.additions}</span>
            <span className="stat-label">Stock In</span>
          </div>
        </div>
        <div className="stat-card removals">
          <div className="stat-icon">📤</div>
          <div className="stat-info">
            <span className="stat-value">{stats.removals}</span>
            <span className="stat-label">Stock Out</span>
          </div>
        </div>
        <div className="stat-card adjustments">
          <div className="stat-icon">⚖️</div>
          <div className="stat-info">
            <span className="stat-value">{stats.adjustments}</span>
            <span className="stat-label">Adjustments</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by product, user, or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
            <option value="all">All Actions</option>
            {actions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      )}

      {/* History Table */}
      <div className="history-table-container">
        <table className="history-table polished">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Product</th>
              <th>Action</th>
              <th className="numeric">Quantity</th>
              <th>User</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((event) => {
              const badge = getActionBadge(event.action, event.quantity);
              return (
                <tr key={event.id}>
                  <td>
                    <div className="date-cell">
                      <span className="date">{formatDate(event.date || event.created_at)}</span>
                      <span className="time">{formatTime(event.date || event.created_at)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="product-name">{event.product || event.item_name || "Unknown Product"}</span>
                  </td>
                  <td>
                    <span className={`action-badge ${badge.class}`}>
                      <span className="badge-icon">{badge.icon}</span>
                      {badge.label}
                    </span>
                  </td>
                  <td className={`numeric ${event.quantity > 0 ? "positive" : event.quantity < 0 ? "negative" : ""}`}>
                    {event.quantity > 0 ? `+${event.quantity}` : event.quantity}
                  </td>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{(event.user || "?")[0]?.toUpperCase()}</div>
                      <span className="user-name">{event.user || "System"}</span>
                    </div>
                  </td>
                  <td>
                    <span className="note-text">{event.note || "-"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredHistory.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">📜</div>
            <h3>No history found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryHistory;
