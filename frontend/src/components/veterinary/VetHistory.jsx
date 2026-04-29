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
      const data = await apiRequest("/veterinary/history?status=completed,cancelled,no-show");
      const appointments = Array.isArray(data) ? data : data.appointments || data.data || [];
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
      (record.pet_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.owner_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.diagnosis || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.treatment || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    return matchesSearch && (record.treatment || "").toLowerCase().includes(filterType.toLowerCase());
  }).sort((a, b) => {
    if (sortBy === "date") return new Date(b.date || 0) - new Date(a.date || 0);
    if (sortBy === "cost") return (b.cost || 0) - (a.cost || 0);
    if (sortBy === "pet") return (a.pet_name || "").localeCompare(b.pet_name || "");
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
          record.date ? new Date(record.date).toLocaleDateString() : "",
          record.time || "",
          record.pet_name || "",
          record.owner_name || "",
          record.treatment || "",
          record.vet_name || "",
          record.notes || "",
          record.cost || 0,
          record.payment_status || ""
        ])
      ].map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");

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
    const stats = {
      checkup: 0,
      vaccination: 0,
      surgery: 0,
      emergency: 0,
    };

    filteredHistory.forEach((record) => {
      const t = (record.treatment || "").toLowerCase();

      if (t.includes("check")) stats.checkup++;
      else if (t.includes("vacc")) stats.vaccination++;
      else if (t.includes("surg")) stats.surgery++;
      else if (t.includes("emerg")) stats.emergency++;
    });

    return stats;
  };

  if (loading) {
    return (
      <section className="app-content vet-history">
        <div className="premium-card vet-loading-state">
          <FontAwesomeIcon icon={faSpinner} className="spin-animation" />
          <span>Loading history...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="app-content vet-history">
        <div className="premium-card vet-error-state">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      </section>
    );
  }

  const stats = getTransactionStats();
  const totalRevenue = getTotalRevenue();

  return (
    <section className="app-content vet-history">
      <div className="premium-card vet-history-header">
        <div>
          <h2 className="premium-title">
            <FontAwesomeIcon icon={faCalendarAlt} /> Medical History Records
          </h2>
          <p className="premium-muted">View completed appointments and treatments</p>
        </div>
        <div className="vet-history-controls">
          <div className="vet-search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="app-select"
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
            className="app-select"
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
      <div className="app-grid-6 vet-stats-grid">
        <div className="app-stat-card vet-stat-card">
          <div className="vet-stat-icon">
            <FontAwesomeIcon icon={faFileInvoice} />
          </div>
          <div>
            <h3>{filteredHistory.length}</h3>
            <p>Total Transactions</p>
          </div>
        </div>
        <div className="app-stat-card vet-stat-card">
          <div className="vet-stat-icon">
            <FontAwesomeIcon icon={faDollarSign} />
          </div>
          <div>
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="app-stat-card vet-stat-card">
          <div className="vet-stat-icon">
            <FontAwesomeIcon icon={faStethoscope} />
          </div>
          <div>
            <h3>{stats.checkup || 0}</h3>
            <p>Checkups</p>
          </div>
        </div>
        <div className="app-stat-card vet-stat-card">
          <div className="vet-stat-icon">
            <FontAwesomeIcon icon={faSyringe} />
          </div>
          <div>
            <h3>{stats.vaccination || 0}</h3>
            <p>Vaccinations</p>
          </div>
        </div>
        <div className="app-stat-card vet-stat-card">
          <div className="vet-stat-icon">
            <FontAwesomeIcon icon={faHospital} />
          </div>
          <div>
            <h3>{stats.surgery || 0}</h3>
            <p>Surgeries</p>
          </div>
        </div>
        <div className="app-stat-card vet-stat-card">
          <div className="vet-stat-icon">
            <FontAwesomeIcon icon={faHeartbeat} />
          </div>
          <div>
            <h3>{stats.emergency || 0}</h3>
            <p>Emergencies</p>
          </div>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="premium-card vet-empty-state">
          <FontAwesomeIcon icon={faCalendarAlt} />
          <h3>No history records found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="vet-history-list">
          {filteredHistory.map((record, index) => (
            <article key={record.id || index} className="premium-card vet-history-card">
              <div className="vet-history-card-header">
                <div className="vet-history-date">
                  <FontAwesomeIcon icon={faClock} />
                  {record.date ? new Date(record.date).toLocaleDateString() : "N/A"} at {record.time || "N/A"}
                </div>
                <span className="badge badge-info">
                  <FontAwesomeIcon icon={getTypeIcon(record.type)} />
                  {getTypeLabel(record.type)}
                </span>
                <span className={`badge ${record.payment_status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                  {record.payment_status?.toUpperCase()}
                </span>
              </div>

              <div className="vet-history-body">
                <div className="vet-history-patient">
                  <div className="vet-pet-avatar">
                    <FontAwesomeIcon icon={faPaw} />
                  </div>
                  <div>
                    <h4>{record.pet_name}</h4>
                    <p><FontAwesomeIcon icon={faUser} /> {record.owner_name}</p>
                  </div>
                </div>

                <div className="vet-medical-info">
                  <div className="vet-medical-section">
                    <h5><FontAwesomeIcon icon={faStethoscope} /> Diagnosis</h5>
                    <p>{record.diagnosis}</p>
                  </div>

                  <div className="vet-medical-section">
                    <h5><FontAwesomeIcon icon={faNotesMedical} /> Treatment</h5>
                    <p>{record.treatment}</p>
                  </div>

                  {record.prescription && (
                    <div className="vet-medical-section">
                      <h5><FontAwesomeIcon icon={faPills} /> Prescription</h5>
                      <p>{record.prescription}</p>
                    </div>
                  )}

                  <div className="vet-medical-section vet-cost">
                    <h5><FontAwesomeIcon icon={faDollarSign} /> Cost</h5>
                    <p className="vet-cost-amount">{record.cost ? formatCurrency(record.cost) : "₱0"}</p>
                  </div>
                </div>

                <div className="vet-history-notes">
                  <h5><FontAwesomeIcon icon={faFileInvoice} /> Notes</h5>
                  <p>{record.notes}</p>
                </div>
              </div>

              <div className="vet-history-card-footer">
                <div className="vet-vet-info">
                  <FontAwesomeIcon icon={faUser} /> {record.vet_name ? `Dr. ${record.vet_name}` : "Unassigned"}
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => handleViewRecord(record)}
                  type="button"
                >
                  <FontAwesomeIcon icon={faEye} /> View
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {filteredHistory.length > 0 && (
        <div className="vet-history-actions">
          <button className="btn-primary" onClick={handleExportHistory} type="button">
            <FontAwesomeIcon icon={faDownload} /> Export to CSV
          </button>
        </div>
      )}
    </section>
  );
};

export default VetHistory;
