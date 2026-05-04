import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faCalendarCheck,
  faUserCheck,
  faPaw,
  faCut,
  faStethoscope,
  faHotel,
  faSearch,
  faFilter,
  faDownload,
  faPrint,
  faEye,
  faTimes,
  faFileCsv,
  faFilePdf,
  faFileExcel,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import "./ReceptionistReports.css";
import { formatCurrency } from "../../utils/currency";
import { apiRequest } from "../../api/client";
import {
  exportToCSV,
  exportToPDF,
  exportToExcel,
} from "../../utils/reportExport";

const demoTransactions = [
  {
    id: "TXN-001",
    customer: "John Smith",
    pet: "Max",
    date: new Date().toISOString().split("T")[0],
    time: "09:30",
    amount: 1500,
    status: "completed",
    type: "check-in",
  },
  {
    id: "TXN-002",
    customer: "Sarah Johnson",
    pet: "Bella",
    date: new Date().toISOString().split("T")[0],
    time: "10:15",
    amount: 2500,
    status: "completed",
    type: "vet-appointment",
  },
  {
    id: "TXN-003",
    customer: "Mike Brown",
    pet: "Charlie",
    date: new Date().toISOString().split("T")[0],
    time: "11:00",
    amount: 3500,
    status: "completed",
    type: "hotel-booking",
  },
  {
    id: "TXN-004",
    customer: "Emily Davis",
    pet: "Luna",
    date: new Date().toISOString().split("T")[0],
    time: "13:45",
    amount: 1200,
    status: "completed",
    type: "grooming",
  },
];

const ReceptionistReports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);

        let transformedTransactions;

        try {
          const data = await apiRequest("/receptionist/reports/transactions");
          const sales = Array.isArray(data)
            ? data
            : data.transactions || data.sales || [];

          transformedTransactions = sales.map((sale) => ({
            id: `TXN-${sale.id}`,
            customer: sale.customer?.name || "Walk-in Customer",
            pet: sale.pet?.name || "N/A",
            date: sale.created_at
              ? new Date(sale.created_at).toISOString().split("T")[0]
              : "N/A",
            time: sale.created_at
              ? new Date(sale.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A",
            amount: parseFloat(sale.amount) || 0,
            status: "completed",
            type: sale.type || "other",
          }));
        } catch (apiErr) {
          console.warn("API fetch failed, using demo data:", apiErr);
          transformedTransactions = demoTransactions;
          setError("Live data unavailable. Showing demo report data.");
        }

        setTransactions(transformedTransactions);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError("Failed to load transactions. Showing demo data.");
        setTransactions(demoTransactions);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const stats = {
    totalTransactions: transactions.length,
    totalRevenue: transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0),
    checkIns: transactions.filter((t) => t.type === "check-in").length,
    checkOuts: transactions.filter((t) => t.type === "check-out").length,
    vetAppointments: transactions.filter((t) => t.type === "vet-appointment")
      .length,
    hotelBookings: transactions.filter((t) => t.type === "hotel-booking")
      .length,
    groomingSessions: transactions.filter((t) => t.type === "grooming")
      .length,
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      transaction.customer?.toLowerCase().includes(search) ||
      transaction.pet?.toLowerCase().includes(search) ||
      transaction.type?.toLowerCase().includes(search) ||
      transaction.id?.toLowerCase().includes(search);

    if (filterType === "all") return matchesSearch;
    if (filterType === "today") {
      return (
        matchesSearch &&
        transaction.date === new Date().toISOString().split("T")[0]
      );
    }
    if (filterType === "completed") {
      return matchesSearch && transaction.status === "completed";
    }
    if (filterType === "pending") {
      return matchesSearch && transaction.status === "pending";
    }

    return matchesSearch;
  });

  const getTransactionIcon = (type) => {
    switch (type) {
      case "check-in":
      case "check-out":
        return faUserCheck;
      case "vet-appointment":
        return faStethoscope;
      case "hotel-booking":
        return faHotel;
      case "grooming":
        return faCut;
      default:
        return faPaw;
    }
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case "check-in":
        return "Check-in";
      case "check-out":
        return "Check-out";
      case "vet-appointment":
        return "Vet Appointment";
      case "hotel-booking":
        return "Hotel Booking";
      case "grooming":
        return "Grooming";
      default:
        return "Other";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
      case "confirmed":
        return "status-success";
      case "pending":
      case "scheduled":
        return "status-warning";
      case "in-progress":
        return "status-info";
      case "cancelled":
      case "rejected":
        return "status-danger";
      default:
        return "status-muted";
    }
  };

  const columns = [
    { key: "id", label: "Transaction ID" },
    { key: "type", label: "Type" },
    { key: "customer", label: "Customer" },
    { key: "pet", label: "Pet" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "amount", label: "Amount", format: "currency" },
    { key: "status", label: "Status" },
  ];

  const handleExportCSV = () => {
    exportToCSV(filteredTransactions, columns, "receptionist-transactions-report");
  };

  const handleExportPDF = () => {
    exportToPDF(
      filteredTransactions,
      columns,
      "Receptionist Transactions Report",
      "receptionist-transactions-report"
    );
  };

  const handleExportExcel = () => {
    exportToExcel(
      filteredTransactions,
      columns,
      "receptionist-transactions-report"
    );
  };

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="loading-spinner-wrapper">
              <div className="loading-spinner-circle primary"></div>
              <div className="loading-spinner-circle secondary"></div>
              <div className="loading-spinner-circle tertiary"></div>
            </div>
            <div>Loading receptionist reports...</div>
            <div className="loading-spinner-dots">
              <div className="loading-spinner-dot"></div>
              <div className="loading-spinner-dot"></div>
              <div className="loading-spinner-dot"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <section className="reports-header fade-up">
        <div className="header-content">
          <div className="header-title">
            <span className="eyebrow">Reception Portal</span>
            <h1>
              <FontAwesomeIcon icon={faChartLine} />
              Reports & Analytics
            </h1>
            <p>
              Monitor transactions, services, revenue, bookings, and receptionist
              operations in one clean dashboard.
            </p>
          </div>

          <div className="header-actions">
            <div className="export-dropdown">
              <button className="action-btn export-btn" type="button">
                <FontAwesomeIcon icon={faDownload} />
                Export
              </button>

              <div className="export-options">
                <button type="button" onClick={handleExportCSV}>
                  <FontAwesomeIcon icon={faFileCsv} /> CSV
                </button>
                <button type="button" onClick={handleExportPDF}>
                  <FontAwesomeIcon icon={faFilePdf} /> PDF
                </button>
                <button type="button" onClick={handleExportExcel}>
                  <FontAwesomeIcon icon={faFileExcel} /> Excel
                </button>
              </div>
            </div>

            <button
              className="action-btn print-btn"
              type="button"
              onClick={() => window.print()}
            >
              <FontAwesomeIcon icon={faPrint} />
              Print
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="report-alert fade-up">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      )}

      <section className="stats-grid">
        <div className="stat-card fade-up">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalTransactions}</h3>
            <p>Total Transactions</p>
          </div>
        </div>

        <div className="stat-card fade-up">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCalendarCheck} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card fade-up">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUserCheck} />
          </div>
          <div className="stat-content">
            <h3>{stats.checkIns + stats.checkOuts}</h3>
            <p>Check-in / Check-out</p>
          </div>
        </div>

        <div className="stat-card fade-up">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faStethoscope} />
          </div>
          <div className="stat-content">
            <h3>{stats.vetAppointments}</h3>
            <p>Vet Appointments</p>
          </div>
        </div>

        <div className="stat-card fade-up">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faHotel} />
          </div>
          <div className="stat-content">
            <h3>{stats.hotelBookings}</h3>
            <p>Hotel Bookings</p>
          </div>
        </div>

        <div className="stat-card fade-up">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCut} />
          </div>
          <div className="stat-content">
            <h3>{stats.groomingSessions}</h3>
            <p>Grooming Sessions</p>
          </div>
        </div>
      </section>

      <section className="search-filter-section fade-up">
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search by customer, pet, type, or transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <FontAwesomeIcon icon={faFilter} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Transactions</option>
            <option value="today">Today</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </section>

      <section className="transactions-table-container fade-up">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Type</th>
              <th>Customer</th>
              <th>Pet</th>
              <th>Date</th>
              <th>Time</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>
                  <span className="transaction-id">{transaction.id}</span>
                </td>

                <td>
                  <div className="transaction-type">
                    <FontAwesomeIcon
                      icon={getTransactionIcon(transaction.type)}
                    />
                    <span>{getTransactionLabel(transaction.type)}</span>
                  </div>
                </td>

                <td>{transaction.customer}</td>
                <td>{transaction.pet}</td>
                <td>{transaction.date}</td>
                <td>{transaction.time}</td>

                <td>
                  <span className="amount">
                    {transaction.amount > 0
                      ? formatCurrency(transaction.amount)
                      : "-"}
                  </span>
                </td>

                <td>
                  <span
                    className={`status-badge ${getStatusClass(
                      transaction.status
                    )}`}
                  >
                    {transaction.status}
                  </span>
                </td>

                <td>
                  <button
                    className="view-btn"
                    type="button"
                    onClick={() => setSelectedTransaction(transaction)}
                    title="View details"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTransactions.length === 0 && (
          <div className="no-results">
            <FontAwesomeIcon icon={faSearch} />
            <h3>No transactions found</h3>
            <p>Try changing your search keyword or selected filter.</p>
          </div>
        )}
      </section>

      {selectedTransaction && (
        <div
          className="transaction-modal-overlay"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="transaction-modal fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">Transaction Details</span>
                <h3>{selectedTransaction.id}</h3>
              </div>

              <button
                className="close-modal-btn"
                type="button"
                onClick={() => setSelectedTransaction(null)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-content">
              <div className="detail-row">
                <label>Type</label>
                <span>{getTransactionLabel(selectedTransaction.type)}</span>
              </div>

              <div className="detail-row">
                <label>Customer</label>
                <span>{selectedTransaction.customer}</span>
              </div>

              <div className="detail-row">
                <label>Pet</label>
                <span>{selectedTransaction.pet}</span>
              </div>

              <div className="detail-row">
                <label>Date</label>
                <span>{selectedTransaction.date}</span>
              </div>

              <div className="detail-row">
                <label>Time</label>
                <span>{selectedTransaction.time}</span>
              </div>

              <div className="detail-row">
                <label>Amount</label>
                <span>
                  {selectedTransaction.amount > 0
                    ? formatCurrency(selectedTransaction.amount)
                    : "No charge"}
                </span>
              </div>

              <div className="detail-row">
                <label>Status</label>
                <span
                  className={`status-badge ${getStatusClass(
                    selectedTransaction.status
                  )}`}
                >
                  {selectedTransaction.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistReports;
