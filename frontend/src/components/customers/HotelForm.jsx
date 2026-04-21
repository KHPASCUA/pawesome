import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHotel,
  faPlus,
  faBed,
  faCalendarAlt,
  faPaw,
  faDollarSign,
  faStar,
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { boardingApi } from "../../api/boardings";
import "./HotelForm_Polished.css";

const HotelForm = () => {
  const [activeTab, setActiveTab] = useState("book"); // book, my-bookings
  const [pets, setPets] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [bookingForm, setBookingForm] = useState({
    petId: "",
    checkIn: "",
    checkOut: "",
    roomType: "all",
    specialRequests: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  // Fetch user's pets and bookings on mount
  useEffect(() => {
    fetchMyPets();
    fetchMyBookings();
  }, []);

  // Search available rooms when dates change
  useEffect(() => {
    const searchAvailableRooms = async () => {
      if (!bookingForm.checkIn || !bookingForm.checkOut) return;
      
      try {
        const size = bookingForm.roomType === "all" ? null : bookingForm.roomType;
        const response = await boardingApi.getAvailableRooms(
          bookingForm.checkIn,
          bookingForm.checkOut,
          size
        );
        setAvailableRooms(response.available_rooms || []);
      } catch (err) {
        console.error("Failed to fetch available rooms:", err);
      }
    };
    
    searchAvailableRooms();
  }, [bookingForm.checkIn, bookingForm.checkOut, bookingForm.roomType]);

  const fetchMyPets = async () => {
    // In production, this would fetch from a pets API
    // For now using sample data - replace with actual API call
    setPets([
      { id: 1, name: "Buddy", species: "Dog", breed: "Golden Retriever", age: 3 },
      { id: 2, name: "Luna", species: "Cat", breed: "Persian", age: 2 },
    ]);
  };

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const response = await boardingApi.getBoardings();
      if (response.boardings) {
        setMyBookings(response.boardings.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (roomId) => {
    if (!bookingForm.petId || !bookingForm.checkIn || !bookingForm.checkOut) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      await boardingApi.createBoarding({
        pet_id: bookingForm.petId,
        hotel_room_id: roomId,
        check_in: bookingForm.checkIn,
        check_out: bookingForm.checkOut,
        special_requests: bookingForm.specialRequests,
        emergency_contact: bookingForm.emergencyContact,
        emergency_phone: bookingForm.emergencyPhone,
      });

      setSuccessMessage("Hotel reservation created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Reset form and refresh
      setBookingForm({
        petId: "",
        checkIn: "",
        checkOut: "",
        roomType: "all",
        specialRequests: "",
        emergencyContact: "",
        emergencyPhone: "",
      });
      setAvailableRooms([]);
      fetchMyBookings();
      setActiveTab("my-bookings");
    } catch (err) {
      setError(err.message || "Failed to create reservation");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    
    try {
      setLoading(true);
      await boardingApi.cancelBoarding(bookingId);
      setSuccessMessage("Reservation cancelled successfully");
      fetchMyBookings();
    } catch (err) {
      setError(err.message || "Failed to cancel reservation");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: "#fef3c7", color: "#d97706" },
      confirmed: { bg: "#dbeafe", color: "#2563eb" },
      checked_in: { bg: "#d1fae5", color: "#059669" },
      checked_out: { bg: "#e5e7eb", color: "#6b7280" },
      cancelled: { bg: "#fee2e2", color: "#dc2626" },
    };
    return styles[status] || styles.pending;
  };

  const getRoomTypeLabel = (type) => {
    const labels = { standard: "Standard", deluxe: "Deluxe", suite: "Suite" };
    return labels[type] || type;
  };

  return (
    <div className="customer-hotel-reservation">
      {/* Header */}
      <div className="hotel-header">
        <div className="header-left">
          <h1><FontAwesomeIcon icon={faHotel} /> Pet Hotel</h1>
          <p>Book a comfortable stay for your furry friend</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <FontAwesomeIcon icon={faTimesCircle} /> {error}
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success">
          <FontAwesomeIcon icon={faCheckCircle} /> {successMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="hotel-tabs">
        <button
          className={activeTab === "book" ? "active" : ""}
          onClick={() => setActiveTab("book")}
        >
          <FontAwesomeIcon icon={faPlus} /> New Reservation
        </button>
        <button
          className={activeTab === "my-bookings" ? "active" : ""}
          onClick={() => setActiveTab("my-bookings")}
        >
          <FontAwesomeIcon icon={faBed} /> My Bookings ({myBookings.length})
        </button>
      </div>

      {/* Book Tab */}
      {activeTab === "book" && (
        <div className="book-tab">
          {/* Booking Form */}
          <div className="booking-form-section">
            <h3><FontAwesomeIcon icon={faCalendarAlt} /> Reservation Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Select Pet *</label>
                <select
                  value={bookingForm.petId}
                  onChange={(e) => setBookingForm({...bookingForm, petId: e.target.value})}
                >
                  <option value="">Choose your pet...</option>
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species} - {pet.breed})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Check-in Date *</label>
                <input
                  type="date"
                  value={bookingForm.checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingForm({...bookingForm, checkIn: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Check-out Date *</label>
                <input
                  type="date"
                  value={bookingForm.checkOut}
                  min={bookingForm.checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingForm({...bookingForm, checkOut: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Room Type Preference</label>
                <select
                  value={bookingForm.roomType}
                  onChange={(e) => setBookingForm({...bookingForm, roomType: e.target.value})}
                >
                  <option value="all">Any Type</option>
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Special Requests</label>
              <textarea
                value={bookingForm.specialRequests}
                onChange={(e) => setBookingForm({...bookingForm, specialRequests: e.target.value})}
                placeholder="Dietary needs, medication, exercise preferences, etc."
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Emergency Contact</label>
                <input
                  type="text"
                  value={bookingForm.emergencyContact}
                  onChange={(e) => setBookingForm({...bookingForm, emergencyContact: e.target.value})}
                  placeholder="Contact person name"
                />
              </div>
              <div className="form-group">
                <label>Emergency Phone</label>
                <input
                  type="tel"
                  value={bookingForm.emergencyPhone}
                  onChange={(e) => setBookingForm({...bookingForm, emergencyPhone: e.target.value})}
                  placeholder="+63..."
                />
              </div>
            </div>
          </div>

          {/* Available Rooms */}
          {bookingForm.checkIn && bookingForm.checkOut && (
            <div className="available-rooms-section">
              <h3><FontAwesomeIcon icon={faBed} /> Available Rooms</h3>
              
              {availableRooms.length === 0 ? (
                <div className="no-rooms">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <p>No rooms available for selected dates. Try different dates or room type.</p>
                </div>
              ) : (
                <div className="rooms-grid">
                  {availableRooms.map(room => (
                    <div key={room.id} className="room-card">
                      <div className="room-header">
                        <h4>Room {room.room_number}</h4>
                        <span className={`room-type ${room.type}`}>
                          {getRoomTypeLabel(room.type)}
                        </span>
                      </div>
                      <p className="room-name">{room.name}</p>
                      <p className="room-description">{room.description}</p>
                      <div className="room-details">
                        <span><FontAwesomeIcon icon={faPaw} /> {room.size} size</span>
                        <span><FontAwesomeIcon icon={faBed} /> Capacity: {room.capacity}</span>
                      </div>
                      {room.amenities && (
                        <div className="room-amenities">
                          {room.amenities.map((amenity, idx) => (
                            <span key={idx} className="amenity-tag">
                              <FontAwesomeIcon icon={faStar} /> {amenity}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="room-price">
                        <FontAwesomeIcon icon={faDollarSign} />
                        <span className="price">{room.daily_rate}</span>
                        <span className="per-night">/night</span>
                      </div>
                      <button
                        className="book-room-btn"
                        onClick={() => handleCreateBooking(room.id)}
                        disabled={loading || !bookingForm.petId}
                      >
                        {loading ? "Booking..." : "Book This Room"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* My Bookings Tab */}
      {activeTab === "my-bookings" && (
        <div className="my-bookings-tab">
          {myBookings.length === 0 ? (
            <div className="no-bookings">
              <FontAwesomeIcon icon={faBed} />
              <p>No reservations yet. Book your pet's first stay!</p>
              <button onClick={() => setActiveTab("book")}>
                <FontAwesomeIcon icon={faPlus} /> Make Reservation
              </button>
            </div>
          ) : (
            <div className="bookings-list">
              {myBookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <div className="booking-id">Reservation #{booking.id}</div>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusBadge(booking.status).bg,
                        color: getStatusBadge(booking.status).color,
                      }}
                    >
                      {booking.status === "checked_in" ? "Checked In" :
                       booking.status === "checked_out" ? "Checked Out" :
                       booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="label"><FontAwesomeIcon icon={faPaw} /> Pet:</span>
                      <span className="value">{booking.pet?.name || "Unknown"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label"><FontAwesomeIcon icon={faBed} /> Room:</span>
                      <span className="value">
                        {booking.hotel_room?.room_number} ({getRoomTypeLabel(booking.hotel_room?.type)})
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label"><FontAwesomeIcon icon={faCalendarAlt} /> Check-in:</span>
                      <span className="value">
                        {booking.check_in ? new Date(booking.check_in).toLocaleDateString() : "TBD"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label"><FontAwesomeIcon icon={faCalendarAlt} /> Check-out:</span>
                      <span className="value">
                        {booking.check_out ? new Date(booking.check_out).toLocaleDateString() : "TBD"}
                      </span>
                    </div>
                    {booking.total_amount && (
                      <div className="detail-row">
                        <span className="label"><FontAwesomeIcon icon={faDollarSign} /> Total:</span>
                        <span className="value">₱{booking.total_amount}</span>
                      </div>
                    )}
                  </div>

                  {booking.status === "pending" && (
                    <div className="booking-actions">
                      <button
                        className="cancel-btn"
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faTimesCircle} /> Cancel Reservation
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HotelForm;