import React, { useState, useEffect, useMemo } from "react";
import { inventoryApi } from "../../api/inventory";
import { normalizeList } from "../../api/client";
import { exportToCSV } from "../../utils/reportExport";
import StockAdjustmentModal from "./StockAdjustmentModal";
import { useNavigate } from "react-router-dom";
import "./InventoryStock_Polished.css";

const InventoryStock = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockError, setStockError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Batch view state
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [itemBatches, setItemBatches] = useState({});
  const [loadingBatches, setLoadingBatches] = useState({});

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await inventoryApi.getItems();
        const apiItems = normalizeList(response, ["items", "data"]);
        setItems(apiItems);
        setStockError("");
      } catch (err) {
        setItems([]);
        setStockError(err.message || "Failed to load live stock records.");
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
        const apiItems = normalizeList(response, ["items", "data"]);

        setItems(apiItems);
        setStockError("");
        setLastUpdated(new Date());
      } catch {
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Helper to get stock quantity from multiple possible field names
  const getStock = (item) => {
    const val = item?.stock ?? item?.quantity ?? item?.stock_quantity ?? item?.current_stock ?? 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  // Fetch batches for an item
  const fetchItemBatches = async (itemId) => {
    if (itemBatches[itemId]) return; // Already loaded
    
    setLoadingBatches(prev => ({ ...prev, [itemId]: true }));
    try {
      const response = await inventoryApi.getItemBatches(itemId);
      if (response.success) {
        setItemBatches(prev => ({ ...prev, [itemId]: response.batches }));
      }
    } catch (err) {
      console.error(`Failed to fetch batches for item ${itemId}:`, err);
    } finally {
      setLoadingBatches(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Toggle batch view for item
  const toggleBatchView = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
      fetchItemBatches(itemId);
    }
    setExpandedItems(newExpanded);
  };

  
  // Filter out service items from stock management
  const physicalItems = useMemo(() => {
    return items.filter((item) => {
      const category = String(item.category || "").toLowerCase();
      const type = String(item.type || item.item_type || "").toLowerCase();

      return (
        category !== "services" &&
        category !== "service" &&
        type !== "service"
      );
    });
  }, [items]);

  // Statistics
  const stats = useMemo(() => {
    const totalItems = physicalItems.length;
    const totalQuantity = physicalItems.reduce((sum, item) => sum + getStock(item), 0);
    const lowStock = physicalItems.filter(
      (item) => getStock(item) <= 10 && getStock(item) > 0
    ).length;

    const outOfStock = physicalItems.filter(
      (item) => getStock(item) === 0
    ).length;

    return {
      totalItems,
      totalQuantity,
      lowStock,
      outOfStock,
    };
  }, [physicalItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    return physicalItems.filter(item => {
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
  }, [physicalItems, search, filterStatus]);

  // Export to CSV
  const handleExportCSV = () => {
    const columns = [
      { key: "name", label: "Product Name" },
      { key: "sku", label: "SKU" },
      { key: "brand", label: "Brand" },
      { key: "supplier", label: "Supplier" },
      { key: "category", label: "Category" },
      { key: "quantity", label: "Qty" },
      { key: "price", label: "Price" },
      { key: "status", label: "Status" },
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

  // Top moving products
  const topMovingItems = useMemo(() => {
    return [...physicalItems]
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 5);
  }, [physicalItems]);

  // Handle adjust stock
  const handleAdjustClick = (item) => {
    setSelectedItem(item);
    setShowAdjustModal(true);
  };

  const handleAdjustSuccess = async () => {
    // Refresh items after adjustment
    try {
      const response = await inventoryApi.getItems();
      const apiItems = normalizeList(response, ["items", "inventory", "inventory_items", "data"]);
      setItems(apiItems);
    } catch (err) {
      setStockError(err.message || "Failed to refresh live stock records.");
    }
    // Close modal and clear selection
    setShowAdjustModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="inventory-stock-page polished">
      {/* Header */}
      <div className="stock-header">
        <div className="header-title">
          <h2>Stock Management</h2>
          <p>Monitor inventory levels, stock status, and adjustments</p>
          {stockError && <span className="demo-badge">No live records</span>}
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
                  <th></th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th className="numeric">Qty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const stockValue = getStock(item);
                  const badge = getStatusBadge(stockValue);
                  const isExpanded = expandedItems.has(item.id);
                  const batches = itemBatches[item.id] || [];
                  const loadingBatch = loadingBatches[item.id];
                  
                  return (
                    <React.Fragment key={item.id}>
                      <tr className={badge.class}>
                        <td>
                          <button 
                            className="btn-expand"
                            onClick={() => toggleBatchView(item.id)}
                            title={isExpanded ? "Hide batches" : "View batches"}
                          >
                            {isExpanded ? "▼" : "▶"}
                          </button>
                        </td>
                        <td>
                          <div className="product-cell">
                            <span className="product-name">{item.name}</span>
                            <span className="product-brand">{item.brand || "No Brand"}</span>
                            {item.category && (
                              <small className="product-category">{item.category}</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <code className="sku-code">{item.sku}</code>
                        </td>
                        <td className="numeric">
                          <span className="quantity-value">{stockValue}</span>
                          {batches.length > 0 && (
                            <small className="batch-count">({batches.filter(b => b.status === 'active').length} batches)</small>
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
                      
                      {/* Batch Details Row */}
                      {isExpanded && (
                        <tr className="batch-row">
                          <td colSpan="6">
                            <div className="batch-details">
                              <h4>📦 Batch Inventory</h4>
                              {loadingBatch ? (
                                <div className="batch-loading">Loading batches...</div>
                              ) : batches.length > 0 ? (
                                <table className="batch-table">
                                  <thead>
                                    <tr>
                                      <th>Batch No</th>
                                      <th>Received</th>
                                      <th>Quantity</th>
                                      <th>Remaining</th>
                                      <th>Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {batches.map((batch) => {
                                      return (
                                        <tr key={batch.id} className={`batch-${batch.status}`}>
                                          <td><code>{batch.batch_no}</code></td>
                                          <td>{new Date(batch.received_date).toLocaleDateString()}</td>
                                          <td>{batch.quantity}</td>
                                          <td className={batch.remaining_quantity === 0 ? 'depleted' : ''}>
                                            {batch.remaining_quantity}
                                          </td>
                                          <td>
                                            <span className={`batch-status ${batch.status}`}>{batch.status}</span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              ) : (
                                <div className="no-batches">
                                  <p>No batch tracking for this item. Stock is managed as total quantity only.</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
