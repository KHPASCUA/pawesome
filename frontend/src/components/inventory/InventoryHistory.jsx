import React from "react";
import { inventoryHistory } from "./inventoryData";
import "./InventoryHistory.css";

const InventoryHistory = () => {
  return (
    <div className="inventory-history-page">
      <div className="history-header">
        <div>
          <h2>Inventory History</h2>
          <p>Track stock movement, restocks, and sales events at a glance.</p>
        </div>
      </div>

      <div className="history-stats">
        <div className="history-card">
          <p>Total Events</p>
          <strong>{inventoryHistory.length}</strong>
        </div>
      </div>

      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Action</th>
              <th>Quantity</th>
              <th>By</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {inventoryHistory.map((event) => (
              <tr key={event.id}>
                <td>{event.date}</td>
                <td>{event.product}</td>
                <td>{event.action}</td>
                <td>{event.quantity}</td>
                <td>{event.user}</td>
                <td>{event.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryHistory;
