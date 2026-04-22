import React, { useMemo, useState, useEffect } from "react";
import { inventoryItems as demoInventoryItems } from "./inventoryData";
import { inventoryApi } from "../../api/inventory";
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

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    brand: "",
    supplier: "",
    category: "",
    quantity: "",
    price: "",
    expiration: "",
    status: "In stock"
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
      // Only use demo data on API failure
      setItems(demoInventoryItems);
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
    if (!window.confirm(`Delete ${selectedItems.length} selected items?`)) return;
    
    if (usingDemoData) {
      // Demo mode: simulate bulk delete locally
      setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      return;
    }
    
    try {
      await Promise.all(selectedItems.map(id => inventoryApi.deleteItem(id)));
      setSelectedItems([]);
      await fetchItems(false);
    } catch (err) {
      alert("Failed to delete some items. Please check your connection and try again.");
    }
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
    setFormData({
      name: "",
      sku: "",
      brand: "",
      supplier: "",
      category: "",
      quantity: "",
      price: "",
      expiration: "",
      status: "In stock"
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      sku: item.sku || "",
      brand: item.brand || "",
      supplier: item.supplier || "",
      category: item.category || "",
      quantity: item.quantity || "",
      price: item.price || "",
      expiration: item.expiration || "",
      status: item.status || "In stock"
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    if (usingDemoData) {
      // Demo mode: simulate delete locally
      setItems(prev => prev.filter(item => item.id !== id));
      return;
    }
    
    try {
      await inventoryApi.deleteItem(id);
      await fetchItems(false); // Refresh without full loading
    } catch (err) {
      console.error("API delete failed, falling back to demo mode:", err);
      
      // Fallback to demo mode - delete locally
      setUsingDemoData(true);
      setItems(prev => prev.filter(item => item.id !== id));
      alert("Item deleted in DEMO mode (API unavailable). Changes are local only.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      quantity: parseInt(formData.quantity) || 0,
      price: parseFloat(formData.price) || 0
    };

    if (usingDemoData) {
      // Demo mode: simulate save locally
      if (editingItem) {
        setItems(prev => prev.map(item => item.id === editingItem.id ? { ...data, id: item.id } : item));
      } else {
        const newId = Math.max(...items.map(i => i.id), 0) + 1;
        setItems(prev => [...prev, { ...data, id: newId }]);
      }
      setShowModal(false);
      return;
    }
    
    try {
      if (editingItem) {
        await inventoryApi.updateItem(editingItem.id, data);
      } else {
        await inventoryApi.createItem(data);
      }
      
      setShowModal(false);
      await fetchItems(false); // Refresh without full loading
    } catch (err) {
      console.error("API save failed, falling back to demo mode:", err);
      
      // Fallback to demo mode - save locally
      setUsingDemoData(true);
      
      if (editingItem) {
        setItems(prev => prev.map(item => item.id === editingItem.id ? { ...data, id: item.id } : item));
      } else {
        const newId = Math.max(...items.map(i => parseInt(i.id) || 0), 0) + 1;
        setItems(prev => [...prev, { ...data, id: String(newId) }]);
      }
      
      setShowModal(false);
      alert(`Item ${editingItem ? 'updated' : 'created'} in DEMO mode (API unavailable). Changes are local only.`);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      )}

      {/* Table */}
      <div className="products-table-container">
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
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
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

      {/* Add/Edit Modal - Professional */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-icon">
                  {editingItem ? "✏️" : "➕"}
                </div>
                <div>
                  <h3>{editingItem ? "Edit Product" : "Add New Product"}</h3>
                  <p>{editingItem ? "Update product information" : "Create a new inventory item"}</p>
                </div>
              </div>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Basic Info Section */}
                <div className="form-section">
                  <div className="section-header">
                    <span className="section-icon">📋</span>
                    <h4>Basic Information</h4>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>
                        Product Name <span className="required">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="Enter product name"
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        SKU <span className="required">*</span>
                        <small className="hint">Unique product code</small>
                      </label>
                      <input 
                        type="text" 
                        name="sku" 
                        value={formData.sku} 
                        onChange={handleChange} 
                        placeholder="e.g., PRD-001"
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select name="category" value={formData.category} onChange={handleChange}>
                        <option value="">Select category</option>
                        <option value="Food">🍖 Food</option>
                        <option value="Accessories">🦴 Accessories</option>
                        <option value="Grooming">✂️ Grooming</option>
                        <option value="Toys">🎾 Toys</option>
                        <option value="Health">💊 Health</option>
                        <option value="Services">🩺 Services</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Brand</label>
                      <input 
                        type="text" 
                        name="brand" 
                        value={formData.brand} 
                        onChange={handleChange} 
                        placeholder="Brand name"
                      />
                    </div>
                  </div>
                </div>

                {/* Inventory Section */}
                <div className="form-section">
                  <div className="section-header">
                    <span className="section-icon">📦</span>
                    <h4>Inventory Details</h4>
                  </div>
                  <div className="form-grid inventory-grid">
                    <div className="form-group">
                      <label>
                        Quantity <span className="required">*</span>
                      </label>
                      <div className="input-with-icon">
                        <input 
                          type="number" 
                          name="quantity" 
                          value={formData.quantity} 
                          onChange={handleChange} 
                          min="0"
                          placeholder="0"
                          required 
                        />
                        <span className="input-suffix">units</span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>
                        Price <span className="required">*</span>
                      </label>
                      <div className="input-with-icon">
                        <span className="input-prefix">₱</span>
                        <input 
                          type="number" 
                          step="0.01" 
                          name="price" 
                          value={formData.price} 
                          onChange={handleChange} 
                          min="0"
                          placeholder="0.00"
                          required 
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <div className="status-options">
                        {[
                          { value: "In stock", label: "In Stock", color: "#10b981" },
                          { value: "Low stock", label: "Low Stock", color: "#f59e0b" },
                          { value: "Out of stock", label: "Out of Stock", color: "#ef4444" },
                        ].map((status) => (
                          <button
                            key={status.value}
                            type="button"
                            className={`status-option ${formData.status === status.value ? "active" : ""}`}
                            style={{ 
                              borderColor: status.color,
                              background: formData.status === status.value ? `${status.color}20` : "white",
                              color: formData.status === status.value ? status.color : "#64748b"
                            }}
                            onClick={() => setFormData(prev => ({ ...prev, status: status.value }))}
                          >
                            <span className="status-dot" style={{ background: status.color }}></span>
                            {status.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Expiration Date</label>
                      <input 
                        type="date" 
                        name="expiration" 
                        value={formData.expiration} 
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Supplier Section */}
                <div className="form-section">
                  <div className="section-header">
                    <span className="section-icon">🚚</span>
                    <h4>Supplier Information</h4>
                  </div>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Supplier</label>
                      <input 
                        type="text" 
                        name="supplier" 
                        value={formData.supplier} 
                        onChange={handleChange} 
                        placeholder="Supplier company name"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary btn-lg">
                  {editingItem ? "💾 Update Product" : "➕ Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryProducts;
