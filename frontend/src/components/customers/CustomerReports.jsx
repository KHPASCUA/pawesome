import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faPaw,
  faMoneyBillWave,
  faShoppingBag,
  faChartLine,
  faDownload,
  faFilePdf,
  faFileExcel,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import {
  exportToCSV,
  exportToPDF,
  exportToExcel,
  filterByDateRange,
  getDateRangePreset,
} from "../../utils/reportExport";
import "./CustomerReports.css";

const CustomerReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
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
      // Fetch customer data from APIs
      const bookingsData = await apiRequest("/customer/bookings");
      const petsData = await apiRequest("/customer/pets");
      const transactionsData = await apiRequest("/customer/transactions");
      const purchasesData = await apiRequest("/customer/purchases");

      setBookings(Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || []);
      setPets(Array.isArray(petsData) ? petsData : petsData.pets || []);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : transactionsData.transactions || []);
      setPurchases(Array.isArray(purchasesData) ? purchasesData : purchasesData.purchases || []);

      setError("");
    } catch (err) {
      console.error("Failed to fetch customer reports:", err);
      setError("Failed to load report data. Please try again.");
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
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.service?.toLowerCase().includes(search) ||
          b.pet?.name?.toLowerCase().includes(search) ||
          b.type?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [bookings, startDate, endDate, statusFilter, searchTerm]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (startDate || endDate) {
      filtered = filterByDateRange(filtered, "date", startDate, endDate);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((t) => t.description?.toLowerCase().includes(search));
    }

    return filtered;
  }, [transactions, startDate, endDate, searchTerm]);

  // Calculate summary stats
  const totalSpent = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  }, [filteredTransactions]);

  const upcomingBookings = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return bookings.filter((b) => b.date >= today && b.status !== "cancelled").length;
  }, [bookings]);

  const completedBookings = useMemo(() => {
    return bookings.filter((b) => b.status === "completed").length;
  }, [bookings]);

  const totalPurchases = useMemo(() => {
    return purchases.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
  }, [purchases]);

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

  // Export handlers
  const handleExportCSV = () => {
    const columns = [
      { key: "id", label: "ID" },
      { key: "service", label: "Service" },
      { key: "pet", label: "Pet" },
      { key: "date", label: "Date" },
      { key: "status", label: "Status" },
      { key: "amount", label: "Amount", format: "currency" },
    ];
    exportToCSV(filteredBookings, columns, "customer-bookings-report");
  };

  const handleExportPDF = () => {
    const columns = [
      { key: "service", label: "Service" },
      { key: "pet", label: "Pet" },
      { key: "date", label: "Date" },
      { key: "status", label: "Status" },
      { key: "amount", label: "Amount", format: "currency" },
    ];
    exportToPDF(filteredBookings, columns, "Customer Bookings Report", "customer-bookings-report");
  };

  const handleExportExcel = () => {
    const columns = [
      { key: "id", label: "ID" },
      { key: "service", label: "Service" },
      { key: "pet", label: "Pet" },
      { key: "date", label: "Date" },
      { key: "status", label: "Status" },
      { key: "amount", label: "Amount", format: "currency" },
    ];
    exportToExcel(filteredBookings, columns, "customer-bookings-report");
  };

  return (
    <div className="customer-reports">
      <div className="reports-header">
        <div className="header-content">
          <h1>
            <FontAwesomeIcon icon={faChartLine} /> Customer Reports
          </h1>
          <p>View your bookings, pets, payments, and store activity</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-filter-row">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search bookings, services, pets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="date-filters">
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
              className="date-input"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
              className="date-input"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button onClick={handleClearFilters} className="clear-btn">
            Clear
          </button>
        </div>

        {/* Export Buttons */}
        <div className="export-actions">
          <button onClick={handleExportCSV} className="export-btn csv">
            <FontAwesomeIcon icon={faDownload} /> CSV
          </button>
          <button onClick={handleExportPDF} className="export-btn pdf">
            <FontAwesomeIcon icon={faFilePdf} /> PDF
          </button>
          <button onClick={handleExportExcel} className="export-btn excel">
            <FontAwesomeIcon icon={faFileExcel} /> Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Loading your reports...</span>
        </div>
      ) : error ? (
        <div className="error-state">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card bookings">
              <div className="card-icon">
                <FontAwesomeIcon icon={faCalendarCheck} />
              </div>
              <div className="card-content">
                <h3>{upcomingBookings}</h3>
                <p>Upcoming Bookings</p>
              </div>
            </div>

            <div className="summary-card completed">
              <div className="card-icon">
                <FontAwesomeIcon icon={faCalendarCheck} />
              </div>
              <div className="card-content">
                <h3>{completedBookings}</h3>
                <p>Completed Bookings</p>
              </div>
            </div>

            <div className="summary-card pets">
              <div className="card-icon">
                <FontAwesomeIcon icon={faPaw} />
              </div>
              <div className="card-content">
                <h3>{pets.length}</h3>
                <p>Registered Pets</p>
              </div>
            </div>

            <div className="summary-card spent">
              <div className="card-icon">
                <FontAwesomeIcon icon={faMoneyBillWave} />
              </div>
              <div className="card-content">
                <h3>{formatCurrency(totalSpent)}</h3>
                <p>Total Spent</p>
              </div>
            </div>

            <div className="summary-card purchases">
              <div className="card-icon">
                <FontAwesomeIcon icon={faShoppingBag} />
              </div>
              <div className="card-content">
                <h3>{formatCurrency(totalPurchases)}</h3>
                <p>Store Purchases</p>
              </div>
            </div>
          </div>

          {/* Bookings Section */}
          <div className="report-section">
            <h3>
              <FontAwesomeIcon icon={faCalendarCheck} /> My Bookings
            </h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Pet</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-data">
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.service}</td>
                        <td>{booking.pet?.name || "N/A"}</td>
                        <td>{booking.date}</td>
                        <td>
                          <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                        </td>
                        <td>{formatCurrency(booking.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pets Section */}
          <div className="report-section">
            <h3>
              <FontAwesomeIcon icon={faPaw} /> My Pets
            </h3>
            <div className="pets-grid">
              {pets.length === 0 ? (
                <p className="no-data">No pets registered</p>
              ) : (
                pets.map((pet) => (
                  <div key={pet.id} className="pet-card">
                    <div className="pet-icon">
                      <FontAwesomeIcon icon={faPaw} />
                    </div>
                    <div className="pet-info">
                      <h4>{pet.name}</h4>
                      <p>{pet.breed || "Unknown breed"}</p>
                      <p>{pet.age ? `${pet.age} years old` : "Age unknown"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Transactions Section */}
          <div className="report-section">
            <h3>
              <FontAwesomeIcon icon={faMoneyBillWave} /> Payment History
            </h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="no-data">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{transaction.date}</td>
                        <td>{transaction.description}</td>
                        <td>{formatCurrency(transaction.amount)}</td>
                        <td>
                          <span className={`status-badge ${transaction.status}`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerReports;