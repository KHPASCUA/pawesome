import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStethoscope,
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
  faNotesMedical,
  faSyringe,
  faHeartbeat,
  faPhone,
  faSpinner,
  faExclamationTriangle,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import "./VetAppointments.css";

const VetAppointments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedVet, setSelectedVet] = useState("");

  // Fetch appointments and veterinarians on mount
  useEffect(() => {
    fetchAppointments();
    fetchVeterinarians();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/receptionist/appointment/list");
      const appointmentsData = Array.isArray(data) ? data : [];
      
      const transformedAppointments = appointmentsData.map(apt => ({
        id: `APT-${String(apt.id).padStart(3, '0')}`,
        rawId: apt.id,
        petName: apt.pet?.name || 'Unknown Pet',
        petType: apt.pet?.species || 'Pet',
        breed: apt.pet?.breed || 'Unknown',
        owner: apt.customer?.name || 'Unknown Customer',
        ownerPhone: apt.customer?.phone || 'No phone',
        doctor: apt.veterinarian?.name || 'Unassigned',
        veterinarianId: apt.veterinarian_id,
        appointmentDate: new Date(apt.scheduled_at).toISOString().split('T')[0],
        appointmentTime: new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: "30 mins",
        service: apt.service?.name || 'Service',
        status: apt.status || 'pending',
        notes: apt.notes || '',
        price: apt.price || 0,
      }));
      
      setAppointments(transformedAppointments);
      setError("");
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchVeterinarians = async () => {
    try {
      const data = await apiRequest("/receptionist/veterinarians/available");
      setVeterinarians(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch veterinarians:", err);
    }
  };

  // Approve appointment and assign veterinarian
  const handleApprove = async (appointmentId, veterinarianId) => {
    if (!veterinarianId) {
      setError("Please select a veterinarian to approve this appointment");
      return;
    }
    
    try {
      setActionLoading(true);
      await apiRequest(`/receptionist/appointments/${appointmentId}/approve`, {
        method: "POST",
        body: JSON.stringify({ veterinarian_id: veterinarianId }),
      });
      
      await fetchAppointments();
      setSelectedAppointment(null);
      setSelectedVet("");
      setError("");
    } catch (err) {
      console.error("Failed to approve appointment:", err);
      setError(err.message || "Failed to approve appointment");
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel appointment
  const handleCancel = async (appointmentId, reason = "Cancelled by receptionist") => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }
    
    try {
      setActionLoading(true);
      await apiRequest(`/receptionist/appointments/${appointmentId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      
      await fetchAppointments();
      setSelectedAppointment(null);
      setError("");
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      setError(err.message || "Failed to cancel appointment");
    } finally {
      setActionLoading(false);
    }
  };

  // Reschedule appointment
  const handleReschedule = async (appointmentId, newDateTime) => {
    try {
      setActionLoading(true);
      await apiRequest(`/receptionist/appointments/${appointmentId}/reschedule`, {
        method: "POST",
        body: JSON.stringify({ scheduled_at: newDateTime }),
      });
      
      await fetchAppointments();
      setSelectedAppointment(null);
      setError("");
    } catch (err) {
      console.error("Failed to reschedule appointment:", err);
      setError(err.message || "Failed to reschedule appointment");
    } finally {
      setActionLoading(false);
    }
  };

  const vetAppointments = appointments;

  const doctors = ["all", ...veterinarians.map(v => v.name)];

  const filteredAppointments = vetAppointments.filter(appointment => {
    const matchesSearch = 
      appointment.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
    const matchesDoctor = filterDoctor === "all" || appointment.doctor === filterDoctor;
    
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
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

  const getServiceIcon = (service) => {
    switch (service) {
      case "Vaccination":
        return faSyringe;
      case "Surgery":
        return faHeartbeat;
      case "Dental Cleaning":
        return faNotesMedical;
      default:
        return faStethoscope;
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
    <div className="vet-appointments">
      <div className="appointments-header">
        <div className="header-left">
          <h1>Veterinary Appointments</h1>
          <p>Manage veterinary appointments and patient scheduling</p>
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
            <FontAwesomeIcon icon={faCalendarAlt} />
          </div>
          <div className="card-content">
            <h3>{vetAppointments.length}</h3>
            <p>Total Appointments</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="card-content">
            <h3>{vetAppointments.filter(a => a.status === 'pending').length}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="card-content">
            <h3>{vetAppointments.filter(a => a.status === 'approved').length}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="card-content">
            <h3>{vetAppointments.filter(a => a.status === 'completed').length}</h3>
            <p>Completed Today</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="card-content">
            <h3>{vetAppointments.filter(a => a.status === 'completed').length}</h3>
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
              placeholder="Search by pet name, owner, or doctor..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <FontAwesomeIcon icon={faUserMd} />
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
            >
              <option value="all">All Doctors</option>
              {doctors.map(doctor => (
                <option key={doctor} value={doctor}>{doctor}</option>
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
              <th>Doctor</th>
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
                <td className="doctor">
                  <div className="doctor-info">
                    <FontAwesomeIcon icon={faUserMd} />
                    <span>{appointment.doctor}</span>
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
                  {appointment.status === 'pending' && (
                    <button 
                      className="action-btn approve-btn" 
                      title="Approve & Assign Vet"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                  )}
                  <button 
                    className="action-btn view-btn"
                    onClick={() => setSelectedAppointment(appointment)}
                    title="View Details"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  {(appointment.status === 'pending' || appointment.status === 'approved') && (
                    <button 
                      className="action-btn delete-btn" 
                      title="Cancel"
                      onClick={() => handleCancel(appointment.rawId)}
                      disabled={actionLoading}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
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
                      <span>{selectedAppointment.previousVisit}</span>
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
                      <label>Doctor:</label>
                      <span>{selectedAppointment.doctor}</span>
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
                  <h3>Medical Notes</h3>
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

export default VetAppointments;
