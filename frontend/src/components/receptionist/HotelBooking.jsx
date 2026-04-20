import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHotel,
  faCalendarAlt,
  faUser,
  faPaw,
  faCheckCircle,
  faSignInAlt,
  faSignOutAlt,
  faPlus,
  faSearch,
  faFilter,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { boardingApi } from "../../api/boardings";
import "./HotelBooking.css";

const HotelBooking = () => {
  const [activeTab, setActiveTab] = useState("reservations");
  const [reservations, setReservations] = useState([]);
  const [currentBoarders, setCurrentBoarders] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [todayActivity, setTodayActivity] = useState({ check_ins: [], check_outs: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form states
  const [searchDates, setSearchDates] = useState({ check_in: "", check_out: "" });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    customer_id: "",
    pet_id: "",
    emergency_contact: "",
    emergency_phone: "",
    special_requests: "",
  });

  // Fetch data on mount
  useEffect(() => {
    fetchReservations();
    fetchCurrentBoarders();
    fetchTodayActivity();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await boardingApi.getBoardings();
      if (response.boardings) {
        setReservations(response.boardings.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
    }
  };

  const fetchCurrentBoarders = async () => {
    try {
      const response = await boardingApi.getCurrentBoarders();
      if (response.boarders) {
        setCurrentBoarders(response.boarders);
      }
    } catch (err) {
      console.error("Failed to fetch current boarders:", err);
    }
  };

  const fetchTodayActivity = async () => {
    try {
      const response = await boardingApi.getTodayActivity();
      setTodayActivity(response);
    } catch (err) {
      console.error("Failed to fetch today's activity:", err);
    }
  };

  const searchAvailableRooms = async () => {
    if (!searchDates.check_in || !searchDates.check_out) {
      setError("Please select both check-in and check-out dates");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await boardingApi.getAvailableRooms(
        searchDates.check_in,
        searchDates.check_out
      );
      setAvailableRooms(response.available_rooms || []);
    } catch (err) {
      setError(err.message || "Failed to search available rooms");
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async () => {
    if (!selectedRoom) {
      setError("Please select a room");
      return;
    }
    if (!bookingForm.customer_id || !bookingForm.pet_id) {
      setError("Please enter customer and pet information");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await boardingApi.createBoarding({
        pet_id: bookingForm.pet_id,
        customer_id: bookingForm.customer_id,
        hotel_room_id: selectedRoom.id,
        check_in: searchDates.check_in,
        check_out: searchDates.check_out,
        emergency_contact: bookingForm.emergency_contact,
        emergency_phone: bookingForm.emergency_phone,
        special_requests: bookingForm.special_requests,
      });
      setSuccessMessage("Reservation created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      // Reset form
      setSelectedRoom(null);
      setBookingForm({
        customer_id: "",
        pet_id: "",
        emergency_contact: "",
        emergency_phone: "",
        special_requests: "",
      });
      setAvailableRooms([]);
      fetchReservations();
    } catch (err) {
      setError(err.message || "Failed to create reservation");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await boardingApi.checkIn(id);
      setSuccessMessage("Guest checked in successfully!");
      fetchCurrentBoarders();
      fetchReservations();
      fetchTodayActivity();
    } catch (err) {
      setError(err.message || "Failed to check in");
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await boardingApi.checkOut(id);
      setSuccessMessage("Guest checked out successfully!");
      fetchCurrentBoarders();
      fetchReservations();
      fetchTodayActivity();
    } catch (err) {
      setError(err.message || "Failed to check out");
    }
  };

  const handleConfirm = async (id) => {
    try {
      await boardingApi.confirmBoarding(id);
      setSuccessMessage("Reservation confirmed successfully!");
      fetchReservations();
      fetchTodayActivity();
    } catch (err) {
      setError(err.message || "Failed to confirm reservation");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    try {
      await boardingApi.cancelBoarding(id);
      setSuccessMessage("Reservation cancelled successfully!");
      fetchReservations();
      fetchCurrentBoarders();
      fetchTodayActivity();
    } catch (err) {
      setError(err.message || "Failed to cancel reservation");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "status-pending",
      confirmed: "status-confirmed",
      checked_in: "status-checked-in",
      checked_out: "status-checked-out",
      cancelled: "status-cancelled",
    };
    return badges[status] || "status-pending";
  };

  return (
    <div className="hotel-booking-container">
      <div className="hotel-header">
        <h2>
          <FontAwesomeIcon icon={faHotel} /> Pet Hotel Management
        </h2>
        <div className="hotel-tabs">
          <button
            className={activeTab === "reservations" ? "active" : ""}
            onClick={() => setActiveTab("reservations")}
          >
            All Reservations
          </button>
          <button
            className={activeTab === "current" ? "active" : ""}
            onClick={() => setActiveTab("current")}
          >
            Current Boarders ({currentBoarders.length})
          </button>
          <button
            className={activeTab === "today" ? "active" : ""}
            onClick={() => setActiveTab("today")}
          >
            Today&apos;s Activity
          </button>
          <button
            className={activeTab === "new" ? "active" : ""}
            onClick={() => setActiveTab("new")}
          >
            <FontAwesomeIcon icon={faPlus} /> New Booking
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {activeTab === "reservations" && (
        <div className="reservations-list">
          <h3>All Reservations</h3>
          {reservations.length === 0 ? (
            <p>No reservations found.</p>
          ) : (
            <table className="hotel-table">
              <thead>
                <tr>
                  <th>Pet</th>
                  <th>Room</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => (
                  <tr key={res.id}>
                    <td>{res.pet?.name || "Unknown"}</td>
                    <td>{res.hotel_room?.room_number || "N/A"}</td>
                    <td>{new Date(res.check_in).toLocaleDateString()}</td>
                    <td>{new Date(res.check_out).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(res.status)}`}>
                        {res.status}
                      </span>
                    </td>
                    <td>
                      {res.status === "pending" && (
                        <button
                          className="btn-confirm"
                          onClick={() => handleConfirm(res.id)}
                        >
                          <FontAwesomeIcon icon={faCheckCircle} /> Confirm
                        </button>
                      )}
                      {res.status === "confirmed" && (
                        <button
                          className="btn-checkin"
                          onClick={() => handleCheckIn(res.id)}
                        >
                          <FontAwesomeIcon icon={faSignInAlt} /> Check In
                        </button>
                      )}
                      {res.status === "checked_in" && (
                        <button
                          className="btn-checkout"
                          onClick={() => handleCheckOut(res.id)}
                        >
                          <FontAwesomeIcon icon={faSignOutAlt} /> Check Out
                        </button>
                      )}
                      {(res.status === "pending" || res.status === "confirmed") && (
                        <button
                          className="btn-cancel"
                          onClick={() => handleCancel(res.id)}
                        >
                          <FontAwesomeIcon icon={faTimesCircle} /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "current" && (
        <div className="current-boarders">
          <h3>Currently Boarded Pets</h3>
          {currentBoarders.length === 0 ? (
            <p>No pets currently checked in.</p>
          ) : (
            <div className="boarders-grid">
              {currentBoarders.map((boarder) => (
                <div key={boarder.id} className="boarder-card">
                  <div className="boarder-header">
                    <FontAwesomeIcon icon={faPaw} />
                    <h4>{boarder.pet?.name}</h4>
                  </div>
                  <p>
                    <FontAwesomeIcon icon={faHotel} /> Room: {boarder.hotel_room?.room_number}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faUser} /> Owner: {boarder.customer?.name}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faCalendarAlt} /> Check-out: {new Date(boarder.check_out).toLocaleDateString()}
                  </p>
                  <button
                    className="btn-checkout"
                    onClick={() => handleCheckOut(boarder.id)}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} /> Check Out
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "today" && (
        <div className="today-activity">
          <h3>Today&apos;s Activity</h3>
          <div className="activity-section">
            <h4>Check-ins Today ({todayActivity.check_ins?.length || 0})</h4>
            {todayActivity.check_ins?.length === 0 ? (
              <p>No check-ins scheduled for today.</p>
            ) : (
              <ul className="activity-list">
                {todayActivity.check_ins?.map((item) => (
                  <li key={item.id}>
                    {item.pet?.name} - Room {item.hotel_room?.room_number}
                    <button
                      className="btn-checkin"
                      onClick={() => handleCheckIn(item.id)}
                    >
                      Check In
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="activity-section">
            <h4>Check-outs Today ({todayActivity.check_outs?.length || 0})</h4>
            {todayActivity.check_outs?.length === 0 ? (
              <p>No check-outs scheduled for today.</p>
            ) : (
              <ul className="activity-list">
                {todayActivity.check_outs?.map((item) => (
                  <li key={item.id}>
                    {item.pet?.name} - Room {item.hotel_room?.room_number}
                    <button
                      className="btn-checkout"
                      onClick={() => handleCheckOut(item.id)}
                    >
                      Check Out
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {activeTab === "new" && (
        <div className="new-booking">
          <h3>Create New Booking</h3>

          {/* Step 1: Search Available Rooms */}
          <div className="booking-section">
            <h4>Step 1: Select Dates</h4>
            <div className="date-inputs">
              <input
                type="date"
                value={searchDates.check_in}
                onChange={(e) => setSearchDates({ ...searchDates, check_in: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
              <input
                type="date"
                value={searchDates.check_out}
                onChange={(e) => setSearchDates({ ...searchDates, check_out: e.target.value })}
                min={searchDates.check_in}
              />
              <button
                className="btn-search"
                onClick={searchAvailableRooms}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faSearch} /> Search Rooms
              </button>
            </div>
          </div>

          {/* Step 2: Select Room */}
          {availableRooms.length > 0 && (
            <div className="booking-section">
              <h4>Step 2: Select Available Room</h4>
              <div className="rooms-grid">
                {availableRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`room-card ${selectedRoom?.id === room.id ? "selected" : ""}`}
                    onClick={() => setSelectedRoom(room)}
                  >
                    <h5>Room {room.room_number}</h5>
                    <p>{room.name}</p>
                    <p className="room-type">{room.type} - {room.size}</p>
                    <p className="room-rate">₱{room.daily_rate}/night</p>
                    {selectedRoom?.id === room.id && (
                      <span className="selected-badge">
                        <FontAwesomeIcon icon={faCheckCircle} /> Selected
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Booking Details */}
          {selectedRoom && (
            <div className="booking-section">
              <h4>Step 3: Booking Details</h4>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Customer ID"
                  value={bookingForm.customer_id}
                  onChange={(e) => setBookingForm({ ...bookingForm, customer_id: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Pet ID"
                  value={bookingForm.pet_id}
                  onChange={(e) => setBookingForm({ ...bookingForm, pet_id: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Emergency Contact Name"
                  value={bookingForm.emergency_contact}
                  onChange={(e) => setBookingForm({ ...bookingForm, emergency_contact: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Emergency Contact Phone"
                  value={bookingForm.emergency_phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, emergency_phone: e.target.value })}
                />
                <textarea
                  placeholder="Special Requests"
                  value={bookingForm.special_requests}
                  onChange={(e) => setBookingForm({ ...bookingForm, special_requests: e.target.value })}
                  rows={3}
                />
              </div>
              <button
                className="btn-submit"
                onClick={createBooking}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Reservation"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HotelBooking;