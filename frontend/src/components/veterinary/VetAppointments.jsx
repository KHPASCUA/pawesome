import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faUser,
  faPaw,
  faStethoscope,
  faPlus,
  faEdit,
  faTrash,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faSearch,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import "./VetAppointments.css";

const VetAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAppointments();

    // Real-time updates: poll every 5 seconds
    const interval = setInterval(() => {
      fetchAppointments();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const data = await apiRequest("/veterinary/appointments");
      const appointmentsData = Array.isArray(data)
        ? data
        : data.appointments || data.data || [];

      const transformedAppointments = appointmentsData.map((apt) => ({
        id: apt.id,
        pet: apt.pet?.name || "Unknown Pet",
        owner: apt.customer?.name || "Unknown Owner",
        date: apt.scheduled_at
          ? new Date(apt.scheduled_at).toISOString().split("T")[0]
          : "TBD",
        time: apt.scheduled_at
          ? new Date(apt.scheduled_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "TBD",
        service: apt.service?.name || "General Service",
        status: apt.status || "pending",
        notes: apt.notes || "",
      }));
      setAppointments(transformedAppointments);
      setError("");
    } catch (err) {
      setError("Failed to load appointments. Please try again.");
      console.error("Failed to fetch appointments:", err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesFilter = filter === "all" || appointment.status === filter;
    const matchesSearch = 
      appointment.pet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#28a745";
      case "pending":
        return "#ffc107";
      case "completed":
        return "#17a2b8";
      case "cancelled":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return faCheckCircle;
      case "pending":
        return faClock;
      case "completed":
        return faCheckCircle;
      case "cancelled":
        return faTimesCircle;
      default:
        return faClock;
    }
  };

  if (loading) {
    return (
      <div className="vet-appointments">
        <div className="loading-spinner">
          <div className="spinner-icon">
            <FontAwesomeIcon icon={faSpinner} className="spin-animation" />
          </div>
          <span>Loading appointments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vet-appointments">
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="vet-appointments">
      <div className="appointments-header">
        <div className="header-content">
          <h2>
            <FontAwesomeIcon icon={faCalendarAlt} /> Appointments Management
          </h2>
          <p>Manage and track all veterinary appointments</p>
        </div>
        <button className="add-appointment-btn">
          <FontAwesomeIcon icon={faPlus} /> New Appointment
        </button>
      </div>

      <div className="appointments-controls">
        <div className="search-filter">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search by pet, owner, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({appointments.length})
            </button>
            <button
              className={`filter-btn ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending ({appointments.filter(a => a.status === "pending").length})
            </button>
            <button
              className={`filter-btn ${filter === "approved" ? "active" : ""}`}
              onClick={() => setFilter("approved")}
            >
              Approved ({appointments.filter(a => a.status === "approved").length})
            </button>
            <button
              className={`filter-btn ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              Completed ({appointments.filter(a => a.status === "completed").length})
            </button>
            <button
              className={`filter-btn ${filter === "cancelled" ? "active" : ""}`}
              onClick={() => setFilter("cancelled")}
            >
              Cancelled ({appointments.filter(a => a.status === "cancelled").length})
            </button>
          </div>
        </div>
      </div>

      <div className="appointments-grid">
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="appointment-card">
            <div className="appointment-header">
              <div className="appointment-info">
                <h3>
                  <FontAwesomeIcon icon={faPaw} /> {appointment.pet}
                </h3>
                <p>
                  <FontAwesomeIcon icon={faUser} /> {appointment.owner}
                </p>
              </div>
              <div className="appointment-status">
                <FontAwesomeIcon
                  icon={getStatusIcon(appointment.status)}
                  style={{ color: getStatusColor(appointment.status) }}
                />
                <span style={{ color: getStatusColor(appointment.status) }}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="appointment-details">
              <div className="detail-item">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <div>
                  <strong>Date & Time</strong>
                  <p>{appointment.date} at {appointment.time}</p>
                </div>
              </div>
              
              <div className="detail-item">
                <FontAwesomeIcon icon={faStethoscope} />
                <div>
                  <strong>Service</strong>
                  <p>{appointment.service}</p>
                </div>
              </div>

              {appointment.notes && (
                <div className="detail-item">
                  <FontAwesomeIcon icon={faEdit} />
                  <div>
                    <strong>Notes</strong>
                    <p>{appointment.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="appointment-actions">
              <button className="action-btn edit-btn">
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
              <button className="action-btn delete-btn">
                <FontAwesomeIcon icon={faTrash} /> Cancel
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="no-appointments">
          <FontAwesomeIcon icon={faCalendarAlt} />
          <h3>No appointments found</h3>
          <p>
            {searchTerm
              ? "Try adjusting your search terms"
              : "No appointments match the current filter"}
          </p>
        </div>
      )}

      <div className="appointments-summary">
        <div className="summary-card">
          <h3>Today's Schedule</h3>
          <div className="today-count">
            {appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length} appointments
          </div>
        </div>
        <div className="summary-card">
          <h3>This Week</h3>
          <div className="week-count">
            {appointments.length} total appointments
          </div>
        </div>
        <div className="summary-card">
          <h3>Completion Rate</h3>
          <div className="completion-rate">
            {appointments.length > 0 ? Math.round((appointments.filter(a => a.status === "completed").length / appointments.length) * 100) : 0}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetAppointments;