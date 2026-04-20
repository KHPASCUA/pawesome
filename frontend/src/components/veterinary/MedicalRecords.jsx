import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCalendarAlt,
  faPaw,
  faUser,
  faStethoscope,
  faSyringe,
  faPills,
  faSpinner,
  faExclamationTriangle,
  faDownload,
  faPlus,
  faEdit,
  faLock,
  faTrash,
  faFileMedical,
  faHeartbeat,
  faWeight,
  faThermometerHalf,
  faNotesMedical,
  faChevronDown,
  faChevronUp,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import {
  getMedicalRecords,
  deleteMedicalRecord,
  lockMedicalRecord,
  exportMedicalRecordsToCSV,
} from "../../api/medicalRecords";
import MedicalRecordModal from "./MedicalRecordModal";
import VaccinationModal from "./VaccinationModal";
import "./MedicalRecords.css";

const MedicalRecords = () => {
  // State
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isVaccinationModalOpen, setIsVaccinationModalOpen] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState(null);

  // Load records on mount
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await getMedicalRecords(filters);
      setRecords(data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch medical records:", err);
      setError("Failed to load medical records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (statusFilter !== "all") filters.status = statusFilter;
    if (dateRange.from) filters.from_date = dateRange.from;
    if (dateRange.to) filters.to_date = dateRange.to;
    fetchRecords(filters);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateRange({ from: "", to: "" });
    fetchRecords();
  };

  const handleCreateRecord = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleEditRecord = (record) => {
    if (record.status === "locked") {
      alert("This record is locked and cannot be edited.");
      return;
    }
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleViewRecord = (record) => {
    setExpandedRecord(expandedRecord === record.id ? null : record.id);
  };

  const handleDeleteRecord = async (record) => {
    if (record.status === "locked") {
      alert("Locked records cannot be deleted.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this medical record?")) {
      return;
    }

    try {
      await deleteMedicalRecord(record.id);
      await fetchRecords();
    } catch (err) {
      console.error("Failed to delete record:", err);
      alert("Failed to delete record. " + err.message);
    }
  };

  const handleLockRecord = async (record) => {
    if (!window.confirm("Lock this record? It will no longer be editable.")) {
      return;
    }

    try {
      await lockMedicalRecord(record.id);
      await fetchRecords();
    } catch (err) {
      console.error("Failed to lock record:", err);
      alert("Failed to lock record. " + err.message);
    }
  };

  const handleExportCSV = () => {
    exportMedicalRecordsToCSV(records);
  };

  const handleSaveSuccess = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    fetchRecords();
  };

  const handleAddVaccination = (petId) => {
    setSelectedPetId(petId);
    setIsVaccinationModalOpen(true);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "draft":
        return "status-draft";
      case "finalized":
        return "status-finalized";
      case "locked":
        return "status-locked";
      default:
        return "status-default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate statistics
  const stats = {
    total: records.length,
    draft: records.filter((r) => r.status === "draft").length,
    finalized: records.filter((r) => r.status === "finalized").length,
    locked: records.filter((r) => r.status === "locked").length,
    withPrescriptions: records.filter(
      (r) => r.prescriptions?.length > 0
    ).length,
    withVaccinations: records.filter(
      (r) => r.vaccinations?.length > 0
    ).length,
  };

  if (loading && records.length === 0) {
    return (
      <div className="medical-records">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Loading medical records...</span>
        </div>
      </div>
    );
  }

  if (error && records.length === 0) {
    return (
      <div className="medical-records">
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
          <button onClick={fetchRecords} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-records">
      {/* Header */}
      <div className="records-header">
        <div className="header-content">
          <h2>
            <FontAwesomeIcon icon={faFileMedical} />
            Medical Records Management
          </h2>
          <p className="header-subtitle">
            Structured consultation data, diagnosis, treatment, prescriptions, and vaccination history
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleCreateRecord}>
            <FontAwesomeIcon icon={faPlus} />
            New Record
          </button>
          <button className="btn-secondary" onClick={handleExportCSV}>
            <FontAwesomeIcon icon={faDownload} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faFileMedical} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Records</div>
          </div>
        </div>
        <div className="stat-card draft">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faEdit} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.draft}</div>
            <div className="stat-label">Draft</div>
          </div>
        </div>
        <div className="stat-card finalized">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faNotesMedical} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.finalized}</div>
            <div className="stat-label">Finalized</div>
          </div>
        </div>
        <div className="stat-card locked">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faLock} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.locked}</div>
            <div className="stat-label">Locked</div>
          </div>
        </div>
        <div className="stat-card prescriptions">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faPills} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.withPrescriptions}</div>
            <div className="stat-label">With Prescriptions</div>
          </div>
        </div>
        <div className="stat-card vaccinations">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faSyringe} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.withVaccinations}</div>
            <div className="stat-label">With Vaccinations</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-input">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search by pet, owner, diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            className="btn-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FontAwesomeIcon icon={faFilter} />
            Filters
            <FontAwesomeIcon icon={showFilters ? faChevronUp : faChevronDown} />
          </button>
          <button className="btn-search" onClick={handleSearch}>
            Search
          </button>
          <button className="btn-clear" onClick={handleClearFilters}>
            Clear
          </button>
        </div>

        {showFilters && (
          <div className="advanced-filters">
            <div className="filter-group">
              <label>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="finalized">Finalized</option>
                <option value="locked">Locked</option>
              </select>
            </div>
            <div className="filter-group">
              <label>From Date</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange({ ...dateRange, from: e.target.value })
                }
              />
            </div>
            <div className="filter-group">
              <label>To Date</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange({ ...dateRange, to: e.target.value })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Records List */}
      <div className="records-list">
        {records.length === 0 ? (
          <div className="no-records">
            <FontAwesomeIcon icon={faFileMedical} />
            <h3>No medical records found</h3>
            <p>Try adjusting your search or filters, or create a new record.</p>
            <button className="btn-primary" onClick={handleCreateRecord}>
              <FontAwesomeIcon icon={faPlus} />
              Create First Record
            </button>
          </div>
        ) : (
          records.map((record) => (
            <div
              key={record.id}
              className={`record-card ${expandedRecord === record.id ? "expanded" : ""}`}
            >
              {/* Record Header */}
              <div className="record-header">
                <div className="record-main-info">
                  <div className="pet-info">
                    <div className="pet-avatar">
                      <FontAwesomeIcon icon={faPaw} />
                    </div>
                    <div className="pet-details">
                      <h4>{record.pet?.name || "Unknown Pet"}</h4>
                      <p>
                        <FontAwesomeIcon icon={faUser} />
                        {record.pet?.customer?.name || "Unknown Owner"}
                      </p>
                    </div>
                  </div>
                  <div className="visit-info">
                    <div className="visit-date">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {formatDateTime(record.visit_date)}
                    </div>
                    <div className="veterinarian">
                      <FontAwesomeIcon icon={faStethoscope} />
                      Dr. {record.veterinarian?.name || "Unknown"}
                    </div>
                  </div>
                </div>
                <div className="record-status">
                  <span className={`status-badge ${getStatusBadgeClass(record.status)}`}>
                    {record.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Record Summary */}
              <div className="record-summary">
                {record.diagnosis && (
                  <div className="summary-item">
                    <span className="summary-label">Diagnosis:</span>
                    <span className="summary-value">{record.diagnosis}</span>
                  </div>
                )}
                {record.chief_complaint && (
                  <div className="summary-item">
                    <span className="summary-label">Chief Complaint:</span>
                    <span className="summary-value">{record.chief_complaint}</span>
                  </div>
                )}
                <div className="summary-tags">
                  {record.prescriptions?.length > 0 && (
                    <span className="tag prescriptions">
                      <FontAwesomeIcon icon={faPills} />
                      {record.prescriptions.length} Prescription
                      {record.prescriptions.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {record.vaccinations?.length > 0 && (
                    <span className="tag vaccinations">
                      <FontAwesomeIcon icon={faSyringe} />
                      {record.vaccinations.length} Vaccination
                      {record.vaccinations.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {record.weight_kg && (
                    <span className="tag weight">
                      <FontAwesomeIcon icon={faWeight} />
                      {record.weight_kg} kg
                    </span>
                  )}
                  {record.temperature_celsius && (
                    <span className="tag temp">
                      <FontAwesomeIcon icon={faThermometerHalf} />
                      {record.temperature_celsius}°C
                    </span>
                  )}
                </div>
              </div>

              {/* Record Actions */}
              <div className="record-actions">
                <button
                  className="btn-action view"
                  onClick={() => handleViewRecord(record)}
                  title="View Details"
                >
                  <FontAwesomeIcon icon={expandedRecord === record.id ? faChevronUp : faChevronDown} />
                  {expandedRecord === record.id ? "Hide" : "View"}
                </button>
                {record.status !== "locked" && (
                  <button
                    className="btn-action edit"
                    onClick={() => handleEditRecord(record)}
                    title="Edit Record"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    Edit
                  </button>
                )}
                {record.status !== "locked" && (
                  <button
                    className="btn-action lock"
                    onClick={() => handleLockRecord(record)}
                    title="Lock Record"
                  >
                    <FontAwesomeIcon icon={faLock} />
                    Lock
                  </button>
                )}
                {record.status !== "locked" && (
                  <button
                    className="btn-action delete"
                    onClick={() => handleDeleteRecord(record)}
                    title="Delete Record"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Delete
                  </button>
                )}
              </div>

              {/* Expanded Details */}
              {expandedRecord === record.id && (
                <div className="record-details">
                  {/* Vitals */}
                  {(record.weight_kg ||
                    record.temperature_celsius ||
                    record.heart_rate ||
                    record.respiratory_rate) && (
                    <div className="details-section vitals">
                      <h4>
                        <FontAwesomeIcon icon={faHeartbeat} />
                        Vital Signs
                      </h4>
                      <div className="vitals-grid">
                        {record.weight_kg && (
                          <div className="vital-item">
                            <span className="vital-label">Weight</span>
                            <span className="vital-value">{record.weight_kg} kg</span>
                          </div>
                        )}
                        {record.temperature_celsius && (
                          <div className="vital-item">
                            <span className="vital-label">Temperature</span>
                            <span className="vital-value">
                              {record.temperature_celsius}°C
                            </span>
                          </div>
                        )}
                        {record.heart_rate && (
                          <div className="vital-item">
                            <span className="vital-label">Heart Rate</span>
                            <span className="vital-value">
                              {record.heart_rate} bpm
                            </span>
                          </div>
                        )}
                        {record.respiratory_rate && (
                          <div className="vital-item">
                            <span className="vital-label">Respiratory Rate</span>
                            <span className="vital-value">
                              {record.respiratory_rate} /min
                            </span>
                          </div>
                        )}
                        {record.body_condition_score && (
                          <div className="vital-item">
                            <span className="vital-label">Body Condition</span>
                            <span className="vital-value">
                              {record.body_condition_score}/9
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Chief Complaint & Symptoms */}
                  {(record.chief_complaint || record.symptoms) && (
                    <div className="details-section">
                      <h4>
                        <FontAwesomeIcon icon={faNotesMedical} />
                        Presenting Complaint
                      </h4>
                      {record.chief_complaint && (
                        <div className="detail-item">
                          <span className="detail-label">Chief Complaint:</span>
                          <p className="detail-value">{record.chief_complaint}</p>
                        </div>
                      )}
                      {record.symptoms && (
                        <div className="detail-item">
                          <span className="detail-label">Symptoms:</span>
                          <p className="detail-value">{record.symptoms}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Physical Examination */}
                  {record.physical_examination && (
                    <div className="details-section">
                      <h4>
                        <FontAwesomeIcon icon={faStethoscope} />
                        Physical Examination
                      </h4>
                      <p className="detail-value">{record.physical_examination}</p>
                    </div>
                  )}

                  {/* Diagnosis */}
                  {(record.diagnosis || record.secondary_diagnosis) && (
                    <div className="details-section diagnosis">
                      <h4>
                        <FontAwesomeIcon icon={faStethoscope} />
                        Diagnosis
                      </h4>
                      {record.diagnosis && (
                        <div className="detail-item">
                          <span className="detail-label">Primary:</span>
                          <p className="detail-value primary">{record.diagnosis}</p>
                        </div>
                      )}
                      {record.secondary_diagnosis && (
                        <div className="detail-item">
                          <span className="detail-label">Secondary:</span>
                          <p className="detail-value secondary">
                            {record.secondary_diagnosis}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Treatment Plan */}
                  {record.treatment_plan && (
                    <div className="details-section">
                      <h4>
                        <FontAwesomeIcon icon={faNotesMedical} />
                        Treatment Plan
                      </h4>
                      <p className="detail-value">{record.treatment_plan}</p>
                    </div>
                  )}

                  {/* Procedure Notes */}
                  {record.procedure_notes && (
                    <div className="details-section">
                      <h4>
                        <FontAwesomeIcon icon={faNotesMedical} />
                        Procedures Performed
                      </h4>
                      <p className="detail-value">{record.procedure_notes}</p>
                    </div>
                  )}

                  {/* Follow-up Instructions */}
                  {record.follow_up_instructions && (
                    <div className="details-section">
                      <h4>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        Follow-up Instructions
                      </h4>
                      <p className="detail-value">{record.follow_up_instructions}</p>
                    </div>
                  )}

                  {/* Prescriptions */}
                  {record.prescriptions?.length > 0 && (
                    <div className="details-section prescriptions">
                      <h4>
                        <FontAwesomeIcon icon={faPills} />
                        Prescriptions ({record.prescriptions.length})
                      </h4>
                      <div className="prescriptions-list">
                        {record.prescriptions.map((prescription, idx) => (
                          <div key={idx} className="prescription-item">
                            <div className="prescription-header">
                              <span className="medication-name">
                                {prescription.medication_name}
                              </span>
                              <span
                                className={`prescription-status ${prescription.is_active ? "active" : "inactive"}`}
                              >
                                {prescription.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <p className="prescription-details">
                              {prescription.dosage} {prescription.dosage_unit},{" "}
                              {prescription.frequency}, {prescription.route} for{" "}
                              {prescription.duration}
                            </p>
                            {prescription.instructions && (
                              <p className="prescription-instructions">
                                <strong>Instructions:</strong> {prescription.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vaccinations */}
                  {record.vaccinations?.length > 0 && (
                    <div className="details-section vaccinations">
                      <h4>
                        <FontAwesomeIcon icon={faSyringe} />
                        Vaccinations Given ({record.vaccinations.length})
                      </h4>
                      <div className="vaccinations-list">
                        {record.vaccinations.map((vaccination, idx) => (
                          <div key={idx} className="vaccination-item">
                            <div className="vaccination-header">
                              <span className="vaccine-name">
                                {vaccination.vaccine_name}
                              </span>
                              <span className="vaccination-date">
                                {formatDate(vaccination.date_administered)}
                              </span>
                            </div>
                            {vaccination.next_due_date && (
                              <p className="next-due">
                                Next due: {formatDate(vaccination.next_due_date)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* General Notes */}
                  {record.notes && (
                    <div className="details-section notes">
                      <h4>
                        <FontAwesomeIcon icon={faNotesMedical} />
                        Additional Notes
                      </h4>
                      <p className="detail-value">{record.notes}</p>
                    </div>
                  )}

                  {/* Record Metadata */}
                  <div className="details-section metadata">
                    <div className="meta-grid">
                      <div className="meta-item">
                        <span className="meta-label">Record ID:</span>
                        <span className="meta-value">#{record.id}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Created:</span>
                        <span className="meta-value">
                          {formatDateTime(record.created_at)}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Last Updated:</span>
                        <span className="meta-value">
                          {formatDateTime(record.updated_at)}
                        </span>
                      </div>
                      {record.locked_at && (
                        <div className="meta-item">
                          <span className="meta-label">Locked:</span>
                          <span className="meta-value">
                            {formatDateTime(record.locked_at)} by{" "}
                            {record.locked_by?.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action to add vaccination to this pet */}
                  <div className="details-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => handleAddVaccination(record.pet_id)}
                    >
                      <FontAwesomeIcon icon={faSyringe} />
                      Add Vaccination for {record.pet?.name}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Medical Record Modal */}
      {isModalOpen && (
        <MedicalRecordModal
          record={editingRecord}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRecord(null);
          }}
          onSave={handleSaveSuccess}
        />
      )}

      {/* Vaccination Modal */}
      {isVaccinationModalOpen && (
        <VaccinationModal
          petId={selectedPetId}
          onClose={() => {
            setIsVaccinationModalOpen(false);
            setSelectedPetId(null);
          }}
          onSave={() => {
            setIsVaccinationModalOpen(false);
            setSelectedPetId(null);
            fetchRecords();
          }}
        />
      )}
    </div>
  );
};

export default MedicalRecords;
