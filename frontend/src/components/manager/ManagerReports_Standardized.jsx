import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
import "./ManagerReports.css";

const CHART_COLORS = ["#ff5f93", "#ff8db5", "#ffc8dd", "#f59e0b", "#10b981", "#3b82f6"];

const ManagerReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Data states
  const [staff, setStaff] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [workflowMetrics, setWorkflowMetrics] = useState({});

  // Set default date range to current month
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
      const [staffData, reportResult] = await Promise.all([
        apiRequest("/manager/staff").catch(() => []),
        apiRequest("/manager/reports/live"),
      ]);
      const reportData = reportResult?.data || reportResult || {};
      const summary = reportData.summary || {};

      setStaff(
        Array.isArray(staffData)
          ? staffData
          : staffData?.staff || staffData?.users || staffData?.data || []
      );
      setRevenue(reportData.revenue || reportData.monthly_revenue || []);
      setTransactions(reportData.transactions || reportData.sales || []);
      setWorkflowMetrics(summary);

      setError("");
    } catch (err) {
      console.error("Failed to fetch manager reports:", err);
      setError("Failed to load live manager report data.");
      setStaff([]);
      setRevenue([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const filteredStaff = useMemo(() => {
    let filtered = [...staff];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (person) =>
          person.name?.toLowerCase().includes(search) ||
          person.email?.toLowerCase().includes(search) ||
          person.role?.toLowerCase().includes(search)
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((person) => person.role === roleFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((person) => person.status === statusFilter);
    }

    return filtered;
  }, [staff, searchTerm, roleFilter, statusFilter]);

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

  const staffExportColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "hire_date", label: "Hire Date", format: "date" },
    { key: "performance", label: "Performance" },
  ];

  const handleExportStaffCSV = () => {
    exportToCSV(filteredStaff, staffExportColumns, "manager-staff-report");
  };

  const handleExportStaffPDF = () => {
    exportToPDF(filteredStaff, staffExportColumns, "Manager Staff Report", "manager-staff-report");
  };

  const handleExportStaffExcel = () => {
    exportToExcel(filteredStaff, staffExportColumns, "manager-staff-report");
  };

  // Prepare summary cards data
  const summaryCards = [
    {
      id: "total-staff",
      label: "Total Staff",
      value: workflowMetrics.total_staff || staff.length,
      icon: "faUsers",
      color: "primary",
      trend: "up",
      change: "+3.2%"
    },
    {
      id: "active-staff",
      label: "Active Staff",
      value: workflowMetrics.active_staff || staff.filter(s => s.status === 'active').length,
      icon: "faUserCheck",
      color: "success",
      trend: "up",
      change: "+5.1%"
    },
    {
      id: "monthly-revenue",
      label: "Monthly Revenue",
      value: formatCurrency(workflowMetrics.monthly_revenue || 0),
      icon: "faMoneyBillWave",
      color: "secondary",
      trend: "up",
      change: "+12.7%"
    },
    {
      id: "total-transactions",
      label: "Total Transactions",
      value: workflowMetrics.total_transactions || transactions.length,
      icon: "faChartLine",
      color: "warning",
      trend: "up",
      change: "+8.3%"
    },
    {
      id: "staff-on-leave",
      label: "Staff on Leave",
      value: workflowMetrics.staff_on_leave || staff.filter(s => s.status === 'on_leave').length,
      icon: "faCalendarAlt",
      color: "info",
      trend: "neutral",
      change: "0%"
    }
  ];

  // Prepare table columns
  const staffTableColumns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "hire_date", label: "Hire Date", format: "date", sortable: true },
    { key: "performance", label: "Performance", sortable: true },
  ];

  // Chart data preparation
  const roleDistributionData = useMemo(() => {
    const roleCounts = {};
    filteredStaff.forEach(person => {
      const role = person.role || 'Unknown';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
    return Object.entries(roleCounts).map(([role, count]) => ({
      role,
      count,
    }));
  }, [filteredStaff]);

  const statusDistributionData = useMemo(() => {
    const statusCounts = {};
    filteredStaff.forEach(person => {
      const status = person.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  }, [filteredStaff]);

  const monthlyRevenueData = useMemo(() => {
    return revenue.slice(-12).map(item => ({
      month: new Date(item.month || Date.now()).toLocaleDateString('en-US', { month: 'short' }),
      revenue: Number(item.revenue || item.amount || 0),
    }));
  }, [revenue]);

  const renderManagerContent = () => (
    <div className="manager-reports-content">
      <StandardSummaryCards cards={summaryCards} />
      
      <div className="charts-section">
        <div className="chart-row">
          <div className="chart-container">
            <h3 className="section-title">Staff Role Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, percent }) => `${role}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {roleDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3 className="section-title">Monthly Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="revenue" stroke="#ff5f93" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="data-table-section">
        <h3 className="section-title">Staff Management</h3>
        <StandardTable
          columns={staffTableColumns}
          data={filteredStaff}
          emptyMessage="No staff members found"
        />
      </div>
    </div>
  );

  const filterProps = {
    searchTerm,
    onSearchChange: setSearchTerm,
    startDate,
    endDate,
    onDateChange: handleDateChange,
    statusFilter,
    onStatusChange: setStatusFilter,
    statusOptions: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "on_leave", label: "On Leave" },
      { value: "suspended", label: "Suspended" },
    ],
    roleFilter,
    onRoleChange: setRoleFilter,
    roleOptions: [
      { value: "admin", label: "Admin" },
      { value: "manager", label: "Manager" },
      { value: "cashier", label: "Cashier" },
      { value: "receptionist", label: "Receptionist" },
      { value: "veterinary", label: "Veterinary" },
      { value: "inventory", label: "Inventory" },
    ],
    showRole: true,
    onExportCSV: handleExportStaffCSV,
    onExportPDF: handleExportStaffPDF,
    onExportExcel: handleExportStaffExcel,
    loading,
    onRefresh: fetchReportData,
    onClearFilters: handleClearFilters,
    searchPlaceholder: "Search staff members...",
  };

  return (
    <StandardReportLayout
      title="Manager Reports"
      subtitle="Staff performance, business metrics, and operational analytics"
      icon={faUsers}
      loading={loading}
      error={error}
      onRefresh={fetchReportData}
      lastUpdated={new Date().toLocaleTimeString()}
      filterProps={filterProps}
    >
      <div className="reports-content">
        {renderManagerContent()}
      </div>
    </StandardReportLayout>
  );
};

export default ManagerReports;
