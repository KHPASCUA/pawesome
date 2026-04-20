import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCheckCircle, faCalendarAlt, faPaw, faUser } from "@fortawesome/free-solid-svg-icons";
import { boardingApi } from "../../api/boardings";
import "./CheckInForm.css";

const CheckInForm = () => {
  const [boardings, setBoardings] = useState([]);
  const [filteredBoardings, setFilteredBoardings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadBoardings = async () => {
      setLoading(true);
      try {
        const response = await boardingApi.getBoardings();
        const data = response.boardings?.data || response.boardings || response || [];
        setBoardings(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load boarding reservations");
      } finally {
        setLoading(false);
      }
    };

    loadBoardings();
  }, []);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    const confirmed = boardings.filter((item) => item.status === "confirmed");
    if (!query) {
      setFilteredBoardings(confirmed);
      return;
    }

    setFilteredBoardings(
      confirmed.filter((item) => {
        const petName = item.pet?.name?.toLowerCase() || "";
        const ownerName = item.customer?.name?.toLowerCase() || "";
        return petName.includes(query) || ownerName.includes(query) || item.hotel_room?.room_number?.toString().includes(query);
      })
    );
  }, [searchQuery, boardings]);

  const handleCheckIn = async (id) => {
    setError("");
    setSuccess("");
    try {
      await boardingApi.checkIn(id);
      setSuccess("Guest checked in successfully.");
      const response = await boardingApi.getBoardings();
      const data = response.boardings?.data || response.boardings || response || [];
      setBoardings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to process check-in");
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
            placeholder="Search by pet owner or room..."
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading available check-ins...</div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : (
        <div className="boarding-list">
          {success && <div className="alert alert-success">{success}</div>}
          {filteredBoardings.length === 0 ? (
            <div className="no-data">No confirmed bookings available for check-in.</div>
          ) : (
            filteredBoardings.map((booking) => (
              <div key={booking.id} className="boarding-card">
                <div className="card-header">
                  <h3>{booking.pet?.name || "Unknown Pet"}</h3>
                  <span className="status-badge status-confirmed">Confirmed</span>
                </div>
                <div className="card-body">
                  <p><FontAwesomeIcon icon={faUser} /> {booking.customer?.name || "Unknown Owner"}</p>
                  <p><FontAwesomeIcon icon={faPaw} /> {booking.pet?.species || "Pet"}</p>
                  <p><FontAwesomeIcon icon={faCalendarAlt} /> Check-in: {booking.check_in ? new Date(booking.check_in).toLocaleDateString() : "TBD"}</p>
                  <p>Room: {booking.hotel_room?.room_number || "TBD"}</p>
                </div>
                <button className="btn-primary" onClick={() => handleCheckIn(booking.id)}>
                  <FontAwesomeIcon icon={faCheckCircle} /> Confirm Check-In
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CheckInForm;
