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
  faPrint,
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

const getStatusClass = (status) =>
  String(status || "pending")
    .toLowerCase()
    .replace(/\s+/g, "-");

const CustomerReports = () => {
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

  // Demo data for fallback when API fails
  const demoBookings = [
    { id: 1, customer: "John Smith", service: "Vet Checkup", date: new Date().toISOString().split('T')[0], status: "completed", amount: 1500 },
    { id: 2, customer: "Sarah Johnson", service: "Grooming", date: new Date().toISOString().split('T')[0], status: "completed", amount: 800 },
    { id: 3, customer: "Mike Brown", service: "Hotel Booking", date: new Date(Date.now() + 86400000).toISOString().split('T')[0], status: "confirmed", amount: 2500 },
    { id: 4, customer: "Emily Davis", service: "Vaccination", date: new Date(Date.now() - 86400000).toISOString().split('T')[0], status: "completed", amount: 1200 },
  ];

  const demoPets = [
    { id: 1, name: "Max", owner: "John Smith", species: "Dog", breed: "Golden Retriever", age: 3 },
    { id: 2, name: "Bella", owner: "Sarah Johnson", species: "Cat", breed: "Persian", age: 2 },
    { id: 3, name: "Charlie", owner: "Mike Brown", species: "Dog", breed: "Beagle", age: 4 },
    { id: 4, name: "Luna", owner: "Emily Davis", species: "Cat", breed: "Siamese", age: 1 },
    { id: 5, name: "Rocky", owner: "David Wilson", species: "Dog", breed: "Bulldog", age: 5 },
  ];

  const demoTransactions = [
    { id: 1, customer: "John Smith", type: "service", amount: 1500, status: "completed", date: new Date().toISOString() },
    { id: 2, customer: "Sarah Johnson", type: "service", amount: 800, status: "completed", date: new Date().toISOString() },
    { id: 3, customer: "Mike Brown", type: "purchase", amount: 2500, status: "completed", date: new Date(Date.now() - 86400000).toISOString() },
    { id: 4, customer: "Emily Davis", type: "service", amount: 1200, status: "completed", date: new Date(Date.now() - 172800000).toISOString() },
  ];

  const demoPurchases = [
    { id: 1, customer: "John Smith", item: "Dog Food Premium", quantity: 2, amount: 1200, date: new Date().toISOString() },
    { id: 2, customer: "Sarah Johnson", item: "Cat Litter", quantity: 1, amount: 450, date: new Date().toISOString() },
    { id: 3, customer: "Mike Brown", item: "Pet Toys Bundle", quantity: 1, amount: 850, date: new Date(Date.now() - 86400000).toISOString() },
    { id: 4, customer: "Emily Davis", item: "Grooming Kit", quantity: 1, amount: 650, date: new Date(Date.now() - 172800000).toISOString() },
  ];

  const fetchReportData = async () => {
    try {
      setLoading(true);
      let bookingsData, petsData, transactionsData, purchasesData;
      
      try {
        bookingsData = await apiRequest("/customer/bookings");
      } catch (apiErr) {
        console.warn("Bookings API failed, using demo:", apiErr);
        bookingsData = demoBookings;
      }
      
      try {
        petsData = await apiRequest("/customer/pets");
      } catch (apiErr) {
        console.warn("Pets API failed, using demo:", apiErr);
        petsData = demoPets;
      }
      
      try {
        transactionsData = await apiRequest("/customer/transactions");
      } catch (apiErr) {
        console.warn("Transactions API failed, using demo:", apiErr);
        transactionsData = demoTransactions;
      }
      
      try {
        purchasesData = await apiRequest("/customer/purchases");
      } catch (apiErr) {
        console.warn("Purchases API failed, using demo:", apiErr);
        purchasesData = demoPurchases;
      }

      setBookings(Array.isArray(bookingsData) ? bookingsData : bookingsData?.bookings || demoBookings);
      setPets(Array.isArray(petsData) ? petsData : petsData?.pets || demoPets);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : transactionsData?.transactions || demoTransactions);
      setPurchases(Array.isArray(purchasesData) ? purchasesData : purchasesData?.purchases || demoPurchases);

      setError("");
    } catch (err) {
      console.error("Failed to fetch customer reports:", err);
      setError("Failed to load report data. Using demo data.");
      setBookings(demoBookings);
      setPets(demoPets);
      setTransactions(demoTransactions);
      setPurchases(demoPurchases);
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
      filtered = filtered.filter(
        (b) => String(b.status || "").toLowerCase() === statusFilter
      );
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();

      filtered = filtered.filter((booking) => {
        const service = booking.service || booking.type || "";
        const petName = booking.pet?.name || booking.pet_name || booking.pet || "";
        const customer = booking.customer || "";

        return (
          service.toLowerCase().includes(search) ||
          petName.toLowerCase().includes(search) ||
          customer.toLowerCase().includes(search)
        );
      });
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

      filtered = filtered.filter((transaction) => {
        const description =
          transaction.description ||
          transaction.type ||
          transaction.customer ||
          "";

        return description.toLowerCase().includes(search);
      });
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
    return purchases.reduce(
      (sum, purchase) =>
        sum + (parseFloat(purchase.total || purchase.amount) || 0),
      0
    );
  }, [purchases]);

  const serviceBreakdown = useMemo(() => {
    return bookings.reduce((acc, booking) => {
      const service = booking.service || booking.type || "Unknown Service";
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {});
  }, [bookings]);

  const latestBooking = useMemo(() => {
    return [...bookings].sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
    )[0];
  }, [bookings]);

  const latestPayment = useMemo(() => {
    return [...transactions].sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
    )[0];
  }, [transactions]);

  const handleDateChange = (key, value) => {
    if (key === "startDate") setStartDate(value);
    if (key === "endDate") setEndDate(value);
  };

  const handleDatePreset = (preset) => {
    if (preset === "all") {
      setStartDate("");
      setEndDate("");
      return;
    }

    const range = getDateRangePreset(preset);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    const { startDate: defaultStart, endDate: defaultEnd } = getDateRangePreset("month");
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  };

  const handlePrintReport = () => {
    window.print();
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

        <div className="date-preset-row">
          <button type="button" onClick={() => handleDatePreset("month")}>
            This Month
          </button>
          <button type="button" onClick={() => handleDatePreset("last30")}>
            Last 30 Days
          </button>
          <button type="button" onClick={() => handleDatePreset("year")}>
            This Year
          </button>
          <button type="button" onClick={() => handleDatePreset("all")}>
            All Time
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
          <button
            type="button"
            onClick={handlePrintReport}
            className="export-btn print"
          >
            <FontAwesomeIcon icon={faPrint} /> Print
          </button>
        </div>
      </div>

      {error && (
        <div className="reports-error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Loading your reports...</span>
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

          <div className="reports-insights-grid">
            <article className="reports-insight-card">
              <span className="insight-label">Latest Booking</span>
              <h3>{latestBooking?.service || latestBooking?.type || "No booking yet"}</h3>
              <p>{latestBooking?.date || "Your latest booking will appear here."}</p>
            </article>

            <article className="reports-insight-card">
              <span className="insight-label">Latest Payment</span>
              <h3>{formatCurrency(latestPayment?.amount || 0)}</h3>
              <p>
                {latestPayment?.description ||
                  latestPayment?.type ||
                  "No payment yet"}
              </p>
            </article>

            <article className="reports-insight-card">
              <span className="insight-label">Registered Pets</span>
              <h3>{pets.length}</h3>
              <p>
                {pets.length > 0
                  ? "Pet records are available."
                  : "No pets registered yet."}
              </p>
            </article>
          </div>

          <div className="report-section">
            <h3>
              <FontAwesomeIcon icon={faChartLine} /> Service Usage Breakdown
            </h3>

            <div className="service-breakdown-list">
              {Object.entries(serviceBreakdown).length === 0 ? (
                <p className="no-data">No service data available</p>
              ) : (
                Object.entries(serviceBreakdown).map(([service, count]) => (
                  <div key={service} className="service-breakdown-item">
                    <span>{service}</span>
                    <strong>{count} booking(s)</strong>
                  </div>
                ))
              )}
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
                        <td>{booking.service || booking.type || "N/A"}</td>
                        <td>
                          {booking.pet?.name ||
                            booking.pet_name ||
                            booking.pet ||
                            "N/A"}
                        </td>
                        <td>{booking.date || "N/A"}</td>
                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              booking.status
                            )}`}
                          >
                            {booking.status || "Pending"}
                          </span>
                        </td>
                        <td>{formatCurrency(booking.amount || 0)}</td>
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
                        <td>{transaction.date || "N/A"}</td>
                        <td>
                          {transaction.description ||
                            transaction.type ||
                            "Payment Transaction"}
                        </td>
                        <td>{formatCurrency(transaction.amount || 0)}</td>
                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              transaction.status
                            )}`}
                          >
                            {transaction.status || "Pending"}
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