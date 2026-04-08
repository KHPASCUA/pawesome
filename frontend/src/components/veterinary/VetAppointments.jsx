import React, { useState } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import "./VetAppointments.css";

const VetAppointments = () => {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      pet: "Max",
      owner: "John Smith",
      date: "2026-03-28",
      time: "09:00 AM",
      service: "Regular Checkup",
      status: "confirmed",
      notes: "Annual vaccination due",
    },
    {
      id: 2,
      pet: "Bella",
      owner: "Sarah Johnson",
      date: "2026-03-28",
      time: "10:30 AM",
      service: "Vaccination",
      status: "confirmed",
      notes: "Rabies vaccination",
    },
    {
      id: 3,
      pet: "Charlie",
      owner: "Mike Davis",
      date: "2026-03-29",
      time: "02:00 PM",
      service: "Surgery Consultation",
      status: "pending",
      notes: "Pre-surgical evaluation",
    },
    {
      id: 4,
      pet: "Luna",
      owner: "Emily Brown",
      date: "2026-03-29",
      time: "03:30 PM",
      service: "Dental Cleaning",
      status: "confirmed",
      notes: "Regular dental maintenance",
    },
  ]);

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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
      case "confirmed":
        return "#28a745";
      case "pending":
        return "#ffc107";
      case "cancelled":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return faCheckCircle;
      case "pending":
        return faClock;
      case "cancelled":
        return faTimesCircle;
      default:
        return faClock;
    }
  };

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
              className={`filter-btn ${filter === "confirmed" ? "active" : ""}`}
              onClick={() => setFilter("confirmed")}
            >
              Confirmed ({appointments.filter(a => a.status === "confirmed").length})
            </button>
            <button
              className={`filter-btn ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending ({appointments.filter(a => a.status === "pending").length})
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
            {appointments.filter(a => a.date === "2026-03-28").length} appointments
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
            {Math.round((appointments.filter(a => a.status === "confirmed").length / appointments.length) * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetAppointments;