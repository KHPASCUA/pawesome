import React, { useState, useEffect, useMemo } from "react";
import { inventoryItems as demoItems } from "./inventoryData";
import { inventoryApi } from "../../api/inventory";
import { formatCurrency } from "../../utils/currency";
import { exportToCSV } from "../../utils/reportExport";
import "./InventoryStock_Polished.css";

const InventoryStock = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustData, setAdjustData] = useState({ quantity: "", reason: "" });

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await inventoryApi.getItems();
        const apiItems = response.items || response.data || [];
        
        if (apiItems.length > 0) {
          setItems(apiItems);
          setUsingDemoData(false);
        } else {
          // Empty API response - use demo for presentation
          setItems(demoItems);
          setUsingDemoData(true);
        }
      } catch (err) {
        console.error("Stock API failed, using demo:", err);
        setItems(demoItems);
        setUsingDemoData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);
    const lowStock = items.filter(item => (item.quantity || 0) <= 10 && (item.quantity || 0) > 0).length;
    const outOfStock = items.filter(item => (item.quantity || 0) === 0).length;
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
        (filterStatus === "low" && (item.quantity || 0) <= 10 && (item.quantity || 0) > 0) ||
        (filterStatus === "out" && (item.quantity || 0) === 0) ||
        (filterStatus === "good" && (item.quantity || 0) > 10);
      
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

  // Get quantity bar color
  const getQuantityBar = (quantity) => {
    if (quantity === 0) return { width: "0%", color: "#ef4444" };
    if (quantity <= 10) return { width: "25%", color: "#f59e0b" };
    if (quantity <= 50) return { width: "50%", color: "#3b82f6" };
    return { width: "100%", color: "#10b981" };
  };

  // Handle adjust stock
  const handleAdjustClick = (item) => {
    setSelectedItem(item);
    setAdjustData({ quantity: "", reason: "" });
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const adjustQty = parseInt(adjustData.quantity) || 0;
    
    if (usingDemoData) {
      // Demo mode: update locally
      setItems(prev => prev.map(item => 
        item.id === selectedItem.id 
          ? { ...item, quantity: Math.max(0, (item.quantity || 0) + adjustQty) }
          : item
      ));
    } else {
      try {
        await inventoryApi.adjustStock(selectedItem.id, adjustQty, adjustData.reason);
        // Refresh items
        const response = await inventoryApi.getItems();
        setItems(response.items || response.data || []);
      } catch (err) {
        alert("Failed to adjust stock. Please try again.");
        return;
      }
    }
    
    setShowAdjustModal(false);
    setSelectedItem(null);
  };

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
        </div>
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

      {/* Loading */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading stock...</p>
        </div>
      )}

      {/* Stock Table */}
      <div className="stock-table-container">
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
              const badge = getStatusBadge(item.quantity || 0);
              const bar = getQuantityBar(item.quantity || 0);
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
                    </div>
                  </td>
                  <td className="numeric">
                    <span className="quantity-value">{item.quantity || 0}</span>
                  </td>
                  <td>
                    <span className={`expiration ${isExpiring ? "expiring-soon" : ""}`}>
                      {item.expiration || "N/A"}
                      {isExpiring && " ⚠️"}
                    </span>
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

        {filteredItems.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No stock items found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowAdjustModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-icon">⚖️</div>
                <div>
                  <h3>Adjust Stock</h3>
                  <p>{selectedItem.name}</p>
                </div>
              </div>
              <button className="btn-close" onClick={() => setShowAdjustModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleAdjustSubmit}>
              <div className="modal-body">
                <div className="current-stock">
                  <span>Current Stock: <strong>{selectedItem.quantity || 0} units</strong></span>
                </div>
                
                <div className="form-group">
                  <label>
                    Adjustment <span className="hint">(+ to add, - to remove)</span>
                  </label>
                  <div className="input-with-icon">
                    <input
                      type="number"
                      value={adjustData.quantity}
                      onChange={(e) => setAdjustData(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="e.g., +10 or -5"
                      required
                      autoFocus
                    />
                    <span className="input-suffix">units</span>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Reason</label>
                  <select
                    value={adjustData.reason}
                    onChange={(e) => setAdjustData(prev => ({ ...prev, reason: e.target.value }))}
                    required
                  >
                    <option value="">Select reason...</option>
                    <option value="New stock received">New stock received</option>
                    <option value="Damaged/Expired">Damaged/Expired</option>
                    <option value="Correction">Correction</option>
                    <option value="Return">Return</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAdjustModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryStock;
