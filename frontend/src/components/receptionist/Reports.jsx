import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './Reports.css';
import { formatCurrency } from "../../utils/currency";
import { apiRequest } from "../../api/client";
import {
  exportToCSV,
  exportToPDF,
  exportToExcel,
} from "../../utils/reportExport";

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Backend returns Sale records with: id, amount, type, created_at, updated_at
        // Transform to match expected format
        const data = await apiRequest("/cashier/transactions");
        const sales = Array.isArray(data) ? data : (data.transactions || data.sales || []);
        // Transform Sale data to match expected transaction format
        const transformedTransactions = sales.map(sale => ({
          id: `TXN-${sale.id}`,
          customer: sale.customer?.name || "Walk-in Customer",
          pet: sale.pet?.name || "N/A",
          date: sale.created_at ? new Date(sale.created_at).toISOString().split('T')[0] : "N/A",
          time: sale.created_at ? new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A",
          amount: parseFloat(sale.amount) || 0,
          status: "completed",
          type: sale.type || "other"
        }));
        setTransactions(transformedTransactions);
        setError("");
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError("Failed to load transactions. Please ensure you have proper permissions.");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Calculate statistics from live data
  const stats = {
    totalTransactions: transactions.length,
    totalRevenue: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    checkIns: transactions.filter(t => t.type === "check-in").length,
    checkOuts: transactions.filter(t => t.type === "check-out").length,
    vetAppointments: transactions.filter(t => t.type === "vet-appointment").length,
    hotelBookings: transactions.filter(t => t.type === "hotel-booking").length,
    groomingSessions: transactions.filter(t => t.type === "grooming").length,
    completedTransactions: transactions.filter(t => t.status === "completed").length
  };

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Loading reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-container">
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Filter transactions based on search and filter
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = (transaction.customer?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                         (transaction.pet?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                         (transaction.type?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                         (transaction.id?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    if (filterType === "today") return matchesSearch && transaction.date === new Date().toISOString().split('T')[0];
    if (filterType === "completed") return matchesSearch && transaction.status === "completed";
    if (filterType === "pending") return matchesSearch && transaction.status === "pending";
    return matchesSearch;
  });

  const getTransactionIcon = (type) => {
    switch(type) {
      case "check-in": return faUserCheck;
      case "check-out": return faUserCheck;
      case "vet-appointment": return faStethoscope;
      case "hotel-booking": return faHotel;
      case "grooming": return faCut;
      default: return faPaw;
    }
  };

  const getTransactionLabel = (type) => {
    switch(type) {
      case "check-in": return "Check-in";
      case "check-out": return "Check-out";
      case "vet-appointment": return "Vet Appointment";
      case "hotel-booking": return "Hotel Booking";
      case "grooming": return "Grooming";
      default: return "Other";
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "completed": return "#10b981";
      case "pending": return "#f59e0b";
      case "scheduled": return "#3b82f6";
      case "in-progress": return "#8b5cf6";
      case "confirmed": return "#059669";
      default: return "#6b7280";
    }
  };

  const handleCloseDetails = () => {
    setSelectedTransaction(null);
  };

  // Export handlers
  const handleExportCSV = () => {
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
    exportToCSV(filteredTransactions, columns, "receptionist-transactions-report");
  };

  const handleExportPDF = () => {
    const columns = [
      { key: "id", label: "ID" },
      { key: "type", label: "Type" },
      { key: "customer", label: "Customer" },
      { key: "pet", label: "Pet" },
      { key: "date", label: "Date" },
      { key: "amount", label: "Amount", format: "currency" },
      { key: "status", label: "Status" },
    ];
    exportToPDF(filteredTransactions, columns, "Receptionist Transactions Report", "receptionist-transactions-report");
  };

  const handleExportExcel = () => {
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
    exportToExcel(filteredTransactions, columns, "receptionist-transactions-report");
  };

  return (
    <div className="reports-container">
      {/* Header Section */}
      <div className="reports-header">
        <div className="header-content">
          <div className="header-title">
            <h1><FontAwesomeIcon icon={faChartLine} /> Reports & Analytics</h1>
            <p>Comprehensive view of all transactions and operations</p>
          </div>
          <div className="header-actions">
            <div className="export-dropdown">
              <button className="action-btn export-btn">
                <FontAwesomeIcon icon={faDownload} /> Export
              </button>
              <div className="export-options">
                <button onClick={handleExportCSV}>Export CSV</button>
                <button onClick={handleExportPDF}>Export PDF</button>
                <button onClick={handleExportExcel}>Export Excel</button>
              </div>
            </div>
            <button className="action-btn print-btn" onClick={() => window.print()}>
              <FontAwesomeIcon icon={faPrint} /> Print
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalTransactions}</h3>
            <p>Total Transactions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCalendarCheck} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUserCheck} />
          </div>
          <div className="stat-content">
            <h3>{stats.checkIns + stats.checkOuts}</h3>
            <p>Check-ins/Check-outs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faStethoscope} />
          </div>
          <div className="stat-content">
            <h3>{stats.vetAppointments}</h3>
            <p>Vet Appointments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faHotel} />
          </div>
          <div className="stat-content">
            <h3>{stats.hotelBookings}</h3>
            <p>Hotel Bookings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCut} />
          </div>
          <div className="stat-content">
            <h3>{stats.groomingSessions}</h3>
            <p>Grooming Sessions</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search transactions by customer, pet, type, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <FontAwesomeIcon icon={faFilter} />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Transactions</option>
            <option value="today">Today</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-table-container">
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(transaction => (
              <tr key={transaction.id}>
                <td>
                  <span className="transaction-id">{transaction.id}</span>
                </td>
                <td>
                  <div className="transaction-type">
                    <FontAwesomeIcon icon={getTransactionIcon(transaction.type)} />
                    <span>{getTransactionLabel(transaction.type)}</span>
                  </div>
                </td>
                <td>{transaction.customer}</td>
                <td>{transaction.pet}</td>
                <td>{transaction.date}</td>
                <td>{transaction.time}</td>
                <td>
                  <span className="amount">
                    {transaction.amount > 0 ? formatCurrency(transaction.amount) : "-"}
                  </span>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(transaction.status) }}
                  >
                    {transaction.status}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => setSelectedTransaction(transaction)}
                      title="View Details"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTransactions.length === 0 && !loading && (
        <div className="no-results">
          <FontAwesomeIcon icon={faSearch} />
          <h3>No transactions found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="transaction-modal-overlay" onClick={handleCloseDetails}>
          <div className="transaction-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Transaction Details</h3>
              <button className="close-modal-btn" onClick={handleCloseDetails}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-content">
              <div className="detail-row">
                <label>Transaction ID:</label>
                <span>{selectedTransaction.id}</span>
              </div>
              <div className="detail-row">
                <label>Type:</label>
                <span>{getTransactionLabel(selectedTransaction.type)}</span>
              </div>
              <div className="detail-row">
                <label>Customer:</label>
                <span>{selectedTransaction.customer}</span>
              </div>
              <div className="detail-row">
                <label>Pet:</label>
                <span>{selectedTransaction.pet}</span>
              </div>
              <div className="detail-row">
                <label>Date:</label>
                <span>{selectedTransaction.date}</span>
              </div>
              <div className="detail-row">
                <label>Time:</label>
                <span>{selectedTransaction.time}</span>
              </div>
              <div className="detail-row">
                <label>Amount:</label>
                <span>{selectedTransaction.amount > 0 ? formatCurrency(selectedTransaction.amount) : "No charge"}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(selectedTransaction.status) }}
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

export default Reports;
