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
  faReceipt,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import "./HotelForm.css";
import { apiRequest } from "../../api/client";

const normalizeList = (result, keys = []) => {
  if (Array.isArray(result)) return result;

  for (const key of keys) {
    if (Array.isArray(result?.[key])) return result[key];
    if (Array.isArray(result?.[key]?.data)) return result[key].data;
  }

  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.requests)) return result.requests;
  if (Array.isArray(result?.boarding_requests)) return result.boarding_requests;
  if (Array.isArray(result?.boardings?.data)) return result.boardings.data;
  if (Array.isArray(result?.care_logs)) return result.care_logs;

  return [];
};

const HotelForm = () => {
  const [activeTab, setActiveTab] = useState("book");
  const [myBookings, setMyBookings] = useState([]);
  const [pets, setPets] = useState([]);
  const [careLogs, setCareLogs] = useState({});
  const [paymentFiles, setPaymentFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [bookingForm, setBookingForm] = useState({
    pet_id: "",
    pet_name: "",
    pet_type: "",
    pet_breed: "",
    check_in_date: "",
    check_out_date: "",
    check_in_time: "",
    check_out_time: "",
    boarding_type: "standard",
    special_instructions: "",
    feeding_instructions: "",
    medication_notes: "",
    emergency_contact: "",
    notes: "",
  });

  const fetchPets = useCallback(async () => {
    try {
      const result = await apiRequest("/customer/pets");
      setPets(normalizeList(result, ["pets"]));
    } catch {
      setPets([]);
    }
  }, []);

  const fetchMyBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/customer/boarding-requests");
      setMyBookings(normalizeList(data, ["boarding_requests", "boardings"]));
    } catch (err) {
      setError(err.message || "Failed to load boarding requests.");
      setMyBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPets();
    fetchMyBookings();
  }, [fetchPets, fetchMyBookings]);

  const selectedPet = pets.find((pet) => String(pet.id) === String(bookingForm.pet_id));

  const handleCreateBooking = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const payload = {
        pet_id: bookingForm.pet_id || undefined,
        pet_name: selectedPet?.name || bookingForm.pet_name,
        pet_type: selectedPet?.type || selectedPet?.species || bookingForm.pet_type,
        pet_breed: selectedPet?.breed || bookingForm.pet_breed,
        check_in: bookingForm.check_in_date,
        check_out: bookingForm.check_out_date,
        check_in_time: bookingForm.check_in_time,
        check_out_time: bookingForm.check_out_time,
        boarding_type: bookingForm.boarding_type,
        special_instructions: bookingForm.special_instructions,
        feeding_instructions: bookingForm.feeding_instructions,
        medication_notes: bookingForm.medication_notes,
        emergency_contact: bookingForm.emergency_contact,
        notes: bookingForm.notes,
      };

      await apiRequest("/customer/boarding-requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccessMessage("Pet boarding request submitted successfully.");
      setBookingForm({
        pet_id: "",
        pet_name: "",
        pet_type: "",
        pet_breed: "",
        check_in_date: "",
        check_out_date: "",
        check_in_time: "",
        check_out_time: "",
        boarding_type: "standard",
        special_instructions: "",
        feeding_instructions: "",
        medication_notes: "",
        emergency_contact: "",
        notes: "",
      });
      await fetchMyBookings();
      setActiveTab("my-bookings");
    } catch (err) {
      setError(err.message || "Failed to create boarding request.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this pending boarding request?")) return;

    try {
      setLoading(true);
      await apiRequest(`/customer/boarding-requests/${bookingId}/cancel`, { method: "POST" });
      setSuccessMessage("Boarding request cancelled.");
      await fetchMyBookings();
    } catch (err) {
      setError(err.message || "Failed to cancel reservation.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpload = async (booking) => {
    const file = paymentFiles[booking.id];
    if (!file) {
      setError("Choose a payment proof file first.");
      return;
    }

    const formData = new FormData();
    formData.append("payment_method", "online_transfer");
    formData.append("payment_proof", file);

    try {
      setLoading(true);
      await apiRequest(`/customer/boarding-requests/${booking.id}/payment-proof`, {
        method: "POST",
        body: formData,
      });
      setSuccessMessage("Payment proof submitted for cashier verification.");
      setPaymentFiles((prev) => ({ ...prev, [booking.id]: null }));
      await fetchMyBookings();
    } catch (err) {
      setError(err.message || "Failed to upload payment proof.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCareLogs = async (bookingId) => {
    try {
      const data = await apiRequest(`/customer/boarding-requests/${bookingId}/care-logs`);
      setCareLogs((prev) => ({ ...prev, [bookingId]: normalizeList(data, ["care_logs"]) }));
    } catch (err) {
      setError(err.message || "Failed to load care logs.");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: "#fef3c7", color: "#d97706" },
      approved: { bg: "#dbeafe", color: "#2563eb" },
      scheduled: { bg: "#ede9fe", color: "#7c3aed" },
      checked_in: { bg: "#dcfce7", color: "#16a34a" },
      in_care: { bg: "#dcfce7", color: "#16a34a" },
      ready_for_pickup: { bg: "#cffafe", color: "#0891b2" },
      completed: { bg: "#fce7f3", color: "#be185d" },
      rejected: { bg: "#fee2e2", color: "#dc2626" },
      cancelled: { bg: "#f3f4f6", color: "#4b5563" },
    };
    return styles[status] || styles.pending;
  };

  const canUploadPayment = (booking) =>
    ["approved", "scheduled"].includes(booking.status) &&
    ["unpaid", "rejected"].includes(booking.payment_status || "unpaid");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="customer-hotel-reservation">
      <div className="hotel-header">
        <div className="header-left">
          <h1><FontAwesomeIcon icon={faHotel} /> Pet Hotel</h1>
          <p>Book and track a live pet boarding stay</p>
        </div>
      </div>

      {error && (
        <div className="hotel-error">
          <span>x</span>
          <p>{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success">
          <FontAwesomeIcon icon={faCheckCircle} /> {successMessage}
        </div>
      )}

      <div className="hotel-tabs">
        <button className={`hotel-tab ${activeTab === "book" ? "active" : ""}`} onClick={() => setActiveTab("book")}>
          <FontAwesomeIcon icon={faPlus} /> New Reservation
        </button>
        <button className={`hotel-tab ${activeTab === "my-bookings" ? "active" : ""}`} onClick={() => setActiveTab("my-bookings")}>
          <FontAwesomeIcon icon={faBed} /> My Bookings ({myBookings.length})
        </button>
      </div>

      {activeTab === "book" && (
        <div className="book-tab">
          <div className="booking-form-section">
            <h3><FontAwesomeIcon icon={faCalendarAlt} /> Boarding Request</h3>

            <form onSubmit={handleCreateBooking}>
              <div className="form-group">
                <label>Saved Pet</label>
                <select name="pet_id" value={bookingForm.pet_id} onChange={handleChange}>
                  <option value="">Enter pet details manually</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>{pet.name}</option>
                  ))}
                </select>
              </div>

              {!bookingForm.pet_id && (
                <>
                  <div className="form-group">
                    <label>Pet Name *</label>
                    <input type="text" name="pet_name" value={bookingForm.pet_name} onChange={handleChange} required placeholder="Enter pet name" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Pet Type *</label>
                      <input type="text" name="pet_type" value={bookingForm.pet_type} onChange={handleChange} required placeholder="Dog, cat, etc." />
                    </div>
                    <div className="form-group">
                      <label>Breed</label>
                      <input type="text" name="pet_breed" value={bookingForm.pet_breed} onChange={handleChange} />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Room Type</label>
                <select name="boarding_type" value={bookingForm.boarding_type} onChange={handleChange}>
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                  <option value="kennel">Kennel</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Check-in Date *</label>
                  <input type="date" name="check_in_date" value={bookingForm.check_in_date} onChange={handleChange} required min={new Date().toISOString().split("T")[0]} />
                </div>
                <div className="form-group">
                  <label>Check-out Date *</label>
                  <input type="date" name="check_out_date" value={bookingForm.check_out_date} onChange={handleChange} required min={bookingForm.check_in_date || new Date().toISOString().split("T")[0]} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Check-in Time</label>
                  <input type="time" name="check_in_time" value={bookingForm.check_in_time} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Check-out Time</label>
                  <input type="time" name="check_out_time" value={bookingForm.check_out_time} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Feeding Instructions</label>
                <textarea name="feeding_instructions" value={bookingForm.feeding_instructions} onChange={handleChange} rows={2} />
              </div>

              <div className="form-group">
                <label>Medication Notes</label>
                <textarea name="medication_notes" value={bookingForm.medication_notes} onChange={handleChange} rows={2} />
              </div>

              <div className="form-group">
                <label>Emergency Contact</label>
                <input type="text" name="emergency_contact" value={bookingForm.emergency_contact} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Special Instructions</label>
                <textarea name="special_instructions" value={bookingForm.special_instructions} onChange={handleChange} rows={3} />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Boarding Request"}
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
              <p>No boarding requests yet.</p>
              <button onClick={() => setActiveTab("book")}><FontAwesomeIcon icon={faPlus} /> Make Reservation</button>
            </div>
          ) : (
            <div className="bookings-list">
              {myBookings.map((booking) => {
                const statusStyle = getStatusBadge(booking.status);
                const logs = careLogs[booking.id] || [];

                return (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <div className="booking-id">Boarding #{booking.id}</div>
                      <span className="status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="booking-details">
                      <div className="detail-row"><span className="label"><FontAwesomeIcon icon={faPaw} /> Pet:</span><span className="value">{booking.pet?.name || booking.pet_name}</span></div>
                      <div className="detail-row"><span className="label"><FontAwesomeIcon icon={faBed} /> Room:</span><span className="value">{booking.hotel_room?.name || booking.hotel_room?.room_number || booking.boarding_type || "Pending assignment"}</span></div>
                      <div className="detail-row"><span className="label"><FontAwesomeIcon icon={faCalendarAlt} /> Stay:</span><span className="value">{booking.check_in?.slice(0, 10)} to {booking.check_out?.slice(0, 10)}</span></div>
                      <div className="detail-row"><span className="label"><FontAwesomeIcon icon={faReceipt} /> Payment:</span><span className="value">{booking.payment_status || "unpaid"}</span></div>
                      {booking.rejection_reason && <div className="detail-row"><span className="label">Reason:</span><span className="value">{booking.rejection_reason}</span></div>}
                    </div>

                    <div className="booking-actions">
                      {booking.status === "pending" && (
                        <button className="cancel-btn" onClick={() => handleCancelBooking(booking.id)} disabled={loading}>
                          <FontAwesomeIcon icon={faTimesCircle} /> Cancel
                        </button>
                      )}

                      {canUploadPayment(booking) && (
                        <div className="payment-upload-inline">
                          <input type="file" accept="image/*,.pdf" onChange={(e) => setPaymentFiles((prev) => ({ ...prev, [booking.id]: e.target.files?.[0] }))} />
                          <button type="button" onClick={() => handlePaymentUpload(booking)} disabled={loading || !paymentFiles[booking.id]}>
                            <FontAwesomeIcon icon={faReceipt} /> Upload Proof
                          </button>
                        </div>
                      )}

                      {["checked_in", "in_care", "ready_for_pickup", "completed"].includes(booking.status) && (
                        <button type="button" onClick={() => fetchCareLogs(booking.id)}>
                          <FontAwesomeIcon icon={faClipboardList} /> View Care Logs
                        </button>
                      )}
                    </div>

                    {logs.length > 0 && (
                      <div className="care-log-list">
                        {logs.map((log) => (
                          <div key={log.id} className="care-log-item">
                            <strong>{log.title || log.log_type}</strong>
                            <p>{log.notes}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HotelForm;
