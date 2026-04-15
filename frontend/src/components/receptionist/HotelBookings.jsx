import React, { useState, useEffect } from "react";
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
  faSignInAlt,
  faSignOutAlt,
  faMoneyBillWave,
  faCreditCard,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import { boardingApi } from "../../api/boardings";
import "./HotelBookings.css";

const HotelBookings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRoomType, setFilterRoomType] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // API data states
  const [bookings, setBookings] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [stats, setStats] = useState({ total: 0, checked_in: 0, pending: 0 });
  
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
    specialRequests: "",
    hotelRoomId: "",
  });

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await boardingApi.getBoardings();
      if (response.boardings) {
        setBookings(response.boardings.data || []);
        setStats(response.summary || { total: 0, checked_in: 0, pending: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const searchAvailableRooms = async () => {
    if (!bookingFormData.checkInDate) {
      setError("Please select check-in date first");
      return;
    }
    // Calculate check-out based on duration
    const days = parseInt(bookingFormData.duration) || 1;
    const checkOut = new Date(bookingFormData.checkInDate);
    checkOut.setDate(checkOut.getDate() + days);
    
    try {
      const response = await boardingApi.getAvailableRooms(
        bookingFormData.checkInDate,
        checkOut.toISOString().split('T')[0]
      );
      setAvailableRooms(response.available_rooms || []);
    } catch (err) {
      console.error("Failed to fetch available rooms:", err);
    }
  };

  // Auto-search rooms when dates change
  useEffect(() => {
    if (bookingFormData.checkInDate) {
      searchAvailableRooms();
    }
  }, [bookingFormData.checkInDate, bookingFormData.duration]);

  // Sample customer and pet data (would come from API in production)
  const customers = [
    { id: "1", name: "John Smith", phone: "+63-912-345-6789", email: "john.smith@email.com" },
    { id: "2", name: "Emily Davis", phone: "+63-913-456-7890", email: "emily.davis@email.com" },
    { id: "3", name: "Robert Wilson", phone: "+63-914-567-8901", email: "robert.wilson@email.com" },
  ];

  const pets = [
    { id: "1", customerId: "1", name: "Buddy", type: "Dog", breed: "Golden Retriever", age: "3 years" },
    { id: "2", customerId: "1", name: "Max", type: "Dog", breed: "Labrador", age: "5 years" },
    { id: "3", customerId: "2", name: "Luna", type: "Cat", breed: "Persian", age: "2 years" },
  ];

  // Transform API bookings to match component format
  const formattedBookings = bookings.map(booking => ({
    id: `HOTEL-${booking.id}`,
    guestName: booking.pet?.name || "Unknown",
    ownerName: booking.customer?.name || "Unknown",
    ownerPhone: booking.customer?.phone || "N/A",
    petType: booking.pet?.species || "Unknown",
    breed: booking.pet?.breed || "Unknown",
    checkInDate: booking.check_in ? new Date(booking.check_in).toISOString().split('T')[0] : "",
    checkInTime: booking.check_in ? new Date(booking.check_in).toTimeString().slice(0, 5) : "10:00",
    roomType: booking.hotel_room?.type || "Standard",
    roomNumber: booking.hotel_room?.room_number || "TBD",
    duration: booking.check_in && booking.check_out 
      ? `${Math.ceil((new Date(booking.check_out) - new Date(booking.check_in)) / (1000 * 60 * 60 * 24))} days`
      : "1 day",
    service: "Pet Hotel Stay",
    status: booking.status,
    specialRequests: booking.special_requests || "None",
    totalAmount: booking.total_amount,
    lastVisit: booking.pet?.updated_at ? new Date(booking.pet.updated_at).toISOString().split('T')[0] : "N/A",
    // Payment fields (from backend or default)
    paymentStatus: booking.payment_status || "unpaid",
    amountPaid: booking.amount_paid || 0,
    balance: booking.total_amount - (booking.amount_paid || 0),
  }));

  const roomTypes = ["Deluxe Suite", "Standard Room", "Premium Suite", "Economy Room"];

  const filteredBookings = formattedBookings.filter(booking => {
    const matchesSearch = 
      booking.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    const matchesRoomType = filterRoomType === "all" || booking.roomType === filterRoomType;
    const matchesPayment = filterPayment === "all" || booking.paymentStatus === filterPayment;
    
    return matchesSearch && matchesStatus && matchesRoomType && matchesPayment;
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

  // Check-in and Check-out handlers
  const handleCheckIn = async (bookingId) => {
    const originalId = bookingId.replace('HOTEL-', '');
    try {
      await boardingApi.checkIn(originalId);
      alert("Guest checked in successfully!");
      fetchBookings();
    } catch (err) {
      alert(err.message || "Failed to check in");
    }
  };

  const handleCheckOut = async (bookingId) => {
    const originalId = bookingId.replace('HOTEL-', '');
    try {
      await boardingApi.checkOut(originalId);
      alert("Guest checked out successfully!");
      fetchBookings();
    } catch (err) {
      alert(err.message || "Failed to check out");
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

  const handleBookingSubmit = async (e) => {
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

    // Create new booking via API
    try {
      setLoading(true);
      await boardingApi.createBoarding({
        pet_id: bookingFormData.petId,
        customer_id: bookingFormData.customerId,
        hotel_room_id: bookingFormData.hotelRoomId,
        check_in: bookingFormData.checkInDate,
        check_out: checkOutDate.toISOString().split('T')[0],
        special_requests: bookingFormData.specialRequests,
      });
      
      setSuccessMessage("Hotel booking created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Refresh bookings list
      fetchBookings();
    } catch (err) {
      setError(err.message || "Failed to create booking");
      return;
    } finally {
      setLoading(false);
    }
    
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
      {error && <div className="alert alert-error" style={{margin: '20px', padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '4px'}}>{error}</div>}
      {successMessage && <div className="alert alert-success" style={{margin: '20px', padding: '10px', background: '#dcfce7', color: '#16a34a', borderRadius: '4px'}}>{successMessage}</div>}
      
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
            <h3>{stats.total}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="card-content">
            <h3>{stats.checked_in}</h3>
            <p>Checked In</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faBed} />
          </div>
          <div className="card-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
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
          <div className="filter-dropdown">
            <FontAwesomeIcon icon={faMoneyBillWave} />
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
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
              <th>Payment</th>
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
                <td className="payment">
                  <div className="payment-info">
                    <span className={`payment-badge ${booking.paymentStatus}`}>
                      <FontAwesomeIcon icon={faCreditCard} />
                      {booking.paymentStatus === 'paid' ? 'Paid' : 
                       booking.paymentStatus === 'partial' ? 'Partial' : 'Unpaid'}
                    </span>
                    {booking.totalAmount > 0 && (
                      <span className="amount">
                        ₱{booking.totalAmount.toLocaleString()}
                      </span>
                    )}
                    {booking.balance > 0 && booking.paymentStatus !== 'paid' && (
                      <span className="balance-due">
                        Balance: ₱{booking.balance.toLocaleString()}
                      </span>
                    )}
                  </div>
                </td>
                <td className="actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => setSelectedBooking(booking)}
                    title="View Details"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  {booking.status === 'confirmed' && (
                    <button
                      className="action-btn checkin-btn"
                      onClick={() => handleCheckIn(booking.id)}
                      title="Check In"
                    >
                      <FontAwesomeIcon icon={faSignInAlt} />
                    </button>
                  )}
                  {booking.status === 'checked_in' && (
                    <button
                      className="action-btn checkout-btn"
                      onClick={() => handleCheckOut(booking.id)}
                      title="Check Out"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} />
                    </button>
                  )}
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

                {/* Payment Section */}
                <div className="overview-section payment-section">
                  <h3><FontAwesomeIcon icon={faMoneyBillWave} /> Payment Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Total Amount:</label>
                      <span className="amount-value">
                        ₱{selectedBooking.totalAmount?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Amount Paid:</label>
                      <span className="amount-paid">
                        ₱{selectedBooking.amountPaid?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Balance:</label>
                      <span className={`balance-value ${selectedBooking.balance > 0 ? 'unpaid' : 'paid'}`}>
                        ₱{selectedBooking.balance?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Payment Status:</label>
                      <span className={`payment-badge ${selectedBooking.paymentStatus}`}>
                        <FontAwesomeIcon icon={faCreditCard} />
                        {selectedBooking.paymentStatus === 'paid' ? 'Paid' : 
                         selectedBooking.paymentStatus === 'partial' ? 'Partial' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                  {selectedBooking.balance > 0 && (
                    <div className="payment-actions">
                      <button className="payment-btn">
                        <FontAwesomeIcon icon={faDollarSign} />
                        Record Payment
                      </button>
                    </div>
                  )}
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
