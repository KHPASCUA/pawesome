import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCalendarAlt,
  faPaw,
  faUser,
  faClock,
  faNotesMedical,
  faStethoscope,
  faSyringe,
  faSpinner,
  faExclamationTriangle,
  faDownload,
  faDollarSign,
  faFileInvoice,
  faHospital,
  faHeartbeat,
  faPills,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import "./VetHistory.css";

const VetHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/veterinary/appointments?status=completed,cancelled,no-show");
      const appointments = Array.isArray(data) ? data : (data.appointments || []);
      const historyRecords = appointments.map(apt => ({
        id: apt.id,
        date: new Date(apt.scheduled_at).toISOString().split('T')[0],
        time: new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pet_name: apt.pet?.name || 'Unknown',
        owner_name: apt.customer?.name || 'Unknown',
        type: apt.service?.name || 'General service',
        vet_name: 'Unassigned', // No veterinarian field in current model
        diagnosis: apt.notes || 'No notes recorded',
        treatment: apt.service?.name || 'General service',
        cost: apt.price || 0,
        payment_status: 'completed', // Assuming completed appointments are paid
        notes: apt.notes || ''
      }));
      setHistory(historyRecords);
      setError("");
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setError("Failed to load history");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((record) => {
    const matchesSearch = 
      record.pet_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.treatment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    return matchesSearch && record.treatment.toLowerCase().includes(filterType.toLowerCase());
  }).sort((a, b) => {
    if (sortBy === "date") return new Date(b.date) - new Date(a.date);
    if (sortBy === "cost") return b.cost - a.cost;
    if (sortBy === "pet") return a.pet_name.localeCompare(b.pet_name);
    return 0;
  });

  const getTypeIcon = (type) => {
    // Since type is now service name, use a generic icon
    return faStethoscope;
  };

  const getTypeClass = (type) => {
    return "type-consultation";
  };

  const getTypeLabel = (type) => {
    return type || "Service";
  };

  const handleViewRecord = (record) => {
    console.log("View record:", record);
  };

  const handleExportHistory = async () => {
    try {
      const csvContent = [
        ["Date", "Time", "Pet", "Owner", "Service", "Veterinarian", "Notes", "Cost", "Payment Status"],
        ...filteredHistory.map(record => [
          new Date(record.date).toLocaleDateString(),
          record.time,
          record.pet_name || "",
          record.owner_name || "",
          record.treatment || "",
          record.vet_name || "",
          record.notes || "",
          record.cost || 0,
          record.payment_status || ""
        ])
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "veterinary_history.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to export history");
      console.error("Export error:", err);
    }
  };

  const getTotalRevenue = () => {
    return filteredHistory.reduce((sum, record) => sum + (record.cost || 0), 0);
  };

  const getTransactionStats = () => {
    const stats = {};
    filteredHistory.forEach(record => {
      const service = record.treatment || 'Unknown';
      stats[service] = (stats[service] || 0) + 1;
    });
    return stats;
  };

  if (loading) {
    return (
      <div className="vet-history">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Loading history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vet-history">
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const stats = getTransactionStats();
  const totalRevenue = getTotalRevenue();

  return (
    <div className="vet-history">
      <div className="history-header">
        <h2>Veterinary Transaction History</h2>
        <div className="filter-controls">
          <div className="search-input">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="checkup">Checkups</option>
            <option value="vaccination">Vaccinations</option>
            <option value="surgery">Surgeries</option>
            <option value="emergency">Emergency</option>
            <option value="dental">Dental</option>
            <option value="grooming">Grooming</option>
          </select>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="cost">Sort by Cost</option>
            <option value="pet">Sort by Pet</option>
          </select>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faFileInvoice} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{filteredHistory.length}</div>
            <div className="stat-label">Total Transactions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faDollarSign} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(totalRevenue)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faStethoscope} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.checkup || 0}</div>
            <div className="stat-label">Checkups</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faSyringe} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.vaccination || 0}</div>
            <div className="stat-label">Vaccinations</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faHospital} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.surgery || 0}</div>
            <div className="stat-label">Surgeries</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faHeartbeat} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.emergency || 0}</div>
            <div className="stat-label">Emergencies</div>
          </div>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="no-records">
          <FontAwesomeIcon icon={faCalendarAlt} />
          <h3>No history records found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="history-timeline">
          {filteredHistory.map((record, index) => (
            <div key={record.id || index} className="history-item">
              <div className="history-item-header">
                <div className="history-date">
                  <FontAwesomeIcon icon={faClock} />
                  {new Date(record.date).toLocaleDateString()} at {record.time}
                </div>
                <span className={`history-type ${getTypeClass(record.type)}`}>
                  <FontAwesomeIcon icon={getTypeIcon(record.type)} />
                  {getTypeLabel(record.type)}
                </span>
                <div className="payment-status">
                  <span className={`status-badge status-${record.payment_status}`}>
                    {record.payment_status?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="history-content">
                <div className="history-patient">
                  <div className="patient-avatar">
                    <FontAwesomeIcon icon={faPaw} />
                  </div>
                  <div className="patient-info">
                    <h4>{record.pet_name}</h4>
                    <p><FontAwesomeIcon icon={faUser} /> {record.owner_name}</p>
                  </div>
                </div>

                <div className="medical-info">
                  <div className="diagnosis-section">
                    <h5>
                      <FontAwesomeIcon icon={faStethoscope} />
                      Diagnosis
                    </h5>
                    <p>{record.diagnosis}</p>
                  </div>

                  <div className="treatment-section">
                    <h5>
                      <FontAwesomeIcon icon={faNotesMedical} />
                      Treatment
                    </h5>
                    <p>{record.treatment}</p>
                  </div>

                  {record.prescription && (
                    <div className="prescription-section">
                      <h5>
                        <FontAwesomeIcon icon={faPills} />
                        Prescription
                      </h5>
                      <p>{record.prescription}</p>
                    </div>
                  )}

                  <div className="cost-section">
                    <h5>
                      <FontAwesomeIcon icon={faDollarSign} />
                      Cost
                    </h5>
                    <p className="cost-amount">{formatCurrency(record.cost)}</p>
                  </div>
                </div>

                <div className="notes-section">
                  <h5>
                    <FontAwesomeIcon icon={faFileInvoice} />
                    Notes
                  </h5>
                  <p>{record.notes}</p>
                </div>
              </div>

              <div className="history-footer">
                <div className="vet-info">
                  <FontAwesomeIcon icon={faUser} />
                  Dr. {record.vet_name}
                </div>
                <div className="action-buttons">
                  <button
                    className="btn-view"
                    onClick={() => handleViewRecord(record)}
                    title="View Details"
                  >
                    <FontAwesomeIcon icon={faEye} />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredHistory.length > 0 && (
        <div className="history-footer-actions">
          <button className="btn-export" onClick={handleExportHistory}>
            <FontAwesomeIcon icon={faDownload} />
            Export to CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default VetHistory;
