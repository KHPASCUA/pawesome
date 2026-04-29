import React, { useMemo, useState, useEffect } from "react";
import { inventoryApi } from "../../api/inventory";
import { demoItems } from "./inventoryData";
import AddProductModal from "./AddProductModal";
import PremiumToast from "../shared/PremiumToast";
import DeleteConfirmModal from "../shared/DeleteConfirmModal";
import "./InventoryProducts_Advanced.css";
import { formatCurrency } from "../../utils/currency";

const InventoryProducts = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usingDemoData, setUsingDemoData] = useState(false);
  
  // Advanced features states
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    brand: "all",
    supplier: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [reorderLoading, setReorderLoading] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  // Delete confirmation state
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    item: null,
    loading: false,
  });

  // Fetch items from API - ONLY use demo on complete API failure
  const fetchItems = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const response = await inventoryApi.getItems();
      const apiItems = response.items || response.data || [];
      
      // Use API data even if empty (that's real data state)
      setItems(apiItems);
      setUsingDemoData(false);
      return true; // Success
    } catch (err) {
      console.error("API fetch failed, using demo fallback:", err);
      setItems(demoItems);
      setUsingDemoData(true);
      return false; // Failed
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Fetch items on mount and auto-refresh every 30 seconds for live data
  useEffect(() => {
    fetchItems();
    
    const interval = setInterval(() => {
      fetchItems(false); // Silent refresh without loading spinner
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Get unique values for filters
  const categories = useMemo(() => [...new Set(items.map(i => i.category).filter(Boolean))], [items]);
  const brands = useMemo(() => [...new Set(items.map(i => i.brand).filter(Boolean))], [items]);
  const suppliers = useMemo(() => [...new Set(items.map(i => i.supplier).filter(Boolean))], [items]);
  const statuses = ["In stock", "Low stock", "Out of stock"];

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = items;
    
    // Search filter
    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter((item) => {
        return [item.name, item.sku, item.brand, item.supplier, item.category]
          .some((value) => (value || "").toLowerCase().includes(query));
      });
    }
    
    // Category filter
    if (filters.category !== "all") {
      result = result.filter(item => item.category === filters.category);
    }
    
    // Status filter
    if (filters.status !== "all") {
      result = result.filter(item => item.status === filters.status);
    }
    
    // Brand filter
    if (filters.brand !== "all") {
      result = result.filter(item => item.brand === filters.brand);
    }
    
    // Supplier filter
    if (filters.supplier !== "all") {
      result = result.filter(item => item.supplier === filters.supplier);
    }
    
    // Sorting
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
        
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }
    
    return result;
  }, [search, items, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // AI Reorder Suggestions - Smart detection for low stock items
  const reorderSuggestions = useMemo(() => {
    return items
      .filter((item) => {
        const qty = Number(item.quantity || item.stock || item.stock_quantity || 0);
        const reorderLevel = Number(item.reorder_level || item.minStock || 10);
        return qty <= reorderLevel;
      })
      .map((item) => {
        const qty = Number(item.quantity || item.stock || item.stock_quantity || 0);
        const reorderLevel = Number(item.reorder_level || item.minStock || 10);
        const suggestedQty = Math.max(reorderLevel * 2 - qty, reorderLevel);

        let priority = "low";
        if (qty === 0) priority = "critical";
        else if (qty <= reorderLevel / 2) priority = "high";

        return {
          ...item,
          quantity: qty,
          reorder_level: reorderLevel,
          suggestedQty,
          priority,
        };
      })
      .sort((a, b) => {
        const order = { critical: 1, high: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      });
  }, [items]);

  const handleAutoReorder = async (item) => {
    try {
      setReorderLoading(item.id);

      await inventoryApi.createReorderRequest({
        item_id: item.id,
        item_name: item.name,
        sku: item.sku,
        suggested_quantity: item.suggestedQty,
        current_stock: item.quantity,
        reorder_level: item.reorder_level,
        priority: item.priority,
        status: "pending",
      });

      setToast({
        show: true,
        type: "success",
        title: "Reorder Request Created",
        message: `${item.name} was added to reorder requests.`,
      });
    } catch (err) {
      setToast({
        show: true,
        type: "error",
        title: "Reorder Failed",
        message: err.message || "Unable to create reorder request.",
      });
    } finally {
      setReorderLoading(null);
    }
  };

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(paginatedItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(current => 
      current.includes(id) 
        ? current.filter(itemId => itemId !== id)
        : [...current, id]
    );
  };

  const handleBulkDelete = async () => {
    setDeleteModal({
      open: true,
      item: { name: `${selectedItems.length} selected items`, isBulk: true },
      loading: false,
    });
  };

  const exportToCSV = () => {
    const headers = ["Name", "SKU", "Brand", "Supplier", "Category", "Quantity", "Price", "Status", "Expiration"];
    const rows = filteredItems.map(item => [
      item.name, item.sku, item.brand, item.supplier, item.category,
      item.quantity, item.price, item.status, item.expiration
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory-products.csv";
    a.click();
  };

  // CRUD Operations
  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const item = items.find(i => i.id === id);
    setDeleteModal({
      open: true,
      item: { ...item, isBulk: false },
      loading: false,
    });
  };

  const confirmDelete = async () => {
    setDeleteModal((prev) => ({ ...prev, loading: true }));

    const { item } = deleteModal;
    
    if (item?.isBulk) {
      // Bulk delete
      if (usingDemoData) {
        setItems(prev => prev.filter(i => !selectedItems.includes(i.id)));
        setSelectedItems([]);
        setToast({
          show: true,
          type: "success",
          title: "Products Deleted",
          message: `${selectedItems.length} products were removed from inventory.`,
        });
        setDeleteModal({ open: false, item: null, loading: false });
        return;
      }
      
      try {
        await Promise.all(selectedItems.map(id => inventoryApi.deleteItem(id)));
        setSelectedItems([]);
        await fetchItems(false);
        setToast({
          show: true,
          type: "success",
          title: "Products Deleted",
          message: `${selectedItems.length} products were removed from inventory.`,
        });
        setDeleteModal({ open: false, item: null, loading: false });
      } catch (err) {
        setToast({
          show: true,
          type: "error",
          title: "Delete Failed",
          message: "Failed to delete some items. Please check your connection and try again.",
        });
        setDeleteModal((prev) => ({ ...prev, loading: false }));
      }
      return;
    }
    
    // Single delete
    if (usingDemoData) {
      setItems(prev => prev.filter(i => i.id !== item.id));
      setToast({
        show: true,
        type: "success",
        title: "Product Deleted",
        message: "The selected product was removed from inventory.",
      });
      setDeleteModal({ open: false, item: null, loading: false });
      return;
    }
    
    try {
      await inventoryApi.deleteItem(item.id);
      await fetchItems(false);
      setToast({
        show: true,
        type: "success",
        title: "Product Deleted",
        message: "The selected product was removed from inventory.",
      });
      setDeleteModal({ open: false, item: null, loading: false });
    } catch (err) {
      console.error("API delete failed, falling back to demo mode:", err);
      setUsingDemoData(true);
      setItems(prev => prev.filter(i => i.id !== item.id));
      setToast({
        show: true,
        type: "success",
        title: "Product Deleted",
        message: "Item deleted in DEMO mode (API unavailable). Changes are local only.",
      });
      setDeleteModal({ open: false, item: null, loading: false });
    }
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕️";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className="inventory-products-page advanced">
      {/* Header */}
      <div className="products-header">
        <div className="header-title">
          <h2>Inventory Details</h2>
          <p>Manage your products, stock levels, and suppliers</p>
          {usingDemoData && <span className="demo-badge">Demo Mode</span>}
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={exportToCSV}>
            📥 Export CSV
          </button>
          <button className="btn-primary" onClick={handleAdd}>
            + Add Product
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-value">{items.length}</span>
          <span className="stat-label">Total Products</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{filteredItems.length}</span>
          <span className="stat-label">Filtered</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{selectedItems.length}</span>
          <span className="stat-label">Selected</span>
        </div>
      </div>

      {/* AI Reorder Suggestions Panel */}
      {reorderSuggestions.length > 0 && (
        <div className="ai-suggestion-panel">
          <div className="ai-header">
            <div>
              <h3>Smart Reorder Suggestions</h3>
              <p>System-generated stock recommendations based on reorder level.</p>
            </div>
            <span>{reorderSuggestions.length} alert{reorderSuggestions.length > 1 ? "s" : ""}</span>
          </div>

          <div className="ai-list">
            {reorderSuggestions.slice(0, 5).map((item) => (
              <div key={item.id} className={`ai-item ${item.priority}`}>
                <div className="ai-item-info">
                  <strong>{item.name}</strong>
                  <p>
                    Current stock: {item.quantity} • Reorder level: {item.reorder_level} • Suggested: {item.suggestedQty}
                  </p>
                </div>

                <div className="ai-item-actions">
                  <span className={`ai-priority ${item.priority}`}>
                    {item.priority}
                  </span>

                  <button
                    className="btn-reorder"
                    onClick={() => handleAutoReorder(item)}
                    disabled={reorderLoading === item.id}
                  >
                    {reorderLoading === item.id ? "Sending..." : "Create Request"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="products-toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, SKU, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            className={`btn-filter ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            🔍 Filters {Object.values(filters).some(f => f !== "all") && "•"}
          </button>
        </div>
        
        <div className="toolbar-right">
          {selectedItems.length > 0 && (
            <div className="bulk-actions">
              <span>{selectedItems.length} selected</span>
              <button className="btn-danger" onClick={handleBulkDelete}>
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Category</label>
            <select value={filters.category} onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}>
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="all">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Brand</label>
            <select value={filters.brand} onChange={(e) => setFilters(f => ({ ...f, brand: e.target.value }))}>
              <option value="all">All Brands</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Supplier</label>
            <select value={filters.supplier} onChange={(e) => setFilters(f => ({ ...f, supplier: e.target.value }))}>
              <option value="all">All Suppliers</option>
              {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button 
            className="btn-clear" 
            onClick={() => setFilters({ category: "all", status: "all", brand: "all", supplier: "all" })}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="products-loading">
          <div className="skeleton-row"></div>
          <div className="skeleton-row"></div>
          <div className="skeleton-row"></div>
          <div className="skeleton-row"></div>
        </div>
      )}

      {/* Table */}
      <div className="inventory-table-card">
        <div className="inventory-table-wrapper">
          <table className="products-table advanced-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  checked={selectedItems.length === paginatedItems.length && paginatedItems.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th onClick={() => handleSort("id")} className="sortable id-col">
                ID {renderSortIcon("id")}
              </th>
              <th onClick={() => handleSort("name")} className="sortable product-col">
                Product {renderSortIcon("name")}
              </th>
              <th onClick={() => handleSort("sku")} className="sortable sku-col">
                SKU {renderSortIcon("sku")}
              </th>
              <th onClick={() => handleSort("category")} className="sortable category-col">
                Category {renderSortIcon("category")}
              </th>
              <th onClick={() => handleSort("brand")} className="sortable brand-col">
                Brand {renderSortIcon("brand")}
              </th>
              <th onClick={() => handleSort("supplier")} className="sortable supplier-col">
                Supplier {renderSortIcon("supplier")}
              </th>
              <th onClick={() => handleSort("quantity")} className="sortable numeric stock-col">
                Stock {renderSortIcon("quantity")}
              </th>
              <th onClick={() => handleSort("price")} className="sortable numeric price-col">
                Price {renderSortIcon("price")}
              </th>
              <th className="numeric value-col">
                Value
              </th>
              <th onClick={() => handleSort("status")} className="sortable status-col">
                Status {renderSortIcon("status")}
              </th>
              <th onClick={() => handleSort("expiration")} className="sortable expiration-col">
                Expiration {renderSortIcon("expiration")}
              </th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id} className={selectedItems.includes(item.id) ? "selected" : ""}>
                <td className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                  />
                </td>
                <td className="id-col">
                  <span className="id-code">{item.id}</span>
                </td>
                <td className="product-cell">
                  <div className="product-info">
                    <span className="product-name">{item.name}</span>
                  </div>
                </td>
                <td className="sku-col"><code className="sku-code">{item.sku}</code></td>
                <td className="category-col">
                  <span className="category-badge">{item.category || "Uncategorized"}</span>
                </td>
                <td className="brand-col">{item.brand || "-"}</td>
                <td className="supplier-col">{item.supplier || "-"}</td>
                <td className="numeric stock-col">
                  <span className={`quantity ${item.quantity < 10 ? "low" : ""}`}>
                    {item.quantity}
                  </span>
                </td>
                <td className="numeric price-col">{formatCurrency(item.price)}</td>
                <td className="numeric value-col">
                  {formatCurrency(item.quantity * item.price)}
                </td>
                <td className="status-col">
                  <span className={`status-badge ${(item.status || "").toLowerCase().replace(/\s/g, "-")}`}>
                    {item.status || "Unknown"}
                  </span>
                </td>
                <td className="expiration-col">{item.expiration || "-"}</td>
                <td className="actions-col">
                  <button className="btn-icon" onClick={() => handleEdit(item)} title="Edit">
                    ✏️
                  </button>
                  <button className="btn-icon danger" onClick={() => handleDelete(item.id)} title="Delete">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedItems.length === 0 && !loading && (
          <div className="products-empty-state">
            <div className="empty-icon">📦</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters, or add your first product to get started.</p>
            <button className="empty-action-btn" onClick={handleAdd}>
              + Add First Product
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={currentPage === page ? "active" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages} ({filteredItems.length} total)
          </span>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddProductModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
        }}
        onSuccess={() => {
          fetchItems(false);
          setToast({
            show: true,
            type: "success",
            title: editingItem ? "Product Updated" : "Product Added",
            message: editingItem
              ? "The product details were updated successfully."
              : "The new product was added to your inventory.",
          });
        }}
        editItem={editingItem}
      />

      {/* Toast Notification */}
      <PremiumToast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        itemName={deleteModal.item?.name || "this item"}
        loading={deleteModal.loading}
        onClose={() => setDeleteModal({ open: false, item: null, loading: false })}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default InventoryProducts;
