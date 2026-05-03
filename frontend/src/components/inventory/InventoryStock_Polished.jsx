import React, { useState, useEffect, useMemo } from "react";
import { inventoryApi } from "../../api/inventory";
import { formatCurrency } from "../../utils/currency";
import { exportToCSV } from "../../utils/reportExport";
import { demoItems } from "./inventoryData";
import StockAdjustmentModal from "./StockAdjustmentModal";
import { useNavigate } from "react-router-dom";
import "./InventoryStock_Polished.css";

const InventoryStock = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await inventoryApi.getItems();
        const apiItems = response.items || response.data || [];
        setItems(apiItems);
        setUsingDemoData(false);
      } catch (err) {
        console.error("Stock API failed, using demo:", err);
        // Only use demo data on API failure, not empty response
        setItems(demoItems);
        setUsingDemoData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Auto-refresh every 5 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await inventoryApi.getItems();
        const apiItems = response.items || response.data || [];

        if (apiItems.length > 0) {
          setItems(apiItems);
          setUsingDemoData(false);
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.log("Auto refresh failed");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Helper to get stock value from multiple possible field names
  const getStock = (item) => Number(item.stock ?? item.quantity ?? item.stock_quantity ?? item.current_stock ?? 0);

  // Calculate stats
  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + getStock(item), 0);
    const totalValue = items.reduce((sum, item) => sum + (getStock(item) * (item.price || 0)), 0);
    const lowStock = items.filter(item => getStock(item) <= 10 && getStock(item) > 0).length;
    const outOfStock = items.filter(item => getStock(item) === 0).length;
    const expiringSoon = items.filter(item => {
      if (!item.expiration) return false;
      const exp = new Date(item.expiration);
      const today = new Date();
      const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }).length;

    return { totalItems, totalQuantity, totalValue, lowStock, outOfStock, expiringSoon };
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        (item.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (item.sku?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (item.brand?.toLowerCase() || "").includes(search.toLowerCase());
      
      const matchesStatus = 
        filterStatus === "all" || 
        (filterStatus === "low" && getStock(item) <= 10 && getStock(item) > 0) ||
        (filterStatus === "out" && getStock(item) === 0) ||
        (filterStatus === "good" && getStock(item) > 10);
      
      return matchesSearch && matchesStatus;
    });
  }, [items, search, filterStatus]);

  // Export to CSV
  const handleExportCSV = () => {
    const columns = [
      { key: "name", label: "Product Name" },
      { key: "sku", label: "SKU" },
      { key: "brand", label: "Brand" },
      { key: "supplier", label: "Supplier" },
      { key: "category", label: "Category" },
      { key: "quantity", label: "Stock Level" },
      { key: "price", label: "Price" },
      { key: "status", label: "Status" },
      { key: "expiration", label: "Expiration" },
    ];
    exportToCSV(filteredItems, columns, "stock-management");
  };

  // Get status badge
  const getStatusBadge = (quantity) => {
    if (quantity === 0) {
      return { class: "status-out", label: "Out of Stock", icon: "⚠️" };
    }
    if (quantity <= 10) {
      return { class: "status-low", label: "Low Stock", icon: "🔔" };
    }
    return { class: "status-good", label: "In Stock", icon: "✅" };
  };

  // Smart stock color bar - percentage based
  const getQuantityBar = (quantity) => {
    const maxStock = 100; // Reference max stock
    const percentage = Math.min((quantity / maxStock) * 100, 100);

    if (quantity === 0) return { width: "0%", color: "#ef4444", percentage: 0 };
    if (percentage <= 10) return { width: `${percentage}%`, color: "#ef4444", percentage };
    if (percentage <= 30) return { width: `${percentage}%`, color: "#f59e0b", percentage };
    if (percentage <= 60) return { width: `${percentage}%`, color: "#3b82f6", percentage };
    return { width: `${percentage}%`, color: "#10b981", percentage };
  };

  // Top moving products
  const topMovingItems = useMemo(() => {
    return [...items]
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 5);
  }, [items]);

  // Handle adjust stock
  const handleAdjustClick = (item) => {
    setSelectedItem(item);
    setShowAdjustModal(true);
  };

  const handleAdjustSuccess = async () => {
    // Refresh items after adjustment
    try {
      const response = await inventoryApi.getItems();
      const apiItems = response.items || response.data || [];
      setItems(apiItems);
      setUsingDemoData(false);
    } catch (err) {
      console.error("Stock refresh failed:", err);
    }
    // Close modal and clear selection
    setShowAdjustModal(false);
    setSelectedItem(null);
  };

  // Notification helper function
  const createInventoryNotification = async (item, type) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:8000/api"}/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title:
            type === "out"
              ? "Out of Stock Alert"
              : "Low Stock Alert",
          message:
            type === "out"
              ? `${item.name} is out of stock.`
              : `${item.name} is running low. Current stock: ${getStock(item)}`,
          module: "Inventory",
          type,
          priority: type === "out" ? "high" : "medium",
          reference_id: item.id,
        }),
      });
    } catch (error) {
      console.error("Failed to create inventory notification:", error);
    }
  };

  // Auto-notification checker for low/out of stock
  useEffect(() => {
    if (!items.length) return;

    const notified = JSON.parse(
      localStorage.getItem("inventoryNotifiedItems") || "{}"
    );

    items.forEach((item) => {
      const quantity = getStock(item);

      if (quantity === 0 && notified[item.id] !== "out") {
        createInventoryNotification(item, "out");
        notified[item.id] = "out";
      }

      if (quantity > 0 && quantity <= 10 && notified[item.id] !== "low") {
        createInventoryNotification(item, "low");
        notified[item.id] = "low";
      }

      if (quantity > 10 && notified[item.id]) {
        delete notified[item.id];
      }
    });

    localStorage.setItem("inventoryNotifiedItems", JSON.stringify(notified));
  }, [items]);

  return (
    <div className="inventory-stock-page polished">
      {/* Header */}
      <div className="stock-header">
        <div className="header-title">
          <h2>Stock Management</h2>
          <p>Monitor inventory levels, track expirations, and adjust stock</p>
          {usingDemoData && <span className="demo-badge">Demo Mode</span>}
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={handleExportCSV}>
            📥 Export CSV
          </button>
          <button className="btn-add-item" onClick={() => navigate("/inventory/management")}>
            ➕ Add Item
          </button>
          <button className="btn-view-reports" onClick={() => navigate("/inventory/reports")}>
            📊 View Reports
          </button>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {stats.outOfStock > 0 && (
        <div className="critical-alert-banner">
          ⚠️ <strong>{stats.outOfStock}</strong> items are OUT OF STOCK — Immediate attention required!
        </div>
      )}

      {/* Real-time indicator */}
      <div className="realtime-indicator">
        <span className="live-dot"></span>
        Live updates • Last synced: {lastUpdated.toLocaleTimeString()}
      </div>

      {/* Stats Cards */}
      <div className="stock-stats">
        <div className="stat-card total">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalItems}</span>
            <span className="stat-label">Total Products</span>
          </div>
        </div>
        <div className="stat-card quantity">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalQuantity}</span>
            <span className="stat-label">Total Units</span>
          </div>
        </div>
        <div className="stat-card value">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(stats.totalValue)}</span>
            <span className="stat-label">Stock Value</span>
          </div>
        </div>
        <div className="stat-card low">
          <div className="stat-icon">🔔</div>
          <div className="stat-info">
            <span className="stat-value">{stats.lowStock}</span>
            <span className="stat-label">Low Stock</span>
          </div>
        </div>
        <div className="stat-card out">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <span className="stat-value">{stats.outOfStock}</span>
            <span className="stat-label">Out of Stock</span>
          </div>
        </div>
        <div className="stat-card expiring">
          <div className="stat-icon">⏰</div>
          <div className="stat-info">
            <span className="stat-value">{stats.expiringSoon}</span>
            <span className="stat-label">Expiring Soon</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="stock-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by product, SKU, or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="good">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="stock-table-container">
        {loading ? (
          <div className="table-loading">
            <div className="spinner"></div>
            <p>Loading stock...</p>
          </div>
        ) : (
          <>
            <table className="stock-table polished">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock Level</th>
                  <th className="numeric">Qty</th>
                  <th>Expiration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const stockValue = getStock(item);
                  const badge = getStatusBadge(stockValue);
                  const bar = getQuantityBar(stockValue);
                  const isExpiring = item.expiration && new Date(item.expiration) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <tr key={item.id} className={badge.class}>
                      <td>
                        <div className="product-cell">
                          <span className="product-name">{item.name}</span>
                          <span className="product-brand">{item.brand || "No Brand"}</span>
                        </div>
                      </td>
                      <td>
                        <code className="sku-code">{item.sku}</code>
                      </td>
                      <td>
                        <div className="stock-level">
                          <div className="stock-bar-bg">
                            <div 
                              className="stock-bar-fill" 
                              style={{ width: bar.width, backgroundColor: bar.color }}
                            ></div>
                          </div>
                          <small className="stock-percentage">{Math.round(bar.percentage)}%</small>
                        </div>
                      </td>
                      <td className="numeric">
                        <span className="quantity-value">{stockValue}</span>
                      </td>
                      <td>
                        <span className={`expiration ${isExpiring ? "expiring-soon" : ""}`}>
                          {item.expiration || "N/A"}
                          {isExpiring && " ⚠️"}
                        </span>
                        {item.last_updated && (
                          <small className="last-updated">
                            Updated: {new Date(item.last_updated).toLocaleTimeString()}
                          </small>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${badge.class}`}>
                          <span className="badge-icon">{badge.icon}</span>
                          {badge.label}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-adjust"
                          onClick={() => handleAdjustClick(item)}
                        >
                          ⚖️ Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredItems.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No stock items found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Top Moving Items Section */}
      {topMovingItems.length > 0 && (
        <div className="top-moving-section">
          <h3>🔥 Top Moving Products</h3>
          <div className="top-moving-grid">
            {topMovingItems.map((item) => (
              <div key={item.id} className="top-moving-card">
                <span className="moving-name">{item.name}</span>
                <span className="moving-sold">{item.sold || 0} sold</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      <StockAdjustmentModal
        isOpen={showAdjustModal}
        onClose={() => {
          setShowAdjustModal(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onSuccess={handleAdjustSuccess}
      />
    </div>
  );
};

export default InventoryStock;
