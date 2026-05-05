import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
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
import StandardReportLayout from "../shared/StandardReportLayout";
import StandardSummaryCards from "../shared/StandardSummaryCards";
import StandardTable from "../shared/StandardTable";
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
    const { startDate: defaultStart, endDate: defaultEnd } = getDateRangePreset("month");
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  }, []);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const result = await apiRequest("/admin/reports/overview");
      const data = result?.data?.summary || result?.data || result?.summary || result || {};

      const safeData = {
        total_revenue: safeNumber(data.total_revenue),
        total_transactions: safeNumber(data.total_transactions || data.total_orders),
        total_customers: safeNumber(data.total_customers),
        new_customers: safeNumber(data.new_customers || data.active_customers),
        total_users: safeNumber(data.total_users),
        today_transactions: safeNumber(data.today_transactions),
        today_revenue: safeNumber(data.today_revenue),
        total_pets: safeNumber(data.total_pets),
        total_appointments: safeNumber(data.total_appointments),
        completed_appointments: safeNumber(data.completed_appointments || data.completed_services),
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

    const { startDate: defaultStart, endDate: defaultEnd } = getDateRangePreset("month");

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

  // Prepare summary cards data
  const summaryCards = [
    {
      id: "total-revenue",
      label: "Total Revenue",
      value: formatCurrency(reportData?.total_revenue || 0),
      icon: "faMoneyBillWave",
      color: "primary",
      trend: "up",
      change: "+12.5%"
    },
    {
      id: "total-transactions",
      label: "Total Transactions",
      value: reportData?.total_transactions || 0,
      icon: "faChartLine",
      color: "secondary",
      trend: "up",
      change: "+8.2%"
    },
    {
      id: "total-customers",
      label: "Total Customers",
      value: reportData?.total_customers || 0,
      icon: "faUsers",
      color: "success",
      trend: "up",
      change: "+15.3%"
    },
    {
      id: "new-customers",
      label: "New Customers",
      value: reportData?.new_customers || 0,
      icon: "faUsers",
      color: "warning",
      trend: "up",
      change: "+5.1%"
    },
    {
      id: "total-users",
      label: "Total Users",
      value: reportData?.total_users || 0,
      icon: "faUsers",
      color: "info",
      trend: "up",
      change: "+3.7%"
    }
  ];

  // Prepare table columns
  const tableColumns = [
    { key: "id", label: "ID", sortable: true },
    { key: "customer", label: "Customer", sortable: true },
    { key: "type", label: "Type", sortable: true },
    { key: "date", label: "Date", format: "date", sortable: true },
    { key: "amount", label: "Amount", format: "currency", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

  const renderOverview = () => (
    <div className="admin-overview-content">
      <StandardSummaryCards cards={summaryCards} />
      
      <div className="chart-section">
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
      </div>

      <div className="data-table-section">
        <h3 className="section-title">Recent Transactions</h3>
        <StandardTable
          columns={tableColumns}
          data={getFilteredData().transactions}
          emptyMessage="No transactions found"
        />
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      default:
        return renderOverview();
    }
  };

  const filterProps = {
    searchTerm,
    onSearchChange: setSearchTerm,
    startDate,
    endDate,
    onDateChange: handleDateChange,
    statusFilter,
    onStatusChange: setStatusFilter,
    statusOptions: [
      { value: "completed", label: "Completed" },
      { value: "pending", label: "Pending" },
      { value: "cancelled", label: "Cancelled" },
      { value: "in-progress", label: "In Progress" },
    ],
    roleFilter,
    onRoleChange: setRoleFilter,
    roleOptions: [
      { value: "admin", label: "Admin" },
      { value: "manager", label: "Manager" },
      { value: "cashier", label: "Cashier" },
      { value: "receptionist", label: "Receptionist" },
      { value: "veterinary", label: "Veterinary" },
      { value: "customer", label: "Customer" },
    ],
    onExportCSV: handleExportCSV,
    onExportPDF: handleExportPDF,
    onExportExcel: handleExportExcel,
    loading,
    onRefresh: fetchReportData,
    onClearFilters: handleClearFilters,
    showRole: true,
    searchPlaceholder: "Search transactions, customers, or services...",
  };

  return (
    <StandardReportLayout
      title="Admin Reports"
      subtitle="Live business metrics and activity trends from the backend"
      icon={faChartLine}
      loading={loading}
      error={error}
      onRefresh={fetchReportData}
      lastUpdated={new Date().toLocaleTimeString()}
      filterProps={filterProps}
    >
      <div className="admin-reports-navigation">
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
        {renderActiveTab()}
      </div>
    </StandardReportLayout>
  );
};

export default AdminReports;
