import React, { useMemo, useState, useEffect } from "react";
import { inventoryItems as demoInventoryItems } from "./inventoryData";
import { inventoryApi } from "../../api/inventory";
import "./InventoryProducts.css";
import { formatCurrency } from "../../utils/currency";

const InventoryProducts = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usingDemoData, setUsingDemoData] = useState(false);
  
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

  // Fetch items from API
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await inventoryApi.getItems();
      const apiItems = response.items || response.data || [];
      
      if (apiItems.length > 0) {
        setItems(apiItems);
        setUsingDemoData(false);
      } else {
        setItems(demoInventoryItems);
        setUsingDemoData(true);
      }
      setError("");
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setItems(demoInventoryItems);
      setUsingDemoData(true);
      setError("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => {
      return [item.name, item.sku, item.brand, item.supplier, item.category]
        .some((value) => (value || "").toLowerCase().includes(query));
    });
  }, [search, items]);

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
    
    try {
      await inventoryApi.deleteItem(id);
      await fetchItems(); // Refresh list
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Failed to delete item. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        price: parseFloat(formData.price) || 0
      };

      if (editingItem) {
        await inventoryApi.updateItem(editingItem.id, data);
      } else {
        await inventoryApi.createItem(data);
      }
      
      setShowModal(false);
      await fetchItems(); // Refresh list
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Failed to save item. Please try again.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="inventory-products-page">
      <div className="products-topbar">
        <div>
          <h2>Inventory Products</h2>
          <p>Full product details with price, quantity, expiration, brand, and supplier.</p>
        </div>
        <div className="products-actions">
          <div className="products-search">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, SKU, brand, or supplier"
            />
          </div>
          <button className="add-btn" onClick={handleAdd}>+ Add Product</button>
        </div>
      </div>

      {usingDemoData && (
        <div className="demo-banner">Using demo data - API not available</div>
      )}

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Brand</th>
                <th>Supplier</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Expiration</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.brand}</td>
                  <td>{item.supplier}</td>
                  <td>{item.category}</td>
                  <td>{item.quantity}</td>
                  <td>{item.expiration}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>
                    <span className={`status-badge ${(item.status || "").toLowerCase().replace(" ", "-")}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="edit-btn" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="no-results">No products match your search.</div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingItem ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input type="text" name="sku" value={formData.sku} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Brand</label>
                <input type="text" name="brand" value={formData.brand} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Supplier</label>
                <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Expiration Date</label>
                <input type="date" name="expiration" value={formData.expiration} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="In stock">In stock</option>
                  <option value="Low stock">Low stock</option>
                  <option value="Out of stock">Out of stock</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">{editingItem ? "Update" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryProducts;
