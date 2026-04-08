import React, { useMemo } from "react";

const InventoryReportsDashboard = ({ items }) => {
  // Category totals
  const categorySummary = useMemo(() => {
    const summary = {};
    items.forEach((item) => {
      if (!summary[item.category]) {
        summary[item.category] = 0;
      }
      summary[item.category] += item.quantity;
    });
    return summary;
  }, [items]);

  // Low stock alerts (threshold = 5)
  const lowStockItems = items.filter((item) => item.quantity <= 5);

  // Out of stock items
  const outOfStockItems = items.filter((item) => item.quantity === 0);

  return (
    <div>
      <h2>Inventory Reports Dashboard</h2>

      {/* Category Summary */}
      <section>
        <h3>Category Summary</h3>
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Category</th>
              <th>Total Quantity</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categorySummary).map(([category, total]) => (
              <tr key={category}>
                <td>{category}</td>
                <td>{total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Low Stock Alerts */}
      <section style={{ marginTop: "20px" }}>
        <h3>Low Stock Alerts</h3>
        {lowStockItems.length > 0 ? (
          <ul>
            {lowStockItems.map((item) => (
              <li key={item.id}>
                ⚠️ {item.name} ({item.category}) — Only {item.quantity} left
              </li>
            ))}
          </ul>
        ) : (
          <p>All items are sufficiently stocked.</p>
        )}
      </section>

      {/* Out of Stock */}
      <section style={{ marginTop: "20px" }}>
        <h3>Out of Stock</h3>
        {outOfStockItems.length > 0 ? (
          <ul>
            {outOfStockItems.map((item) => (
              <li key={item.id}>
                ❌ {item.name} ({item.category}) — Out of stock
              </li>
            ))}
          </ul>
        ) : (
          <p>No items are completely out of stock.</p>
        )}
      </section>
    </div>
  );
};

export default InventoryReportsDashboard;