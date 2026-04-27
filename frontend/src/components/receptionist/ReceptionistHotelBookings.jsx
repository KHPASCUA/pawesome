import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHotel,
  faCalendarAlt,
  faSearch,
  faFilter,
  faEdit,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faPaw,
} from "@fortawesome/free-solid-svg-icons";
import "./ReceptionistHotelBookings.css";

const HotelBookings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/receptionist/requests");
      const data = await response.json();
      
      const hotelOnly = data.requests.filter(item => item.type === "hotel");
      
      setBookings(hotelOnly);
      setStats({
        total: hotelOnly.length,
        approved: hotelOnly.filter(b => b.status === "approved").length,
        pending: hotelOnly.filter(b => b.status === "pending").length,
      });
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Failed to load bookings");
    }
  };

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
      
      await fetchBookings();
      setSuccessMessage(`Booking ${newStatus} successfully`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setError("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.pet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
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
      case "rejected":
        return faTimesCircle;
      default:
        return faClock;
    }
  };

  return (
    <div className="hotel-bookings">
      {error && <div className="alert alert-error" style={{margin: '20px', padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '4px'}}>{error}</div>}
      {successMessage && <div className="alert alert-success" style={{margin: '20px', padding: '10px', background: '#dcfce7', color: '#16a34a', borderRadius: '4px'}}>{successMessage}</div>}
      
      <div className="bookings-header">
        <div className="header-left">
          <h1>Hotel Bookings</h1>
          <p>Manage pet hotel reservations</p>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faHotel} />
          </div>
          <div className="card-content">
            <h3>{stats.total}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="card-content">
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="card-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>

      <div className="bookings-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search by pet name or customer..."
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
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bookings-table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pet</th>
              <th>Customer</th>
              <th>Room Type</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="booking-row">
                <td className="booking-id">
                  <span className="id-badge">{booking.id}</span>
                </td>
                <td className="pet-info">
                  <div className="pet-details">
                    <div className="pet-avatar">
                      <FontAwesomeIcon icon={faPaw} />
                    </div>
                    <span className="pet-name">{booking.pet}</span>
                  </div>
                </td>
                <td className="customer">
                  <span>{booking.customer}</span>
                </td>
                <td className="room">
                  <span>{booking.service}</span>
                </td>
                <td className="date">
                  <div className="date-details">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    {booking.date}
                  </div>
                </td>
                <td className="time">
                  <span>{booking.time}</span>
                </td>
                <td className="status">
                  <span className={`status-badge ${getStatusColor(booking.status)}`}>
                    <FontAwesomeIcon icon={getStatusIcon(booking.status)} />
                    {booking.status}
                  </span>
                </td>
                <td className="actions">
                  {booking.status === "pending" && (
                    <>
                      <button
                        className="action-btn approve-btn"
                        onClick={() => handleStatusUpdate(booking.id, "approved")}
                        title="Approve"
                        disabled={processingId === booking.id}
                      >
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </button>
                      <button
                        className="action-btn reject-btn"
                        onClick={() => handleStatusUpdate(booking.id, "rejected")}
                        title="Reject"
                        disabled={processingId === booking.id}
                      >
                        <FontAwesomeIcon icon={faTimesCircle} />
                      </button>
                    </>
                  )}
                  <button
                    className="action-btn view-btn"
                    onClick={() => setSelectedBooking(booking)}
                    title="View Details"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedBooking && (
        <div className="booking-modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedBooking(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="info-grid">
                <div className="info-item">
                  <label>Pet:</label>
                  <span>{selectedBooking.pet}</span>
                </div>
                <div className="info-item">
                  <label>Customer:</label>
                  <span>{selectedBooking.customer}</span>
                </div>
                <div className="info-item">
                  <label>Room Type:</label>
                  <span>{selectedBooking.service}</span>
                </div>
                <div className="info-item">
                  <label>Date:</label>
                  <span>{selectedBooking.date}</span>
                </div>
                <div className="info-item">
                  <label>Time:</label>
                  <span>{selectedBooking.time}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className={`status-badge ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div className="info-item">
                  <label>Notes:</label>
                  <span>{selectedBooking.notes || "None"}</span>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setSelectedBooking(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelBookings;
