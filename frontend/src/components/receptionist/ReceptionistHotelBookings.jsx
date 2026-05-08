import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHotel,
  faCalendarAlt,
  faSearch,
  faFilter,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faPaw,
  faDoorOpen,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import "./ReceptionistHotelBookings.css";
import { apiRequest } from "../../api/client";

const normalizeList = (result, keys = []) => {
  if (Array.isArray(result)) return result;
  for (const key of keys) {
    if (Array.isArray(result?.[key])) return result[key];
    if (Array.isArray(result?.[key]?.data)) return result[key].data;
  }
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.boarding_requests)) return result.boarding_requests;
  if (Array.isArray(result?.boardings?.data)) return result.boardings.data;
  if (Array.isArray(result?.available_rooms)) return result.available_rooms;
  if (Array.isArray(result?.rooms)) return result.rooms;
  return [];
};

const ReceptionistHotelBookings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [scheduleDraft, setScheduleDraft] = useState({});
  const [careDraft, setCareDraft] = useState({ log_type: "general_update", notes: "" });

  const fetchBookings = async () => {
    try {
      const data = await apiRequest("/receptionist/boarding-requests");
      setBookings(normalizeList(data, ["boarding_requests", "boardings"]));
    } catch (err) {
      setError(err.message || "Failed to load boarding requests.");
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await apiRequest("/receptionist/boarding-rooms");
      setRooms(normalizeList(data, ["rooms", "hotel_rooms", "available_rooms"]));
    } catch {
      setRooms([]);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchRooms();
  }, []);

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    active: bookings.filter((b) => ["checked_in", "in_care"].includes(b.status)).length,
  }), [bookings]);

  const runAction = async (booking, endpoint, message, body = null) => {
    try {
      setProcessingId(booking.id);
      setError("");
      await apiRequest(endpoint, {
        method: "POST",
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      setSuccessMessage(message);
      await fetchBookings();
      await fetchRooms();
    } catch (err) {
      setError(err.message || "Action failed.");
    } finally {
      setProcessingId(null);
    }
  };

  const scheduleBooking = async (booking) => {
    const draft = scheduleDraft[booking.id] || {};
    if (!draft.hotel_room_id) {
      setError("Select a room before scheduling.");
      return;
    }

    await runAction(
      booking,
      `/receptionist/boarding-requests/${booking.id}/schedule`,
      "Boarding scheduled.",
      {
        hotel_room_id: draft.hotel_room_id,
        check_in: draft.check_in || booking.check_in?.slice(0, 10),
        check_out: draft.check_out || booking.check_out?.slice(0, 10),
        check_in_time: draft.check_in_time || booking.check_in_time,
        check_out_time: draft.check_out_time || booking.check_out_time,
        total_amount: draft.total_amount,
      }
    );
  };

  const addCareLog = async (booking) => {
    if (!careDraft.notes.trim()) {
      setError("Care log notes are required.");
      return;
    }

    await runAction(
      booking,
      `/receptionist/boarding-requests/${booking.id}/care-logs`,
      "Care log added.",
      careDraft
    );
    setCareDraft({ log_type: "general_update", notes: "" });
  };

  const filteredBookings = bookings.filter((booking) => {
    const haystack = `${booking.pet?.name || booking.pet_name || ""} ${booking.customer?.name || booking.customer_name || ""}`.toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    if (["approved", "scheduled", "completed"].includes(status)) return "success";
    if (["pending", "checked_in", "in_care", "ready_for_pickup"].includes(status)) return "warning";
    if (["rejected", "cancelled"].includes(status)) return "danger";
    return "secondary";
  };

  const getStatusIcon = (status) => {
    if (["approved", "scheduled", "completed"].includes(status)) return faCheckCircle;
    if (["rejected", "cancelled"].includes(status)) return faTimesCircle;
    return faClock;
  };

  return (
    <div className="hotel-bookings">
      {error && <div className="alert alert-error" style={{ margin: 20, padding: 10, background: "#fee2e2", color: "#dc2626", borderRadius: 4 }}>{error}</div>}
      {successMessage && <div className="alert alert-success" style={{ margin: 20, padding: 10, background: "#dcfce7", color: "#16a34a", borderRadius: 4 }}>{successMessage}</div>}

      <div className="bookings-header">
        <div className="header-left">
          <h1>Hotel Boarding</h1>
          <p>Approve, schedule, check in, care for, and release pet hotel stays</p>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card"><div className="card-icon"><FontAwesomeIcon icon={faHotel} /></div><div className="card-content"><h3>{stats.total}</h3><p>Total</p></div></div>
        <div className="summary-card"><div className="card-icon"><FontAwesomeIcon icon={faClock} /></div><div className="card-content"><h3>{stats.pending}</h3><p>Pending</p></div></div>
        <div className="summary-card"><div className="card-icon"><FontAwesomeIcon icon={faDoorOpen} /></div><div className="card-content"><h3>{stats.active}</h3><p>In Care</p></div></div>
      </div>

      <div className="bookings-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input type="text" placeholder="Search by pet or customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="filter-dropdown">
            <FontAwesomeIcon icon={faFilter} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_care">In Care</option>
              <option value="ready_for_pickup">Ready</option>
              <option value="completed">Completed</option>
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
              <th>Stay</th>
              <th>Room</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="booking-row">
                <td className="booking-id"><span className="id-badge">{booking.id}</span></td>
                <td className="pet-info"><div className="pet-details"><div className="pet-avatar"><FontAwesomeIcon icon={faPaw} /></div><span className="pet-name">{booking.pet?.name || booking.pet_name}</span></div></td>
                <td className="customer"><span>{booking.customer?.name || booking.customer_name || booking.customer_email}</span></td>
                <td className="date"><FontAwesomeIcon icon={faCalendarAlt} /> {booking.check_in?.slice(0, 10)} to {booking.check_out?.slice(0, 10)}</td>
                <td className="room"><span>{booking.hotel_room?.name || booking.hotel_room?.room_number || "Unassigned"}</span></td>
                <td className="time"><span>{booking.payment_status || "unpaid"}</span></td>
                <td className="status"><span className={`status-badge ${getStatusColor(booking.status)}`}><FontAwesomeIcon icon={getStatusIcon(booking.status)} /> {booking.status}</span></td>
                <td className="actions">
                  {booking.status === "pending" && (
                    <>
                      <button className="action-btn approve-btn" onClick={() => runAction(booking, `/receptionist/boarding-requests/${booking.id}/approve`, "Boarding approved.")} disabled={processingId === booking.id} title="Approve"><FontAwesomeIcon icon={faCheckCircle} /></button>
                      <button className="action-btn reject-btn" onClick={() => runAction(booking, `/receptionist/boarding-requests/${booking.id}/reject`, "Boarding rejected.")} disabled={processingId === booking.id} title="Reject"><FontAwesomeIcon icon={faTimesCircle} /></button>
                    </>
                  )}
                  {["approved", "pending"].includes(booking.status) && <button className="action-btn view-btn" onClick={() => setSelectedBooking(booking)} title="Schedule"><FontAwesomeIcon icon={faCalendarAlt} /></button>}
                  {["approved", "scheduled"].includes(booking.status) && <button className="action-btn approve-btn" onClick={() => runAction(booking, `/receptionist/boarding-requests/${booking.id}/check-in`, "Pet checked in.")} disabled={processingId === booking.id} title="Check in"><FontAwesomeIcon icon={faDoorOpen} /></button>}
                  {["checked_in", "in_care"].includes(booking.status) && <button className="action-btn view-btn" onClick={() => setSelectedBooking(booking)} title="Care log"><FontAwesomeIcon icon={faClipboardList} /></button>}
                  {["checked_in", "in_care"].includes(booking.status) && <button className="action-btn approve-btn" onClick={() => runAction(booking, `/receptionist/boarding-requests/${booking.id}/ready-for-pickup`, "Pet marked ready for pickup.")} disabled={processingId === booking.id} title="Ready"><FontAwesomeIcon icon={faCheckCircle} /></button>}
                  {booking.status === "ready_for_pickup" && <button className="action-btn approve-btn" onClick={() => runAction(booking, `/receptionist/boarding-requests/${booking.id}/check-out`, "Pet checked out.")} disabled={processingId === booking.id} title="Check out"><FontAwesomeIcon icon={faDoorOpen} /></button>}
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
              <h2>Boarding #{selectedBooking.id}</h2>
              <button className="close-btn" onClick={() => setSelectedBooking(null)}>x</button>
            </div>
            <div className="modal-content">
              <div className="info-grid">
                <div className="info-item"><label>Pet:</label><span>{selectedBooking.pet?.name || selectedBooking.pet_name}</span></div>
                <div className="info-item"><label>Customer:</label><span>{selectedBooking.customer?.name || selectedBooking.customer_name}</span></div>
                <div className="info-item"><label>Status:</label><span className={`status-badge ${getStatusColor(selectedBooking.status)}`}>{selectedBooking.status}</span></div>
                <div className="info-item"><label>Instructions:</label><span>{selectedBooking.special_requests || selectedBooking.feeding_instructions || "None"}</span></div>
              </div>

              {["pending", "approved"].includes(selectedBooking.status) && (
                <div className="booking-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Room / Kennel</label>
                      <select value={scheduleDraft[selectedBooking.id]?.hotel_room_id || ""} onChange={(e) => setScheduleDraft((prev) => ({ ...prev, [selectedBooking.id]: { ...(prev[selectedBooking.id] || {}), hotel_room_id: e.target.value } }))}>
                        <option value="">Select room</option>
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>{room.name || room.room_number} ({room.status})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Total Amount</label>
                      <input type="number" min="0" step="0.01" value={scheduleDraft[selectedBooking.id]?.total_amount || ""} onChange={(e) => setScheduleDraft((prev) => ({ ...prev, [selectedBooking.id]: { ...(prev[selectedBooking.id] || {}), total_amount: e.target.value } }))} />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="submit-btn" onClick={() => scheduleBooking(selectedBooking)} disabled={processingId === selectedBooking.id}>Schedule</button>
                  </div>
                </div>
              )}

              {["checked_in", "in_care"].includes(selectedBooking.status) && (
                <div className="booking-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Care Log Type</label>
                      <select value={careDraft.log_type} onChange={(e) => setCareDraft((prev) => ({ ...prev, log_type: e.target.value }))}>
                        <option value="feeding">Feeding</option>
                        <option value="water">Water</option>
                        <option value="walk">Walk</option>
                        <option value="playtime">Playtime</option>
                        <option value="medication">Medication</option>
                        <option value="cleaning">Cleaning</option>
                        <option value="behavior">Behavior</option>
                        <option value="health_observation">Health Observation</option>
                        <option value="general_update">General Update</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label>Notes</label>
                      <textarea rows="3" value={careDraft.notes} onChange={(e) => setCareDraft((prev) => ({ ...prev, notes: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="submit-btn" onClick={() => addCareLog(selectedBooking)} disabled={processingId === selectedBooking.id}>Add Care Log</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistHotelBookings;
