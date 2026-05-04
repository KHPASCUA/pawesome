import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faMoneyBillWave,
  faChartLine,
  faUserCheck,
  faUserTimes,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
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

  // Set default date range to current month
  useEffect(() => {
    const { startDate: defaultStart, endDate: defaultEnd } = getDateRangePreset("month");
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  }, []);

  useEffect(() => {
    fetchReportData();
  }, []);

  // Demo data for fallback when API fails
  const demoStaff = [
    { id: 1, name: "John Admin", email: "john@pawesome.com", role: "admin", status: "active", joinDate: "2024-01-15" },
    { id: 2, name: "Sarah Manager", email: "sarah@pawesome.com", role: "manager", status: "active", joinDate: "2024-02-01" },
    { id: 3, name: "Mike Cashier", email: "mike@pawesome.com", role: "cashier", status: "active", joinDate: "2024-03-10" },
    { id: 4, name: "Emily Vet", email: "emily@pawesome.com", role: "veterinary", status: "active", joinDate: "2024-02-20" },
    { id: 5, name: "Tom Reception", email: "tom@pawesome.com", role: "receptionist", status: "on_leave", joinDate: "2024-04-01" },
    { id: 6, name: "Lisa Inventory", email: "lisa@pawesome.com", role: "inventory", status: "active", joinDate: "2024-03-15" },
  ];

  const demoRevenue = [
    { month: 1, total: 125000, transactions: 145 },
    { month: 2, total: 145000, transactions: 168 },
    { month: 3, total: 138000, transactions: 152 },
    { month: 4, total: 162000, transactions: 185 },
    { month: 5, total: 175000, transactions: 198 },
    { month: 6, total: 158000, transactions: 172 },
  ];

  const demoTransactions = [
    { id: 1, customer: "John Smith", amount: 1500, type: "sale", status: "completed", created_at: new Date().toISOString() },
    { id: 2, customer: "Sarah Johnson", amount: 2500, type: "sale", status: "completed", created_at: new Date().toISOString() },
    { id: 3, customer: "Mike Brown", amount: 3500, type: "sale", status: "completed", created_at: new Date(Date.now() - 86400000).toISOString() },
  ];

  const fetchReportData = async () => {
    try {
      setLoading(true);
      let staffData, revenueData, transactionsData;
      
      try {
        staffData = await apiRequest("/manager/staff");
      } catch (apiErr) {
        console.warn("Staff API failed, using demo:", apiErr);
        staffData = demoStaff;
      }
      
      try {
        revenueData = await apiRequest("/manager/reports/summary");
      } catch (apiErr) {
        console.warn("Revenue API failed, using demo:", apiErr);
        revenueData = { revenue: demoRevenue };
      }
      
      try {
        transactionsData = await apiRequest("/manager/reports/sales");
      } catch (apiErr) {
        console.warn("Transactions API failed, using demo:", apiErr);
        transactionsData = demoTransactions;
      }

      setStaff(
        Array.isArray(staffData)
          ? staffData
          : staffData?.staff || staffData?.users || staffData?.data || demoStaff
      );
      setRevenue(revenueData?.revenue || demoRevenue);
      setTransactions(
        Array.isArray(transactionsData) ? transactionsData : transactionsData?.sales || transactionsData?.transactions || demoTransactions
      );

      setError("");
    } catch (err) {
      console.error("Failed to fetch manager reports:", err);
      setError("Failed to load report data. Using demo data.");
      setStaff(demoStaff);
      setRevenue(demoRevenue);
      setTransactions(demoTransactions);
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
        (s) =>
          s.name?.toLowerCase().includes(search) ||
          s.email?.toLowerCase().includes(search) ||
          s.role?.toLowerCase().includes(search)
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((s) => s.role === roleFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (s) =>
          (s.status === "active" || s.active === true || s.is_active === true
            ? "active"
            : "inactive") === statusFilter
      );
    }

    return filtered;
  }, [staff, searchTerm, roleFilter, statusFilter]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (startDate || endDate) {
      filtered = filterByDateRange(filtered, "created_at", startDate, endDate);
    }

    return filtered;
  }, [transactions, startDate, endDate]);

  // Calculate summaries
  const activeStaff = filteredStaff.filter(
    (s) => s.status === "active" || s.active === true || s.is_active === true
  ).length;
  const inactiveStaff = filteredStaff.length - activeStaff;

  const totalRevenue = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  }, [filteredTransactions]);

  const monthlyRevenue = useMemo(() => {
    const summary = {};
    filteredTransactions.forEach((t) => {
      if (t.created_at) {
        const month = new Date(t.created_at).toLocaleString("default", { month: "short", year: "2-digit" });
        summary[month] = (summary[month] || 0) + (parseFloat(t.amount) || 0);
      }
    });
    return summary;
  }, [filteredTransactions]);

  // Role distribution
  const roleDistribution = useMemo(() => {
    const dist = {};
    filteredStaff.forEach((s) => {
      dist[s.role] = (dist[s.role] || 0) + 1;
    });
    return dist;
  }, [filteredStaff]);

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
    const columns = [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "active", label: "Status" },
      { key: "created_at", label: "Joined Date" },
    ];
    exportToCSV(filteredStaff, columns, "manager-staff-report");
  };

  const handleExportPDF = () => {
    const columns = [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "active", label: "Status" },
    ];
    exportToPDF(filteredStaff, columns, "Staff Report", "manager-staff-report");
  };

  const handleExportExcel = () => {
    const columns = [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "active", label: "Status" },
    ];
    exportToExcel(filteredStaff, columns, "manager-staff-report");
  };

  // Chart data
  const revenueChartData = Object.entries(monthlyRevenue).map(([month, amount]) => ({
    month,
    revenue: amount,
  }));

  const roleChartData = Object.entries(roleDistribution).map(([role, count]) => ({
    role,
    count,
  }));

  const staffStatusData = [
    { name: "Active", value: activeStaff, color: "#ff5f93" },
    { name: "Inactive", value: inactiveStaff, color: "#ffb3c8" },
  ];

  return (
    <div className="manager-reports">
      <div className="reports-header">
        <div className="header-content">
          <h1 className="reports-title">Manager Reports</h1>
          <p className="reports-subtitle">Business analytics, staff overview, and revenue insights</p>
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
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
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
        searchPlaceholder="Search staff by name, email, or role..."
      />

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{filteredStaff.length}</div>
            <div className="stat-label">Total Staff</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUserCheck} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{activeStaff}</div>
            <div className="stat-label">Active Staff</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUserTimes} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{inactiveStaff}</div>
            <div className="stat-label">Inactive Staff</div>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faMoneyBillWave} />
          </div>
          <div className="revenue-icon">
            <FontAwesomeIcon icon={faMoneyBillWave} />
          </div>
          <div className="revenue-info">
            <span className="revenue-label">Total Revenue</span>
            <span className="revenue-value">{formatCurrency(totalRevenue)}</span>
            <span className="revenue-period">For selected period</span>
          </div>
        </div>
      </div>

      {/* Premium Charts Grid */}
      <div className="premium-reports-chart-grid">
        <div className="premium-chart-card wide">
          <h3>Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ff5f93"
                strokeWidth={4}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="premium-chart-card">
          <h3>Staff Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={staffStatusData}
                dataKey="value"
                nameKey="name"
                outerRadius={95}
                label
              >
                {staffStatusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="premium-chart-card full">
          <h3>Role Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roleChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ff8db5" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="reports-columns">
        {/* Monthly Revenue */}
        <div className="reports-panel">
          <h3>
            <FontAwesomeIcon icon={faCalendarAlt} />
            Monthly Revenue
          </h3>
          <div className="revenue-list">
            {Object.entries(monthlyRevenue).length === 0 ? (
              <p className="no-data">No revenue data available</p>
            ) : (
              Object.entries(monthlyRevenue)
                .sort()
                .map(([month, amount]) => (
                  <div key={month} className="revenue-item">
                    <span className="month">{month}</span>
                    <span className="amount">{formatCurrency(amount)}</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(
                            (amount / Math.max(...Object.values(monthlyRevenue))) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="reports-panel">
          <h3>
            <FontAwesomeIcon icon={faUsers} />
            Role Distribution
          </h3>
          <div className="role-distribution">
            {Object.entries(roleDistribution).length === 0 ? (
              <p className="no-data">No staff data available</p>
            ) : (
              Object.entries(roleDistribution)
                .sort(([, a], [, b]) => b - a)
                .map(([role, count]) => (
                  <div key={role} className="role-item">
                    <span className="role-name">{role}</span>
                    <span className="role-count">{count}</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(
                            (count / Math.max(...Object.values(roleDistribution))) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="staff-table-section">
        <h3>Staff Overview</h3>
        <div className="table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    No staff found matching your filters
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>
                      <span className="role-badge">{s.role}</span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          s.status === "active" || s.active === true || s.is_active === true
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {s.status === "active" || s.active === true || s.is_active === true
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>
                    <td>{s.created_at ? new Date(s.created_at).toLocaleDateString() : "N/A"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerReports;
