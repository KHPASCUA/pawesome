import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHotel,
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
  faBed,
  faUtensils,
  faWalking,
  faBox,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import "./HotelBookings.css";

const HotelBookings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRoomType, setFilterRoomType] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const hotelBookings = [
    {
      id: "HOTEL-001",
      petName: "Buddy",
      petType: "Dog",
      breed: "Golden Retriever",
      owner: "John Smith",
      ownerPhone: "+1-234-567-8901",
      roomType: "Deluxe Suite",
      roomNumber: "101",
      checkInDate: "2026-04-05",
      checkInTime: "10:00 AM",
      duration: "3 days",
      checkOutDate: "2026-04-08",
      service: "Pet Hotel Stay",
      status: "checked-in",
      specialRequests: "Extra toys, dietary restrictions",
      lastVisit: "2025-10-15",
    },
    {
      id: "HOTEL-002",
      petName: "Luna",
      petType: "Cat",
      breed: "Persian",
      owner: "Emily Davis",
      ownerPhone: "+1-234-567-8902",
      roomType: "Standard Room",
      roomNumber: "205",
      checkInDate: "2026-04-05",
      checkInTime: "2:00 PM",
      duration: "2 days",
      checkOutDate: "2026-04-07",
      service: "Daycare",
      status: "confirmed",
      specialRequests: "Quiet environment needed",
      lastVisit: "2026-01-20",
    },
    {
      id: "HOTEL-003",
      petName: "Max",
      petType: "Dog",
      breed: "German Shepherd",
      owner: "Robert Wilson",
      ownerPhone: "+1-234-567-8903",
      roomType: "Premium Suite",
      roomNumber: "301",
      checkInDate: "2026-04-06",
      checkInTime: "9:00 AM",
      duration: "5 days",
      checkOutDate: "2026-04-11",
      service: "Extended Boarding",
      status: "pending",
      specialRequests: "Daily walks required",
      lastVisit: "2026-03-28",
    },
    {
      id: "HOTEL-004",
      petName: "Whiskers",
      petType: "Cat",
      breed: "Siamese",
      owner: "Jessica Brown",
      ownerPhone: "+1-234-567-8904",
      roomType: "Economy Room",
      roomNumber: "102",
      checkInDate: "2026-04-04",
      checkInTime: "3:00 PM",
      duration: "1 day",
      checkOutDate: "2026-04-05",
      service: "Pet Hotel Stay",
      status: "checked-out",
      specialRequests: "None",
      lastVisit: "2026-03-01",
    },
  ];

  const roomTypes = ["Deluxe Suite", "Standard Room", "Premium Suite", "Economy Room"];

  const filteredBookings = hotelBookings.filter(booking => {
    const matchesSearch = 
      booking.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    const matchesRoomType = filterRoomType === "all" || booking.roomType === filterRoomType;
    
    return matchesSearch && matchesStatus && matchesRoomType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "checked-in":
        return "success";
      case "confirmed":
        return "info";
      case "pending":
        return "warning";
      case "checked-out":
        return "secondary";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getServiceIcon = (service) => {
    switch (service) {
      case "Pet Hotel Stay":
        return faBed;
      case "Daycare":
        return faClock;
      case "Extended Boarding":
        return faBox;
      default:
        return faHotel;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "checked-in":
        return faCheckCircle;
      case "confirmed":
        return faClock;
      case "pending":
        return faClock;
      case "checked-out":
        return faTimesCircle;
      case "cancelled":
        return faTimesCircle;
      default:
        return faClock;
    }
  };

  return (
    <div className="hotel-bookings">
      <div className="appointments-header">
        <div className="header-left">
          <h1>Hotel Bookings</h1>
          <p>Manage pet hotel reservations and room assignments</p>
        </div>
        <div className="header-actions">
          <button className="primary-btn">
            <FontAwesomeIcon icon={faPlus} />
            New Booking
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faHotel} />
          </div>
          <div className="card-content">
            <h3>{hotelBookings.length}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="card-content">
            <h3>{hotelBookings.filter(b => b.status === 'confirmed').length}</h3>
            <p>Confirmed</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faBed} />
          </div>
          <div className="card-content">
            <h3>{hotelBookings.filter(b => b.roomType === 'Deluxe Suite').length}</h3>
            <p>Deluxe Suites</p>
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
              placeholder="Search by pet name, owner, or room..."
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
              <option value="checked-in">Checked In</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="checked-out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <FontAwesomeIcon icon={faHotel} />
            <select
              value={filterRoomType}
              onChange={(e) => setFilterRoomType(e.target.value)}
            >
              <option value="all">All Room Types</option>
              {roomTypes.map(roomType => (
                <option key={roomType} value={roomType}>{roomType}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="appointments-table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Pet Info</th>
              <th>Owner</th>
              <th>Room</th>
              <th>Check-in & Check-out</th>
              <th>Service</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="appointment-row">
                <td className="appointment-id">
                  <span className="id-badge">{booking.id}</span>
                </td>
                <td className="pet-info">
                  <div className="pet-details">
                    <div className="pet-avatar">
                      <FontAwesomeIcon icon={faPaw} />
                    </div>
                    <div>
                      <span className="pet-name">{booking.petName}</span>
                      <span className="pet-breed">{booking.breed}</span>
                      <span className="pet-type">{booking.petType}</span>
                    </div>
                  </div>
                </td>
                <td className="owner">
                  <div className="owner-details">
                    <span className="owner-name">{booking.owner}</span>
                    <span className="owner-phone">
                      <FontAwesomeIcon icon={faPhone} />
                      {booking.ownerPhone}
                    </span>
                  </div>
                </td>
                <td className="room">
                  <div className="room-info">
                    <div className="room-type">{booking.roomType}</div>
                    <div className="room-number">Room {booking.roomNumber}</div>
                  </div>
                </td>
                <td className="datetime">
                  <div className="datetime-details">
                    <div className="checkin">
                      <div className="date">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        {booking.checkInDate}
                      </div>
                      <div className="time">{booking.checkInTime}</div>
                    </div>
                    <div className="duration">{booking.duration}</div>
                    <div className="checkout">{booking.checkOutDate}</div>
                  </div>
                </td>
                <td className="service">
                  <div className="service-info">
                    <FontAwesomeIcon icon={getServiceIcon(booking.service)} />
                    <span>{booking.service}</span>
                  </div>
                </td>
                <td className="status">
                  <span className={`status-badge ${getStatusColor(booking.status)}`}>
                    <FontAwesomeIcon icon={getStatusIcon(booking.status)} />
                    {booking.status}
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => setSelectedBooking(booking)}
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

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="appointment-modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
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
              <div className="appointment-overview">
                <div className="overview-section">
                  <h3>Pet Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Pet Name:</label>
                      <span>{selectedBooking.petName}</span>
                    </div>
                    <div className="info-item">
                      <label>Type:</label>
                      <span>{selectedBooking.petType}</span>
                    </div>
                    <div className="info-item">
                      <label>Breed:</label>
                      <span>{selectedBooking.breed}</span>
                    </div>
                    <div className="info-item">
                      <label>Last Visit:</label>
                      <span>{selectedBooking.lastVisit}</span>
                    </div>
                  </div>
                </div>
                
                <div className="overview-section">
                  <h3>Owner Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Owner Name:</label>
                      <span>{selectedBooking.owner}</span>
                    </div>
                    <div className="info-item">
                      <label>Phone:</label>
                      <span>{selectedBooking.ownerPhone}</span>
                    </div>
                  </div>
                </div>
                
                <div className="overview-section">
                  <h3>Room Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Room Type:</label>
                      <span>{selectedBooking.roomType}</span>
                    </div>
                    <div className="info-item">
                      <label>Room Number:</label>
                      <span>{selectedBooking.roomNumber}</span>
                    </div>
                  </div>
                </div>
                
                <div className="overview-section">
                  <h3>Booking Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Check-in Date:</label>
                      <span>{selectedBooking.checkInDate}</span>
                    </div>
                    <div className="info-item">
                      <label>Check-in Time:</label>
                      <span>{selectedBooking.checkInTime}</span>
                    </div>
                    <div className="info-item">
                      <label>Duration:</label>
                      <span>{selectedBooking.duration}</span>
                    </div>
                    <div className="info-item">
                      <label>Check-out Date:</label>
                      <span>{selectedBooking.checkOutDate}</span>
                    </div>
                    <div className="info-item">
                      <label>Service:</label>
                      <span>{selectedBooking.service}</span>
                    </div>
                    <div className="info-item">
                      <label>Status:</label>
                      <span className={`status-badge ${getStatusColor(selectedBooking.status)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(selectedBooking.status)} />
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="overview-section">
                  <h3>Special Requests</h3>
                  <div className="notes-section">
                    <p>{selectedBooking.specialRequests}</p>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="secondary-btn" onClick={() => setSelectedBooking(null)}>
                  Close
                </button>
                <button className="primary-btn">
                  <FontAwesomeIcon icon={faEdit} />
                  Edit Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelBookings;
