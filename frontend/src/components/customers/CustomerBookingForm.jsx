import React, { useState } from "react";
import {
  FaPaw,
  FaCut,
  FaHotel,
  FaStethoscope,
  FaCalendarAlt,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";
import "./CustomerBookingForm.css";
import { apiRequest } from "../../api/client";

const CustomerBookingForm = () => {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: localStorage.getItem("email") || "",
    pet_name: "",
    service_type: "grooming",
    service_name: "Grooming",
    request_date: "",
    request_time: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const serviceOptions = {
    grooming: "Grooming",
    vet: "Vet Appointment",
    hotel: "Pet Hotel",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "service_type") {
      setFormData((prev) => ({
        ...prev,
        service_type: value,
        service_name: serviceOptions[value],
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const submissionData = {
        ...formData,
        customer_email: localStorage.getItem("email") || formData.customer_email,
      };

      const data = await apiRequest("/customer/requests", {
        method: "POST",
        body: JSON.stringify(submissionData),
      }, "http://127.0.0.1:8000/api");

      if (data.success) {
        alert("Booking request submitted successfully. Please wait for receptionist approval.");

        setFormData({
          customer_name: "",
          customer_email: localStorage.getItem("email") || "",
          pet_name: "",
          service_type: "grooming",
          service_name: "Grooming",
          request_date: "",
          request_time: "",
          notes: "",
        });
      } else {
        alert(data.message || "Failed to submit request.");
      }
    } catch (error) {
      console.error("Submit booking error:", error);
      alert("Server error while submitting booking request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-booking-page">
      <section className="booking-hero">
        <span className="booking-badge">Customer Portal</span>
        <h1>Book a Pet Service</h1>
        <p>
          Submit a grooming, veterinary, or pet hotel request. Your request will
          be reviewed by the receptionist before payment and confirmation.
        </p>
      </section>

      <section className="booking-card">
        <div className="booking-card-header">
          <div>
            <h2>Service Request Form</h2>
            <p>Fill in the details below to send your request.</p>
          </div>
          <FaPaw />
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-grid">
            <label>
              Customer Name
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </label>

            <label>
              Pet Name
              <input
                type="text"
                name="pet_name"
                value={formData.pet_name}
                onChange={handleChange}
                placeholder="Enter pet name"
                required
              />
            </label>

            <label>
              Service Type
              <div className="select-wrapper">
                {formData.service_type === "grooming" && <FaCut />}
                {formData.service_type === "vet" && <FaStethoscope />}
                {formData.service_type === "hotel" && <FaHotel />}
                <select
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  required
                >
                  <option value="grooming">Grooming</option>
                  <option value="vet">Vet Appointment</option>
                  <option value="hotel">Pet Hotel</option>
                </select>
              </div>
            </label>

            <label>
              Preferred Date
              <div className="input-icon">
                <FaCalendarAlt />
                <input
                  type="date"
                  name="request_date"
                  value={formData.request_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>

            <label>
              Preferred Time
              <div className="input-icon">
                <FaClock />
                <input
                  type="time"
                  name="request_time"
                  value={formData.request_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>

            <label className="full-width">
              Notes / Special Request
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Example: Full grooming, vaccine concern, 2 nights stay..."
                rows="5"
              />
            </label>
          </div>

          <button className="submit-booking-btn" type="submit" disabled={loading}>
            <FaPaperPlane />
            {loading ? "Submitting..." : "Submit Booking Request"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default CustomerBookingForm;
