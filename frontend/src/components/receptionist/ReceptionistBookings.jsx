import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHotel,
  faStethoscope,
  faCut,
  faCalendarAlt,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "./ReceptionistBookings.css";

const ReceptionistBookings = () => {
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [bookings, setBookings] = useState([
    {
      id: "HOTEL-001",
      type: "hotel",
      petName: "Buddy",
      petType: "Dog",
      breed: "Golden Retriever",
      owner: "John Smith",
      ownerPhone: "+1-234-567-8901",
      roomType: "Deluxe Suite",
      roomNumber: "101",
      checkIn: "2024-01-15",
      checkOut: "2024-01-17",
      duration: "2 days",
      status: "confirmed",
      service: "Pet Hotel Stay",
      appointmentDate: "2024-01-15",
      appointmentTime: "10:00 AM",
      amount: 160,
      paidAmount: 160,
      paymentMethod: "cash",
      paymentStatus: "paid",
      createdAt: "2024-01-10T10:00:00"
    },
    {
      id: "VET-001",
      type: "vet",
      petName: "Luna",
      petType: "Cat",
      breed: "Persian",
      owner: "Emily Davis",
      ownerPhone: "+1-234-567-8902",
      service: "Regular Checkup",
      appointmentDate: "2024-01-16",
      appointmentTime: "2:00 PM",
      status: "confirmed",
      amount: 100,
      paidAmount: 50,
      paymentMethod: "card",
      paymentStatus: "partial",
      createdAt: "2024-01-11T14:00:00"
    },
    {
      id: "GROOM-001",
      type: "grooming",
      petName: "Max",
      petType: "Dog",
      breed: "Poodle",
      owner: "Michael Brown",
      ownerPhone: "+1-234-567-8903",
      service: "Full Grooming Package",
      appointmentDate: "2024-01-17",
      appointmentTime: "11:00 AM",
      status: "pending",
      amount: 60,
      paidAmount: 0,
      paymentMethod: "cash",
      paymentStatus: "pending",
      createdAt: "2024-01-12T09:00:00"
    }
  ]);
  const [bookingFormData, setBookingFormData] = useState({
    customerId: "",
    petId: "",
    ownerName: "",
    petName: "",
    petType: "",
    breed: "",
    appointmentDate: "",
    appointmentTime: "10:00 AM",
    service: "",
    duration: "1 day",
    roomType: "",
    symptoms: "",
    medicalNotes: "",
    specialRequests: "",
    bookingType: "hotel",
    paymentMethod: "cash",
    paymentStatus: "pending",
    amount: "",
    paidAmount: "0"
  });

  // Sample data
  const customers = [
    { id: "CUST-001", name: "John Smith", phone: "+1-234-567-8901", email: "john.smith@email.com" },
    { id: "CUST-002", name: "Emily Davis", phone: "+1-234-567-8902", email: "emily.davis@email.com" },
    { id: "CUST-003", name: "Robert Wilson", phone: "+1-234-567-8903", email: "robert.wilson@email.com" },
    { id: "CUST-004", name: "Jessica Brown", phone: "+1-234-567-8904", email: "jessica.brown@email.com" },
    { id: "CUST-005", name: "Michael Johnson", phone: "+1-234-567-8905", email: "michael.johnson@email.com" },
  ];

  const pets = [
    { id: "PET-001", customerId: "CUST-001", name: "Buddy", type: "Dog", breed: "Golden Retriever", age: "3 years" },
    { id: "PET-002", customerId: "CUST-001", name: "Max", type: "Dog", breed: "Labrador", age: "5 years" },
    { id: "PET-003", customerId: "CUST-002", name: "Luna", type: "Cat", breed: "Persian", age: "2 years" },
    { id: "PET-004", customerId: "CUST-003", name: "Charlie", type: "Dog", breed: "German Shepherd", age: "4 years" },
    { id: "PET-005", customerId: "CUST-004", name: "Whiskers", type: "Cat", breed: "Siamese", age: "1 year" },
    { id: "PET-006", customerId: "CUST-005", name: "Bella", type: "Dog", breed: "Poodle", age: "6 years" },
    { id: "PET-007", customerId: "CUST-005", name: "Duke", type: "Dog", breed: "Bulldog", age: "2 years" },
  ];

  
  // Customer selection handler
  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setBookingFormData(prev => ({
        ...prev,
        customerId,
        petId: "",
        ownerName: customer.name,
        petName: "",
        petType: "",
        breed: ""
      }));
    }
  };

  // Pet selection handler
  const handlePetChange = (petId) => {
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      setBookingFormData(prev => ({
        ...prev,
        petId,
        petName: pet.name,
        petType: pet.type,
        breed: pet.breed
      }));
    }
  };

  // Get pets for selected customer
  const getAvailablePets = () => {
    if (!bookingFormData.customerId) return [];
    return pets.filter(pet => pet.customerId === bookingFormData.customerId);
  };

  // Sort bookings by creation date (newest first)
  const sortedBookings = [...bookings].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Form handlers
  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!bookingFormData.customerId || !bookingFormData.petId || !bookingFormData.appointmentDate) {
      alert("Please select a customer, pet, and appointment date.");
      return;
    }

    // Create service name and calculate amount based on booking type
    let serviceName = "";
    let amount = 0;
    
    if (bookingFormData.bookingType === "hotel") {
      serviceName = "Pet Hotel Stay";
      // Calculate based on room type and duration
      const roomRates = {
        "Standard Room": 50,
        "Deluxe Suite": 80,
        "Premium Suite": 120
      };
      const dailyRate = roomRates[bookingFormData.roomType] || 50;
      const duration = parseInt(bookingFormData.duration) || 1;
      amount = dailyRate * duration;
    } else if (bookingFormData.bookingType === "vet") {
      serviceName = bookingFormData.service || "Regular Checkup";
      // Vet service prices
      const vetPrices = {
        "Regular Checkup": 100,
        "Vaccination": 80,
        "Surgery": 500,
        "Emergency": 300
      };
      amount = vetPrices[bookingFormData.service] || 100;
    } else if (bookingFormData.bookingType === "grooming") {
      serviceName = bookingFormData.service || "Full Grooming";
      // Grooming service prices
      const groomingPrices = {
        "Full Grooming": 60,
        "Bath & Trim": 40,
        "Nail Trimming": 20,
        "Teeth Cleaning": 50
      };
      amount = groomingPrices[bookingFormData.service] || 60;
    }

    // Process payment
    let paymentStatus = "pending";
    let paidAmount = parseFloat(bookingFormData.paidAmount) || 0;
    
    if (paidAmount >= amount) {
      paymentStatus = "paid";
    } else if (paidAmount > 0) {
      paymentStatus = "partial";
    }

    // Create new booking object
    const newBooking = {
      id: `${bookingFormData.bookingType.toUpperCase()}-${Date.now()}`,
      type: bookingFormData.bookingType,
      petName: bookingFormData.petName,
      petType: bookingFormData.petType,
      breed: bookingFormData.breed,
      owner: bookingFormData.ownerName,
      ownerPhone: customers.find(c => c.id === bookingFormData.customerId)?.phone || "",
      service: serviceName,
      appointmentDate: bookingFormData.appointmentDate,
      appointmentTime: bookingFormData.appointmentTime,
      status: "confirmed",
      amount: amount,
      paidAmount: paidAmount,
      paymentMethod: bookingFormData.paymentMethod,
      paymentStatus: paymentStatus,
      createdAt: new Date().toISOString()
    };

    // Add booking type specific fields
    if (bookingFormData.bookingType === "hotel") {
      newBooking.roomType = bookingFormData.roomType;
      newBooking.duration = bookingFormData.duration;
      newBooking.checkIn = bookingFormData.appointmentDate;
      newBooking.checkOut = bookingFormData.appointmentDate; // Would need calculation based on duration
    } else if (bookingFormData.bookingType === "vet") {
      newBooking.symptoms = bookingFormData.symptoms;
      newBooking.medicalNotes = bookingFormData.medicalNotes;
    } else if (bookingFormData.bookingType === "grooming") {
      newBooking.specialRequests = bookingFormData.specialRequests;
    }

    // Add new booking to the bookings list
    setBookings(prev => [...prev, newBooking]);
    
    console.log(`${bookingFormData.bookingType} appointment booked:`, bookingFormData);
    alert(`${bookingFormData.bookingType} appointment booked successfully!`);
    handleBookingCancel();
  };

  const handleBookingCancel = () => {
    setBookingFormData({
      customerId: "",
      petId: "",
      ownerName: "",
      petName: "",
      petType: "",
      breed: "",
      appointmentDate: "",
      appointmentTime: "10:00 AM",
      service: "",
      duration: "1 day",
      roomType: "Standard Room",
      specialRequests: "",
      bookingType: ""
    });
    setShowNewBookingModal(false);
  };

  
  return (
    <div className="receptionist-bookings">
      <div className="booking-header">
        <h2>
          <FontAwesomeIcon icon={faCalendarAlt} /> Booking Management
        </h2>
        <button 
          className="primary-btn create-btn"
          onClick={() => setShowNewBookingModal(true)}
        >
          <FontAwesomeIcon icon={faPlus} />
          Create Booking
        </button>
      </div>

      
      {/* Bookings Table */}
      <div className="bookings-table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Pet</th>
              <th>Owner</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedBookings.map((booking) => (
              <tr key={booking.id}>
                <td>
                  <span className={`booking-type ${booking.type}`}>
                    {booking.type === "hotel" && <FontAwesomeIcon icon={faHotel} />}
                    {booking.type === "vet" && <FontAwesomeIcon icon={faStethoscope} />}
                    {booking.type === "grooming" && <FontAwesomeIcon icon={faCut} />}
                    {booking.type === "hotel" && "Hotel"}
                    {booking.type === "vet" && "Vet"}
                    {booking.type === "grooming" && "Grooming"}
                  </span>
                </td>
                <td>{booking.petName}</td>
                <td>{booking.owner}</td>
                <td>{booking.service}</td>
                <td>{booking.appointmentDate || booking.checkIn}</td>
                <td>{booking.appointmentTime || "N/A"}</td>
                <td>
                  <span className={`payment-status ${booking.paymentStatus || 'pending'}`}>
                    {booking.paymentStatus === 'paid' ? 'Paid' : 
                     booking.paymentStatus === 'partial' ? 'Partial' : 'Pending'}
                  </span>
                </td>
                <td>
                  <span className={`status ${booking.status}`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Walk-in Booking Modal */}
      {showNewBookingModal && (
        <div className="appointment-modal-overlay" onClick={() => setShowNewBookingModal(false)}>
          <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Booking (Walk-in)</h2>
              <button 
                className="close-btn"
                onClick={() => setShowNewBookingModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <form className="appointment-form" onSubmit={handleBookingSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Booking Type *</label>
                    <select
                      name="bookingType"
                      value={bookingFormData.bookingType}
                      onChange={handleBookingInputChange}
                      required
                    >
                      <option value="">Select booking type...</option>
                      <option value="hotel">Hotel</option>
                      <option value="vet">Veterinary</option>
                      <option value="grooming">Grooming</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Select Customer *</label>
                    <select
                      name="customerId"
                      value={bookingFormData.customerId}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      required
                    >
                      <option value="">Choose a customer...</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({customer.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Select Pet *</label>
                    <select
                      name="petId"
                      value={bookingFormData.petId}
                      onChange={(e) => handlePetChange(e.target.value)}
                      required
                      disabled={!bookingFormData.customerId}
                    >
                      <option value="">
                        {bookingFormData.customerId ? "Choose a pet..." : "Select customer first"}
                      </option>
                      {getAvailablePets().map(pet => (
                        <option key={pet.id} value={pet.id}>
                          {pet.name} ({pet.type} - {pet.breed})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Pet Name</label>
                    <input
                      type="text"
                      name="petName"
                      value={bookingFormData.petName}
                      onChange={handleBookingInputChange}
                      placeholder="Pet name (auto-filled)"
                      disabled
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Pet Type</label>
                    <input
                      type="text"
                      name="petType"
                      value={bookingFormData.petType}
                      onChange={handleBookingInputChange}
                      placeholder="Pet type (auto-filled)"
                      disabled
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Breed</label>
                    <input
                      type="text"
                      name="breed"
                      value={bookingFormData.breed}
                      onChange={handleBookingInputChange}
                      placeholder="Breed (auto-filled)"
                      disabled
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Owner Name</label>
                    <input
                      type="text"
                      name="ownerName"
                      value={bookingFormData.ownerName}
                      onChange={handleBookingInputChange}
                      placeholder="Owner name (auto-filled)"
                      disabled
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Appointment Date *</label>
                    <input
                      type="date"
                      name="appointmentDate"
                      value={bookingFormData.appointmentDate}
                      onChange={handleBookingInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Appointment Time</label>
                    <select
                      name="appointmentTime"
                      value={bookingFormData.appointmentTime}
                      onChange={handleBookingInputChange}
                    >
                      <option value="09:00 AM">9:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="02:00 PM">2:00 PM</option>
                      <option value="03:00 PM">3:00 PM</option>
                      <option value="04:00 PM">4:00 PM</option>
                      <option value="05:00 PM">5:00 PM</option>
                    </select>
                  </div>

                  {/* Dynamic fields based on booking type */}
                  {bookingFormData.bookingType === "hotel" && (
                    <>
                      <div className="form-group">
                        <label>Room Type *</label>
                        <select
                          name="roomType"
                          value={bookingFormData.roomType}
                          onChange={handleBookingInputChange}
                          required
                        >
                          <option value="Standard Room">Standard Room</option>
                          <option value="Deluxe Suite">Deluxe Suite</option>
                          <option value="Presidential Suite">Presidential Suite</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Duration *</label>
                        <select
                          name="duration"
                          value={bookingFormData.duration}
                          onChange={handleBookingInputChange}
                          required
                        >
                          <option value="1 day">1 day</option>
                          <option value="2 days">2 days</option>
                          <option value="3 days">3 days</option>
                          <option value="1 week">1 week</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Service *</label>
                        <select
                          name="service"
                          value={bookingFormData.service}
                          onChange={handleBookingInputChange}
                          required
                        >
                          <option value="Pet Hotel Stay">Pet Hotel Stay</option>
                          <option value="Day Care">Day Care</option>
                          <option value="Pet Training">Pet Training</option>
                        </select>
                      </div>
                    </>
                  )}

                  {bookingFormData.bookingType === "vet" && (
                    <>
                      <div className="form-group">
                        <label>Service *</label>
                        <select
                          name="service"
                          value={bookingFormData.service}
                          onChange={handleBookingInputChange}
                          required
                        >
                          <option value="Checkup">Checkup</option>
                          <option value="Vaccination">Vaccination</option>
                          <option value="Surgery">Surgery</option>
                          <option value="Dental Cleaning">Dental Cleaning</option>
                          <option value="Grooming">Grooming</option>
                          <option value="Emergency">Emergency</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Symptoms</label>
                        <textarea
                          name="symptoms"
                          value={bookingFormData.symptoms}
                          onChange={handleBookingInputChange}
                          placeholder="Describe symptoms or reason for visit..."
                        />
                      </div>
                    </>
                  )}

                  {bookingFormData.bookingType === "grooming" && (
                    <>
                      <div className="form-group">
                        <label>Service *</label>
                        <select
                          name="service"
                          value={bookingFormData.service}
                          onChange={handleBookingInputChange}
                          required
                        >
                          <option value="Bath">Bath</option>
                          <option value="Haircut">Haircut</option>
                          <option value="Nail Trim">Nail Trim</option>
                          <option value="Full Grooming">Full Grooming</option>
                          <option value="Teeth Cleaning">Teeth Cleaning</option>
                          <option value="Flea Treatment">Flea Treatment</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Payment Section */}
                  <div className="payment-section">
                    <h4>Payment Information</h4>
                    <div className="form-group">
                      <label>Payment Method *</label>
                      <select
                        name="paymentMethod"
                        value={bookingFormData.paymentMethod}
                        onChange={handleBookingInputChange}
                        required
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Credit Card</option>
                        <option value="gcash">GCash</option>
                        <option value="bank">Bank Transfer</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Paid Amount</label>
                      <input
                        type="number"
                        name="paidAmount"
                        value={bookingFormData.paidAmount}
                        onChange={handleBookingInputChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Special Requests</label>
                    <textarea
                      name="specialRequests"
                      value={bookingFormData.specialRequests}
                      onChange={handleBookingInputChange}
                      placeholder="Any special requests or notes..."
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="secondary-btn" onClick={handleBookingCancel}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    Create Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistBookings;