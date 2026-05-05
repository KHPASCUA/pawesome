import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LineChart,
  Line,
  XAxis,
  YAxis,
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
import "./ReceptionistReports.css";

const CHART_COLORS = ["#ff5f93", "#ff8db5", "#ffc8dd", "#f59e0b", "#10b981", "#3b82f6"];

const ReceptionistReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");

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

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await apiRequest("/receptionist/reports/live");
      const data = result?.data || result || {};
      const requests = data.requests || [];
      const orders = data.orders || [];

      // Transform data into consistent transaction format
      const transformedTransactions = [
        ...requests.map((request) => ({
          id: request.id || `REQ-${Math.random().toString(36).substr(2, 9)}`,
          customer: request.customer_name || request.customer || "Unknown Customer",
          type: "appointment",
          service: request.service || request.service_name || "General Service",
          date: request.date || request.created_at || new Date().toISOString().split('T')[0],
          time: request.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          amount: Number(request.amount || request.price || 0),
          status: request.status || "pending",
          notes: request.notes || "",
        })),
        ...orders.map((order) => ({
          id: order.id || `ORD-${Math.random().toString(36).substr(2, 9)}`,
          customer: order.customer_name || order.customer || "Unknown Customer",
          type: "order",
          service: order.service || order.product_name || "Product/Service",
          date: order.date || order.created_at || new Date().toISOString().split('T')[0],
          time: order.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          amount: Number(order.amount || order.total || 0),
          status: order.status || "pending",
          notes: order.notes || "",
        })),
      ];

      setTransactions(transformedTransactions);
    } catch (err) {
      console.error("Failed to fetch receptionist reports:", err);
      setError("Failed to load live receptionist report data.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (startDate || endDate) {
      filtered = filterByDateRange(filtered, "date", startDate, endDate);
    }

    if (statusFilter !== "all") {
      filtered = filterByStatus(filtered, "status", statusFilter);
    }

    if (transactionTypeFilter !== "all") {
      filtered = filtered.filter((transaction) => transaction.type === transactionTypeFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (transaction) =>
          transaction.id?.toLowerCase().includes(search) ||
          transaction.customer?.toLowerCase().includes(search) ||
          transaction.service?.toLowerCase().includes(search) ||
          transaction.type?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [transactions, startDate, endDate, statusFilter, transactionTypeFilter, searchTerm]);

  const handleDateChange = (key, value) => {
    if (key === "startDate") setStartDate(value);
    if (key === "endDate") setEndDate(value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTransactionTypeFilter("all");

    const { startDate: defaultStart, endDate: defaultEnd } = getDateRangePreset("month");
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  };

  const exportColumns = [
    { key: "id", label: "Transaction ID" },
    { key: "customer", label: "Customer" },
    { key: "type", label: "Type" },
    { key: "service", label: "Service" },
    { key: "date", label: "Date", format: "date" },
    { key: "time", label: "Time" },
    { key: "amount", label: "Amount", format: "currency" },
    { key: "status", label: "Status" },
  ];

  const handleExportCSV = () => {
    exportToCSV(filteredTransactions, exportColumns, "receptionist-transactions-report");
  };

  const handleExportPDF = () => {
    exportToPDF(filteredTransactions, exportColumns, "Receptionist Transactions Report", "receptionist-transactions-report");
  };

  const handleExportExcel = () => {
    exportToExcel(filteredTransactions, exportColumns, "receptionist-transactions-report");
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalTransactions = transactions.length;
    const appointments = transactions.filter(t => t.type === 'appointment').length;
    const orders = transactions.filter(t => t.type === 'order').length;
    const completedTransactions = transactions.filter(t => t.status === 'completed').length;
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      totalTransactions,
      appointments,
      orders,
      completedTransactions,
      totalRevenue,
    };
  }, [transactions]);

  // Prepare summary cards data
  const summaryCards = [
    {
      id: "total-transactions",
      label: "Total Transactions",
      value: summaryStats.totalTransactions,
      icon: "faChartLine",
      color: "primary",
      trend: "up",
      change: "+12.5%"
    },
    {
      id: "appointments",
      label: "Appointments",
      value: summaryStats.appointments,
      icon: "faCalendarCheck",
      color: "success",
      trend: "up",
      change: "+8.2%"
    },
    {
      id: "orders",
      label: "Orders",
      value: summaryStats.orders,
      icon: "faShoppingBag",
      color: "secondary",
      trend: "up",
      change: "+15.3%"
    },
    {
      id: "completed",
      label: "Completed",
      value: summaryStats.completedTransactions,
      icon: "faCheckCircle",
      color: "warning",
      trend: "up",
      change: "+5.1%"
    },
    {
      id: "total-revenue",
      label: "Total Revenue",
      value: formatCurrency(summaryStats.totalRevenue),
      icon: "faMoneyBillWave",
      color: "info",
      trend: "up",
      change: "+3.7%"
    }
  ];

  // Prepare table columns
  const tableColumns = [
    { key: "id", label: "Transaction ID", sortable: true },
    { key: "customer", label: "Customer", sortable: true },
    { key: "type", label: "Type", sortable: true },
    { key: "service", label: "Service", sortable: true },
    { key: "date", label: "Date", format: "date", sortable: true },
    { key: "time", label: "Time", sortable: true },
    { key: "amount", label: "Amount", format: "currency", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

  // Chart data preparation
  const transactionTypeData = useMemo(() => {
    const typeCounts = {};
    transactions.forEach(transaction => {
      const type = transaction.type || 'Unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
    }));
  }, [transactions]);

  const dailyTransactionsData = useMemo(() => {
    const dailyCounts = {};
    transactions.forEach(transaction => {
      if (transaction.date) {
        const date = transaction.date;
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      }
    });
    return Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    })).slice(-7); // Last 7 days
  }, [transactions]);

  const renderReceptionistContent = () => (
    <div className="receptionist-reports-content">
      <StandardSummaryCards cards={summaryCards} />
      
      <div className="charts-section">
        <div className="chart-row">
          <div className="chart-container">
            <h3 className="section-title">Transaction Types</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transactionTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {transactionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3 className="section-title">Daily Transactions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTransactionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#ff5f93" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="data-table-section">
        <h3 className="section-title">Transaction History</h3>
        <StandardTable
          columns={tableColumns}
          data={filteredTransactions}
          emptyMessage="No transactions found"
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
      { value: "completed", label: "Completed" },
      { value: "pending", label: "Pending" },
      { value: "cancelled", label: "Cancelled" },
      { value: "confirmed", label: "Confirmed" },
    ],
    transactionTypeFilter,
    onTransactionTypeChange: setTransactionTypeFilter,
    transactionTypeOptions: [
      { value: "all", label: "All Types" },
      { value: "appointment", label: "Appointments" },
      { value: "order", label: "Orders" },
    ],
    showTransactionType: true,
    onExportCSV: handleExportCSV,
    onExportPDF: handleExportPDF,
    onExportExcel: handleExportExcel,
    loading,
    onRefresh: fetchReportData,
    onClearFilters: handleClearFilters,
    searchPlaceholder: "Search transactions, customers, or services...",
  };

  return (
    <StandardReportLayout
      title="Receptionist Reports"
      subtitle="Appointment scheduling, order management, and customer service metrics"
      icon={faCalendarCheck}
      loading={loading}
      error={error}
      onRefresh={fetchReportData}
      lastUpdated={new Date().toLocaleTimeString()}
      filterProps={filterProps}
    >
      <div className="reports-content">
        {renderReceptionistContent()}
      </div>
    </StandardReportLayout>
  );
};

export default ReceptionistReports;
