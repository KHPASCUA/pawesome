import React, { useState, useEffect } from "react";
import { inventoryApi } from "../../api/inventory";
import { generateInventoryAuditPdf } from "../../utils/inventoryAuditPdf";
import "./StockLogsViewer.css";

const StockLogsViewer = ({ itemId = null, filterAction = null, search = null }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, adjustment, sale, restock
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Use external props if provided, otherwise use internal state
  const activeFilter = filterAction !== null ? filterAction.toLowerCase().replace(" ", "_") : filter;
  const activeSearch = search !== null ? search : searchTerm;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const params = itemId ? { itemId } : {};
        const response = await inventoryApi.getStockHistory(params);
        const logsData = response.history || response.data || response || [];
        setLogs(logsData);
      } catch (err) {
        console.error("Failed to fetch stock logs:", err);
        setLogs([
          {
            id: 1,
            inventory_item_id: 1,
            item_name: "Premium Dog Food",
            action: "restock",
            quantity_change: 50,
            quantity_before: 0,
            quantity_after: 50,
            reason: "Initial stock",
            created_at: new Date().toISOString(),
            user_name: "Admin",
          },
          {
            id: 2,
            inventory_item_id: 2,
            item_name: "Cat Shampoo",
            action: "adjustment",
            quantity_change: -2,
            quantity_before: 10,
            quantity_after: 8,
            reason: "Damaged items",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            user_name: "Inventory Manager",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [itemId]);

  // Auto reorder trigger for low stock items
  const checkAutoReorder = async () => {
    try {
      const response = await inventoryApi.getLowStockAlerts();
      const lowStockItems = response.data || response.items || [];

      for (const item of lowStockItems) {
        const stock = Number(item.stock || item.quantity || 0);
        const reorderLevel = Number(item.reorder_level || 10);

        if (stock <= reorderLevel && stock > 0) {
          await inventoryApi.createReorderRequest({
            item_id: item.id,
            item_name: item.name,
            sku: item.sku,
            suggested_quantity: reorderLevel * 2,
            current_stock: stock,
            reorder_level: reorderLevel,
            priority: stock === 0 ? "critical" : "high",
            status: "pending",
          });
          console.log(`Auto reorder triggered for ${item.name}`);
        }
      }
    } catch (err) {
      console.error("Auto reorder failed:", err);
    }
  };

  // Run auto reorder when logs load
  useEffect(() => {
    if (!loading && logs.length > 0) {
      checkAutoReorder();
    }
  }, [logs, loading]);

  const refreshLogs = async () => {
    setLoading(true);
    try {
      const params = itemId ? { itemId } : {};
      const response = await inventoryApi.getStockHistory(params);
      const logsData = response.history || response.data || response || [];
      setLogs(logsData);
    } catch (err) {
      console.error("Failed to refresh stock logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredLogs = () => {
    return logs.filter((log) => {
      // Filter by action type (use external prop if provided)
      if (activeFilter !== "all" && log.action !== activeFilter) return false;

      // Filter by search term (use external prop if provided)
      if (activeSearch) {
        const searchLower = activeSearch.toLowerCase();
        const searchable = [
          log.item_name,
          log.reason,
          log.user_name,
          log.action,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!searchable.includes(searchLower)) return false;
      }

      // Filter by date range
      if (dateRange.start) {
        const logDate = new Date(log.created_at);
        const startDate = new Date(dateRange.start);
        if (logDate < startDate) return false;
      }
      if (dateRange.end) {
        const logDate = new Date(log.created_at);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59);
        if (logDate > endDate) return false;
      }

      return true;
    });
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "restock":
        return "📦";
      case "sale":
        return "💰";
      case "adjustment":
        return "📝";
      case "remove":
        return "🗑️";
      case "expired":
        return "⚠️";
      default:
        return "📝";
    }
  };

  const getActionColor = (action, quantityChange) => {
    if (quantityChange > 0) return "positive";
    if (quantityChange < 0) return "negative";
    return "neutral";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const calculateStats = () => {
    const filtered = getFilteredLogs();
    const additions = filtered
      .filter((l) => l.quantity_change > 0)
      .reduce((sum, l) => sum + l.quantity_change, 0);
    const removals = filtered
      .filter((l) => l.quantity_change < 0)
      .reduce((sum, l) => sum + Math.abs(l.quantity_change), 0);
    const adjustments = filtered.filter((l) => l.action === "adjustment").length;

    return { additions, removals, adjustments, total: filtered.length };
  };

  const getItemName = (log) =>
  log.item_name ||
  log.inventory_item?.name ||
  log.inventoryItem?.name ||
  log.product_name ||
  log.name ||
  `Item #${log.inventory_item_id || log.item_id}`;

const getItemSku = (log) =>
  log.item_sku ||
  log.inventory_item?.sku ||
  log.inventoryItem?.sku ||
  log.sku ||
  "No SKU";

const getItemImage = (log) =>
  log.item_image ||
  log.image ||
  log.inventory_item?.image ||
  log.inventoryItem?.image ||
  null;

const getUserName = (log) =>
  log.user_name ||
  log.user?.name ||
  log.performed_by ||
  "System";

const getInitials = (name) =>
  String(name || "S")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const stats = calculateStats();
  const filteredLogs = getFilteredLogs();

  return (
    <div className="stock-logs-viewer">
      {/* Header with Stats */}
      <div className="logs-header">
        <div className="logs-title">
          <h3>📊 Stock Activity Log</h3>
          <p>Track all inventory changes and adjustments</p>
        </div>
        <button className="btn-refresh" onClick={refreshLogs} disabled={loading}>
          {loading ? "⟳" : "🔄"} Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="logs-stats">
        <div className="stat-card additions">
          <span className="stat-icon">📥</span>
          <div className="stat-info">
            <span className="stat-value">+{stats.additions}</span>
            <span className="stat-label">Stock Added</span>
          </div>
        </div>
        <div className="stat-card removals">
          <span className="stat-icon">📤</span>
          <div className="stat-info">
            <span className="stat-value">-{stats.removals}</span>
            <span className="stat-label">Stock Removed</span>
          </div>
        </div>
        <div className="stat-card adjustments">
          <span className="stat-icon">📝</span>
          <div className="stat-info">
            <span className="stat-value">{stats.adjustments}</span>
            <span className="stat-label">Adjustments</span>
          </div>
        </div>
        <div className="stat-card total">
          <span className="stat-icon">📋</span>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Entries</span>
          </div>
        </div>
      </div>

      {/* Analytics Panel */}
      <div className="logs-analytics">
        <h4>📈 Activity Overview</h4>
        <div className="analytics-row">
          <div>
            <strong>Most Active Item:</strong>{" "}
            {filteredLogs[0]?.item_name || filteredLogs[0]?.product_name || filteredLogs[0]?.name || filteredLogs[0]?.inventory_name || "N/A"}
          </div>
          <div>
            <strong>Top User:</strong>{" "}
            {
              Object.entries(
                filteredLogs.reduce((acc, log) => {
                  acc[log.user_name || "System"] = (acc[log.user_name || "System"] || 0) + 1;
                  return acc;
                }, {})
              ).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"
            }
          </div>
          <div>
            <strong>Net Change:</strong>{" "}
            {stats.additions - stats.removals > 0 ? "+" : ""}
            {stats.additions - stats.removals}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="logs-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="🔍 Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Actions</option>
            <option value="restock">📦 Restock</option>
            <option value="sale">💰 Sale</option>
            <option value="adjustment">📝 Adjustment</option>
            <option value="remove">🗑️ Removal</option>
            <option value="expired">⚠️ Expired</option>
          </select>
        </div>

        <div className="filter-group date-range">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
            placeholder="From"
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
            placeholder="To"
          />
        </div>

        <button
          className="btn-clear-filters"
          onClick={() => {
            setFilter("all");
            setSearchTerm("");
            setDateRange({ start: "", end: "" });
          }}
        >
          Clear
        </button>

        <button
          className="btn-export"
          onClick={() => generateInventoryAuditPdf(filteredLogs)}
          disabled={filteredLogs.length === 0}
          title="Export audit report as PDF"
        >
          🖨 Export PDF
        </button>
      </div>

      {/* Logs List */}
      <div className="logs-list-container">
        {loading ? (
          <div className="logs-loading">
            <div className="spinner"></div>
            <p>Loading stock logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="logs-empty">
            <span className="empty-icon">📭</span>
            <h4>No logs found</h4>
            <p>Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          <div className="logs-list">
            {filteredLogs.map((log) => (
              <div key={log.id} className={`log-item ${log.action}`}>
              <div className="log-product-media">
                {getItemImage(log) ? (
                  <img src={getItemImage(log)} alt={getItemName(log)} />
                ) : (
                  <span>{getActionIcon(log.action)}</span>
                )}
              </div>

              <div className="log-content">
                <div className="log-header">
                  <div>
                    <span className="log-item-name">
                      {getItemName(log)}
                      <span className="audit-badge">AUDIT LOG</span>
                    </span>
                    <div className="log-sku">{getItemSku(log)}</div>
                  </div>

                  <span className="log-time">{formatDate(log.created_at)}</span>
                </div>

                <div className="log-details">
                  <span className={`log-quantity ${getActionColor(log.action, log.quantity_change)}`}>
                    {Number(log.quantity_change) > 0 ? "+" : ""}
                    {log.quantity_change} units
                  </span>
                  <span className="log-arrow">→</span>
                  <span className="log-after">{log.quantity_after} total</span>
                  <span className="log-action">{log.action}</span>
                </div>

                <div className="log-bottom-row">
                  <div className="log-reason">
                    <span className="reason-label">Reason:</span>
                    <span className="reason-text">{log.reason || "No reason provided"}</span>
                  </div>

                  <div className="log-user-pill">
                    <span className="log-user-avatar">{getInitials(getUserName(log))}</span>
                    <span>{getUserName(log)}</span>
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {filteredLogs.length > 0 && (
        <div className="logs-footer">
          <p>
            Showing <strong>{filteredLogs.length}</strong> of <strong>{logs.length}</strong>{" "}
            total entries
          </p>
        </div>
      )}
    </div>
  );
};

export default StockLogsViewer;
