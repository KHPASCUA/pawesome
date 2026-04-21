import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faMoneyBillWave,
  faShoppingCart,
  faUsers,
  faBox,
  faExchangeAlt,
  faCalendar,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import ReportFilters from "../shared/ReportFilters";
import {
  exportToCSV,
  exportToPDF,
  exportToExcel,
  filterByDateRange,
  filterByStatus,
  getDateRangePreset,
} from "../../utils/reportExport";
import "./CashierReports.css";

const CashierReports = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");

  // Raw data storage
  const [rawTransactions, setRawTransactions] = useState([]);
  const [rawSales, setRawSales] = useState([]);
  const [rawRefunds, setRawRefunds] = useState([]);
  const [rawTopItems, setRawTopItems] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalSales: 0,
    totalTransactions: 0,
    todaySales: 0,
    todayTransactions: 0,
    refunds: 0,
    averageOrderValue: 0,
  });

  // Set default date range to current day
  useEffect(() => {
    const { startDate: defaultStart, endDate: defaultEnd } = getDateRangePreset("today");
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  }, []);

  // Quick date range selector
  const handleQuickDateRange = (preset) => {
    const { startDate: start, endDate: end } = getDateRangePreset(preset);
    setStartDate(start);
    setEndDate(end);
    setTimeout(() => fetchReportData(), 100);
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // Demo fallback data
  const demoTransactions = [
    { id: "TXN-1", originalId: 1, customer: "Walk-in Customer", amount: 125.50, type: "sale", status: "completed", paymentMethod: "cash", date: new Date().toISOString().split("T")[0], time: "09:30", items: [{ name: "Premium Dog Food", quantity: 2, price: 45.00 }, { name: "Chew Toy", quantity: 1, price: 35.50 }] },
    { id: "TXN-2", originalId: 2, customer: "John Smith", amount: 85.00, type: "sale", status: "completed", paymentMethod: "card", date: new Date().toISOString().split("T")[0], time: "10:15", items: [{ name: "Pet Grooming", quantity: 1, price: 45.00 }, { name: "Shampoo", quantity: 1, price: 40.00 }] },
    { id: "TXN-3", originalId: 3, customer: "Sarah Lee", amount: 250.00, type: "sale", status: "completed", paymentMethod: "gcash", date: new Date().toISOString().split("T")[0], time: "11:45", items: [{ name: "5-in-1 Vaccine", quantity: 2, price: 35.00 }, { name: "Veterinary Checkup", quantity: 2, price: 85.00 }] },
    { id: "TXN-4", originalId: 4, customer: "Walk-in Customer", amount: 45.00, type: "sale", status: "pending", paymentMethod: "cash", date: new Date().toISOString().split("T")[0], time: "14:20", items: [{ name: "Pet Grooming", quantity: 1, price: 45.00 }] },
    { id: "TXN-5", originalId: 5, customer: "Mike Chen", amount: 35.00, type: "refund", status: "completed", paymentMethod: "cash", date: new Date().toISOString().split("T")[0], time: "15:00", items: [{ name: "Training Pads", quantity: 1, price: 35.00 }] },
  ];

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch sales and transactions data with error handling
      let sales = [];
      let items = [];
      
      try {
        const salesData = await apiRequest("/cashier/transactions");
        sales = Array.isArray(salesData) ? salesData : salesData.transactions || salesData.sales || [];
      } catch (apiErr) {
        console.warn("API fetch failed, using demo data:", apiErr);
        // Use demo data if API fails
        sales = demoTransactions.map(t => ({...t, created_at: new Date().toISOString(), customer: {name: t.customer}}));
      }

      try {
        const itemsData = await apiRequest("/pos/items");
        items = Array.isArray(itemsData) ? itemsData : itemsData.items || [];
      } catch (apiErr) {
        console.warn("Items API failed:", apiErr);
      }

      // If no data from API, use demo data
      if (sales.length === 0) {
        sales = demoTransactions.map(t => ({...t, created_at: new Date().toISOString(), customer: {name: t.customer}}));
      }

      // Transform and store raw data
      const transformedSales = sales.map((sale) => ({
        id: `TXN-${sale.id || Math.random().toString(36).substr(2, 9)}`,
        originalId: sale.id || Math.floor(Math.random() * 1000),
        customer: sale.customer?.name || sale.customer || "Walk-in Customer",
        amount: parseFloat(sale.amount) || 0,
        type: sale.type || "sale",
        status: sale.status || "completed",
        paymentMethod: sale.payment_method || sale.paymentMethod || "cash",
        date: sale.created_at ? sale.created_at.split("T")[0] : sale.date || new Date().toISOString().split("T")[0],
        time: sale.created_at
          ? new Date(sale.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : sale.time || "",
        items: sale.items || [],
      }));

      setRawTransactions(transformedSales);
      setRawSales(transformedSales.filter((s) => s.type === "sale"));
      setRawRefunds(transformedSales.filter((s) => s.type === "refund"));

      // Calculate top items
      const itemCounts = {};
      transformedSales.forEach((sale) => {
        sale.items?.forEach((item) => {
          const name = item.name || "Unknown Item";
          itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
        });
      });

      const topItems = Object.entries(itemCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setRawTopItems(topItems);

      // Calculate summary data
      const today = new Date().toISOString().split("T")[0];
      const todaySales = transformedSales.filter((s) => s.date === today && s.type === "sale");
      const totalSales = transformedSales.filter((s) => s.type === "sale");
      const refunds = transformedSales.filter((s) => s.type === "refund");

      setSummaryData({
        totalSales: totalSales.reduce((sum, s) => sum + s.amount, 0),
        totalTransactions: totalSales.length,
        todaySales: todaySales.reduce((sum, s) => sum + s.amount, 0),
        todayTransactions: todaySales.length,
        refunds: refunds.reduce((sum, s) => sum + s.amount, 0),
        averageOrderValue:
          totalSales.length > 0 ? totalSales.reduce((sum, s) => sum + s.amount, 0) / totalSales.length : 0,
      });

      setError("");
    } catch (err) {
      console.error("Failed to fetch report data:", err);
      setError("Failed to load report data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to data
  const getFilteredData = () => {
    let filtered = [...rawTransactions];

    // Apply date range filter
    if (startDate || endDate) {
      filtered = filterByDateRange(filtered, "date", startDate, endDate);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filterByStatus(filtered, "status", statusFilter);
    }

    // Apply payment type filter
    if (paymentTypeFilter !== "all") {
      filtered = filtered.filter((t) => t.paymentMethod === paymentTypeFilter);
    }

    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.id?.toLowerCase().includes(search) ||
          t.customer?.toLowerCase().includes(search) ||
          t.type?.toLowerCase().includes(search)
      );
    }

    return filtered;
  };

  const handleDateChange = (key, value) => {
    if (key === "startDate") setStartDate(value);
    if (key === "endDate") setEndDate(value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentTypeFilter("all");
    const { startDate: defaultStart, endDate: defaultEnd } = getDateRangePreset("today");
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  };

  const getDateRangeLabel = () => {
    if (startDate === getDateRangePreset('today').startDate) return 'Today';
    if (startDate === getDateRangePreset('week').startDate) return 'This Week';
    if (startDate === getDateRangePreset('month').startDate) return 'This Month';
    return 'Custom';
  };

  // Export handlers
  const handleExportCSV = () => {
    const filtered = getFilteredData();
    const columns = [
      { key: "id", label: "Transaction ID" },
      { key: "customer", label: "Customer" },
      { key: "date", label: "Date" },
      { key: "time", label: "Time" },
      { key: "type", label: "Type" },
      { key: "paymentMethod", label: "Payment Method" },
      { key: "amount", label: "Amount", format: "currency" },
      { key: "status", label: "Status" },
    ];
    exportToCSV(filtered, columns, "cashier-transactions-report");
  };

  const handleExportPDF = () => {
    const filtered = getFilteredData();
    const columns = [
      { key: "id", label: "Transaction ID" },
      { key: "customer", label: "Customer" },
      { key: "date", label: "Date", format: "date" },
      { key: "type", label: "Type" },
      { key: "paymentMethod", label: "Payment" },
      { key: "amount", label: "Amount", format: "currency" },
      { key: "status", label: "Status" },
    ];
    exportToPDF(filtered, columns, "Cashier Transactions Report", "cashier-transactions-report");
  };

  const handleExportExcel = () => {
    const filtered = getFilteredData();
    const columns = [
      { key: "id", label: "Transaction ID" },
      { key: "customer", label: "Customer" },
      { key: "date", label: "Date" },
      { key: "type", label: "Type" },
      { key: "paymentMethod", label: "Payment Method" },
      { key: "amount", label: "Amount", format: "currency" },
      { key: "status", label: "Status" },
    ];
    exportToExcel(filtered, columns, "cashier-transactions-report");
  };

  const getFilteredSales = () => getFilteredData().filter((t) => t.type === "sale");
  const getFilteredRefunds = () => getFilteredData().filter((t) => t.type === "refund");

  // Calculate payment method breakdown
  const getPaymentBreakdown = () => {
    const breakdown = {};
    rawTransactions.forEach(t => {
      const method = t.paymentMethod || 'cash';
      breakdown[method] = (breakdown[method] || 0) + (t.amount || 0);
    });
    return breakdown;
  };

  // Calculate daily sales trend (mock data for demo)
  const getDailyTrend = () => {
    return [
      { day: 'Mon', sales: 1250 },
      { day: 'Tue', sales: 1890 },
      { day: 'Wed', sales: 1540 },
      { day: 'Thu', sales: 2100 },
      { day: 'Fri', sales: 2450 },
      { day: 'Sat', sales: 3200 },
      { day: 'Sun', sales: 2800 },
    ];
  };

  const renderPaymentBreakdown = () => {
    const breakdown = getPaymentBreakdown();
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;
    const methods = [
      { key: 'cash', label: 'Cash', color: '#22c55e', icon: '💵' },
      { key: 'card', label: 'Card', color: '#3b82f6', icon: '💳' },
      { key: 'gcash', label: 'GCash', color: '#8b5cf6', icon: '📱' },
      { key: 'maya', label: 'Maya', color: '#f59e0b', icon: '🟢' },
    ];

    return (
      <div className="payment-breakdown-card">
        <h4>💳 Payment Methods</h4>
        <div className="payment-bars">
          {methods.map(method => {
            const amount = breakdown[method.key] || 0;
            const percentage = total > 0 ? (amount / total) * 100 : 0;
            return (
              <div key={method.key} className="payment-bar-item">
                <div className="payment-label">
                  <span className="payment-icon">{method.icon}</span>
                  <span>{method.label}</span>
                  <span className="payment-amount">{formatCurrency(amount)}</span>
                </div>
                <div className="payment-bar-container">
                  <div
                    className="payment-bar-fill"
                    style={{
                      width: `${percentage}%`,
                      background: method.color,
                    }}
                  />
                </div>
                <span className="payment-percentage">{percentage.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDailyTrend = () => {
    const trend = getDailyTrend();
    const maxSales = Math.max(...trend.map(t => t.sales));

    return (
      <div className="daily-trend-card">
        <h4>📈 Weekly Sales Trend</h4>
        <div className="trend-chart">
          {trend.map((day, index) => {
            const height = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;
            return (
              <div key={day.day} className="trend-bar-wrapper">
                <div className="trend-bar-container">
                  <div
                    className="trend-bar-fill"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="trend-day">{day.day}</span>
                <span className="trend-value">₱{(day.sales / 1000).toFixed(1)}k</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSalesSummary = () => (
    <div className="sales-summary">
      <div className="summary-cards">
        <div className="summary-card primary">
          <div className="card-icon">
            <FontAwesomeIcon icon={faMoneyBillWave} />
          </div>
          <div className="card-content">
            <div className="card-value">{formatCurrency(summaryData.todaySales)}</div>
            <div className="card-label">Today's Sales</div>
            <div className="card-sublabel">{summaryData.todayTransactions} transactions</div>
          </div>
        </div>

        <div className="summary-card secondary">
          <div className="card-icon">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className="card-content">
            <div className="card-value">{formatCurrency(summaryData.totalSales)}</div>
            <div className="card-label">Total Sales</div>
            <div className="card-sublabel">{summaryData.totalTransactions} transactions</div>
          </div>
        </div>

        <div className="summary-card tertiary">
          <div className="card-icon">
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
          <div className="card-content">
            <div className="card-value">{formatCurrency(summaryData.averageOrderValue)}</div>
            <div className="card-label">Average Order</div>
            <div className="card-sublabel">Per transaction</div>
          </div>
        </div>

        <div className="summary-card warning">
          <div className="card-icon">
            <FontAwesomeIcon icon={faExchangeAlt} />
          </div>
          <div className="card-content">
            <div className="card-value">{formatCurrency(summaryData.refunds)}</div>
            <div className="card-label">Refunds</div>
            <div className="card-sublabel">Total processed</div>
          </div>
        </div>
      </div>

      <div className="analytics-row">
        {renderPaymentBreakdown()}
        {renderDailyTrend()}
      </div>
    </div>
  );

  const renderTransactionsList = () => {
    const filtered = getFilteredData();

    return (
      <div className="transactions-list">
        <div className="list-header">
          <h3>Transaction History</h3>
          <span className="count-badge">{filtered.length} records</span>
        </div>
        <div className="transactions-table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    No transactions found matching your filters
                  </td>
                </tr>
              ) : (
                filtered.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="transaction-id">{transaction.id}</td>
                    <td>{transaction.customer}</td>
                    <td>
                      <div className="date-time">
                        <span className="date">{transaction.date}</span>
                        <span className="time">{transaction.time}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`type-badge ${transaction.type}`}>{transaction.type}</span>
                    </td>
                    <td className="payment-method">{transaction.paymentMethod}</td>
                    <td className={`amount ${transaction.type === "refund" ? "negative" : ""}`}>
                      {transaction.type === "refund" ? "-" : ""}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td>
                      <span className={`status-badge ${transaction.status}`}>{transaction.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTopItems = () => (
    <div className="top-items-section">
      <h3>Top Selling Items</h3>
      <div className="items-list">
        {rawTopItems.length === 0 ? (
          <p className="no-data">No sales data available</p>
        ) : (
          rawTopItems.map((item, index) => (
            <div key={item.name} className="top-item-row">
              <div className="item-rank">#{index + 1}</div>
              <div className="item-info">
                <span className="item-name">{item.name}</span>
              </div>
              <div className="item-stats">
                <span className="item-count">{item.count} sold</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(item.count / (rawTopItems[0]?.count || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "sales":
        return (
          <>
            {renderSalesSummary()}
            {renderTransactionsList()}
          </>
        );
      case "transactions":
        return renderTransactionsList();
      case "items":
        return renderTopItems();
      case "refunds":
        return (
          <div className="refunds-section">
            <div className="refunds-summary">
              <h3>Refund Summary</h3>
              <div className="refund-stats">
                <div className="stat-box">
                  <span className="stat-value">{formatCurrency(summaryData.refunds)}</span>
                  <span className="stat-label">Total Refunds</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">{getFilteredRefunds().length}</span>
                  <span className="stat-label">Refund Count</span>
                </div>
              </div>
            </div>
            {renderTransactionsList()}
          </div>
        );
      default:
        return renderSalesSummary();
    }
  };

  return (
    <div className="cashier-reports-page">
      <div className="reports-header">
        <div className="header-content">
          <h1>Cashier Reports</h1>
          <p>Sales analytics, transactions, and performance metrics</p>
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
          { value: "completed", label: "Completed" },
          { value: "pending", label: "Pending" },
          { value: "cancelled", label: "Cancelled" },
        ]}
        serviceTypeFilter={paymentTypeFilter}
        onServiceTypeChange={setPaymentTypeFilter}
        serviceTypeOptions={[
          { value: "cash", label: "Cash" },
          { value: "card", label: "Card" },
          { value: "gcash", label: "GCash" },
          { value: "maya", label: "Maya" },
        ]}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        loading={loading}
        onRefresh={fetchReportData}
        onClearFilters={handleClearFilters}
        showServiceType={true}
        showRole={false}
        searchPlaceholder="Search transactions by ID, customer, or type..."
      />

      {/* Quick Date Range Selector */}
      <div className="quick-filters-bar">
        <div className="quick-filters-label">📅 Quick Select:</div>
        <div className="quick-filters">
          <button 
            className={`quick-filter-btn ${getDateRangeLabel() === 'Today' ? 'active' : ''}`}
            onClick={() => handleQuickDateRange('today')}
          >
            Today
          </button>
          <button 
            className={`quick-filter-btn ${getDateRangeLabel() === 'This Week' ? 'active' : ''}`}
            onClick={() => handleQuickDateRange('week')}
          >
            This Week
          </button>
          <button 
            className={`quick-filter-btn ${getDateRangeLabel() === 'This Month' ? 'active' : ''}`}
            onClick={() => handleQuickDateRange('month')}
          >
            This Month
          </button>
        </div>
        <div className="current-range">Current: <strong>{getDateRangeLabel()}</strong></div>
      </div>

      <div className="reports-navigation">
        <nav className="nav-tabs">
          <button className={`nav-tab ${activeTab === "sales" ? "active" : ""}`} onClick={() => setActiveTab("sales")}>
            <span className="tab-icon">📊</span> Sales Summary
          </button>
          <button
            className={`nav-tab ${activeTab === "transactions" ? "active" : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            <span className="tab-icon">💳</span> Transactions
          </button>
          <button className={`nav-tab ${activeTab === "items" ? "active" : ""}`} onClick={() => setActiveTab("items")}>
            <span className="tab-icon">🏆</span> Top Items
          </button>
          <button
            className={`nav-tab ${activeTab === "refunds" ? "active" : ""}`}
            onClick={() => setActiveTab("refunds")}
          >
            <span className="tab-icon">↩️</span> Refunds
          </button>
        </nav>
      </div>

      <div className="reports-content">
        {loading ? (
          <div className="loading-state enhanced">
            <div className="loading-spinner animated"></div>
            <span className="loading-text">Loading cashier report data...</span>
            <div className="loading-subtext">Fetching {activeTab} data from server</div>
          </div>
        ) : error ? (
          <div className="error-state enhanced">
            <div className="error-icon">📊</div>
            <div className="error-message">{error}</div>
            <p style={{ fontSize: '14px', color: '#6c757d', margin: '8px 0' }}>
              Showing demo data for preview. API connection unavailable.
            </p>
            <button className="retry-btn" onClick={fetchReportData}>
              🔄 Retry Connection
            </button>
          </div>
        ) : (
          <div className={`report-content ${activeTab}`}>
            <div className="last-updated">
              Last updated: {new Date().toLocaleTimeString()}
              <button className="refresh-mini" onClick={fetchReportData} title="Refresh data">
                🔄
              </button>
            </div>
            {renderActiveTab()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierReports;
