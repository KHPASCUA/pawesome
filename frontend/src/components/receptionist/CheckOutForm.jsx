import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSignOutAlt, faCalendarAlt, faPaw, faUser } from "@fortawesome/free-solid-svg-icons";
import { boardingApi } from "../../api/boardings";
import "./CheckOutForm.css";

const CheckOutForm = () => {
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
    const checkedIn = boardings.filter((item) => item.status === "checked_in");
    if (!query) {
      setFilteredBoardings(checkedIn);
      return;
    }

    setFilteredBoardings(
      checkedIn.filter((item) => {
        const petName = item.pet?.name?.toLowerCase() || "";
        const ownerName = item.customer?.name?.toLowerCase() || "";
        return petName.includes(query) || ownerName.includes(query) || item.hotel_room?.room_number?.toString().includes(query);
      })
    );
  }, [searchQuery, boardings]);

  const handleCheckOut = async (id) => {
    setError("");
    setSuccess("");
    try {
      await boardingApi.checkOut(id);
      setSuccess("Guest checked out successfully.");
      const response = await boardingApi.getBoardings();
      const data = response.boardings?.data || response.boardings || response || [];
      setBoardings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to process check-out");
    }
  };

  return (
    <div className="checkout-form">
      <div className="form-header">
        <h1>Receptionist Check-Out</h1>
        <p>Complete check-outs for pets currently staying with us.</p>
      </div>

      <div className="checkout-controls">
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
        <div className="loading-state">Loading check-out candidates...</div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : (
        <div className="boarding-list">
          {success && <div className="alert alert-success">{success}</div>}
          {filteredBoardings.length === 0 ? (
            <div className="no-data">No checked-in pets available for check-out.</div>
          ) : (
            filteredBoardings.map((booking) => (
              <div key={booking.id} className="boarding-card">
                <div className="card-header">
                  <h3>{booking.pet?.name || "Unknown Pet"}</h3>
                  <span className="status-badge status-checked-in">Checked In</span>
                </div>
                <div className="card-body">
                  <p><FontAwesomeIcon icon={faUser} /> {booking.customer?.name || "Unknown Owner"}</p>
                  <p><FontAwesomeIcon icon={faPaw} /> {booking.pet?.species || "Pet"}</p>
                  <p><FontAwesomeIcon icon={faCalendarAlt} /> Check-out: {booking.check_out ? new Date(booking.check_out).toLocaleDateString() : "TBD"}</p>
                  <p>Room: {booking.hotel_room?.room_number || "TBD"}</p>
                </div>
                <button className="btn-primary" onClick={() => handleCheckOut(booking.id)}>
                  <FontAwesomeIcon icon={faSignOutAlt} /> Confirm Check-Out
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CheckOutForm;
