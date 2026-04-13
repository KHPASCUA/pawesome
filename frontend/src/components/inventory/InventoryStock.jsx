import React from "react";
import { inventoryItems } from "./inventoryData";
import "./InventoryStock.css";

const InventoryStock = () => {
  const totalItems = inventoryItems.length;
  const totalQuantity = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventoryItems.filter((item) => item.quantity <= 10);

  return (
    <div className="inventory-stock-page">
      <div className="stock-header">
        <div>
          <h2>Stock Management</h2>
          <p>Monitor current stock levels and low inventory warnings.</p>
        </div>
      </div>

      <div className="stock-summary-grid">
        <div className="stock-card">
          <p>Total Products</p>
          <strong>{totalItems}</strong>
        </div>
        <div className="stock-card">
          <p>Total Quantity</p>
          <strong>{totalQuantity}</strong>
        </div>
        <div className="stock-card">
          <p>Low Stock Items</p>
          <strong>{lowStockItems.length}</strong>
        </div>
      </div>

      <div className="stock-table-wrapper">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Expiration</th>
              <th>Supplier</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {inventoryItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.sku}</td>
                <td>{item.quantity}</td>
                <td>{item.expiration}</td>
                <td>{item.supplier}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryStock;
