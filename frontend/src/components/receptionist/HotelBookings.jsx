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
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    customerId: "",
    petId: "",
    ownerName: "",
    ownerPhone: "",
    petName: "",
    petType: "",
    breed: "",
    checkInDate: "",
    checkInTime: "10:00 AM",
    duration: "1 day",
    roomType: "Standard Room",
    service: "Pet Hotel Stay",
    specialRequests: ""
  });

  // Sample customer and pet data
  const customers = [
    { id: "CUST-001", name: "John Smith", phone: "+1-234-567-8901", email: "john.smith@email.com" },
    { id: "CUST-002", name: "Emily Davis", phone: "+1-234-567-8902", email: "emily.davis@email.com" },
    { id: "CUST-003", name: "Robert Wilson", phone: "+1-234-567-8903", email: "robert.wilson@email.com" },
    { id: "CUST-004", name: "Jessica Brown", phone: "+1-234-567-8904", email: "jessica.brown@email.com" },
    { id: "CUST-005", name: "Michael Johnson", phone: "+1-234-567-8905", email: "michael.johnson@email.com" },
  ];

  const pets = [
    { id: "PET-001", customerId: "CUST-001", name: "Buddy", type: "Dog", breed: "Golden Retriever", age: "3 years" },
    { id: "PET-002", customerId: "CUST-001", name: "Max", type: "Dog", breed: "Labrador", age: "5 years" },
    { id: "PET-003", customerId: "CUST-002", name: "Luna", type: "Cat", breed: "Persian", age: "2 years" },
    { id: "PET-004", customerId: "CUST-003", name: "Charlie", type: "Dog", breed: "German Shepherd", age: "4 years" },
    { id: "PET-005", customerId: "CUST-004", name: "Whiskers", type: "Cat", breed: "Siamese", age: "1 year" },
    { id: "PET-006", customerId: "CUST-005", name: "Bella", type: "Dog", breed: "Poodle", age: "6 years" },
    { id: "PET-007", customerId: "CUST-005", name: "Duke", type: "Dog", breed: "Bulldog", age: "2 years" },
  ];

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

  // Booking form handlers
  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Customer selection handler
  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setBookingFormData(prev => ({
        ...prev,
        customerId,
        petId: "", // Reset pet selection
        ownerName: customer.name,
        ownerPhone: customer.phone,
        petName: "",
        petType: "",
        breed: ""
      }));
    }
  };

  // Pet selection handler
  const handlePetChange = (petId) => {
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      setBookingFormData(prev => ({
        ...prev,
        petId,
        petName: pet.name,
        petType: pet.type,
        breed: pet.breed
      }));
    }
  };

  // Get pets for selected customer
  const getAvailablePets = () => {
    if (!bookingFormData.customerId) return [];
    return pets.filter(pet => pet.customerId === bookingFormData.customerId);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!bookingFormData.customerId || !bookingFormData.petId || !bookingFormData.checkInDate) {
      alert("Please select a customer, pet, and check-in date.");
      return;
    }

    // Calculate checkout date based on duration
    const checkOutDate = new Date(bookingFormData.checkInDate);
    if (bookingFormData.duration.includes('day')) {
      const days = parseInt(bookingFormData.duration) || 1;
      checkOutDate.setDate(checkOutDate.getDate() + days);
    }

    // Create new booking
    const newBooking = {
      id: `HOTEL-${String(hotelBookings.length + 1).padStart(3, '0')}`,
      petName: bookingFormData.petName,
      petType: bookingFormData.petType,
      breed: bookingFormData.breed,
      owner: bookingFormData.ownerName,
      ownerPhone: bookingFormData.ownerPhone,
      roomType: bookingFormData.roomType,
      roomNumber: String(Math.floor(Math.random() * 400) + 100),
      checkInDate: bookingFormData.checkInDate,
      checkInTime: bookingFormData.checkInTime,
      duration: bookingFormData.duration,
      checkOutDate: checkOutDate.toISOString().split('T')[0],
      service: bookingFormData.service,
      status: "confirmed",
      specialRequests: bookingFormData.specialRequests,
      lastVisit: new Date().toISOString().split('T')[0],
    };

    console.log("New hotel booking:", newBooking);
    alert("Hotel booking created successfully!");
    
    // Reset form and close modal
    setBookingFormData({
      petName: "",
      ownerName: "",
      ownerPhone: "",
      petType: "Dog",
      breed: "",
      checkInDate: "",
      checkInTime: "10:00 AM",
      duration: "1 day",
      roomType: "Standard Room",
      service: "Pet Hotel Stay",
      specialRequests: ""
    });
    setShowNewBookingModal(false);
  };

  const handleBookingCancel = () => {
    setBookingFormData({
      customerId: "",
      petId: "",
      ownerName: "",
      ownerPhone: "",
      petName: "",
      petType: "",
      breed: "",
      checkInDate: "",
      checkInTime: "10:00 AM",
      duration: "1 day",
      roomType: "Standard Room",
      service: "Pet Hotel Stay",
      specialRequests: ""
    });
    setShowNewBookingModal(false);
  };

  return (
    <div className="hotel-bookings">
      <div className="appointments-header">
        <div className="header-left">
          <h1>Hotel Bookings</h1>
          <p>Manage pet hotel reservations and room assignments</p>
        </div>
        <div className="header-actions">
          <button className="primary-btn" onClick={() => setShowNewBookingModal(true)}>
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

      {/* New Booking Modal */}
      {showNewBookingModal && (
        <div className="appointment-modal-overlay" onClick={() => setShowNewBookingModal(false)}>
          <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Hotel Booking</h2>
              <button
                className="close-btn"
                onClick={() => setShowNewBookingModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <form className="appointment-form" onSubmit={handleBookingSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Customer *</label>
                    <select
                      name="customerId"
                      value={bookingFormData.customerId}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      required
                    >
                      <option value="">Choose a customer...</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({customer.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Select Pet *</label>
                    <select
                      name="petId"
                      value={bookingFormData.petId}
                      onChange={(e) => handlePetChange(e.target.value)}
                      required
                      disabled={!bookingFormData.customerId}
                    >
                      <option value="">
                        {bookingFormData.customerId ? "Choose a pet..." : "Select customer first"}
                      </option>
                      {getAvailablePets().map(pet => (
                        <option key={pet.id} value={pet.id}>
                          {pet.name} ({pet.type} - {pet.breed})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Pet Name</label>
                    <input
                      type="text"
                      name="petName"
                      value={bookingFormData.petName}
                      onChange={handleBookingInputChange}
                      placeholder="Pet name (auto-filled)"
                      disabled
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Pet Type</label>
                    <input
                      type="text"
                      name="petType"
                      value={bookingFormData.petType}
                      onChange={handleBookingInputChange}
                      placeholder="Pet type (auto-filled)"
                      disabled
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Breed</label>
                    <input
                      type="text"
                      name="breed"
                      value={bookingFormData.breed}
                      onChange={handleBookingInputChange}
                      placeholder="Breed (auto-filled)"
                      disabled
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Owner Name</label>
                    <input
                      type="text"
                      name="ownerName"
                      value={bookingFormData.ownerName}
                      onChange={handleBookingInputChange}
                      placeholder="Owner name (auto-filled)"
                      disabled
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Owner Phone</label>
                    <input
                      type="tel"
                      name="ownerPhone"
                      value={bookingFormData.ownerPhone}
                      onChange={handleBookingInputChange}
                      placeholder="Phone (auto-filled)"
                      disabled
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Room Type *</label>
                    <select
                      name="roomType"
                      value={bookingFormData.roomType}
                      onChange={handleBookingInputChange}
                      required
                    >
                      <option value="Standard Room">Standard Room</option>
                      <option value="Deluxe Suite">Deluxe Suite</option>
                      <option value="Premium Suite">Premium Suite</option>
                      <option value="Economy Room">Economy Room</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Service *</label>
                    <select
                      name="service"
                      value={bookingFormData.service}
                      onChange={handleBookingInputChange}
                      required
                    >
                      <option value="Pet Hotel Stay">Pet Hotel Stay</option>
                      <option value="Daycare">Daycare</option>
                      <option value="Extended Boarding">Extended Boarding</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Check-in Date *</label>
                    <input
                      type="date"
                      name="checkInDate"
                      value={bookingFormData.checkInDate}
                      onChange={handleBookingInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Check-in Time</label>
                    <select
                      name="checkInTime"
                      value={bookingFormData.checkInTime}
                      onChange={handleBookingInputChange}
                    >
                      <option value="9:00 AM">9:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="1:00 PM">1:00 PM</option>
                      <option value="2:00 PM">2:00 PM</option>
                      <option value="3:00 PM">3:00 PM</option>
                      <option value="4:00 PM">4:00 PM</option>
                      <option value="5:00 PM">5:00 PM</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <select
                      name="duration"
                      value={bookingFormData.duration}
                      onChange={handleBookingInputChange}
                    >
                      <option value="1 day">1 day</option>
                      <option value="2 days">2 days</option>
                      <option value="3 days">3 days</option>
                      <option value="5 days">5 days</option>
                      <option value="7 days">7 days</option>
                      <option value="14 days">14 days</option>
                      <option value="30 days">30 days</option>
                    </select>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Special Requests</label>
                  <textarea
                    name="specialRequests"
                    value={bookingFormData.specialRequests}
                    onChange={handleBookingInputChange}
                    placeholder="Any special requirements or notes..."
                    rows="3"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handleBookingCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="primary-btn"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Create Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelBookings;
