import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCut,
  faCalendarAlt,
  faSearch,
  faFilter,
  faPlus,
  faEdit,
  faTrash,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faPaw,
  faUserMd,
  faShower,
  faSoap,
  faCut as faScissors,
  faEye,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import "./Grooming.css";

const Grooming = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterService, setFilterService] = useState("all");
  const [filterGroomer, setFilterGroomer] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const groomingAppointments = [
    {
      id: "GROOM-001",
      petName: "Buddy",
      petType: "Dog",
      breed: "Golden Retriever",
      owner: "John Smith",
      ownerPhone: "+1-234-567-8901",
      groomer: "Sarah Johnson",
      appointmentDate: "2026-04-05",
      appointmentTime: "10:00 AM",
      duration: "2 hours",
      service: "Full Grooming",
      status: "confirmed",
      urgency: "medium",
      notes: "Regular grooming, nail trimming",
      lastVisit: "2025-10-15",
    },
    {
      id: "GROOM-002",
      petName: "Luna",
      petType: "Cat",
      breed: "Persian",
      owner: "Emily Davis",
      ownerPhone: "+1-234-567-8902",
      groomer: "Michael Chen",
      appointmentDate: "2026-04-05",
      appointmentTime: "2:00 PM",
      duration: "1.5 hours",
      service: "Bath & Brush",
      status: "in-progress",
      urgency: "low",
      notes: "Sensitive skin, hypoallergenic products",
      lastVisit: "2026-01-20",
    },
    {
      id: "GROOM-003",
      petName: "Max",
      petType: "Dog",
      breed: "German Shepherd",
      owner: "Robert Wilson",
      ownerPhone: "+1-234-567-8903",
      groomer: "Lisa Anderson",
      appointmentDate: "2026-04-06",
      appointmentTime: "9:00 AM",
      duration: "3 hours",
      service: "Full Grooming + Haircut",
      status: "pending",
      urgency: "high",
      notes: "Thick coat, dematting needed",
      lastVisit: "2026-03-28",
    },
    {
      id: "GROOM-004",
      petName: "Whiskers",
      petType: "Cat",
      breed: "Siamese",
      owner: "Jessica Brown",
      ownerPhone: "+1-234-567-8904",
      groomer: "Sarah Johnson",
      appointmentDate: "2026-04-06",
      appointmentTime: "11:00 AM",
      duration: "1 hour",
      service: "Nail Trimming",
      status: "completed",
      urgency: "low",
      notes: "Regular maintenance",
      lastVisit: "2026-03-01",
    },
  ];

  const groomers = ["Sarah Johnson", "Michael Chen", "Lisa Anderson"];

  const filteredAppointments = groomingAppointments.filter(appointment => {
    const matchesSearch = 
      appointment.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.groomer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
    const matchesService = filterService === "all" || appointment.service === filterService;
    const matchesGroomer = filterGroomer === "all" || appointment.groomer === filterGroomer;
    
    return matchesSearch && matchesStatus && matchesService && matchesGroomer;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "info";
      case "pending":
        return "warning";
      case "in-progress":
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
      case "confirmed":
        return faClock;
      case "pending":
        return faClock;
      case "in-progress":
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
      case "Full Grooming":
        return faShower;
      case "Bath & Brush":
        return faSoap;
      case "Nail Trimming":
        return faScissors;
      case "Haircut":
        return faScissors;
      default:
        return faCut;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <div className="grooming">
      <div className="appointments-header">
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
            <h3>{groomingAppointments.filter(a => a.status === 'confirmed').length}</h3>
            <p>Confirmed</p>
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
      <div className="appointments-controls">
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
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
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
              <option value="Full Grooming">Full Grooming</option>
              <option value="Bath & Brush">Bath & Brush</option>
              <option value="Nail Trimming">Nail Trimming</option>
              <option value="Haircut">Haircut</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <FontAwesomeIcon icon={faUserMd} />
            <select
              value={filterGroomer}
              onChange={(e) => setFilterGroomer(e.target.value)}
            >
              <option value="all">All Groomers</option>
              {groomers.map(groomer => (
                <option key={groomer} value={groomer}>{groomer}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="appointments-table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Appointment ID</th>
              <th>Pet Info</th>
              <th>Owner</th>
              <th>Groomer</th>
              <th>Date & Time</th>
              <th>Service</th>
              <th>Status</th>
              <th>Urgency</th>
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
                    <div>
                      <span className="pet-name">{appointment.petName}</span>
                      <span className="pet-breed">{appointment.breed}</span>
                      <span className="pet-type">{appointment.petType}</span>
                    </div>
                  </div>
                </td>
                <td className="owner">
                  <div className="owner-details">
                    <span className="owner-name">{appointment.owner}</span>
                    <span className="owner-phone">
                      <FontAwesomeIcon icon={faPhone} />
                      {appointment.ownerPhone}
                    </span>
                  </div>
                </td>
                <td className="groomer">
                  <div className="groomer-info">
                    <FontAwesomeIcon icon={faUserMd} />
                    <span>{appointment.groomer}</span>
                  </div>
                </td>
                <td className="datetime">
                  <div className="datetime-details">
                    <div className="date">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {appointment.appointmentDate}
                    </div>
                    <div className="time">{appointment.appointmentTime}</div>
                    <div className="duration">{appointment.duration}</div>
                  </div>
                </td>
                <td className="service">
                  <div className="service-info">
                    <FontAwesomeIcon icon={getServiceIcon(appointment.service)} />
                    <span>{appointment.service}</span>
                  </div>
                </td>
                <td className="status">
                  <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                    <FontAwesomeIcon icon={getStatusIcon(appointment.status)} />
                    {appointment.status}
                  </span>
                </td>
                <td className="urgency">
                  <span className={`urgency-badge ${getUrgencyColor(appointment.urgency)}`}>
                    {appointment.urgency}
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => setSelectedAppointment(appointment)}
                    title="View Details"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button className="action-btn edit-btn" title="Edit">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button className="action-btn delete-btn" title="Cancel">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="appointment-modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Appointment Details</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedAppointment(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="appointment-overview">
                <div className="overview-section">
                  <h3>Pet Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Pet Name:</label>
                      <span>{selectedAppointment.petName}</span>
                    </div>
                    <div className="info-item">
                      <label>Type:</label>
                      <span>{selectedAppointment.petType}</span>
                    </div>
                    <div className="info-item">
                      <label>Breed:</label>
                      <span>{selectedAppointment.breed}</span>
                    </div>
                    <div className="info-item">
                      <label>Last Visit:</label>
                      <span>{selectedAppointment.lastVisit}</span>
                    </div>
                  </div>
                </div>
                
                <div className="overview-section">
                  <h3>Owner Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Owner Name:</label>
                      <span>{selectedAppointment.owner}</span>
                    </div>
                    <div className="info-item">
                      <label>Phone:</label>
                      <span>{selectedAppointment.ownerPhone}</span>
                    </div>
                  </div>
                </div>
                
                <div className="overview-section">
                  <h3>Appointment Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Groomer:</label>
                      <span>{selectedAppointment.groomer}</span>
                    </div>
                    <div className="info-item">
                      <label>Date:</label>
                      <span>{selectedAppointment.appointmentDate}</span>
                    </div>
                    <div className="info-item">
                      <label>Time:</label>
                      <span>{selectedAppointment.appointmentTime}</span>
                    </div>
                    <div className="info-item">
                      <label>Duration:</label>
                      <span>{selectedAppointment.duration}</span>
                    </div>
                    <div className="info-item">
                      <label>Service:</label>
                      <span>{selectedAppointment.service}</span>
                    </div>
                    <div className="info-item">
                      <label>Urgency:</label>
                      <span className={`urgency-badge ${getUrgencyColor(selectedAppointment.urgency)}`}>
                        {selectedAppointment.urgency}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Status:</label>
                      <span className={`status-badge ${getStatusColor(selectedAppointment.status)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(selectedAppointment.status)} />
                        {selectedAppointment.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="overview-section">
                  <h3>Grooming Notes</h3>
                  <div className="notes-section">
                    <p>{selectedAppointment.notes}</p>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="secondary-btn" onClick={() => setSelectedAppointment(null)}>
                  Close
                </button>
                <button className="primary-btn">
                  <FontAwesomeIcon icon={faEdit} />
                  Edit Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grooming;
