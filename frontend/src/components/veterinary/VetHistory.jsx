import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  faMoneyBillWave,
  faFileInvoice,
  faHospital,
  faHeartbeat,
  faPills,
  faEye,
  faRotateRight,
  faXmark,
  faFilter,
  faSort,
  faChartLine,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import "./VetHistory.css";

const VetHistory = () => {
  const [history, setHistory] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const safeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.appointments)) return value.appointments;
    if (Array.isArray(value?.history)) return value.history;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.records)) return value.records;
    return [];
  };

  const normalizeStatus = (status) =>
    String(status || "completed").toLowerCase().replace(/\s+/g, "_");

  const getSchedule = (apt) =>
    apt?.scheduled_at ||
    apt?.appointment_date ||
    apt?.date ||
    apt?.created_at ||
    null;

  const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateKey = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toISOString().split("T")[0];
  };

  const formatTime = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPetName = (apt) =>
    apt?.pet?.name ||
    apt?.pet_name ||
    apt?.patient_name ||
    "Unknown Pet";

  const getOwnerName = (apt) =>
    apt?.customer?.name ||
    apt?.owner?.name ||
    apt?.customer_name ||
    apt?.owner_name ||
    "Unknown Owner";

  const getServiceName = (apt) =>
    apt?.service?.name ||
    apt?.service_name ||
    apt?.appointment_type ||
    apt?.type ||
    apt?.treatment ||
    "General Service";

  const getVetName = (apt) =>
    apt?.veterinarian?.name ||
    apt?.vet?.name ||
    apt?.vet_name ||
    apt?.doctor_name ||
    "Unassigned";

  const getCost = (apt) =>
    Number(
      apt?.price ||
        apt?.cost ||
        apt?.total_amount ||
        apt?.amount ||
        apt?.service?.price ||
        0
    );

  const transformRecord = (apt) => {
    const schedule = getSchedule(apt);
    const service = getServiceName(apt);
    const notes = apt?.notes || apt?.diagnosis || apt?.description || "No notes recorded";

    return {
      id: apt?.id,
      raw: apt,
      date: formatDate(schedule),
      dateKey: formatDateKey(schedule),
      time: formatTime(schedule),
      pet_name: getPetName(apt),
      owner_name: getOwnerName(apt),
      type: service,
      vet_name: getVetName(apt),
      diagnosis: apt?.diagnosis || notes,
      treatment: apt?.treatment || service,
      prescription: apt?.prescription || apt?.medication || "",
      cost: getCost(apt),
      payment_status: normalizeStatus(apt?.payment_status || apt?.payment?.status || "completed"),
      appointment_status: normalizeStatus(apt?.status),
      notes,
    };
  };

  const fetchHistory = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const data = await apiRequest(
        "/veterinary/history?status=completed,cancelled,no-show"
      );

      const appointments = safeArray(data);
      const records = appointments.map(transformRecord);

      setHistory(records);
      setError("");
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setError("Failed to load medical history records.");
      setHistory([]);

      if (!silent) {
        toast.error("Failed to load veterinary history.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory({ silent: false });
  }, [fetchHistory]);

  const getTypeIcon = (type) => {
    const value = String(type || "").toLowerCase();

    if (value.includes("vacc")) return faSyringe;
    if (value.includes("surg")) return faHospital;
    if (value.includes("emerg")) return faHeartbeat;
    if (value.includes("medicine") || value.includes("medication")) return faPills;

    return faStethoscope;
  };

  const getTypeClass = (type) => {
    const value = String(type || "").toLowerCase();

    if (value.includes("vacc")) return "type-vaccination";
    if (value.includes("surg")) return "type-surgery";
    if (value.includes("emerg")) return "type-emergency";
    if (value.includes("dental")) return "type-dental";
    if (value.includes("groom")) return "type-grooming";
    if (value.includes("check")) return "type-checkup";

    return "type-consultation";
  };

  const filteredHistory = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return history
      .filter((record) => {
        const searchableText = [
          record.pet_name,
          record.owner_name,
          record.diagnosis,
          record.treatment,
          record.type,
          record.vet_name,
          record.notes,
          record.payment_status,
          record.appointment_status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = !keyword || searchableText.includes(keyword);

        if (filterType === "all") return matchesSearch;

        const treatmentText = `${record.treatment} ${record.type}`.toLowerCase();
        return matchesSearch && treatmentText.includes(filterType.toLowerCase());
      })
      .sort((a, b) => {
        if (sortBy === "date") {
          return new Date(b.dateKey || 0) - new Date(a.dateKey || 0);
        }

        if (sortBy === "cost") return (b.cost || 0) - (a.cost || 0);

        if (sortBy === "pet") {
          return (a.pet_name || "").localeCompare(b.pet_name || "");
        }

        if (sortBy === "owner") {
          return (a.owner_name || "").localeCompare(b.owner_name || "");
        }

        return 0;
      });
  }, [history, searchTerm, filterType, sortBy]);

  const stats = useMemo(() => {
    const totalRevenue = filteredHistory.reduce(
      (sum, record) => sum + Number(record.cost || 0),
      0
    );

    const completed = filteredHistory.filter(
      (record) => record.appointment_status === "completed"
    ).length;

    const checkup = filteredHistory.filter((record) =>
      `${record.treatment} ${record.type}`.toLowerCase().includes("check")
    ).length;

    const vaccination = filteredHistory.filter((record) =>
      `${record.treatment} ${record.type}`.toLowerCase().includes("vacc")
    ).length;

    const surgery = filteredHistory.filter((record) =>
      `${record.treatment} ${record.type}`.toLowerCase().includes("surg")
    ).length;

    const emergency = filteredHistory.filter((record) =>
      `${record.treatment} ${record.type}`.toLowerCase().includes("emerg")
    ).length;

    return {
      total: filteredHistory.length,
      totalRevenue,
      completed,
      checkup,
      vaccination,
      surgery,
      emergency,
    };
  }, [filteredHistory]);

  const handleExportHistory = () => {
    try {
      const csvRows = [
        [
          "Date",
          "Time",
          "Pet",
          "Owner",
          "Service",
          "Veterinarian",
          "Diagnosis",
          "Treatment",
          "Prescription",
          "Notes",
          "Cost",
          "Payment Status",
          "Appointment Status",
        ],
        ...filteredHistory.map((record) => [
          record.date || "",
          record.time || "",
          record.pet_name || "",
          record.owner_name || "",
          record.type || "",
          record.vet_name || "",
          record.diagnosis || "",
          record.treatment || "",
          record.prescription || "",
          record.notes || "",
          record.cost || 0,
          record.payment_status || "",
          record.appointment_status || "",
        ]),
      ];

      const csvContent = csvRows
        .map((row) =>
          row
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `veterinary_history_${new Date().toISOString().split("T")[0]}.csv`;
      anchor.click();

      window.URL.revokeObjectURL(url);
      toast.success("History exported successfully.");
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to export history.");
      toast.error("Failed to export history.");
    }
  };

  const handleRefresh = () => {
    fetchHistory({ silent: true });
    toast.success("History refreshed.");
  };

  if (loading) {
    return (
      <section className="app-content vet-history">
        <div className="premium-card vet-loading-state">
          <FontAwesomeIcon icon={faSpinner} className="spin-animation" />
          <span>Loading medical history...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="app-content vet-history">
      <div className="premium-card vet-history-hero">
        <div className="vet-history-hero-copy">
          <span className="vet-history-eyebrow">
            <FontAwesomeIcon icon={faClipboardCheck} />
            Veterinary Records
          </span>

          <h2 className="premium-title">
            <FontAwesomeIcon icon={faCalendarAlt} />
            Medical History Records
          </h2>

          <p className="premium-muted">
            Review completed appointments, treatments, payment records, and exported veterinary history.
          </p>
        </div>

        <div className="vet-history-hero-actions">
          <button
            className={`vet-history-refresh-btn ${refreshing ? "refreshing" : ""}`}
            onClick={handleRefresh}
            disabled={refreshing}
            type="button"
          >
            <FontAwesomeIcon icon={faRotateRight} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            className="vet-history-export-btn"
            onClick={handleExportHistory}
            disabled={filteredHistory.length === 0}
            type="button"
          >
            <FontAwesomeIcon icon={faDownload} />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="premium-card vet-history-error-banner">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      )}

      <div className="vet-history-stats">
        <article className="premium-card vet-history-stat-card">
          <span>
            <FontAwesomeIcon icon={faFileInvoice} />
          </span>
          <div>
            <h3>{stats.total}</h3>
            <p>Total Records</p>
          </div>
        </article>

        <article className="premium-card vet-history-stat-card">
          <span>
            <FontAwesomeIcon icon={faMoneyBillWave} />
          </span>
          <div>
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </article>

        <article className="premium-card vet-history-stat-card">
          <span>
            <FontAwesomeIcon icon={faStethoscope} />
          </span>
          <div>
            <h3>{stats.checkup}</h3>
            <p>Checkups</p>
          </div>
        </article>

        <article className="premium-card vet-history-stat-card">
          <span>
            <FontAwesomeIcon icon={faSyringe} />
          </span>
          <div>
            <h3>{stats.vaccination}</h3>
            <p>Vaccinations</p>
          </div>
        </article>

        <article className="premium-card vet-history-stat-card">
          <span>
            <FontAwesomeIcon icon={faHospital} />
          </span>
          <div>
            <h3>{stats.surgery}</h3>
            <p>Surgeries</p>
          </div>
        </article>

        <article className="premium-card vet-history-stat-card">
          <span>
            <FontAwesomeIcon icon={faHeartbeat} />
          </span>
          <div>
            <h3>{stats.emergency}</h3>
            <p>Emergencies</p>
          </div>
        </article>
      </div>

      <div className="premium-card vet-history-toolbar">
        <div className="vet-history-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search pet, owner, diagnosis, treatment, vet, or notes..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          {searchTerm && (
            <button
              className="vet-history-clear-search"
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <div className="vet-history-toolbar-controls">
          <label>
            <FontAwesomeIcon icon={faFilter} />
            <select
              className="app-select"
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
            >
              <option value="all">All Types</option>
              <option value="checkup">Checkups</option>
              <option value="vaccination">Vaccinations</option>
              <option value="surgery">Surgeries</option>
              <option value="emergency">Emergency</option>
              <option value="dental">Dental</option>
              <option value="grooming">Grooming</option>
            </select>
          </label>

          <label>
            <FontAwesomeIcon icon={faSort} />
            <select
              className="app-select"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="cost">Sort by Cost</option>
              <option value="pet">Sort by Pet</option>
              <option value="owner">Sort by Owner</option>
            </select>
          </label>
        </div>

        <div className="vet-history-result-count">
          Showing <strong>{filteredHistory.length}</strong> of{" "}
          <strong>{history.length}</strong> records
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="premium-card vet-empty-state">
          <FontAwesomeIcon icon={faCalendarAlt} />
          <h3>No history records found</h3>
          <p>
            {searchTerm || filterType !== "all"
              ? "Try adjusting your search or filters."
              : "Completed veterinary records will appear here."}
          </p>
        </div>
      ) : (
        <div className="vet-history-list">
          {filteredHistory.map((record, index) => (
            <article
              key={record.id || `${record.pet_name}-${index}`}
              className="premium-card vet-history-card"
            >
              <div className="vet-history-card-header">
                <div className="vet-history-date">
                  <FontAwesomeIcon icon={faClock} />
                  <span>
                    {record.date} at {record.time}
                  </span>
                </div>

                <div className="vet-history-badges">
                  <span className={`vet-type-badge ${getTypeClass(record.type)}`}>
                    <FontAwesomeIcon icon={getTypeIcon(record.type)} />
                    {record.type || "Service"}
                  </span>

                  <span
                    className={`vet-payment-badge ${
                      record.payment_status === "completed" ||
                      record.payment_status === "paid"
                        ? "paid"
                        : "pending"
                    }`}
                  >
                    {record.payment_status.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="vet-history-body">
                <div className="vet-history-patient">
                  <div className="vet-pet-avatar">
                    <FontAwesomeIcon icon={faPaw} />
                  </div>

                  <div>
                    <h4>{record.pet_name}</h4>
                    <p>
                      <FontAwesomeIcon icon={faUser} />
                      {record.owner_name}
                    </p>
                  </div>
                </div>

                <div className="vet-medical-info">
                  <div className="vet-medical-section">
                    <h5>
                      <FontAwesomeIcon icon={faStethoscope} />
                      Diagnosis
                    </h5>
                    <p>{record.diagnosis || "No diagnosis recorded."}</p>
                  </div>

                  <div className="vet-medical-section">
                    <h5>
                      <FontAwesomeIcon icon={faNotesMedical} />
                      Treatment
                    </h5>
                    <p>{record.treatment || "No treatment recorded."}</p>
                  </div>

                  <div className="vet-medical-section vet-cost">
                    <h5>
                      <FontAwesomeIcon icon={faMoneyBillWave} />
                      Cost
                    </h5>
                    <p className="vet-cost-amount">
                      {formatCurrency(record.cost || 0)}
                    </p>
                  </div>
                </div>

                <div className="vet-history-notes">
                  <h5>
                    <FontAwesomeIcon icon={faFileInvoice} />
                    Notes
                  </h5>
                  <p>{record.notes || "No notes recorded."}</p>
                </div>
              </div>

              <div className="vet-history-card-footer">
                <div className="vet-vet-info">
                  <FontAwesomeIcon icon={faUser} />
                  {record.vet_name === "Unassigned"
                    ? "Unassigned Veterinarian"
                    : `Dr. ${record.vet_name}`}
                </div>

                <button
                  className="vet-history-view-btn"
                  onClick={() => setSelectedRecord(record)}
                  type="button"
                >
                  <FontAwesomeIcon icon={faEye} />
                  View Record
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedRecord && (
        <div
          className="vet-history-modal-overlay"
          onClick={() => setSelectedRecord(null)}
          role="dialog"
        >
          <div
            className="vet-history-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="vet-history-modal-header">
              <div>
                <span className="vet-history-eyebrow">
                  <FontAwesomeIcon icon={faChartLine} />
                  Medical Record Details
                </span>

                <h3>
                  <FontAwesomeIcon icon={faPaw} />
                  {selectedRecord.pet_name}
                </h3>

                <p>{selectedRecord.owner_name}</p>
              </div>

              <button
                className="vet-history-modal-close"
                type="button"
                onClick={() => setSelectedRecord(null)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="vet-history-modal-body">
              <div className="vet-history-modal-grid">
                <div>
                  <small>Date</small>
                  <strong>{selectedRecord.date}</strong>
                </div>

                <div>
                  <small>Time</small>
                  <strong>{selectedRecord.time}</strong>
                </div>

                <div>
                  <small>Pet</small>
                  <strong>{selectedRecord.pet_name}</strong>
                </div>

                <div>
                  <small>Owner</small>
                  <strong>{selectedRecord.owner_name}</strong>
                </div>

                <div>
                  <small>Service</small>
                  <strong>{selectedRecord.type}</strong>
                </div>

                <div>
                  <small>Veterinarian</small>
                  <strong>{selectedRecord.vet_name}</strong>
                </div>

                <div>
                  <small>Cost</small>
                  <strong>{formatCurrency(selectedRecord.cost || 0)}</strong>
                </div>

                <div>
                  <small>Payment</small>
                  <strong>{selectedRecord.payment_status}</strong>
                </div>
              </div>

              <div className="vet-history-modal-section">
                <h4>
                  <FontAwesomeIcon icon={faStethoscope} />
                  Diagnosis
                </h4>
                <p>{selectedRecord.diagnosis || "No diagnosis recorded."}</p>
              </div>

              <div className="vet-history-modal-section">
                <h4>
                  <FontAwesomeIcon icon={faNotesMedical} />
                  Treatment
                </h4>
                <p>{selectedRecord.treatment || "No treatment recorded."}</p>
              </div>

              <div className="vet-history-modal-section">
                <h4>
                  <FontAwesomeIcon icon={faPills} />
                  Prescription
                </h4>
                <p>{selectedRecord.prescription || "No prescription recorded."}</p>
              </div>

              <div className="vet-history-modal-section">
                <h4>
                  <FontAwesomeIcon icon={faFileInvoice} />
                  Notes
                </h4>
                <p>{selectedRecord.notes || "No notes recorded."}</p>
              </div>
            </div>

            <div className="vet-history-modal-actions">
              <button
                className="vet-history-refresh-btn"
                type="button"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VetHistory;