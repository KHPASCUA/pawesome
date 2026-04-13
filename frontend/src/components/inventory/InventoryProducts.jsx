import React, { useMemo, useState } from "react";
import { inventoryItems } from "./inventoryData";
import "./InventoryProducts.css";

const InventoryProducts = () => {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return inventoryItems;
    }

    return inventoryItems.filter((item) => {
      return [
        item.name,
        item.sku,
        item.brand,
        item.supplier,
        item.category,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [search]);

  return (
    <div className="inventory-products-page">
      <div className="products-topbar">
        <div>
          <h2>Inventory Products</h2>
          <p>Full product details with price, quantity, expiration, brand, and supplier.</p>
        </div>
        <div className="products-search">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, SKU, brand, or supplier"
          />
        </div>
      </div>

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
                <td>${item.price.toFixed(2)}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="no-results">No products match your search.</div>
        )}
      </div>
    </div>
  );
};

export default InventoryProducts;
