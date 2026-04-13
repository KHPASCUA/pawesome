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
  faEye,
  faDollarSign,
  faFileInvoice,
  faHospital,
  faHeartbeat,
  faBandAid,
  faPills,
  faWeight,
  faRuler,
  faThermometerHalf,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import "./VetHistory.css";

const VetHistory = () => {
  const [history, setHistory] = useState([
    {
      id: 1,
      date: "2026-04-10",
      time: "09:30 AM",
      pet_name: "Max",
      owner_name: "John Smith",
      type: "checkup",
      vet_name: "Dr. Sarah Johnson",
      diagnosis: "Healthy dog, routine checkup",
      treatment: "Vitamin supplements prescribed",
      prescription: "Multivitamin tablets - 1 daily",
      cost: 85.00,
      payment_status: "paid",
      weight: "25 kg",
      temperature: "38.5°C",
      heart_rate: "85 bpm",
      notes: "Patient appears healthy, all vitals normal. Recommended annual vaccination next month."
    },
    {
      id: 2,
      date: "2026-04-08",
      time: "02:15 PM",
      pet_name: "Bella",
      owner_name: "Emily Wilson",
      type: "vaccination",
      vet_name: "Dr. Michael Chen",
      diagnosis: "Annual vaccination due",
      treatment: "DHPP vaccine administered",
      prescription: "None required",
      cost: 45.00,
      payment_status: "paid",
      weight: "18 kg",
      temperature: "38.2°C",
      heart_rate: "90 bpm",
      notes: "Vaccination completed successfully. No adverse reactions observed."
    },
    {
      id: 3,
      date: "2026-04-05",
      time: "11:00 AM",
      pet_name: "Charlie",
      owner_name: "Robert Brown",
      type: "surgery",
      vet_name: "Dr. Lisa Anderson",
      diagnosis: "Gastrointestinal obstruction",
      treatment: "Emergency surgery performed",
      prescription: "Antibiotics and pain medication",
      cost: 1200.00,
      payment_status: "paid",
      weight: "15 kg",
      temperature: "39.1°C",
      heart_rate: "110 bpm",
      notes: "Successful surgery. Patient recovering well. Follow-up in 7 days."
    },
    {
      id: 4,
      date: "2026-04-03",
      time: "03:45 PM",
      pet_name: "Luna",
      owner_name: "Sarah Johnson",
      type: "emergency",
      vet_name: "Dr. David Miller",
      diagnosis: "Acute allergic reaction",
      treatment: "Epinephrine and antihistamines",
      prescription: "Prednisone for 5 days",
      cost: 350.00,
      payment_status: "pending",
      weight: "8 kg",
      temperature: "39.8°C",
      heart_rate: "120 bpm",
      notes: "Emergency treatment successful. Monitor for 24 hours."
    },
    {
      id: 5,
      date: "2026-04-01",
      time: "10:30 AM",
      pet_name: "Rocky",
      owner_name: "Mike Davis",
      type: "dental",
      vet_name: "Dr. Sarah Johnson",
      diagnosis: "Dental cleaning required",
      treatment: "Professional dental cleaning",
      prescription: "None required",
      cost: 200.00,
      payment_status: "paid",
      weight: "30 kg",
      temperature: "38.3°C",
      heart_rate: "80 bpm",
      notes: "Dental procedure completed successfully. Good oral hygiene advised."
    },
    {
      id: 6,
      date: "2026-03-28",
      time: "01:15 PM",
      pet_name: "Mittens",
      owner_name: "Emily Wilson",
      type: "grooming",
      vet_name: "Dr. Michael Chen",
      diagnosis: "Routine grooming check",
      treatment: "Full grooming service",
      prescription: "Flea prevention treatment",
      cost: 75.00,
      payment_status: "paid",
      weight: "4 kg",
      temperature: "38.7°C",
      heart_rate: "95 bpm",
      notes: "Grooming completed. Applied flea prevention. Next visit in 3 months."
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/veterinary/history");
      setHistory(data.history || []);
      setError("");
    } catch (err) {
      console.log("API failed, using mock data:", err);
      setError("");
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
    return matchesSearch && record.type === filterType;
  }).sort((a, b) => {
    if (sortBy === "date") return new Date(b.date) - new Date(a.date);
    if (sortBy === "cost") return b.cost - a.cost;
    if (sortBy === "pet") return a.pet_name.localeCompare(b.pet_name);
    return 0;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case "checkup": return faStethoscope;
      case "vaccination": return faSyringe;
      case "surgery": return faHospital;
      case "emergency": return faHeartbeat;
      case "dental": return faNotesMedical;
      case "grooming": return faBandAid;
      default: return faCalendarAlt;
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case "checkup": return "type-checkup";
      case "vaccination": return "type-vaccination";
      case "surgery": return "type-surgery";
      case "emergency": return "type-emergency";
      case "dental": return "type-dental";
      case "grooming": return "type-grooming";
      default: return "type-consultation";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "checkup": return "Checkup";
      case "vaccination": return "Vaccination";
      case "surgery": return "Surgery";
      case "emergency": return "Emergency";
      case "dental": return "Dental";
      case "grooming": return "Grooming";
      default: return "Consultation";
    }
  };

  const handleViewRecord = (record) => {
    console.log("View record:", record);
  };

  const handleExportHistory = async () => {
    try {
      const csvContent = [
        ["Date", "Time", "Pet", "Owner", "Type", "Veterinarian", "Diagnosis", "Treatment", "Cost", "Payment Status"],
        ...filteredHistory.map(record => [
          new Date(record.date).toLocaleDateString(),
          record.time,
          record.pet_name || "",
          record.owner_name || "",
          getTypeLabel(record.type),
          record.vet_name || "",
          record.diagnosis || "",
          record.treatment || "",
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
      stats[record.type] = (stats[record.type] || 0) + 1;
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
            <div className="stat-value">${totalRevenue.toFixed(2)}</div>
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
                    <div className="vital-signs">
                      <span><FontAwesomeIcon icon={faWeight} /> {record.weight}</span>
                      <span><FontAwesomeIcon icon={faThermometerHalf} /> {record.temperature}</span>
                      <span><FontAwesomeIcon icon={faHeartbeat} /> {record.heart_rate}</span>
                    </div>
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
                    <p className="cost-amount">${record.cost.toFixed(2)}</p>
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