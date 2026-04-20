import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import "./AdminReports.css";

const AdminReports = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Raw data storage
  const [rawTransactions, setRawTransactions] = useState([]);
  const [rawAppointments, setRawAppointments] = useState([]);
  const [rawUsers, setRawUsers] = useState([]);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/reports") {
      setActiveTab("overview");
    }
  }, [location.pathname]);

  // Set default date range to current month
  useEffect(() => {
    const { startDate: defaultStart, endDate: defaultEnd } = getDateRangePreset("month");
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  }, []);

  // Quick date range selector
  const handleQuickDateRange = (preset) => {
    const { startDate: start, endDate: end } = getDateRangePreset(preset);
    setStartDate(start);
    setEndDate(end);
    // Auto refresh data when date range changes
    setTimeout(() => fetchReportData(), 100);
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/admin/reports/summary");
      setReportData(data);

      // Store raw data for filtering
      setRawTransactions(data.transactions || []);
      setRawAppointments(data.appointments || []);
      setRawUsers(data.users || []);

      setError("");
    } catch (err) {
      setError(err.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to data
  const getFilteredData = () => {
    let filtered = {
      transactions: rawTransactions,
      appointments: rawAppointments,
      users: rawUsers,
    };

    // Apply date range filter
    if (startDate || endDate) {
      filtered.transactions = filterByDateRange(filtered.transactions, "date", startDate, endDate);
      filtered.appointments = filterByDateRange(filtered.appointments, "date", startDate, endDate);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered.transactions = filterByStatus(filtered.transactions, "status", statusFilter);
      filtered.appointments = filterByStatus(filtered.appointments, "status", statusFilter);
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered.users = filtered.users.filter((u) => u.role === roleFilter);
    }

    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered.transactions = filtered.transactions.filter(
        (t) =>
          t.id?.toLowerCase().includes(search) ||
          t.customer?.toLowerCase().includes(search) ||
          t.type?.toLowerCase().includes(search)
      );
      filtered.appointments = filtered.appointments.filter(
        (a) =>
          a.id?.toLowerCase().includes(search) ||
          a.customer?.toLowerCase().includes(search) ||
          a.service?.toLowerCase().includes(search)
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
    setRoleFilter("all");
    const { startDate: defaultStart, endDate: defaultEnd } = getDateRangePreset("month");
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  };

  // Export handlers
  const handleExportCSV = () => {
    const filtered = getFilteredData();
    const columns = [
      { key: "id", label: "ID" },
      { key: "customer", label: "Customer" },
      { key: "type", label: "Type" },
      { key: "date", label: "Date" },
      { key: "amount", label: "Amount", format: "currency" },
      { key: "status", label: "Status" },
    ];
    exportToCSV(filtered.transactions, columns, "admin-transactions-report");
  };

  const handleExportPDF = () => {
    const filtered = getFilteredData();
    const columns = [
      { key: "id", label: "ID" },
      { key: "customer", label: "Customer" },
      { key: "type", label: "Type" },
      { key: "date", label: "Date", format: "date" },
      { key: "amount", label: "Amount", format: "currency" },
      { key: "status", label: "Status" },
    ];
    exportToPDF(filtered.transactions, columns, "Admin Transactions Report", "admin-transactions-report");
  };

  const handleExportExcel = () => {
    const filtered = getFilteredData();
    const columns = [
      { key: "id", label: "ID" },
      { key: "customer", label: "Customer" },
      { key: "type", label: "Type" },
      { key: "date", label: "Date" },
      { key: "amount", label: "Amount", format: "currency" },
      { key: "status", label: "Status" },
    ];
    exportToExcel(filtered.transactions, columns, "admin-transactions-report");
  };

  const formatPercentage = (value) => {
    return `${Number(value || 0).toFixed(1)}%`;
  };

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyTrend = reportData?.monthly_revenue?.map((item) => ({
    month: monthNames[(item.month ?? 1) - 1] || "N/A",
    revenue: Number(item.total) || 0,
  })) || [];

  const renderOverview = () => (
    <div className="modern-reports">
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-value">{formatCurrency(reportData?.total_revenue)}</div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-change positive">+12.5%</div>
        </div>
        <div className="stat-card secondary">
          <div className="stat-value">{reportData?.total_transactions || 0}</div>
          <div className="stat-label">Total Transactions</div>
          <div className="stat-change positive">+8.2%</div>
        </div>
        <div className="stat-card tertiary">
          <div className="stat-value">{reportData?.total_customers || 0}</div>
          <div className="stat-label">Total Customers</div>
          <div className="stat-change positive">+15.3%</div>
        </div>
        <div className="stat-card quaternary">
          <div className="stat-value">{reportData?.new_customers || 0}</div>
          <div className="stat-label">New Customers (30d)</div>
          <div className="stat-change neutral">+5.1%</div>
        </div>
        <div className="stat-card quinary">
          <div className="stat-value">{reportData?.total_users || 0}</div>
          <div className="stat-label">Total Users</div>
          <div className="stat-change positive">+3.7%</div>
        </div>
      </div>
      
      <div className="chart-section">
        <h3 className="section-title">Monthly Revenue Trend</h3>
        <div className="chart-container">
          <div className="revenue-chart">
            {monthlyTrend.map((month, index) => {
              const height = Math.min((month.revenue / Math.max(reportData?.total_revenue || 1, 1)) * 100, 100);
              return (
                <div key={month.month} className="chart-bar-wrapper">
                  <div className="chart-bar" style={{ height: `${height}%` }}></div>
                  <div className="chart-label">{month.month}</div>
                  <div className="chart-value">{formatCurrency(month.revenue)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCashier = () => (
    <div className="modern-reports">
      <div className="metrics-header">
        <h3 className="section-title">Cashier Metrics</h3>
        <div className="period-selector">
          <button className="period-btn active">Today</button>
          <button className="period-btn">Week</button>
          <button className="period-btn">Month</button>
        </div>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card revenue">
          <div className="metric-header">
            <span className="metric-title">Total Sales</span>
            <span className="metric-period">All time</span>
          </div>
          <div className="metric-value">{formatCurrency(reportData?.total_revenue)}</div>
          <div className="metric-sparkline"></div>
        </div>
        
        <div className="metric-card transactions">
          <div className="metric-header">
            <span className="metric-title">Today&apos;s Transactions</span>
            <span className="metric-period">Today</span>
          </div>
          <div className="metric-value">{reportData?.today_transactions || 0}</div>
          <div className="metric-sparkline"></div>
        </div>
        
        <div className="metric-card total-transactions">
          <div className="metric-header">
            <span className="metric-title">Total Transactions</span>
            <span className="metric-period">All time</span>
          </div>
          <div className="metric-value">{reportData?.total_transactions || 0}</div>
          <div className="metric-sparkline"></div>
        </div>
      </div>
      
      <div className="services-section">
        <h4 className="subsection-title">Top Services</h4>
        <div className="services-list">
          {reportData?.top_services?.map((service, index) => (
            <div key={`${service.service}-${index}`} className="service-item">
              <div className="service-rank">#{index + 1}</div>
              <div className="service-info">
                <div className="service-name">{service.service}</div>
                <div className="service-orders">{service.count} orders</div>
              </div>
              <div className="service-performance">
                <div className="performance-bar"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="modern-reports">
      <h3 className="section-title">Inventory Metrics</h3>
      
      <div className="inventory-overview">
        <div className="inventory-card total">
          <div className="inventory-icon"></div>
          <div className="inventory-details">
            <div className="inventory-value">{reportData?.total_inventory_items || 0}</div>
            <div className="inventory-label">Total Items</div>
          </div>
          <div className="inventory-status good"></div>
        </div>
        
        <div className="inventory-card warning">
          <div className="inventory-icon"></div>
          <div className="inventory-details">
            <div className="inventory-value">{reportData?.low_stock_items || 0}</div>
            <div className="inventory-label">Low Stock Items</div>
          </div>
          <div className="inventory-status warning"></div>
        </div>
        
        <div className="inventory-card danger">
          <div className="inventory-icon"></div>
          <div className="inventory-details">
            <div className="inventory-value">{reportData?.out_of_stock_items || 0}</div>
            <div className="inventory-label">Out of Stock</div>
          </div>
          <div className="inventory-status danger"></div>
        </div>
      </div>
      
      <div className="stock-alerts">
        <h4 className="subsection-title">Stock Alerts</h4>
        <div className="alert-summary">
          <div className="alert-item critical">
            <span className="alert-count">{reportData?.out_of_stock_items || 0}</span>
            <span className="alert-text">Critical - Out of Stock</span>
          </div>
          <div className="alert-item warning">
            <span className="alert-count">{reportData?.low_stock_items || 0}</span>
            <span className="alert-text">Warning - Low Stock</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReception = () => (
    <div className="modern-reports">
      <h3 className="section-title">Reception Metrics</h3>
      
      <div className="reception-stats">
        <div className="reception-card appointments">
          <div className="reception-icon appointments"></div>
          <div className="reception-content">
            <div className="reception-value">{reportData?.total_appointments || 0}</div>
            <div className="reception-label">Total Appointments</div>
            <div className="reception-subtitle">This month</div>
          </div>
        </div>
        
        <div className="reception-card completed">
          <div className="reception-icon completed"></div>
          <div className="reception-content">
            <div className="reception-value">{reportData?.completed_appointments || 0}</div>
            <div className="reception-label">Completed Appointments</div>
            <div className="reception-subtitle">Success rate: 85%</div>
          </div>
        </div>
        
        <div className="reception-card revenue">
          <div className="reception-icon revenue"></div>
          <div className="reception-content">
            <div className="reception-value">{formatCurrency(reportData?.today_revenue)}</div>
            <div className="reception-label">Today&apos;s Revenue</div>
            <div className="reception-subtitle">From appointments</div>
          </div>
        </div>
      </div>
      
      <div className="appointment-flow">
        <h4 className="subsection-title">Appointment Status</h4>
        <div className="flow-stages">
          <div className="flow-stage scheduled">
            <div className="stage-dot"></div>
            <div className="stage-info">
              <span className="stage-count">12</span>
              <span className="stage-label">Scheduled</span>
            </div>
          </div>
          <div className="flow-stage in-progress">
            <div className="stage-dot"></div>
            <div className="stage-info">
              <span className="stage-count">5</span>
              <span className="stage-label">In Progress</span>
            </div>
          </div>
          <div className="flow-stage completed">
            <div className="stage-dot"></div>
            <div className="stage-info">
              <span className="stage-count">{reportData?.completed_appointments || 0}</span>
              <span className="stage-label">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVeterinary = () => (
    <div className="modern-reports">
      <h3 className="section-title">Veterinary Metrics</h3>
      
      <div className="veterinary-dashboard">
        <div className="vet-metrics-row">
          <div className="vet-metric-card patients">
            <div className="vet-metric-header">
              <span className="vet-metric-title">Total Patients</span>
              <span className="vet-metric-subtitle">Active records</span>
            </div>
            <div className="vet-metric-value">{reportData?.total_pets || 0}</div>
            <div className="vet-metric-trend positive">+23 this month</div>
          </div>
          
          <div className="vet-metric-card appointments">
            <div className="vet-metric-header">
              <span className="vet-metric-title">Total Appointments</span>
              <span className="vet-metric-subtitle">All time</span>
            </div>
            <div className="vet-metric-value">{reportData?.total_appointments || 0}</div>
            <div className="vet-metric-trend positive">+15 this week</div>
          </div>
          
          <div className="vet-metric-card completed">
            <div className="vet-metric-header">
              <span className="vet-metric-title">Completed Appointments</span>
              <span className="vet-metric-subtitle">Success rate</span>
            </div>
            <div className="vet-metric-value">{reportData?.completed_appointments || 0}</div>
            <div className="vet-metric-trend positive">92% completion</div>
          </div>
        </div>
        
        <div className="vet-health-indicators">
          <h4 className="subsection-title">Health Indicators</h4>
          <div className="indicators-grid">
            <div className="indicator-card vaccinations">
              <div className="indicator-header">
                <span className="indicator-title">Vaccinations</span>
                <span className="indicator-status up-to-date">Up to date</span>
              </div>
              <div className="indicator-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '87%'}}></div>
                </div>
                <span className="progress-text">87% compliance</span>
              </div>
            </div>
            
            <div className="indicator-card checkups">
              <div className="indicator-header">
                <span className="indicator-title">Regular Checkups</span>
                <span className="indicator-status good">Good</span>
              </div>
              <div className="indicator-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '72%'}}></div>
                </div>
                <span className="progress-text">72% regular</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="modern-reports">
      <h3 className="section-title">Customer Metrics</h3>
      
      <div className="customer-overview">
        <div className="customer-stats-grid">
          <div className="customer-stat-card total">
            <div className="customer-stat-header">
              <span className="customer-stat-title">Total Customers</span>
              <span className="customer-stat-badge">All time</span>
            </div>
            <div className="customer-stat-value">{reportData?.total_customers || 0}</div>
            <div className="customer-stat-growth positive">+18.5%</div>
          </div>
          
          <div className="customer-stat-card new">
            <div className="customer-stat-header">
              <span className="customer-stat-title">New Customers</span>
              <span className="customer-stat-badge">30 days</span>
            </div>
            <div className="customer-stat-value">{reportData?.new_customers || 0}</div>
            <div className="customer-stat-growth positive">+12.3%</div>
          </div>
        </div>
      </div>
      
      <div className="top-customers">
        <h4 className="subsection-title">Top Customers</h4>
        <div className="customers-ranking">
          {reportData?.top_customers?.map((customer, index) => (
            <div key={`${customer.customer}-${index}`} className="customer-rank-item">
              <div className="rank-position">#{index + 1}</div>
              <div className="customer-info">
                <div className="customer-name">{customer.customer}</div>
                <div className="customer-details">Active since 2024</div>
              </div>
              <div className="customer-stats">
                <div className="visits-count">{customer.visits}</div>
                <div className="visits-label">visits</div>
              </div>
              <div className="customer-loyalty">
                <div className="loyalty-badge premium">Premium</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "cashier":
        return renderCashier();
      case "inventory":
        return renderInventory();
      case "reception":
        return renderReception();
      case "veterinary":
        return renderVeterinary();
      case "customers":
        return renderCustomers();
      default:
        return renderOverview();
    }
  };

  // Get filtered data for display
  const filteredData = getFilteredData();

  return (
    <div className="admin-reports-page">
      <div className="reports-header">
        <div className="header-content">
          <h1 className="page-title">Admin Reports</h1>
          <p className="page-subtitle">Live business metrics and activity trends from the backend</p>
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
          { value: "in-progress", label: "In Progress" },
        ]}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        roleOptions={[
          { value: "admin", label: "Admin" },
          { value: "manager", label: "Manager" },
          { value: "cashier", label: "Cashier" },
          { value: "receptionist", label: "Receptionist" },
          { value: "veterinary", label: "Veterinary" },
          { value: "customer", label: "Customer" },
        ]}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        loading={loading}
        onRefresh={fetchReportData}
        onClearFilters={handleClearFilters}
        showRole={true}
        searchPlaceholder="Search transactions, customers, or services..."
      />
      
      {/* Quick Date Range Selector */}
      <div className="quick-filters-bar">
        <div className="quick-filters-label">Quick Select:</div>
        <div className="quick-filters">
          <button 
            className={`quick-filter-btn ${startDate === getDateRangePreset('today').startDate ? 'active' : ''}`}
            onClick={() => handleQuickDateRange('today')}
          >
            Today
          </button>
          <button 
            className={`quick-filter-btn ${startDate === getDateRangePreset('week').startDate ? 'active' : ''}`}
            onClick={() => handleQuickDateRange('week')}
          >
            This Week
          </button>
          <button 
            className={`quick-filter-btn ${startDate === getDateRangePreset('month').startDate ? 'active' : ''}`}
            onClick={() => handleQuickDateRange('month')}
          >
            This Month
          </button>
          <button 
            className={`quick-filter-btn ${startDate === getDateRangePreset('quarter').startDate ? 'active' : ''}`}
            onClick={() => handleQuickDateRange('quarter')}
          >
            This Quarter
          </button>
          <button 
            className={`quick-filter-btn ${startDate === getDateRangePreset('year').startDate ? 'active' : ''}`}
            onClick={() => handleQuickDateRange('year')}
          >
            This Year
          </button>
        </div>
      </div>

      <div className="reports-navigation">
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span className="tab-icon">📊</span> Overview
          </button>
          <button
            className={`nav-tab ${activeTab === "cashier" ? "active" : ""}`}
            onClick={() => setActiveTab("cashier")}
          >
            <span className="tab-icon">💰</span> Cashier
          </button>
          <button
            className={`nav-tab ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            <span className="tab-icon">📦</span> Inventory
          </button>
          <button
            className={`nav-tab ${activeTab === "reception" ? "active" : ""}`}
            onClick={() => setActiveTab("reception")}
          >
            <span className="tab-icon">📅</span> Reception
          </button>
          <button
            className={`nav-tab ${activeTab === "veterinary" ? "active" : ""}`}
            onClick={() => setActiveTab("veterinary")}
          >
            <span className="tab-icon">🩺</span> Veterinary
          </button>
          <button
            className={`nav-tab ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            <span className="tab-icon">👥</span> Customers
          </button>
        </nav>
      </div>

      <div className="reports-content">
        {loading ? (
          <div className="loading-state enhanced">
            <div className="loading-spinner animated"></div>
            <span className="loading-text">Loading live report metrics...</span>
            <div className="loading-subtext">Fetching data from {activeTab} module</div>
          </div>
        ) : error ? (
          <div className="error-state enhanced">
            <div className="error-icon">⚠️</div>
            <div className="error-message">{error}</div>
            <button className="retry-btn" onClick={fetchReportData}>
              🔄 Retry Loading
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

export default AdminReports;
