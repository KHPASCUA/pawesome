import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
  faHotel,
  faStethoscope,
  faCut,
} from "@fortawesome/free-solid-svg-icons";
import "./AppointmentList.css";

const AppointmentList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    petName: "",
    petType: "Dog",
    breed: "",
    owner: "",
    type: "hotel",
    service: "",
    date: "",
    time: "",
    duration: "",
    notes: "",
  });

  const appointments = [
    {
      id: "APT-001",
      petName: "Buddy",
      petType: "Dog",
      breed: "Golden Retriever",
      owner: "John Smith",
      type: "hotel",
      service: "Pet Hotel Stay",
      date: "2026-04-05",
      time: "10:00 AM",
      duration: "3 days",
      status: "confirmed",
    },
    {
      id: "APT-002",
      petName: "Luna",
      petType: "Cat",
      breed: "Persian",
      owner: "Sarah Johnson",
      type: "vet",
      service: "Regular Checkup",
      date: "2026-04-05",
      time: "11:30 AM",
      duration: "30 mins",
      status: "confirmed",
    },
    {
      id: "APT-003",
      petName: "Max",
      petType: "Dog",
      breed: "German Shepherd",
      owner: "Robert Wilson",
      type: "grooming",
      service: "Full Grooming",
      date: "2026-04-05",
      time: "2:00 PM",
      duration: "2 hours",
      status: "pending",
    },
    {
      id: "APT-004",
      petName: "Whiskers",
      petType: "Cat",
      breed: "Siamese",
      owner: "Emily Davis",
      type: "vet",
      service: "Vaccination",
      date: "2026-04-06",
      time: "9:00 AM",
      duration: "15 mins",
      status: "confirmed",
    },
  ];

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
    const matchesType = filterType === "all" || appointment.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "info";
      case "pending":
        return "warning";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "hotel":
        return faHotel;
      case "vet":
        return faStethoscope;
      case "grooming":
        return faCut;
      default:
        return faCalendarAlt;
    }
  };

  return (
    <div className="appointment-list">
      <div className="appointments-header">
        <div className="header-left">
          <h1>All Appointments</h1>
          <p>View and manage all appointments across all services</p>
        </div>
        <div className="header-actions">
          <button className="primary-btn" onClick={() => setShowNewAppointmentModal(true)}>
            <FontAwesomeIcon icon={faPlus} />
            New Appointment
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faCalendarAlt} />
          </div>
          <div className="card-content">
            <h3>{appointments.length}</h3>
            <p>Total Appointments</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="card-content">
            <h3>{appointments.filter(a => a.status === 'confirmed').length}</h3>
            <p>Confirmed</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="card-content">
            <h3>{appointments.filter(a => a.status === 'pending').length}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="card-content">
            <h3>{appointments.filter(a => a.status === 'completed').length}</h3>
            <p>Completed</p>
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
              placeholder="Search by pet name, owner, or service..."
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
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="hotel">Hotel</option>
              <option value="vet">Veterinary</option>
              <option value="grooming">Grooming</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="appointments-table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pet Info</th>
              <th>Owner</th>
              <th>Type</th>
              <th>Service</th>
              <th>Date & Time</th>
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
                    <div>
                      <span className="pet-name">{appointment.petName}</span>
                      <span className="pet-breed">{appointment.breed}</span>
                      <span className="pet-type">{appointment.petType}</span>
                    </div>
                  </div>
                </td>
                <td className="owner">
                  <span className="owner-name">{appointment.owner}</span>
                </td>
                <td className="type">
                  <div className="type-info">
                    <FontAwesomeIcon icon={getTypeIcon(appointment.type)} />
                    <span className="type-name">{appointment.type}</span>
                  </div>
                </td>
                <td className="service">
                  <span className="service-name">{appointment.service}</span>
                </td>
                <td className="datetime">
                  <div className="datetime-details">
                    <div className="date">{appointment.date}</div>
                    <div className="time">{appointment.time}</div>
                    <div className="duration">{appointment.duration}</div>
                  </div>
                </td>
                <td className="status">
                  <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="actions">
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

      {/* New Appointment Modal */}
      {showNewAppointmentModal && (
        <div className="appointment-modal-overlay" onClick={() => setShowNewAppointmentModal(false)}>
          <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Appointment</h2>
              <button
                className="close-btn"
                onClick={() => setShowNewAppointmentModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <form className="appointment-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Pet Name *</label>
                    <input
                      type="text"
                      value={newAppointment.petName}
                      onChange={(e) => setNewAppointment({...newAppointment, petName: e.target.value})}
                      placeholder="Enter pet name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Pet Type *</label>
                    <select
                      value={newAppointment.petType}
                      onChange={(e) => setNewAppointment({...newAppointment, petType: e.target.value})}
                      required
                    >
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Rabbit">Rabbit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Breed</label>
                    <input
                      type="text"
                      value={newAppointment.breed}
                      onChange={(e) => setNewAppointment({...newAppointment, breed: e.target.value})}
                      placeholder="Enter breed"
                    />
                  </div>
                  <div className="form-group">
                    <label>Owner Name *</label>
                    <input
                      type="text"
                      value={newAppointment.owner}
                      onChange={(e) => setNewAppointment({...newAppointment, owner: e.target.value})}
                      placeholder="Enter owner name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Appointment Type *</label>
                    <select
                      value={newAppointment.type}
                      onChange={(e) => setNewAppointment({...newAppointment, type: e.target.value, service: ""})}
                      required
                    >
                      <option value="hotel">Hotel</option>
                      <option value="vet">Veterinary</option>
                      <option value="grooming">Grooming</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Service *</label>
                    <select
                      value={newAppointment.service}
                      onChange={(e) => setNewAppointment({...newAppointment, service: e.target.value})}
                      required
                    >
                      {newAppointment.type === "hotel" && (
                        <>
                          <option value="">Select service</option>
                          <option value="Pet Hotel Stay">Pet Hotel Stay</option>
                          <option value="Daycare">Daycare</option>
                          <option value="Extended Boarding">Extended Boarding</option>
                        </>
                      )}
                      {newAppointment.type === "vet" && (
                        <>
                          <option value="">Select service</option>
                          <option value="Regular Checkup">Regular Checkup</option>
                          <option value="Vaccination">Vaccination</option>
                          <option value="Dental Cleaning">Dental Cleaning</option>
                          <option value="Surgery Consultation">Surgery Consultation</option>
                        </>
                      )}
                      {newAppointment.type === "grooming" && (
                        <>
                          <option value="">Select service</option>
                          <option value="Full Grooming">Full Grooming</option>
                          <option value="Bath & Brush">Bath & Brush</option>
                          <option value="Nail Trimming">Nail Trimming</option>
                          <option value="Haircut">Haircut</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Time *</label>
                    <input
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={newAppointment.duration}
                      onChange={(e) => setNewAppointment({...newAppointment, duration: e.target.value})}
                      placeholder="e.g., 2 hours, 3 days"
                    />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                    placeholder="Additional notes or special requirements"
                    rows="3"
                  />
                </div>
              </form>
            </div>
            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={() => setShowNewAppointmentModal(false)}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={() => {
                  // Handle form submission
                  console.log("New appointment:", newAppointment);
                  setShowNewAppointmentModal(false);
                  // Reset form
                  setNewAppointment({
                    petName: "",
                    petType: "Dog",
                    breed: "",
                    owner: "",
                    type: "hotel",
                    service: "",
                    date: "",
                    time: "",
                    duration: "",
                    notes: "",
                  });
                }}
              >
                <FontAwesomeIcon icon={faPlus} />
                Create Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;