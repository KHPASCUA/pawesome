import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHotel,
  faPlus,
  faBed,
  faCalendarAlt,
  faPaw,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import "./HotelForm.css";

const HotelForm = () => {
  const [activeTab, setActiveTab] = useState("book");
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const customerEmail = localStorage.getItem("email");
  const customerName = localStorage.getItem("name") || "Customer";

  const [bookingForm, setBookingForm] = useState({
    customer_name: customerName,
    customer_email: customerEmail || "",
    pet_name: "",
    service_type: "hotel",
    service_name: "Standard Room",
    request_date: "",
    request_time: "",
    notes: "",
  });

  const fetchMyBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!customerEmail) {
        setMyBookings([]);
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/customer/my-requests?email=${customerEmail}`
      );
      const data = await response.json();

      // Filter only hotel requests
      const hotelOnly = data.requests.filter(item => item.type === "hotel");
      
      setMyBookings(hotelOnly);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Failed to load bookings. Please try again.");
      setMyBookings([]);
    } finally {
      setLoading(false);
    }
  }, [customerEmail]);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  const handleCreateBooking = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://127.0.0.1:8000/api/customer/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingForm),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Hotel reservation submitted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        
        setBookingForm({
          customer_name: customerName,
          customer_email: customerEmail || "",
          pet_name: "",
          service_type: "hotel",
          service_name: "Standard Room",
          request_date: "",
          request_time: "",
          notes: "",
        });

        await fetchMyBookings();
        setActiveTab("my-bookings");
      } else {
        setError(data.message || "Failed to create reservation");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to create reservation");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    
    try {
      setLoading(true);
      await fetch(
        `http://127.0.0.1:8000/api/receptionist/requests/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "rejected" }),
        }
      );
      
      setSuccessMessage("Reservation cancelled successfully");
      fetchMyBookings();
    } catch (err) {
      setError("Failed to cancel reservation");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: "#fef3c7", color: "#d97706" },
      approved: { bg: "#dbeafe", color: "#2563eb" },
      rejected: { bg: "#fee2e2", color: "#dc2626" },
    };
    return styles[status] || styles.pending;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="customer-hotel-reservation">
      <div className="hotel-header">
        <div className="header-left">
          <h1><FontAwesomeIcon icon={faHotel} /> Pet Hotel</h1>
          <p>Book a comfortable stay for your furry friend</p>
        </div>
      </div>

      {error && (
        <div className="hotel-error">
          <span>×</span>
          <p>{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success">
          <FontAwesomeIcon icon={faCheckCircle} /> {successMessage}
        </div>
      )}

      <div className="hotel-tabs">
        <button
          className={`hotel-tab ${activeTab === "book" ? "active" : ""}`}
          onClick={() => setActiveTab("book")}
        >
          <FontAwesomeIcon icon={faPlus} /> New Reservation
        </button>
        <button
          className={`hotel-tab ${activeTab === "my-bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("my-bookings")}
        >
          <FontAwesomeIcon icon={faBed} /> My Bookings ({myBookings.length})
        </button>
      </div>

      {activeTab === "book" && (
        <div className="book-tab">
          <div className="booking-form-section">
            <h3><FontAwesomeIcon icon={faCalendarAlt} /> Reservation Details</h3>
            
            <form onSubmit={handleCreateBooking}>
              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  name="customer_name"
                  value={bookingForm.customer_name}
                  onChange={handleChange}
                  required
                  readOnly
                  style={{ backgroundColor: "#f0f0f0" }}
                />
              </div>

              <div className="form-group">
                <label>Pet Name *</label>
                <input
                  type="text"
                  name="pet_name"
                  value={bookingForm.pet_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter pet name"
                />
              </div>

              <div className="form-group">
                <label>Room Type</label>
                <select
                  name="service_name"
                  value={bookingForm.service_name}
                  onChange={handleChange}
                >
                  <option value="Standard Room">Standard Room</option>
                  <option value="Deluxe Room">Deluxe Room</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Check-in Date *</label>
                  <input
                    type="date"
                    name="request_date"
                    value={bookingForm.request_date}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label>Check-in Time *</label>
                  <input
                    type="time"
                    name="request_time"
                    value={bookingForm.request_time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Special Requests</label>
                <textarea
                  name="notes"
                  value={bookingForm.notes}
                  onChange={handleChange}
                  placeholder="Dietary needs, medication, exercise preferences, etc."
                  rows={3}
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Reservation"}
              </button>
            </form>
          </div>
        </div>
      )}

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
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="label"><FontAwesomeIcon icon={faPaw} /> Pet:</span>
                      <span className="value">{booking.pet}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label"><FontAwesomeIcon icon={faBed} /> Room:</span>
                      <span className="value">{booking.service}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label"><FontAwesomeIcon icon={faCalendarAlt} /> Date:</span>
                      <span className="value">{booking.date}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label"><FontAwesomeIcon icon={faCalendarAlt} /> Time:</span>
                      <span className="value">{booking.time}</span>
                    </div>
                    {booking.notes && (
                      <div className="detail-row">
                        <span className="label">Notes:</span>
                        <span className="value">{booking.notes}</span>
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