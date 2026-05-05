import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
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
  LineChart,
  Line,
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
import "./CustomerReports.css";

const CHART_COLORS = ["#ff5f93", "#ff8db5", "#ffc8dd", "#f59e0b", "#10b981", "#3b82f6"];

const CustomerReports = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Data states
  const [bookings, setBookings] = useState([]);
  const [pets, setPets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [purchases, setPurchases] = useState([]);

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
      const isAdminReport = location.pathname.startsWith("/admin/reports/customers");

      if (isAdminReport) {
        const result = await apiRequest("/admin/reports/customers");
        const data = result?.data || result || {};

        setBookings(data.appointments || data.bookings || []);
        setPets(data.pets || []);
        setTransactions(data.transactions || []);
        setPurchases(data.orders || []);
      } else {
        const [bookingsData, petsData, transactionsData, purchasesData] = await Promise.all([
          apiRequest("/customer/bookings").catch(() => []),
          apiRequest("/customer/pets").catch(() => []),
          apiRequest("/customer/transactions").catch(() => []),
          apiRequest("/customer/purchases").catch(() => []),
        ]);

        setBookings(Array.isArray(bookingsData) ? bookingsData : bookingsData?.bookings || []);
        setPets(Array.isArray(petsData) ? petsData : petsData?.pets || []);
        setTransactions(Array.isArray(transactionsData) ? transactionsData : transactionsData?.transactions || []);
        setPurchases(Array.isArray(purchasesData) ? purchasesData : purchasesData?.purchases || []);
      }

      setError("");
    } catch (err) {
      console.error("Failed to fetch customer reports:", err);
      setError("Failed to load live customer report data.");
      setBookings([]);
      setPets([]);
      setTransactions([]);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to data
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    if (startDate || endDate) {
      filtered = filterByDateRange(filtered, "date", startDate, endDate);
    }

    if (statusFilter !== "all") {
      filtered = filterByStatus(filtered, "status", statusFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.id?.toLowerCase().includes(search) ||
          booking.customer_name?.toLowerCase().includes(search) ||
          booking.service?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [bookings, startDate, endDate, statusFilter, searchTerm]);

  const handleDateChange = (key, value) => {
    if (key === "startDate") setStartDate(value);
    if (key === "endDate") setEndDate(value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");

    const { startDate: defaultStart, endDate: defaultEnd } = getDateRangePreset("month");
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  };

  const bookingExportColumns = [
    { key: "id", label: "Booking ID" },
    { key: "customer_name", label: "Customer" },
    { key: "service", label: "Service" },
    { key: "date", label: "Date", format: "date" },
    { key: "time", label: "Time" },
    { key: "status", label: "Status" },
    { key: "amount", label: "Amount", format: "currency" },
  ];

  const handleExportCSV = () => {
    exportToCSV(filteredBookings, bookingExportColumns, "customer-bookings-report");
  };

  const handleExportPDF = () => {
    exportToPDF(filteredBookings, bookingExportColumns, "Customer Bookings Report", "customer-bookings-report");
  };

  const handleExportExcel = () => {
    exportToExcel(filteredBookings, bookingExportColumns, "customer-bookings-report");
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const totalPets = pets.length;
    const totalSpent = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return {
      totalBookings,
      completedBookings,
      pendingBookings,
      totalPets,
      totalSpent,
    };
  }, [bookings, pets, transactions]);

  // Prepare summary cards data
  const summaryCards = [
    {
      id: "total-bookings",
      label: "Total Bookings",
      value: summaryStats.totalBookings,
      icon: "faCalendarCheck",
      color: "primary",
      trend: "up",
      change: "+12.5%"
    },
    {
      id: "completed-bookings",
      label: "Completed Bookings",
      value: summaryStats.completedBookings,
      icon: "faCheckCircle",
      color: "success",
      trend: "up",
      change: "+8.2%"
    },
    {
      id: "total-pets",
      label: "Total Pets",
      value: summaryStats.totalPets,
      icon: "faPaw",
      color: "secondary",
      trend: "up",
      change: "+15.3%"
    },
    {
      id: "total-spent",
      label: "Total Spent",
      value: formatCurrency(summaryStats.totalSpent),
      icon: "faMoneyBillWave",
      color: "warning",
      trend: "up",
      change: "+5.1%"
    },
    {
      id: "pending-bookings",
      label: "Pending Bookings",
      value: summaryStats.pendingBookings,
      icon: "faClock",
      color: "info",
      trend: "neutral",
      change: "0%"
    }
  ];

  // Prepare table columns
  const bookingTableColumns = [
    { key: "id", label: "Booking ID", sortable: true },
    { key: "customer_name", label: "Customer", sortable: true },
    { key: "service", label: "Service", sortable: true },
    { key: "date", label: "Date", format: "date", sortable: true },
    { key: "time", label: "Time", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "amount", label: "Amount", format: "currency", sortable: true },
  ];

  // Chart data preparation
  const statusDistributionData = useMemo(() => {
    const statusCounts = {};
    bookings.forEach(booking => {
      const status = booking.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  }, [bookings]);

  const monthlyBookingsData = useMemo(() => {
    const monthlyCounts = {};
    bookings.forEach(booking => {
      if (booking.date) {
        const month = new Date(booking.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
      }
    });
    return Object.entries(monthlyCounts).map(([month, count]) => ({
      month,
      count,
    })).slice(-6); // Last 6 months
  }, [bookings]);

  const renderCustomerContent = () => (
    <div className="customer-reports-content">
      <StandardSummaryCards cards={summaryCards} />
      
      <div className="charts-section">
        <div className="chart-row">
          <div className="chart-container">
            <h3 className="section-title">Booking Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3 className="section-title">Monthly Booking Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyBookingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#ff5f93" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="data-table-section">
        <h3 className="section-title">Booking History</h3>
        <StandardTable
          columns={bookingTableColumns}
          data={filteredBookings}
          emptyMessage="No bookings found"
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
    onExportCSV: handleExportCSV,
    onExportPDF: handleExportPDF,
    onExportExcel: handleExportExcel,
    loading,
    onRefresh: fetchReportData,
    onClearFilters: handleClearFilters,
    searchPlaceholder: "Search bookings, customers, or services...",
  };

  return (
    <StandardReportLayout
      title="Customer Reports"
      subtitle="Booking history, pet records, and customer activity analytics"
      icon={faUsers}
      loading={loading}
      error={error}
      onRefresh={fetchReportData}
      lastUpdated={new Date().toLocaleTimeString()}
      filterProps={filterProps}
    >
      <div className="reports-content">
        {renderCustomerContent()}
      </div>
    </StandardReportLayout>
  );
};

export default CustomerReports;
