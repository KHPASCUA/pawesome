import React, { useState, useEffect, useCallback } from "react";
import "./CustomerBookings.css";
import { apiRequest } from "../../api/client";

const CustomerBookings = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const customerEmail = localStorage.getItem("email");
  const customerName = localStorage.getItem("name") || "Customer";

  const [formData, setFormData] = useState({
    customer_name: customerName,
    customer_email: customerEmail || "",
    pet_name: "",
    service_type: "",
    service_name: "",
    request_date: "",
    request_time: "",
    notes: "",
  });

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!customerEmail) {
        setBookings([]);
        return;
      }

      const data = await apiRequest(`/customer/my-requests?email=${customerEmail}`);

      const allBookings = (data.requests || []).map(item => ({
        id: item.id,
        type: item.type === 'grooming' ? 'Groom' : item.type === 'vet' ? 'Vet' : 'Hotel',
        icon: item.type === 'grooming' ? '✂️' : item.type === 'vet' ? '🏥' : '🏨',
        title: item.type === 'grooming' ? 'Grooming Service' : item.type === 'vet' ? 'Veterinary Appointment' : 'Hotel Stay',
        details: `${item.pet} - ${item.service}`,
        date: item.date,
        status: item.status
      }));

      allBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
      setBookings(allBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [customerEmail]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSelect = (type) => {
    setSelectedBooking(type);
    setReceipt(null);
    setPreviewUrl(null);
    setFormData({
      customer_name: customerName,
      customer_email: customerEmail || "",
      pet_name: "",
      service_type: type === 'Hotel' ? 'hotel' : type === 'Vet' ? 'vet' : 'grooming',
      service_name: type === 'Hotel' ? 'Standard Room' : type === 'Vet' ? 'Checkup' : 'Basic Bath',
      request_date: "",
      request_time: "",
      notes: "",
    });
  };

  const handleClose = () => {
    setSelectedBooking(null);
    setReceipt(null);
    setPreviewUrl(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceipt(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveReceipt = () => {
    setReceipt(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = await apiRequest("/customer/requests", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (data.success) {
        setSuccessMessage(`${selectedBooking} booking submitted successfully! Your request is pending approval.`);
        await fetchBookings();
        setTimeout(() => {
          setSuccessMessage(null);
          handleClose();
        }, 3000);
      } else {
        alert('Failed to submit booking: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const bookingTypes = [
    { id: 'Hotel', icon: '🏨', title: 'Hotel Stay', description: 'Comfortable boarding for your pet' },
    { id: 'Vet', icon: '🏥', title: 'Veterinary', description: 'Health checkups and treatments' },
    { id: 'Groom', icon: '✂️', title: 'Grooming', description: 'Professional grooming services' }
  ];

  return (
    <div className="customer-bookings">
      {/* Success Message Toast */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
          zIndex: 10000,
          animation: 'slideIn 0.3s ease',
          fontWeight: 600
        }}>
          {successMessage}
        </div>
      )}

      <div className="bookings-header">
        <div className="header-content">
          <h1>My Bookings</h1>
          <p>Manage your pet's appointments and reservations</p>
        </div>
      </div>

      <div className="bookings-content">
      {/* Booking type cards */}
      <div className="booking-types-grid">
        {bookingTypes.map((type) => (
          <div 
            key={type.id}
            className="booking-type-card"
            onClick={() => handleSelect(type.id)}
          >
            <div className="booking-icon">{type.icon}</div>
            <h3>{type.title}</h3>
            <p>{type.description}</p>
          </div>
        ))}
      </div>

      {/* Recent Bookings Section */}
      <div className="recent-bookings">
        <h4>Recent Bookings</h4>
        {loading ? (
          <p style={{ color: 'var(--color-muted)' }}>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>
            <p>No bookings yet</p>
            <p style={{ fontSize: '0.9rem' }}>Start by selecting Hotel, Veterinary, or Grooming service.</p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-item">
                <div className="booking-info">
                  <span className="booking-type">{booking.icon}</span>
                  <span className="booking-details">{booking.details}</span>
                  <span className="booking-date">{booking.date}</span>
                </div>
                <span className={`booking-status ${booking.status}`}>{booking.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      {/* Enhanced Modal */}
      {selectedBooking && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">
                  {bookingTypes.find(t => t.id === selectedBooking)?.icon}
                </span>
                <h4>{bookingTypes.find(t => t.id === selectedBooking)?.title} Booking</h4>
              </div>
              <button className="close-modal-btn" onClick={handleClose}>×</button>
            </div>

            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="pet_name">Pet Name</label>
                <input 
                  type="text" 
                  id="pet_name" 
                  name="pet_name" 
                  value={formData.pet_name} 
                  onChange={handleInputChange}
                  required
                  placeholder="Enter pet name"
                />
              </div>

              {/* Hotel-specific fields */}
              {selectedBooking === "Hotel" && (
                <div className="service-fields">
                  <div className="form-group">
                    <label htmlFor="service_name">Room Type</label>
                    <select 
                      id="service_name" 
                      name="service_name" 
                      value={formData.service_name} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Standard Room">Standard Room</option>
                      <option value="Deluxe Room">Deluxe Room</option>
                      <option value="Suite">Suite</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="request_date">Check-In Date</label>
                      <input 
                        type="date" 
                        id="request_date" 
                        name="request_date" 
                        value={formData.request_date} 
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="request_time">Check-In Time</label>
                      <input 
                        type="time" 
                        id="request_time" 
                        name="request_time" 
                        value={formData.request_time} 
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="notes">Special Requests</label>
                    <textarea 
                      id="notes" 
                      name="notes" 
                      value={formData.notes} 
                      onChange={handleInputChange}
                      placeholder="Any special needs or requests for your pet..."
                      rows="3"
                    />
                  </div>
                </div>
              )}

              {/* Vet-specific fields */}
              {selectedBooking === "Vet" && (
                <div className="service-fields">
                  <div className="form-group">
                    <label htmlFor="service_name">Service Type</label>
                    <select 
                      id="service_name" 
                      name="service_name" 
                      value={formData.service_name} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Checkup">General Checkup</option>
                      <option value="Vaccination">Vaccination</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Dental">Dental Cleaning</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="request_date">Preferred Date</label>
                      <input 
                        type="date" 
                        id="request_date" 
                        name="request_date" 
                        value={formData.request_date} 
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="request_time">Preferred Time</label>
                      <input 
                        type="time" 
                        id="request_time" 
                        name="request_time" 
                        value={formData.request_time} 
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="notes">Reason for Visit</label>
                    <textarea 
                      id="notes" 
                      name="notes" 
                      value={formData.notes} 
                      onChange={handleInputChange}
                      placeholder="Describe the health concern or reason for visit..."
                      rows="4"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Groom-specific fields */}
              {selectedBooking === "Groom" && (
                <div className="service-fields">
                  <div className="form-group">
                    <label htmlFor="service_name">Service Type</label>
                    <select 
                      id="service_name" 
                      name="service_name" 
                      value={formData.service_name} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Basic Bath">Basic Bath</option>
                      <option value="Full Grooming Package">Full Grooming Package</option>
                      <option value="Haircut Only">Haircut Only</option>
                      <option value="Nail Trim">Nail Trim</option>
                      <option value="Teeth Cleaning">Teeth Cleaning</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="request_date">Grooming Date</label>
                      <input 
                        type="date" 
                        id="request_date" 
                        name="request_date" 
                        value={formData.request_date} 
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="request_time">Grooming Time</label>
                      <input 
                        type="time" 
                        id="request_time" 
                        name="request_time" 
                        value={formData.request_time} 
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="notes">Special Instructions</label>
                    <textarea 
                      id="notes" 
                      name="notes" 
                      value={formData.notes} 
                      onChange={handleInputChange}
                      placeholder="Any special instructions for grooming..."
                      rows="3"
                    />
                  </div>
                </div>
              )}

              {/* Payment Section */}
              <div className="payment-section">
                <h5>Payment Information</h5>
                <div className="form-group">
                  <label htmlFor="receipt">Upload Payment Receipt</label>
                  <div className="file-upload">
                    <input 
                      type="file" 
                      id="receipt" 
                      accept="image/*,.pdf" 
                      onChange={handleReceiptUpload}
                      className="file-input"
                    />
                    <label htmlFor="receipt" className="file-label">
                      <span className="upload-icon"></span>
                      <span className="upload-text">
                        {receipt ? receipt.name : 'Choose file or drag here'}
                      </span>
                    </label>
                  </div>
                </div>

                {previewUrl && (
                  <div className="receipt-preview">
                    <div className="preview-header">
                      <span>Receipt Preview</span>
                      <button 
                        type="button" 
                        className="remove-btn" 
                        onClick={handleRemoveReceipt}
                      >
                        Remove
                      </button>
                    </div>
                    <img src={previewUrl} alt="Receipt Preview" />
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;
