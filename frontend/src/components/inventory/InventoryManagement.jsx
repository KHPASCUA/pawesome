import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faBox,
  faExclamationTriangle,
  faCheckCircle,
  faTimes,
  faSave,
  faBarcode,
  faWarehouse,
  faDollarSign,
  faBoxes,
  faBell,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import { inventoryApi } from '../../api/inventory';
import { sharedProducts, sharedServices } from '../shared/inventorySync';
import './InventoryManagement.css';

/**
 * INVENTORY MANAGEMENT COMPONENT
 * 
 * Full CRUD operations via API for centralized inventory management.
 * All changes immediately sync to all dashboards (Cashier, Customer, Admin, Inventory).
 * 
 * API Endpoints Used:
 * - GET    /inventory/items     - Fetch all items
 * - POST   /inventory/items     - Create new item
 * - PUT    /inventory/items/:id - Update item
 * - DELETE /inventory/items/:id - Delete item
 * - GET    /inventory/dashboard - Dashboard stats
 */

const CATEGORIES = [
  { value: 'Food', label: 'Food', icon: '🍖' },
  { value: 'Accessories', label: 'Accessories', icon: '🦴' },
  { value: 'Grooming', label: 'Grooming', icon: '✂️' },
  { value: 'Toys', label: 'Toys', icon: '🎾' },
  { value: 'Health', label: 'Health', icon: '💊' },
  { value: 'Services', label: 'Services', icon: '🩺' }
];

const INITIAL_FORM_DATA = {
  name: '',
  sku: '',
  category: 'Food',
  price: '',
  stock_quantity: '',
  reorder_level: 10,
  brand: '',
  supplier: '',
  description: '',
  expiration_date: '',
  location: ''
};

const InventoryManagement = () => {
  // State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingDemoData, setUsingDemoData] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Stats
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });

  // Fetch inventory data
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [itemsResponse, dashboardResponse] = await Promise.all([
        inventoryApi.getItems(),
        inventoryApi.getDashboard().catch(() => null)
      ]);
      
      const fetchedItems = itemsResponse.items || itemsResponse.data || [];
      
      if (fetchedItems.length > 0) {
        setItems(fetchedItems);
        setUsingDemoData(false);
        
        // Update stats from API
        if (dashboardResponse) {
          setStats({
            totalItems: dashboardResponse.total_items || fetchedItems.length,
            lowStock: dashboardResponse.low_stock_count || 0,
            outOfStock: dashboardResponse.out_of_stock_count || 0,
            totalValue: dashboardResponse.total_value || 0
          });
        }
      } else {
        // Fallback to demo data
        const demoItems = [...sharedProducts, ...sharedServices].map(item => ({
          ...item,
          id: item.sku || item.id,
          stock_quantity: item.stock,
          min_stock_level: item.minStock,
          price: item.price,
          category: item.category,
          status: item.stock === 0 ? 'out_of_stock' : item.stock <= item.minStock ? 'low_stock' : 'in_stock'
        }));
        setItems(demoItems);
        setUsingDemoData(true);
        
        // Calculate demo stats
        const lowStock = demoItems.filter(i => i.stock_quantity > 0 && i.stock_quantity <= i.min_stock_level).length;
        const outOfStock = demoItems.filter(i => i.stock_quantity === 0).length;
        const totalValue = demoItems.reduce((sum, i) => sum + (i.price * i.stock_quantity), 0);
        
        setStats({
          totalItems: demoItems.length,
          lowStock,
          outOfStock,
          totalValue
        });
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError(err.message);
      
      // Fallback to demo data on error
      const demoItems = [...sharedProducts, ...sharedServices];
      setItems(demoItems);
      setUsingDemoData(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchInventory();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchInventory, 30000);
    return () => clearInterval(interval);
  }, [fetchInventory]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('price') || name.includes('quantity') || name.includes('stock') 
        ? parseFloat(value) || value 
        : value
    }));
  };

  // Open modal for new item
  const handleAddNew = () => {
    setEditingItem(null);
    setFormData(INITIAL_FORM_DATA);
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      sku: item.sku || '',
      category: item.category || 'Food',
      price: item.price || '',
      stock_quantity: item.stock_quantity || item.stock || item.quantity || '',
      min_stock_level: item.min_stock_level || item.minStock || 10,
      brand: item.brand || '',
      supplier: item.supplier || '',
      description: item.description || '',
      expiration_date: item.expiration_date || item.expiration || '',
      location: item.location || ''
    });
    setShowModal(true);
  };

  // Save item (create or update)
  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingItem) {
        // Update existing item
        await inventoryApi.updateItem(editingItem.id, formData);
      } else {
        // Create new item
        await inventoryApi.createItem(formData);
      }
      
      // Refresh data
      await fetchInventory();
      setShowModal(false);
      setFormData(INITIAL_FORM_DATA);
      setEditingItem(null);
      
      alert(`Item ${editingItem ? 'updated' : 'created'} successfully! All dashboards will sync automatically.`);
    } catch (err) {
      console.error('Failed to save item:', err);
      alert(`Failed to ${editingItem ? 'update' : 'create'} item: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      await inventoryApi.deleteItem(id);
      await fetchInventory();
      alert('Item deleted successfully!');
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert(`Failed to delete item: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      (item.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.brand?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'in_stock' && (item.stock_quantity || item.stock || 0) > (item.min_stock_level || 10)) ||
      (statusFilter === 'low_stock' && (item.stock_quantity || item.stock || 0) > 0 && (item.stock_quantity || item.stock || 0) <= (item.min_stock_level || 10)) ||
      (statusFilter === 'out_of_stock' && (item.stock_quantity || item.stock || 0) === 0);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get status badge
  const getStatusBadge = (item) => {
    const stock = item.stock_quantity || item.stock || item.quantity || 0;
    const minStock = item.min_stock_level || item.minStock || 10;
    
    if (stock === 0) {
      return <span className="status-badge out-of-stock"><FontAwesomeIcon icon={faTimes} /> Out of Stock</span>;
    }
    if (stock <= minStock) {
      return <span className="status-badge low-stock"><FontAwesomeIcon icon={faExclamationTriangle} /> Low Stock</span>;
    }
    return <span className="status-badge in-stock"><FontAwesomeIcon icon={faCheckCircle} /> In Stock</span>;
  };

  return (
    <div className="inventory-management">
      {/* Header */}
      <div className="inventory-header">
        <div className="header-left">
          <h1><FontAwesomeIcon icon={faWarehouse} /> Inventory Management</h1>
          {usingDemoData && (
            <span className="demo-badge">
              <FontAwesomeIcon icon={faSync} /> Demo Mode - API Unavailable
            </span>
          )}
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          <FontAwesomeIcon icon={faPlus} /> Add New Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon"><FontAwesomeIcon icon={faBoxes} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalItems}</span>
            <span className="stat-label">Total Items</span>
          </div>
        </div>
        <div className="stat-card low">
          <div className="stat-icon"><FontAwesomeIcon icon={faBell} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.lowStock}</span>
            <span className="stat-label">Low Stock</span>
          </div>
        </div>
        <div className="stat-card out">
          <div className="stat-icon"><FontAwesomeIcon icon={faBox} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.outOfStock}</span>
            <span className="stat-label">Out of Stock</span>
          </div>
        </div>
        <div className="stat-card value">
          <div className="stat-icon"><FontAwesomeIcon icon={faDollarSign} /></div>
          <div className="stat-info">
            <span className="stat-value">₱{stats.totalValue.toLocaleString()}</span>
            <span className="stat-label">Total Value</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search by name, SKU, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-selects">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <button className="btn btn-refresh" onClick={fetchInventory}>
            <FontAwesomeIcon icon={faSync} />
          </button>
        </div>
      </div>

      {/* Items Table */}
      <div className="items-table-container">
        {loading && items.length === 0 ? (
          <div className="loading-state">Loading inventory...</div>
        ) : error && items.length === 0 ? (
          <div className="error-state">
            <p>Failed to load inventory: {error}</p>
            <button onClick={fetchInventory}>Retry</button>
          </div>
        ) : (
          <table className="items-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} className={(item.stock_quantity || item.stock || 0) === 0 ? 'out-of-stock-row' : ''}>
                  <td className="sku-cell">
                    <FontAwesomeIcon icon={faBarcode} /> {item.sku || item.id}
                  </td>
                  <td className="name-cell">
                    <div className="product-name">{item.name}</div>
                    <div className="product-brand">{item.brand}</div>
                  </td>
                  <td>
                    <span className="category-badge">
                      {CATEGORIES.find(c => c.value === item.category)?.icon || '📦'} {item.category}
                    </span>
                  </td>
                  <td className="price-cell">₱{(item.price || 0).toLocaleString()}</td>
                  <td className="stock-cell">
                    <span className={`stock-value ${(item.stock_quantity || item.stock || 0) <= (item.min_stock_level || 10) ? 'low' : ''}`}>
                      {item.stock_quantity || item.stock || 0}
                    </span>
                    <span className="min-stock">/ {item.min_stock_level || item.minStock || 10} min</span>
                  </td>
                  <td>{getStatusBadge(item)}</td>
                  <td className="location-cell">{item.location || '-'}</td>
                  <td className="actions-cell">
                    <button className="btn-icon edit" onClick={() => handleEdit(item)} title="Edit">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(item.id)} title="Delete">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {filteredItems.length === 0 && !loading && (
          <div className="empty-state">
            <FontAwesomeIcon icon={faBox} />
            <p>No items found matching your filters</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FontAwesomeIcon icon={editingItem ? faEdit : faPlus} />
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="item-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Premium Dog Food 5kg"
                  />
                </div>
                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., PDF-5KG-001"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required>
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., A1-01"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₱) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Stock Level</label>
                  <input
                    type="number"
                    name="reorder_level"
                    value={formData.reorder_level}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="10"
                  />
                </div>
                <div className="form-group">
                  <label>Expiration Date</label>
                  <input
                    type="date"
                    name="expiration_date"
                    value={formData.expiration_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g., Pawsome Premium"
                  />
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    placeholder="e.g., Pet Nutrition Co."
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter product description..."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <FontAwesomeIcon icon={faSave} />
                  {loading ? 'Saving...' : (editingItem ? 'Update Item' : 'Create Item')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
