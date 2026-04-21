import React, { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faExclamationTriangle,
  faCheckCircle,
  faWarehouse,
  faTags,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import { inventoryItems as demoInventoryItems, inventoryHistory as demoInventoryHistory } from "./inventoryData";
import ReportFilters from "../shared/ReportFilters";
import { inventoryApi } from "../../api/inventory";
import {
  exportToCSV,
  exportToPDF,
  exportToExcel,
  getDateRangePreset,
} from "../../utils/reportExport";
import "./InventoryReports.css";

const InventoryReports = () => {
  const [loading, setLoading] = useState(false);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [apiItems, setApiItems] = useState([]);
  const [apiHistory, setApiHistory] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [itemsResponse, historyResponse] = await Promise.all([
          inventoryApi.getItems(),
          inventoryApi.getStockHistory()
        ]);
        
        const items = itemsResponse.items || itemsResponse.data || [];
        const history = historyResponse.history || historyResponse.data || [];
        
        if (items.length > 0) {
          setApiItems(items);
          setApiHistory(history);
          setUsingDemoData(false);
        } else {
          // Fallback to demo data
          setApiItems(demoInventoryItems);
          setApiHistory(demoInventoryHistory);
          setUsingDemoData(true);
        }
      } catch (err) {
        console.error("Failed to fetch inventory data:", err);
        setApiItems(demoInventoryItems);
        setApiHistory(demoInventoryHistory);
        setUsingDemoData(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Use API data or fallback to demo
  const inventoryItems = apiItems.length > 0 ? apiItems : demoInventoryItems;
  const inventoryHistory = apiHistory.length > 0 ? apiHistory : demoInventoryHistory;

  // Set default date range to current month
  useEffect(() => {
    const { startDate: defaultStart, endDate: defaultEnd } = getDateRangePreset("month");
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  }, []);

  // Get unique categories
  const categories = useMemo(() => [...new Set(inventoryItems.map((item) => item.category))], []);

  // Filter inventory items
  const filteredItems = useMemo(() => {
    let filtered = [...inventoryItems];

    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(search) ||
          item.sku?.toLowerCase().includes(search) ||
          item.brand?.toLowerCase().includes(search) ||
          item.supplier?.toLowerCase().includes(search)
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    return filtered;
  }, [searchTerm, categoryFilter, statusFilter]);

  // Calculate summaries
  const categorySummary = useMemo(() => {
    const summary = {};
    filteredItems.forEach((item) => {
      if (!summary[item.category]) {
        summary[item.category] = { count: 0, quantity: 0, value: 0 };
      }
      summary[item.category].count += 1;
      summary[item.category].quantity += item.quantity;
      summary[item.category].value += item.quantity * item.price;
    });
    return summary;
  }, [filteredItems]);

  const brandSummary = useMemo(() => {
    const summary = {};
    filteredItems.forEach((item) => {
      if (!summary[item.brand]) {
        summary[item.brand] = { count: 0, quantity: 0, value: 0 };
      }
      summary[item.brand].count += 1;
      summary[item.brand].quantity += item.quantity;
      summary[item.brand].value += item.quantity * item.price;
    });
    return summary;
  }, [filteredItems]);

  const statusCounts = useMemo(() => {
    const counts = { "In stock": 0, "Low stock": 0, "Out of stock": 0 };
    filteredItems.forEach((item) => {
      const status = item.status || "In stock";
      if (counts[status] !== undefined) {
        counts[status] += 1;
      }
    });
    return counts;
  }, [filteredItems]);

  const lowStockItems = useMemo(() => filteredItems.filter((item) => item.quantity <= 10), [filteredItems]);
  const criticalItems = useMemo(() => filteredItems.filter((item) => item.quantity <= 5), [filteredItems]);

  // Total values
  const totalProducts = filteredItems.length;
  const totalStockQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalInventoryValue = filteredItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleDateChange = (key, value) => {
    if (key === "startDate") setStartDate(value);
    if (key === "endDate") setEndDate(value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
    const { startDate: defaultStart, endDate: defaultEnd } = getDateRangePreset("month");
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  };

  // Export handlers
  const handleExportCSV = () => {
    const columns = [
      { key: "id", label: "ID" },
      { key: "name", label: "Product Name" },
      { key: "sku", label: "SKU" },
      { key: "category", label: "Category" },
      { key: "brand", label: "Brand" },
      { key: "supplier", label: "Supplier" },
      { key: "quantity", label: "Quantity" },
      { key: "price", label: "Unit Price", format: "currency" },
      { key: "totalValue", label: "Total Value", format: "currency" },
      { key: "status", label: "Status" },
      { key: "expiration", label: "Expiration Date" },
    ];

    const data = filteredItems.map((item) => ({
      ...item,
      totalValue: item.quantity * item.price,
    }));

    exportToCSV(data, columns, "inventory-report");
  };

  const handleExportPDF = () => {
    const columns = [
      { key: "id", label: "ID" },
      { key: "name", label: "Product" },
      { key: "sku", label: "SKU" },
      { key: "category", label: "Category" },
      { key: "quantity", label: "Qty" },
      { key: "price", label: "Price", format: "currency" },
      { key: "status", label: "Status" },
    ];
    exportToPDF(filteredItems, columns, "Inventory Report", "inventory-report");
  };

  const handleExportExcel = () => {
    const columns = [
      { key: "id", label: "ID" },
      { key: "name", label: "Product Name" },
      { key: "sku", label: "SKU" },
      { key: "category", label: "Category" },
      { key: "brand", label: "Brand" },
      { key: "quantity", label: "Quantity" },
      { key: "price", label: "Unit Price", format: "currency" },
      { key: "status", label: "Status" },
    ];
    exportToExcel(filteredItems, columns, "inventory-report");
  };

  return (
    <div className="inventory-reports-page">
      <div className="reports-header">
        <div className="header-content">
          <h1>Inventory Reports</h1>
          <p>Stock levels, suppliers, and inventory analytics</p>
        </div>
      </div>

      <ReportFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "In stock", label: "In Stock" },
          { value: "Low stock", label: "Low Stock" },
          { value: "Out of stock", label: "Out of Stock" },
        ]}
        serviceTypeFilter={categoryFilter}
        onServiceTypeChange={setCategoryFilter}
        serviceTypeOptions={categories.map((cat) => ({ value: cat, label: cat }))}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        loading={loading}
        onClearFilters={handleClearFilters}
        showServiceType={true}
        showRole={false}
        searchPlaceholder="Search products by name, SKU, brand, or supplier..."
      />

      {/* Summary Cards */}
      <div className="reports-summary-grid">
        <div className="summary-card primary">
          <div className="card-icon">
            <FontAwesomeIcon icon={faBox} />
          </div>
          <div className="card-content">
            <div className="card-value">{totalProducts}</div>
            <div className="card-label">Total Products</div>
          </div>
        </div>

        <div className="summary-card secondary">
          <div className="card-icon">
            <FontAwesomeIcon icon={faWarehouse} />
          </div>
          <div className="card-content">
            <div className="card-value">{totalStockQuantity}</div>
            <div className="card-label">Total Stock Units</div>
          </div>
        </div>

        <div className="summary-card tertiary">
          <div className="card-icon">
            <FontAwesomeIcon icon={faTags} />
          </div>
          <div className="card-content">
            <div className="card-value">₱{totalInventoryValue.toFixed(2)}</div>
            <div className="card-label">Inventory Value</div>
          </div>
        </div>

        <div className="summary-card warning">
          <div className="card-icon">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <div className="card-content">
            <div className="card-value">{lowStockItems.length}</div>
            <div className="card-label">Low Stock Items</div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="status-overview-section">
        <h3>Stock Status Overview</h3>
        <div className="status-grid">
          <div className="status-card in-stock">
            <FontAwesomeIcon icon={faCheckCircle} />
            <div className="status-info">
              <span className="status-count">{statusCounts["In stock"]}</span>
              <span className="status-label">In Stock</span>
            </div>
          </div>
          <div className="status-card low-stock">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <div className="status-info">
              <span className="status-count">{statusCounts["Low stock"]}</span>
              <span className="status-label">Low Stock</span>
            </div>
          </div>
          <div className="status-card out-stock">
            <FontAwesomeIcon icon={faBox} />
            <div className="status-info">
              <span className="status-count">{statusCounts["Out of stock"]}</span>
              <span className="status-label">Out of Stock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category and Brand Summaries */}
      <div className="reports-detail-panel">
        <section className="reports-panel">
          <h3>Category Summary</h3>
          <div className="reports-list-wrapper">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Products</th>
                  <th>Quantity</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(categorySummary).map(([category, data]) => (
                  <tr key={category}>
                    <td>{category}</td>
                    <td>{data.count}</td>
                    <td>{data.quantity}</td>
                    <td>₱{data.value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="reports-panel">
          <h3>Brand Summary</h3>
          <div className="reports-list-wrapper">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Products</th>
                  <th>Quantity</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(brandSummary).map(([brand, data]) => (
                  <tr key={brand}>
                    <td>{brand}</td>
                    <td>{data.count}</td>
                    <td>{data.quantity}</td>
                    <td>₱{data.value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="alerts-section">
          <h3>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            Low Stock Alerts
          </h3>
          <div className="alerts-table-container">
            <table className="alerts-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item.id} className={item.quantity <= 5 ? "critical" : "warning"}>
                    <td>{item.name}</td>
                    <td>{item.sku}</td>
                    <td>{item.category}</td>
                    <td className="stock-cell">{item.quantity}</td>
                    <td>
                      <span className={`alert-badge ${item.quantity <= 5 ? "critical" : "warning"}`}>
                        {item.quantity <= 5 ? "Critical" : "Low Stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Items Table */}
      <div className="inventory-table-section">
        <h3>Inventory Details</h3>
        <div className="table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Supplier</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Value</th>
                <th>Status</th>
                <th>Expiration</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.category}</td>
                  <td>{item.brand}</td>
                  <td>{item.supplier}</td>
                  <td className={`stock-cell ${item.quantity <= 10 ? "low" : ""}`}>{item.quantity}</td>
                  <td>₱{item.price.toFixed(2)}</td>
                  <td>₱{(item.quantity * item.price).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${item.status?.toLowerCase().replace(" ", "-")}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.expiration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryReports;
