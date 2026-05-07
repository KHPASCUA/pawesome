import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCalendarCheck,
  faChartLine,
  faClipboardList,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faFilter,
  faMagnifyingGlass,
  faMoneyBillWave,
  faPaw,
  faPeopleGroup,
  faReceipt,
  faRotateRight,
  faSpinner,
  faTimes,
  faTruck,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { normalizeList } from "../../utils/normalizeList";
import StandardSummaryCards from "../shared/StandardSummaryCards";
import StandardTable from "../shared/StandardTable";
import {
  exportToCSV,
  exportToPDF,
  exportToExcel,
  filterByDateRange,
  filterByStatus,
  getDateRangePreset,
} from "../../utils/reportExport";
import OrderReports from "./OrderReports";
import PaymentReports from "./PaymentReports";
import ServiceRequestReports from "./ServiceRequestReports";
import LogisticsReports from "./LogisticsReports";
import CustomerReport from "./CustomerReport";
import PayrollReports from "./PayrollReports";
import "./AdminReports.css";

const safeNumber = (value) => Number(value || 0);
const searchable = (value) => String(value ?? "").toLowerCase();

const REPORT_TABS = [
  {
    key: "overview",
    label: "Overview",
    description: "Executive summary",
    icon: faChartLine,
  },
  {
    key: "orders",
    label: "Orders",
    description: "Sales and order flow",
    icon: faReceipt,
  },
  {
    key: "payments",
    label: "Payments",
    description: "Payment verification",
    icon: faMoneyBillWave,
  },
  {
    key: "services",
    label: "Services",
    description: "Booking and requests",
    icon: faClipboardList,
  },
  {
    key: "logistics",
    label: "Logistics",
    description: "Shipment tracking",
    icon: faTruck,
  },
  {
    key: "customers",
    label: "Customers",
    description: "Customer analytics",
    icon: faUsers,
  },
  {
    key: "payroll",
    label: "Payroll",
    description: "Salary analytics",
    icon: faPeopleGroup,
  },
];

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const [rawTransactions, setRawTransactions] = useState([]);
  const [rawAppointments, setRawAppointments] = useState([]);
  const [rawUsers, setRawUsers] = useState([]);

  const normalizeOverview = (result) => {
    const data = result?.data?.summary || result?.data || result?.summary || result || {};

    return {
      total_revenue: safeNumber(data.total_revenue),
      total_transactions: safeNumber(data.total_transactions || data.total_orders),
      total_customers: safeNumber(data.total_customers),
      new_customers: safeNumber(data.new_customers || data.active_customers),
      total_users: safeNumber(data.total_users),
      today_transactions: safeNumber(data.today_transactions),
      today_revenue: safeNumber(data.today_revenue),
      total_pets: safeNumber(data.total_pets),
      total_appointments: safeNumber(data.total_appointments),
      completed_appointments: safeNumber(
        data.completed_appointments || data.completed_services
      ),
      total_inventory_items: safeNumber(data.total_inventory_items),
      low_stock_items: safeNumber(data.low_stock_items),
      out_of_stock_items: safeNumber(data.out_of_stock_items),
      total_staff: safeNumber(data.total_staff),
      active_staff: safeNumber(data.active_staff),
      staff_on_leave: safeNumber(data.staff_on_leave),
      inactive_staff: safeNumber(data.inactive_staff),
      active_roles: safeNumber(data.active_roles || 0),
      monthly_revenue_total: safeNumber(data.monthly_revenue),
      monthly_revenue_trend: normalizeList(data.monthly_revenue_trend, [
        "data",
        "records",
        "items",
      ]),
      top_services: normalizeList(data.top_services, ["data", "records", "items"]),
      top_customers: normalizeList(data.top_customers, ["data", "records", "items"]),
      transactions: normalizeList(data.transactions, ["data", "records", "items"]),
      appointments: normalizeList(data.appointments, ["data", "records", "items"]),
      users: normalizeList(data.users, ["data", "records", "items"]),
    };
  };

  const fetchReportData = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const result = await apiRequest("/admin/reports/overview");
      const safeData = normalizeOverview(result);

      setReportData(safeData);
      setRawTransactions(safeData.transactions);
      setRawAppointments(safeData.appointments);
      setRawUsers(safeData.users);
      setLastUpdated(new Date().toLocaleString("en-PH"));
    } catch (err) {
      console.error("Admin reports overview error:", err);
      setError(err.message || "Failed to load report data.");

      const emptyData = normalizeOverview({});
      setReportData(emptyData);
      setRawTransactions([]);
      setRawAppointments([]);
      setRawUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const preset = getDateRangePreset("month");
    setStartDate(preset.startDate);
    setEndDate(preset.endDate);
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const getFilteredData = useCallback(() => {
    let filtered = {
      transactions: [...rawTransactions],
      appointments: [...rawAppointments],
      users: [...rawUsers],
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
      filtered.transactions = filterByStatus(filtered.transactions, "status", statusFilter);
      filtered.appointments = filterByStatus(filtered.appointments, "status", statusFilter);
    }

    if (roleFilter !== "all") {
      filtered.users = filtered.users.filter((user) => user.role === roleFilter);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.trim().toLowerCase();

      filtered.transactions = filtered.transactions.filter(
        (item) =>
          searchable(item.id).includes(search) ||
          searchable(item.transaction_number).includes(search) ||
          searchable(item.customer).includes(search) ||
          searchable(item.customer_name).includes(search) ||
          searchable(item.type).includes(search) ||
          searchable(item.status).includes(search)
      );

      filtered.appointments = filtered.appointments.filter(
        (item) =>
          searchable(item.id).includes(search) ||
          searchable(item.customer).includes(search) ||
          searchable(item.customer_name).includes(search) ||
          searchable(item.service).includes(search) ||
          searchable(item.service_name).includes(search) ||
          searchable(item.pet).includes(search) ||
          searchable(item.pet_name).includes(search) ||
          searchable(item.status).includes(search)
      );

      filtered.users = filtered.users.filter(
        (item) =>
          searchable(item.id).includes(search) ||
          searchable(item.name).includes(search) ||
          searchable(item.email).includes(search) ||
          searchable(item.role).includes(search)
      );
    }

    return filtered;
  }, [
    rawTransactions,
    rawAppointments,
    rawUsers,
    searchTerm,
    startDate,
    endDate,
    statusFilter,
    roleFilter,
  ]);

  const filteredData = useMemo(() => getFilteredData(), [getFilteredData]);

  const handleDateChange = (key, value) => {
    if (key === "startDate") setStartDate(value);
    if (key === "endDate") setEndDate(value);
  };

  const handleClearFilters = () => {
    const preset = getDateRangePreset("month");

    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter("all");
    setStartDate(preset.startDate);
    setEndDate(preset.endDate);
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
    exportToCSV(filteredData.transactions, exportColumns, "admin-overview-transactions");
  };

  const handleExportPDF = () => {
    exportToPDF(
      filteredData.transactions,
      exportColumns,
      "Admin Overview Transactions",
      "admin-overview-transactions"
    );
  };

  const handleExportExcel = () => {
    exportToExcel(filteredData.transactions, exportColumns, "admin-overview-transactions");
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const monthlyTrend = useMemo(() => {
    return normalizeList(reportData?.monthly_revenue_trend, ["data", "records", "items"]).map(
      (item) => ({
        month:
          item.month_name ||
          item.label ||
          monthNames[(Number(item.month || 1) || 1) - 1] ||
          "N/A",
        revenue: safeNumber(item.total || item.revenue || item.amount),
      })
    );
  }, [reportData]);

  const summaryCards = [
    {
      id: "total-revenue",
      label: "Total Revenue",
      value: formatCurrency(reportData?.total_revenue || 0),
      icon: "faMoneyBillWave",
      color: "primary",
      trend: "up",
      change: "Live",
    },
    {
      id: "total-transactions",
      label: "Transactions",
      value: reportData?.total_transactions || 0,
      icon: "faChartLine",
      color: "secondary",
      trend: "up",
      change: "Live",
    },
    {
      id: "total-customers",
      label: "Customers",
      value: reportData?.total_customers || 0,
      icon: "faUsers",
      color: "success",
      trend: "up",
      change: `${reportData?.new_customers || 0} new`,
    },
    {
      id: "appointments",
      label: "Appointments",
      value: reportData?.total_appointments || 0,
      icon: "faCalendarCheck",
      color: "warning",
      trend: "up",
      change: `${reportData?.completed_appointments || 0} completed`,
    },
    {
      id: "inventory-alerts",
      label: "Low Stock",
      value: reportData?.low_stock_items || 0,
      icon: "faBoxOpen",
      color: reportData?.low_stock_items > 0 ? "danger" : "success",
      trend: "neutral",
      change: `${reportData?.out_of_stock_items || 0} out`,
    },
  ];

  const tableColumns = [
    { key: "id", label: "ID", sortable: true },
    { key: "customer", label: "Customer", sortable: true },
    { key: "type", label: "Type", sortable: true },
    { key: "date", label: "Date", format: "date", sortable: true },
    { key: "amount", label: "Amount", format: "currency", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

  const activeTabInfo = REPORT_TABS.find((tab) => tab.key === activeTab) || REPORT_TABS[0];

  const renderOverview = () => {
    if (loading) {
      return (
        <div className="reports-state-card">
          <FontAwesomeIcon icon={faSpinner} spin />
          <h3>Loading reports...</h3>
          <p>Please wait while the system fetches live report data.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="reports-state-card error">
          <FontAwesomeIcon icon={faTimes} />
          <h3>Unable to load reports</h3>
          <p>{error}</p>
          <button type="button" onClick={() => fetchReportData()}>
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="admin-overview-content">
        <section className="admin-report-filter-card">
          <div className="admin-report-search">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <input
              type="text"
              value={searchTerm}
              placeholder="Search transactions, customers, services, users..."
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm("")}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>

          <div className="admin-report-filter-grid">
            <label>
              Start Date
              <input
                type="date"
                value={startDate}
                onChange={(event) => handleDateChange("startDate", event.target.value)}
              />
            </label>

            <label>
              End Date
              <input
                type="date"
                value={endDate}
                onChange={(event) => handleDateChange("endDate", event.target.value)}
              />
            </label>

            <label>
              Status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
                <option value="in-progress">In Progress</option>
              </select>
            </label>

            <label>
              Role
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
                <option value="receptionist">Receptionist</option>
                <option value="veterinary">Veterinary</option>
                <option value="inventory">Inventory</option>
                <option value="customer">Customer</option>
              </select>
            </label>
          </div>

          <div className="admin-report-actions">
            <button type="button" className="ghost-btn" onClick={handleClearFilters}>
              <FontAwesomeIcon icon={faFilter} />
              Clear Filters
            </button>
            <button type="button" onClick={handleExportCSV}>
              <FontAwesomeIcon icon={faFileCsv} />
              CSV
            </button>
            <button type="button" onClick={handleExportExcel}>
              <FontAwesomeIcon icon={faFileExcel} />
              Excel
            </button>
            <button type="button" onClick={handleExportPDF}>
              <FontAwesomeIcon icon={faFilePdf} />
              PDF
            </button>
          </div>
        </section>

        <StandardSummaryCards cards={summaryCards} />

        <section className="admin-report-grid">
          <div className="chart-section premium-report-panel">
            <div className="report-panel-heading">
              <div>
                <h3>Monthly Revenue Trend</h3>
                <p>Revenue movement based on live backend data.</p>
              </div>
            </div>

            <div className="admin-chart-box">
              {monthlyTrend.length === 0 ? (
                <div className="reports-empty-mini">
                  <FontAwesomeIcon icon={faChartLine} />
                  <p>No monthly trend data available.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="revenue" name="Revenue" radius={[12, 12, 0, 0]}>
                      {monthlyTrend.map((item, index) => (
                        <Cell
                          key={item.month}
                          fill={["#ff5f93", "#ff8db5", "#ffc8dd", "#fb7185"][index % 4]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="premium-report-panel report-health-panel">
            <div className="report-panel-heading">
              <div>
                <h3>Report Health</h3>
                <p>Quick snapshot of available report records.</p>
              </div>
            </div>

            <div className="report-health-list">
              <div>
                <span>Transactions</span>
                <strong>{filteredData.transactions.length}</strong>
              </div>
              <div>
                <span>Appointments</span>
                <strong>{filteredData.appointments.length}</strong>
              </div>
              <div>
                <span>Users</span>
                <strong>{filteredData.users.length}</strong>
              </div>
              <div>
                <span>Pets</span>
                <strong>{reportData?.total_pets || 0}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="premium-report-panel data-table-section">
          <div className="report-panel-heading">
            <div>
              <h3>Recent Transactions</h3>
              <p>
                Showing {filteredData.transactions.length} filtered transaction record(s).
              </p>
            </div>
          </div>

          <StandardTable
            columns={tableColumns}
            data={filteredData.transactions}
            emptyMessage="No transactions found"
          />
        </section>
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "orders":
        return <OrderReports />;
      case "payments":
        return <PaymentReports />;
      case "services":
        return <ServiceRequestReports />;
      case "logistics":
        return <LogisticsReports />;
      case "customers":
        return <CustomerReport />;
      case "payroll":
        return <PayrollReports />;
      default:
        return renderOverview();
    }
  };

  return (
    <main className="admin-reports-page">
      <section className="reports-hero">
        <div>
          <span className="reports-eyebrow">
            <FontAwesomeIcon icon={activeTabInfo.icon} />
            Admin Analytics
          </span>
          <h1>Reports Center</h1>
          <p>
            Monitor sales, payments, service requests, logistics, customers, and payroll
            in one professional reporting workspace.
          </p>
          <small>Last updated: {lastUpdated || "Not refreshed yet"}</small>
        </div>

        <div className="reports-hero-actions">
          <button
            type="button"
            className={`refresh-report-btn ${refreshing ? "refreshing" : ""}`}
            onClick={() => fetchReportData({ silent: true })}
            disabled={refreshing}
          >
            <FontAwesomeIcon icon={refreshing ? faSpinner : faRotateRight} />
            {refreshing ? "Refreshing..." : "Refresh Overview"}
          </button>
        </div>
      </section>

      <section className="reports-quick-grid">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`reports-quick-card ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span>
              <FontAwesomeIcon icon={tab.icon} />
            </span>
            <div>
              <strong>{tab.label}</strong>
              <p>{tab.description}</p>
            </div>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        ))}
      </section>

      <section className="admin-reports-navigation">
        <nav className="nav-tabs">
          {REPORT_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`nav-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <FontAwesomeIcon icon={tab.icon} />
              {tab.label}
            </button>
          ))}
        </nav>
      </section>

      <section className="reports-content">{renderActiveTab()}</section>
    </main>
  );
};

export default AdminReports;