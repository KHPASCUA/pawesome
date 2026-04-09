import React, { useMemo } from "react";
import { inventoryItems } from "./inventoryData";
import "./InventoryReports.css";

const InventoryReports = () => {
  const categorySummary = useMemo(() => {
    const summary = {};
    inventoryItems.forEach((item) => {
      if (!summary[item.category]) {
        summary[item.category] = 0;
      }
      summary[item.category] += item.quantity;
    });
    return summary;
  }, []);

  const brandSummary = useMemo(() => {
    const summary = {};
    inventoryItems.forEach((item) => {
      if (!summary[item.brand]) {
        summary[item.brand] = 0;
      }
      summary[item.brand] += item.quantity;
    });
    return summary;
  }, []);

  const lowStockItems = inventoryItems.filter((item) => item.quantity <= 10);

  return (
    <div className="inventory-reports-page">
      <div className="reports-header">
        <div>
          <h2>Inventory Reports</h2>
          <p>Actionable insights for stock levels, suppliers, and low inventory alerts.</p>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <p>Total Products</p>
          <strong>{inventoryItems.length}</strong>
        </div>
        <div className="report-card">
          <p>Total Stock Quantity</p>
          <strong>{inventoryItems.reduce((sum, item) => sum + item.quantity, 0)}</strong>
        </div>
        <div className="report-card">
          <p>Low Stock Items</p>
          <strong>{lowStockItems.length}</strong>
        </div>
      </div>

      <div className="reports-detail-panel">
        <section className="reports-panel">
          <h3>Category Summary</h3>
          <div className="reports-list-wrapper">
            <ul>
              {Object.entries(categorySummary).map(([category, total]) => (
                <li key={category}>
                  <strong>{category}</strong>
                  <span>{total} units</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="reports-panel">
          <h3>Brand Summary</h3>
          <div className="reports-list-wrapper">
            <ul>
              {Object.entries(brandSummary).map(([brand, total]) => (
                <li key={brand}>
                  <strong>{brand}</strong>
                  <span>{total} units</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="reports-panel-bottom">
        <h3>Low Stock Alerts</h3>
        <div className="reports-list-wrapper">
          {lowStockItems.length > 0 ? (
            <ul>
              {lowStockItems.map((item) => (
                <li key={item.id}>
                  <strong>{item.name}</strong>
                  <span>{item.quantity} left</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>All items are sufficiently stocked.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryReports;
