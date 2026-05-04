import React, { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faExclamationTriangle,
  faCheckCircle,
  faWarehouse,
  faTags,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { inventoryApi } from "../../api/inventory";
import {
  exportToCSV,
  exportToPDF,
  exportToExcel,
  getDateRangePreset,
} from "../../utils/reportExport";
import { inventoryProducts as demoInventoryItems } from "./inventoryData";
import "./InventoryReports.css";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

const InventoryReports = () => {
  const [loading, setLoading] = useState(true);
  const [apiItems, setApiItems] = useState([]);

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
        const itemsResponse = await inventoryApi.getItems();
        const items = itemsResponse.items || itemsResponse.data || [];

        if (items.length > 0) {
          setApiItems(items);
        } else {
          // API returned empty - use demo data
          setApiItems(demoInventoryItems);
        }
      } catch (err) {
        console.error("Failed to fetch inventory data, using demo:", err);
        setApiItems(demoInventoryItems);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter out service items from inventory data
  const inventoryItems = useMemo(() => {
    return apiItems.filter((item) => {
      const category = String(item.category || "").toLowerCase();
      const type = String(item.type || item.item_type || "").toLowerCase();

      return (
        category !== "services" &&
        category !== "service" &&
        type !== "service"
      );
    });
  }, [apiItems]);

  // Helper functions
  const getQuantity = (item) => Number(item.quantity ?? item.stock ?? 0);
  const getPrice = (item) => Number(item.price ?? item.unit_price ?? 0);

  const getItemStatus = (item) => {
    const quantity = getQuantity(item);
    const minimum = Number(item.minimum_stock_level ?? item.reorder_level ?? 10);

    if (quantity <= 0) return "Out of stock";
    if (quantity <= minimum) return "Low stock";
    return "In stock";
  };

  const formatExpiry = (item) => {
    const expiry =
      item.nearest_expiration ||
      item.expiration_date ||
      item.expiration ||
      null;

    if (!expiry) return "No Expiry";

    return new Date(expiry).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Set default date range to current month
  useEffect(() => {
    const { startDate: defaultStart, endDate: defaultEnd } = getDateRangePreset("month");
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  }, []);

  // Get unique categories
  const categories = useMemo(() => [...new Set(inventoryItems.map((item) => item.category))], [inventoryItems]);

  // Filter inventory items
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventoryItems, searchTerm, categoryFilter, statusFilter]);

  // Calculate summaries
  const categorySummary = useMemo(() => {
    const summary = {};
    filteredItems.forEach((item) => {
      if (!summary[item.category]) {
        summary[item.category] = { count: 0, quantity: 0, value: 0 };
      }
      summary[item.category].count += 1;
      summary[item.category].quantity += getQuantity(item);
      summary[item.category].value += getQuantity(item) * getPrice(item);
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
      summary[item.brand].quantity += getQuantity(item);
      summary[item.brand].value += getQuantity(item) * getPrice(item);
    });
    return summary;
  }, [filteredItems]);

  const normalizeStatus = (item) => {
  const qty = getQuantity(item);
  const min = Number(item.minimum_stock_level ?? item.reorder_level ?? 10);
  const raw = String(item.status || "").toLowerCase();

  if (qty <= 0 || raw.includes("out")) return "Out of Stock";
  if (qty <= min || raw.includes("low")) return "Low Stock";
  return "In Stock";
};

const statusCounts = useMemo(() => {
  const counts = { "In Stock": 0, "Low Stock": 0, "Out of Stock": 0 };

  filteredItems.forEach((item) => {
    counts[normalizeStatus(item)] += 1;
  });

  return counts;
}, [filteredItems]);

  const lowStockItems = useMemo(
  () =>
    filteredItems.filter((item) => {
      const quantity = getQuantity(item);
      const minimum = Number(item.minimum_stock_level ?? item.reorder_level ?? 10);
      return quantity <= minimum;
    }),
  [filteredItems]
);

  // Total values
  const totalProducts = filteredItems.length;
  const totalStockQuantity = filteredItems.reduce((sum, item) => sum + getQuantity(item), 0);
  const totalInventoryValue = filteredItems.reduce(
    (sum, item) => sum + getQuantity(item) * getPrice(item),
    0
  );

  // Get top category and brand
  const topCategory = useMemo(() => {
    const entries = Object.entries(categorySummary);
    if (entries.length === 0) return "N/A";
    return entries.sort((a, b) => b[1].count - a[1].count)[0][0];
  }, [categorySummary]);

  const topBrand = useMemo(() => {
    const entries = Object.entries(brandSummary);
    if (entries.length === 0) return "N/A";
    return entries.sort((a, b) => b[1].count - a[1].count)[0][0];
  }, [brandSummary]);

  const criticalItemsCount = useMemo(() => {
    return lowStockItems.filter((i) => i.quantity <= 5).length;
  }, [lowStockItems]);

  // Chart data preparation
  const categoryChartData = Object.entries(categorySummary).map(
    ([category, data]) => ({
      name: category,
      value: data.quantity,
    })
  );

  const statusChartData = Object.entries(statusCounts).map(
    ([status, count]) => ({
      name: status,
      value: count,
    })
  );

  const topStockItems = [...filteredItems]
    .sort((a, b) => getQuantity(b) - getQuantity(a))
    .slice(0, 6)
    .map((item) => ({
      name:
        item.name && item.name.length > 16
          ? `${item.name.slice(0, 16)}...` 
          : item.name || "Unnamed",
      stock: getQuantity(item),
    }));

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

  const handlePrintExecutiveReport = () => {
    const printWindow = window.open("", "_blank");

    const reportDate = new Date().toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const lowStockRows = lowStockItems
      .map(
        (item) => `
        <tr>
          <td>${item.name || "N/A"}</td>
          <td>${item.sku || "N/A"}</td>
          <td>${item.category || "N/A"}</td>
          <td>${item.quantity || 0}</td>
          <td>${item.quantity <= 5 ? "Critical" : "Low Stock"}</td>
        </tr>
      `
      )
      .join("");

    const inventoryRows = filteredItems
      .map(
        (item) => `
        <tr>
          <td>${item.id || "N/A"}</td>
          <td>${item.name || "N/A"}</td>
          <td>${item.category || "N/A"}</td>
          <td>${item.quantity || 0}</td>
          <td>₱${(Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2)}</td>
          <td>${item.status || "N/A"}</td>
        </tr>
      `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Inventory Executive Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 32px;
              color: #111827;
            }

            .header {
              border-bottom: 4px solid #ff5f93;
              padding-bottom: 18px;
              margin-bottom: 24px;
            }

            .header h1 {
              margin: 0;
              color: #ff5f93;
              font-size: 28px;
            }

            .header p {
              margin: 6px 0 0;
              color: #64748b;
            }

            .summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-bottom: 24px;
            }

            .card {
              border: 1px solid #fbcfe8;
              border-radius: 12px;
              padding: 14px;
              background: #fff1f7;
            }

            .card span {
              display: block;
              color: #64748b;
              font-size: 12px;
              font-weight: 700;
            }

            .card strong {
              display: block;
              margin-top: 6px;
              font-size: 22px;
              color: #be185d;
            }

            h2 {
              margin-top: 28px;
              color: #111827;
              font-size: 18px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 8px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
              font-size: 12px;
            }

            th {
              background: #fff1f7;
              color: #111827;
              text-align: left;
              padding: 10px;
              border: 1px solid #fbcfe8;
            }

            td {
              padding: 9px 10px;
              border: 1px solid #e5e7eb;
            }

            .note {
              margin-top: 24px;
              padding: 14px;
              border-left: 4px solid #ff5f93;
              background: #fff1f7;
              font-size: 13px;
            }

            @media print {
              button {
                display: none;
              }

              body {
                padding: 20px;
              }
            }
          </style>
        </head>

        <body>
          <div class="header">
            <h1>Pawesome Inventory Executive Report</h1>
            <p>Generated on ${reportDate}</p>
            <p>Stock levels, inventory value, and low-stock monitoring summary.</p>
          </div>

          <div class="summary">
            <div class="card">
              <span>Total Products</span>
              <strong>${totalProducts}</strong>
            </div>

            <div class="card">
              <span>Total Stock Units</span>
              <strong>${totalStockQuantity}</strong>
            </div>

            <div class="card">
              <span>Inventory Value</span>
              <strong>₱${Number(totalInventoryValue || 0).toFixed(2)}</strong>
            </div>

            <div class="card">
              <span>Low Stock Items</span>
              <strong>${lowStockItems.length}</strong>
            </div>
          </div>

          <h2>Executive Summary</h2>
          <p>
            This report summarizes the current inventory status of the system.
            It includes total stock quantity, estimated inventory value, product availability,
            and low-stock items requiring attention.
          </p>

          <h2>Low Stock Alerts</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Alert Level</th>
              </tr>
            </thead>
            <tbody>
              ${
                lowStockRows ||
                `<tr><td colspan="5">No low stock items found.</td></tr>` 
              }
            </tbody>
          </table>

          <h2>Inventory Details</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Total Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                inventoryRows ||
                `<tr><td colspan="6">No inventory records found.</td></tr>` 
              }
            </tbody>
          </table>

          <div class="note">
            <strong>Recommendation:</strong>
            Review low-stock and critical-stock items immediately to prevent service or product availability issues.
          </div>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="inventory-reports-page">
      <div className="inventory-reports-inner">
        {/* Hero Header */}
        <div className="reports-hero">
          <div className="hero-left">
            <h1>Inventory Analytics Dashboard</h1>
            <p>Real-time stock insights, alerts, and inventory performance</p>
        </div>

        <div className="hero-right">
          <div className="mini-stat">
            <span>Total</span>
            <strong>{totalProducts}</strong>
          </div>

          <div className="mini-stat">
            <span>Low Stock</span>
            <strong>{lowStockItems.length}</strong>
          </div>

          <div className="mini-stat">
            <span>Value</span>
            <strong>
  ₱{totalInventoryValue >= 1000000
    ? `${(totalInventoryValue / 1000000).toFixed(1)}M` 
    : totalInventoryValue >= 1000
    ? `${(totalInventoryValue / 1000).toFixed(1)}K` 
    : Number(totalInventoryValue || 0).toFixed(0)}
</strong>
          </div>
        </div>
      </div>

      <div className="inventory-compact-filters">
  <div className="compact-search">
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search products by name, SKU, brand, or supplier..."
    />
  </div>

  <div className="compact-filter-row">
    <div className="compact-filter-group">
      <label>From</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => handleDateChange("startDate", e.target.value)}
      />
    </div>

    <div className="compact-filter-group">
      <label>To</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => handleDateChange("endDate", e.target.value)}
      />
    </div>

    <div className="compact-filter-group">
      <label>Status</label>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="all">All Status</option>
        <option value="In stock">In Stock</option>
        <option value="Low stock">Low Stock</option>
        <option value="Out of stock">Out of Stock</option>
      </select>
    </div>

    <div className="compact-filter-group">
      <label>Category</label>
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
      >
        <option value="all">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  </div>

  <div className="compact-filter-actions">
    <button type="button" className="btn-clear-report" onClick={handleClearFilters}>
      Clear
    </button>

    <button type="button" className="btn-export-report" onClick={handleExportCSV}>
      Export CSV
    </button>

    <button type="button" className="btn-export-report" onClick={handleExportPDF}>
      Export PDF
    </button>

    <button type="button" className="btn-export-report" onClick={handleExportExcel}>
      Export Excel
    </button>
  </div>
</div>

      {/* Executive Report Button */}
      <div className="executive-report-actions">
        <button className="btn-primary" onClick={handlePrintExecutiveReport}>
          <FontAwesomeIcon icon={faBox} /> Print Executive Report
        </button>
      </div>

      {/* Loading State or Main Content */}
      {loading ? (
        <div className="reports-loading-card">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : (
        <>
          {/* Insights Row */}
          <div className="insights-row">
        <div className="insight-card">
          <h4>Top Category</h4>
          <p>{topCategory}</p>
        </div>

        <div className="insight-card">
          <h4>Top Brand</h4>
          <p>{topBrand}</p>
        </div>

        <div className="insight-card">
          <h4>Critical Items</h4>
          <p>{criticalItemsCount}</p>
        </div>
      </div>

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
            <div className="card-value">₱{Number(totalInventoryValue || 0).toFixed(2)}</div>
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

      {/* Charts Grid */}
      <div className="reports-charts-grid">
        <section className="chart-card">
          <div className="chart-header">
            <h3>Top Stock Items</h3>
            <p>Highest available stock quantities</p>
          </div>

          {topStockItems.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topStockItems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="stock" fill="#ff5f93" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No stock data available</div>
          )}
        </section>

        <section className="chart-card">
          <div className="chart-header">
            <h3>Stock Status</h3>
            <p>In stock, low stock, and out of stock count</p>
          </div>

          {statusChartData.some((item) => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {statusChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={["#10b981", "#f59e0b", "#ef4444"][index]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No status data available</div>
          )}
        </section>
      </div>

      {/* Status Overview */}
      <div className="status-overview-section">
        <h3>Stock Status Overview</h3>
        <div className="status-grid">
          <div className="status-card in-stock">
            <FontAwesomeIcon icon={faCheckCircle} />
            <div className="status-info">
              <span className="status-count">{statusCounts["In Stock"]}</span>
              <span className="status-label">In Stock</span>
            </div>
          </div>
          <div className="status-card low-stock">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <div className="status-info">
              <span className="status-count">{statusCounts["Low Stock"]}</span>
              <span className="status-label">Low Stock</span>
            </div>
          </div>
          <div className="status-card out-stock">
            <FontAwesomeIcon icon={faBox} />
            <div className="status-info">
              <span className="status-count">{statusCounts["Out of Stock"]}</span>
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
                    <td>₱{Number(data.value || 0).toFixed(2)}</td>
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
                    <td>₱{Number(data.value || 0).toFixed(2)}</td>
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
                  <tr key={item.id} className={getQuantity(item) <= 5 ? "critical" : "warning"}>
                    <td>{item.name}</td>
                    <td>{item.sku}</td>
                    <td>{item.category}</td>
                    <td className="stock-cell">{getQuantity(item)}</td>
                    <td>
                      <span className={`alert-badge ${getQuantity(item) <= 5 ? "critical" : "warning"}`}>
                        {getQuantity(item) <= 5 ? "Critical" : "Low Stock"}
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
                  <td
                  className={`stock-cell ${
                    getQuantity(item) <= Number(item.minimum_stock_level ?? item.reorder_level ?? 10)
                      ? "low"
                      : ""
                  }`}
                >
                  {getQuantity(item)}
                </td>

                <td>₱{getPrice(item).toFixed(2)}</td>

                <td>₱{(getQuantity(item) * getPrice(item)).toFixed(2)}</td>

                <td>
                  <span
                    className={`status-badge ${getItemStatus(item)
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >
                    {getItemStatus(item)}
                  </span>
                </td>

                <td>{formatExpiry(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
    </div>
  );
};

export default InventoryReports;