import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCut,
  faCalendarAlt,
  faSearch,
  faFilter,
  faPlus,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faPaw,
  faShower,
  faCut as faScissors,
} from "@fortawesome/free-solid-svg-icons";
import "./ReceptionistGrooming.css";

const Grooming = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterService, setFilterService] = useState("all");
  const [groomingAppointments, setGroomingAppointments] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/receptionist/requests");
      const data = await response.json();
      
      // Filter only grooming requests
      const groomingOnly = data.requests.filter(item => item.type === "grooming");
      
      setGroomingAppointments(groomingOnly);
    } catch (error) {
      console.error("Failed to load grooming appointments:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    setProcessingId(id);

    try {
      await fetch(
        `http://127.0.0.1:8000/api/receptionist/requests/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      
      await fetchAppointments();
      alert(`Appointment ${newStatus} successfully`);
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredAppointments = groomingAppointments.filter(appointment => {
    const matchesSearch =
      appointment.pet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
    const matchesService = filterService === "all" || appointment.service === filterService;

    return matchesSearch && matchesStatus && matchesService;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "info";
      case "pending":
        return "warning";
      case "in_progress":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return faClock;
      case "pending":
        return faClock;
      case "in_progress":
        return faClock;
      case "completed":
        return faCheckCircle;
      case "cancelled":
        return faTimesCircle;
      default:
        return faClock;
    }
  };

  const getServiceIcon = (service) => {
    switch (service) {
      case "bath":
        return faShower;
      case "haircut":
        return faScissors;
      case "nailTrim":
        return faScissors;
      default:
        return faCut;
    }
  };

  return (
    <div className="grooming">
      <div className="grooming-header">
        <div className="header-left">
          <h1>Grooming Appointments</h1>
          <p>Manage pet grooming appointments and services</p>
        </div>
        <div className="header-actions">
          <button className="primary-btn">
            <FontAwesomeIcon icon={faPlus} />
            New Appointment
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faCut} />
          </div>
          <div className="card-content">
            <h3>{groomingAppointments.length}</h3>
            <p>Total Appointments</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="card-content">
            <h3>{groomingAppointments.filter(a => a.status === 'approved').length}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="card-content">
            <h3>{groomingAppointments.filter(a => a.status === 'completed').length}</h3>
            <p>Completed Today</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faCut} />
          </div>
          <div className="card-content">
            <h3>{groomingAppointments.filter(a => a.urgency === 'high').length}</h3>
            <p>High Priority</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grooming-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search by pet name, owner, or groomer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <FontAwesomeIcon icon={faFilter} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <FontAwesomeIcon icon={faCut} />
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
            >
              <option value="all">All Services</option>
              <option value="bath">Bath</option>
              <option value="haircut">Haircut</option>
              <option value="nailTrim">Nail Trim</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="grooming-table-container">
        <table className="grooming-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pet Name</th>
              <th>Service</th>
              <th>Date</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.id} className="appointment-row">
                <td className="appointment-id">
                  <span className="id-badge">{appointment.id}</span>
                </td>
                <td className="pet-info">
                  <div className="pet-details">
                    <div className="pet-avatar">
                      <FontAwesomeIcon icon={faPaw} />
                    </div>
                    <span className="pet-name">{appointment.pet}</span>
                  </div>
                </td>
                <td className="service">
                  <div className="service-info">
                    <FontAwesomeIcon icon={getServiceIcon(appointment.service)} />
                    <span>{appointment.service}</span>
                  </div>
                </td>
                <td className="datetime">
                  <div className="datetime-details">
                    <div className="date">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {appointment.date}
                    </div>
                    <div className="time">{appointment.time}</div>
                  </div>
                </td>
                <td className="notes">
                  <span className="notes-text">{appointment.notes || "None"}</span>
                </td>
                <td className="status">
                  <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                    <FontAwesomeIcon icon={getStatusIcon(appointment.status)} />
                    {appointment.status}
                  </span>
                </td>
                <td className="actions">
                  {appointment.status === "pending" && (
                    <>
                      <button
                        className="action-btn approve-btn"
                        onClick={() => handleStatusUpdate(appointment.id, "approved")}
                        title="Approve"
                        disabled={processingId === appointment.id}
                      >
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </button>
                      <button
                        className="action-btn reject-btn"
                        onClick={() => handleStatusUpdate(appointment.id, "rejected")}
                        title="Reject"
                        disabled={processingId === appointment.id}
                      >
                        <FontAwesomeIcon icon={faTimesCircle} />
                      </button>
                    </>
                  )}
                  {appointment.status === "approved" && (
                    <button
                      className="action-btn start-btn"
                      onClick={() => handleStatusUpdate(appointment.id, "in_progress")}
                      title="Start"
                      disabled={processingId === appointment.id}
                    >
                      <FontAwesomeIcon icon={faClock} />
                    </button>
                  )}
                  {appointment.status === "in_progress" && (
                    <button
                      className="action-btn complete-btn"
                      onClick={() => handleStatusUpdate(appointment.id, "completed")}
                      title="Mark Complete"
                      disabled={processingId === appointment.id}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Grooming;
