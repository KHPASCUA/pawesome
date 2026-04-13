import React, { useState } from "react";
import "./CustomerBookings.css";

const CustomerBookings = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    pet: '',
    roomType: '',
    checkInDate: '',
    checkOutDate: '',
    specialRequests: '',
    appointmentDate: '',
    reason: '',
    groomingDate: '',
    serviceType: ''
  });

  const handleSelect = (type) => {
    setSelectedBooking(type);
    setReceipt(null);
    setPreviewUrl(null);
    setFormData({
      pet: '',
      roomType: '',
      checkInDate: '',
      checkOutDate: '',
      specialRequests: '',
      appointmentDate: '',
      reason: '',
      groomingDate: '',
      serviceType: ''
    });
  };

  const handleClose = () => {
    setSelectedBooking(null);
    setReceipt(null);
    setPreviewUrl(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Booking submitted:', { type: selectedBooking, ...formData, receipt });
    alert(`${selectedBooking} booking submitted successfully!`);
    handleClose();
  };

  const bookingTypes = [
    { id: 'Hotel', icon: '', title: 'Hotel Stay', description: 'Comfortable boarding for your pet' },
    { id: 'Vet', icon: '', title: 'Veterinary', description: 'Health checkups and treatments' },
    { id: 'Groom', icon: '', title: 'Grooming', description: 'Professional grooming services' }
  ];

  return (
    <div className="customer-bookings">
      <div className="bookings-header">
        <div className="header-content">
          <h3>📅 My Bookings</h3>
          <p>Manage your pet's appointments and reservations</p>
        </div>
      </div>

      {/* Booking type cards */}
      <div className="booking-types-grid">
        {bookingTypes.map((type) => (
          <div 
            key={type.id}
            className="booking-type-card"
            onClick={() => handleSelect(type.id)}
          >
            <div className="card-icon">{type.icon}</div>
            <div className="card-content">
              <h4>{type.title}</h4>
              <p>{type.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings Section */}
      <div className="recent-bookings">
        <h4>Recent Bookings</h4>
        <div className="bookings-list">
          <div className="booking-item">
            <div className="booking-info">
              <span className="booking-type"></span>
              <span className="booking-details">Max - Standard Room</span>
              <span className="booking-date">Dec 15-17, 2023</span>
            </div>
            <span className="booking-status confirmed">Confirmed</span>
          </div>
          <div className="booking-item">
            <div className="booking-info">
              <span className="booking-type"></span>
              <span className="booking-details">Bella - Regular Checkup</span>
              <span className="booking-date">Dec 20, 2023</span>
            </div>
            <span className="booking-status pending">Pending</span>
          </div>
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
              {/* Pet Selection */}
              <div className="form-group">
                <label htmlFor="pet">Select Your Pet</label>
                <select 
                  id="pet" 
                  name="pet" 
                  value={formData.pet} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Choose your pet...</option>
                  <option value="max">Max (Dog) - Golden Retriever</option>
                  <option value="bella">Bella (Cat) - Persian</option>
                  <option value="charlie">Charlie (Dog) - Beagle</option>
                </select>
              </div>

              {/* Hotel-specific fields */}
              {selectedBooking === "Hotel" && (
                <div className="service-fields">
                  <div className="form-group">
                    <label htmlFor="roomType">Room Type</label>
                    <select 
                      id="roomType" 
                      name="roomType" 
                      value={formData.roomType} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select room...</option>
                      <option value="standard">Standard Room - $50/night</option>
                      <option value="deluxe">Deluxe Room - $75/night</option>
                      <option value="suite">Suite - $100/night</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="checkInDate">Check-In Date</label>
                      <input 
                        type="date" 
                        id="checkInDate" 
                        name="checkInDate" 
                        value={formData.checkInDate} 
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="checkOutDate">Check-Out Date</label>
                      <input 
                        type="date" 
                        id="checkOutDate" 
                        name="checkOutDate" 
                        value={formData.checkOutDate} 
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="specialRequests">Special Requests</label>
                    <textarea 
                      id="specialRequests" 
                      name="specialRequests" 
                      value={formData.specialRequests} 
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
                    <label htmlFor="appointmentDate">Preferred Date</label>
                    <input 
                      type="date" 
                      id="appointmentDate" 
                      name="appointmentDate" 
                      value={formData.appointmentDate} 
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reason">Reason for Visit</label>
                    <textarea 
                      id="reason" 
                      name="reason" 
                      value={formData.reason} 
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
                    <label htmlFor="groomingDate">Grooming Date</label>
                    <input 
                      type="date" 
                      id="groomingDate" 
                      name="groomingDate" 
                      value={formData.groomingDate} 
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="serviceType">Service Type</label>
                    <select 
                      id="serviceType" 
                      name="serviceType" 
                      value={formData.serviceType} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select service...</option>
                      <option value="bath">Bath & Dry - $30</option>
                      <option value="haircut">Haircut & Styling - $45</option>
                      <option value="nails">Nail Trim - $15</option>
                      <option value="full">Full Grooming Package - $80</option>
                    </select>
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
                <button type="submit" className="submit-btn">
                  Confirm Booking
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