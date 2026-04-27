import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCheckCircle, faCalendarAlt, faPaw, faUser } from "@fortawesome/free-solid-svg-icons";
import "./ReceptionistCheckInForm.css";

const ReceptionistCheckInForm = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkingInId, setCheckingInId] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/receptionist/requests");
      const data = await response.json();
      
      // Filter only hotel requests that are approved (ready for check-in)
      const hotelApproved = data.requests.filter(
        item => item.type === "hotel" && item.status === "approved"
      );
      
      setBookings(hotelApproved);
    } catch (err) {
      setError("Failed to load boarding reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setFilteredBookings(bookings);
      return;
    }

    setFilteredBookings(
      bookings.filter((item) => {
        const petName = item.pet?.toLowerCase() || "";
        const customerName = item.customer?.toLowerCase() || "";
        return petName.includes(query) || customerName.includes(query);
      })
    );
  }, [searchQuery, bookings]);

  const handleCheckIn = async (id) => {
    const confirm = window.confirm("Confirm this guest check-in?");
    if (!confirm) return;

    setError("");
    setSuccess("");
    setCheckingInId(id);
    try {
      await fetch(
        `http://127.0.0.1:8000/api/receptionist/requests/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "checked_in" }),
        }
      );
      
      setSuccess("Guest checked in successfully.");
      await loadBookings();
    } catch (err) {
      setError("Failed to process check-in");
    } finally {
      setCheckingInId(null);
    }
  };

  return (
    <div className="checkin-form">
      <div className="form-header">
        <h1>Receptionist Check-In</h1>
        <p>Search confirmed bookings ready for check-in.</p>
      </div>

      <div className="checkin-controls">
        <div className="search-row">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by pet or customer..."
          />
          <button className="btn-primary" onClick={loadBookings}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading available check-ins...</div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : (
        <div className="boarding-list">
          {success && <div className="alert alert-success">{success}</div>}
          {filteredBookings.length === 0 ? (
            <div className="no-data">No approved bookings available for check-in.</div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="boarding-card">
                <div className="card-header">
                  <h3>{booking.pet || "Unknown Pet"}</h3>
                  <span className="status-badge status-confirmed">Approved</span>
                </div>
                <div className="card-body">
                  <p><FontAwesomeIcon icon={faUser} /> {booking.customer || "Unknown Owner"}</p>
                  <p><FontAwesomeIcon icon={faPaw} /> Hotel Stay</p>
                  <p><FontAwesomeIcon icon={faCalendarAlt} /> Date: {booking.date || "TBD"}</p>
                  <p>Room: {booking.service || "TBD"}</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => handleCheckIn(booking.id)}
                  disabled={checkingInId === booking.id}
                >
                  <FontAwesomeIcon icon={faCheckCircle} />
                  {checkingInId === booking.id ? "Checking in..." : "Confirm Check-In"}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ReceptionistCheckInForm;
