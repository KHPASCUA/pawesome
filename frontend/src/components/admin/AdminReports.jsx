import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
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

const safeNumber = (value) => Number(value || 0);

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const AdminReports = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const [rawTransactions, setRawTransactions] = useState([]);
  const [rawAppointments, setRawAppointments] = useState([]);
  const [rawUsers, setRawUsers] = useState([]);

  useEffect(() => {
    if (location.pathname === "/admin" || location.pathname === "/admin/reports") {
      setActiveTab("overview");
    }
  }, [location.pathname]);

  useEffect(() => {
    const { startDate: defaultStart, endDate: defaultEnd } =
      getDateRangePreset("month");
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  }, []);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/admin/reports/summary");

      const safeData = {
        total_revenue: safeNumber(data.total_revenue),
        total_transactions: safeNumber(data.total_transactions),
        total_customers: safeNumber(data.total_customers),
        new_customers: safeNumber(data.new_customers),
        total_users: safeNumber(data.total_users),
        today_transactions: safeNumber(data.today_transactions),
        today_revenue: safeNumber(data.today_revenue),
        total_pets: safeNumber(data.total_pets),
        total_appointments: safeNumber(data.total_appointments),
        completed_appointments: safeNumber(data.completed_appointments),
        total_inventory_items: safeNumber(data.total_inventory_items),
        low_stock_items: safeNumber(data.low_stock_items),
        out_of_stock_items: safeNumber(data.out_of_stock_items),
        total_staff: safeNumber(data.total_staff),
        active_staff: safeNumber(data.active_staff),
        staff_on_leave: safeNumber(data.staff_on_leave),
        inactive_staff: safeNumber(data.inactive_staff),
        active_roles: safeNumber(data.active_roles || 6),
        monthly_revenue_total: safeNumber(data.monthly_revenue),
        monthly_revenue_trend: data.monthly_revenue_trend || [],
        top_services: data.top_services || [],
        top_customers: data.top_customers || [],
        transactions: data.transactions || [],
        appointments: data.appointments || [],
        users: data.users || [],
      };

      setReportData(safeData);
      setRawTransactions(safeData.transactions);
      setRawAppointments(safeData.appointments);
      setRawUsers(safeData.users);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load report data");
      setReportData({
        total_revenue: 0,
        total_transactions: 0,
        total_customers: 0,
        new_customers: 0,
        total_users: 0,
        today_transactions: 0,
        today_revenue: 0,
        total_pets: 0,
        total_appointments: 0,
        completed_appointments: 0,
        total_inventory_items: 0,
        low_stock_items: 0,
        out_of_stock_items: 0,
        total_staff: 0,
        active_staff: 0,
        staff_on_leave: 0,
        inactive_staff: 0,
        active_roles: 6,
        monthly_revenue_total: 0,
        monthly_revenue_trend: [],
        top_services: [],
        top_customers: [],
        transactions: [],
        appointments: [],
        users: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    let filtered = {
      transactions: rawTransactions,
      appointments: rawAppointments,
      users: rawUsers,
    };

    if (startDate || endDate) {
      filtered.transactions = filterByDateRange(
        filtered.transactions,
        "date",
        startDate,
        endDate
      );
      filtered.appointments = filterByDateRange(
        filtered.appointments,
        "date",
        startDate,
        endDate
      );
    }

    if (statusFilter !== "all") {
      filtered.transactions = filterByStatus(
        filtered.transactions,
        "status",
        statusFilter
      );
      filtered.appointments = filterByStatus(
        filtered.appointments,
        "status",
        statusFilter
      );
    }

    if (roleFilter !== "all") {
      filtered.users = filtered.users.filter((u) => u.role === roleFilter);
    }

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

    const { startDate: defaultStart, endDate: defaultEnd } =
      getDateRangePreset("month");

    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  };

  const handleQuickDateRange = (preset) => {
    const { startDate: start, endDate: end } = getDateRangePreset(preset);
    setStartDate(start);
    setEndDate(end);
    setTimeout(fetchReportData, 100);
  };

  const exportColumns = [
    { key: "id", label: "ID" },
    { key: "customer", label: "Customer" },
    { key: "type", label: "Type" },
    { key: "date", label: "Date", format: "date" },
    { key: "amount", label: "Amount", format: "currency" },
    { key: "status", label: "Status" },
  ];

  const handleExportCSV = () => {
    exportToCSV(getFilteredData().transactions, exportColumns, "admin-transactions-report");
  };

  const handleExportPDF = () => {
    exportToPDF(
      getFilteredData().transactions,
      exportColumns,
      "Admin Transactions Report",
      "admin-transactions-report"
    );
  };

  const handleExportExcel = () => {
    exportToExcel(
      getFilteredData().transactions,
      exportColumns,
      "admin-transactions-report"
    );
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const monthlyTrend =
    reportData?.monthly_revenue_trend?.map((item) => ({
      month: monthNames[(item.month ?? 1) - 1] || "N/A",
      revenue: safeNumber(item.total),
    })) || [];

  const StatCard = ({ className, value, label, change }) => (
    <motion.div className={`stat-card ${className}`} variants={fadeUp}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className={`stat-change ${change?.includes("+") ? "positive" : "neutral"}`}>
        {change}
      </div>
    </motion.div>
  );

  const renderOverview = () => (
    <motion.div
      className="modern-reports"
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.08 }}
    >
      <div className="stats-grid">
        <StatCard
          className="primary"
          value={formatCurrency(reportData?.total_revenue || 0)}
          label="Total Revenue"
          change="+12.5%"
        />
        <StatCard
          className="secondary"
          value={reportData?.total_transactions || 0}
          label="Total Transactions"
          change="+8.2%"
        />
        <StatCard
          className="tertiary"
          value={reportData?.total_customers || 0}
          label="Total Customers"
          change="+15.3%"
        />
        <StatCard
          className="quaternary"
          value={reportData?.new_customers || 0}
          label="New Customers"
          change="+5.1%"
        />
        <StatCard
          className="quinary"
          value={reportData?.total_users || 0}
          label="Total Users"
          change="+3.7%"
        />
      </div>

      <motion.div className="chart-section" variants={fadeUp}>
        <h3 className="section-title">Monthly Revenue Trend</h3>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="revenue" fill="#ff5f93" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );

  const renderCashier = () => (
    <div className="modern-reports">
      <h3 className="section-title">Cashier Metrics</h3>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-title">Total Sales</div>
          <div className="metric-value">{formatCurrency(reportData?.total_revenue || 0)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-title">Today&apos;s Transactions</div>
          <div className="metric-value">{reportData?.today_transactions || 0}</div>
        </div>

        <div className="metric-card">
          <div className="metric-title">Total Transactions</div>
          <div className="metric-value">{reportData?.total_transactions || 0}</div>
        </div>
      </div>

      <div className="view-full-report">
        <button className="view-full-btn" onClick={() => navigate("/admin/reports/cashier")}>
          <span>📊</span> View Full Cashier Report
        </button>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="modern-reports">
      <h3 className="section-title">Inventory Metrics</h3>

      <div className="inventory-overview">
        <div className="inventory-card total">
          <div className="inventory-details">
            <div className="inventory-value">{reportData?.total_inventory_items || 0}</div>
            <div className="inventory-label">Total Items</div>
          </div>
        </div>

        <div className="inventory-card warning">
          <div className="inventory-details">
            <div className="inventory-value">{reportData?.low_stock_items || 0}</div>
            <div className="inventory-label">Low Stock Items</div>
          </div>
        </div>

        <div className="inventory-card danger">
          <div className="inventory-details">
            <div className="inventory-value">{reportData?.out_of_stock_items || 0}</div>
            <div className="inventory-label">Out of Stock</div>
          </div>
        </div>
      </div>

      <div className="view-full-report">
        <button className="view-full-btn" onClick={() => navigate("/admin/reports/inventory")}>
          <span>📦</span> View Full Inventory Report
        </button>
      </div>
    </div>
  );

  const renderReception = () => (
    <div className="modern-reports">
      <h3 className="section-title">Reception Metrics</h3>

      <div className="reception-stats">
        <div className="reception-card">
          <div className="reception-value">{reportData?.total_appointments || 0}</div>
          <div className="reception-label">Total Appointments</div>
        </div>

        <div className="reception-card">
          <div className="reception-value">{reportData?.completed_appointments || 0}</div>
          <div className="reception-label">Completed Appointments</div>
        </div>

        <div className="reception-card">
          <div className="reception-value">{formatCurrency(reportData?.today_revenue || 0)}</div>
          <div className="reception-label">Today&apos;s Revenue</div>
        </div>
      </div>

      <div className="view-full-report">
        <button className="view-full-btn" onClick={() => navigate("/admin/reports/reception")}>
          <span>📅</span> View Full Reception Report
        </button>
      </div>
    </div>
  );

  const renderVeterinary = () => (
    <div className="modern-reports">
      <h3 className="section-title">Veterinary Metrics</h3>

      <div className="vet-metrics-row">
        <div className="vet-metric-card">
          <div className="vet-metric-title">Total Patients</div>
          <div className="vet-metric-value">{reportData?.total_pets || 0}</div>
        </div>

        <div className="vet-metric-card">
          <div className="vet-metric-title">Total Appointments</div>
          <div className="vet-metric-value">{reportData?.total_appointments || 0}</div>
        </div>

        <div className="vet-metric-card">
          <div className="vet-metric-title">Completed Appointments</div>
          <div className="vet-metric-value">{reportData?.completed_appointments || 0}</div>
        </div>
      </div>

      <div className="view-full-report">
        <button className="view-full-btn" onClick={() => navigate("/admin/reports/veterinary")}>
          <span>🩺</span> View Full Veterinary Report
        </button>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="modern-reports">
      <h3 className="section-title">Customer Metrics</h3>

      <div className="customer-stats-grid">
        <div className="customer-stat-card">
          <div className="customer-stat-title">Total Customers</div>
          <div className="customer-stat-value">{reportData?.total_customers || 0}</div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-title">New Customers</div>
          <div className="customer-stat-value">{reportData?.new_customers || 0}</div>
        </div>
      </div>

      <div className="view-full-report">
        <button className="view-full-btn" onClick={() => navigate("/admin/reports/customers")}>
          <span>👥</span> View Full Customer Report
        </button>
      </div>
    </div>
  );

  const renderManager = () => (
    <div className="modern-reports">
      <h3 className="section-title">Manager Metrics</h3>

      <div className="manager-stats-grid">
        <div className="manager-stat-card staff">
          <div className="manager-stat-title">Total Staff</div>
          <div className="manager-stat-value">
            {reportData?.total_staff || reportData?.total_users || 0}
          </div>
        </div>

        <div className="manager-stat-card roles">
          <div className="manager-stat-title">Role Distribution</div>
          <div className="manager-stat-value">{reportData?.active_roles || 6}</div>
        </div>

        <div className="manager-stat-card revenue">
          <div className="manager-stat-title">Monthly Revenue</div>
          <div className="manager-stat-value">
            {formatCurrency(reportData?.monthly_revenue_total || 0)}
          </div>
        </div>
      </div>

      <div className="view-full-report">
        <button className="view-full-btn" onClick={() => navigate("/admin/reports/manager")}>
          <span>👔</span> View Full Manager Report
        </button>
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
      case "manager":
        return renderManager();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="admin-reports-page">
      <div className="reports-header">
        <div className="header-content">
          <h1 className="page-title">Admin Reports</h1>
          <p className="page-subtitle">
            Live business metrics and activity trends from the backend
          </p>
        </div>
      </div>

      <div className="quick-access-reports">
        <h3 className="quick-access-title">📂 Role-Based Report Modules</h3>

        <div className="quick-access-grid">
          {[
            ["cashier", "💰", "Cashier Reports", "Sales, transactions & refunds"],
            ["inventory", "📦", "Inventory Reports", "Stock levels & analytics"],
            ["manager", "👔", "Manager Reports", "Staff & business analytics"],
            ["veterinary", "🩺", "Veterinary Reports", "Patient & service metrics"],
            ["customers", "👥", "Customer Reports", "Bookings & activity"],
            ["reception", "📅", "Reception Reports", "Appointments & operations"],
          ].map(([key, icon, label, desc]) => (
            <button
              key={key}
              className={`quick-access-card ${key}`}
              onClick={() => setActiveTab(key)}
            >
              <span className="quick-access-icon">{icon}</span>
              <span className="quick-access-label">{label}</span>
              <span className="quick-access-desc">{desc}</span>
            </button>
          ))}
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

      <div className="quick-filters-bar">
        <div className="quick-filters-label">Quick Select:</div>

        <div className="quick-filters">
          {["today", "week", "month", "quarter", "year"].map((preset) => (
            <button
              key={preset}
              className={`quick-filter-btn ${
                startDate === getDateRangePreset(preset).startDate ? "active" : ""
              }`}
              onClick={() => handleQuickDateRange(preset)}
            >
              {preset === "today"
                ? "Today"
                : preset === "week"
                ? "This Week"
                : preset === "month"
                ? "This Month"
                : preset === "quarter"
                ? "This Quarter"
                : "This Year"}
            </button>
          ))}
        </div>
      </div>

      <div className="reports-navigation">
        <nav className="nav-tabs">
          {[
            ["overview", "📊", "Overview"],
            ["cashier", "💰", "Cashier"],
            ["inventory", "📦", "Inventory"],
            ["reception", "📅", "Reception"],
            ["veterinary", "🩺", "Veterinary"],
            ["customers", "👥", "Customers"],
            ["manager", "👔", "Manager"],
          ].map(([key, icon, label]) => (
            <button
              key={key}
              className={`nav-tab ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              <span className="tab-icon">{icon}</span> {label}
            </button>
          ))}
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
          <motion.div
            key={activeTab}
            className={`report-content ${activeTab}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="last-updated">
              Last updated: {new Date().toLocaleTimeString()}
              <button className="refresh-mini" onClick={fetchReportData}>
                🔄
              </button>
            </div>

            {renderActiveTab()}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;