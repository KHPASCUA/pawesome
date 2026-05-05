import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  
  // Get customer name from localStorage
  const customerName =
    localStorage.getItem("name") ||
    localStorage.getItem("customer_name") ||
    "Customer";

  // Get authentication token
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    customer_name: customerName,
    customer_email: localStorage.getItem("email") || "",
    pet_id: "",
    pet_name: "",
    service_type: "grooming",
    service_name: "Grooming",
    preferred_date: "",
    preferred_time: "",
    notes: "",
  });

  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [petsLoading, setPetsLoading] = useState(false);

  // Business hours configuration
  const SHOP_OPEN = "09:00";
  const SHOP_CLOSE = "18:00";
  const SLOT_MINUTES = 30;

  const generateTimeSlots = (open = SHOP_OPEN, close = SHOP_CLOSE, interval = SLOT_MINUTES) => {
    const slots = [];

    const [openHour, openMinute] = open.split(":").map(Number);
    const [closeHour, closeMinute] = close.split(":").map(Number);

    const start = new Date();
    start.setHours(openHour, openMinute, 0, 0);

    const end = new Date();
    end.setHours(closeHour, closeMinute, 0, 0);

    while (start < end) {
      const value = start.toTimeString().slice(0, 5);

      const label = start.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      slots.push({ value, label });

      start.setMinutes(start.getMinutes() + interval);
    }

    return slots;
  };

  const availableTimeSlots = generateTimeSlots();

  // Load pets from API
  const loadPets = async () => {
    try {
      setPetsLoading(true);
      const result = await apiRequest("/customer/pets", "GET");

      const petList = Array.isArray(result)
        ? result
        : result.pets || result.data || [];

      setPets(petList);
    } catch (error) {
      console.error("Failed to load pets:", error);
      setPets([]);
    } finally {
      setPetsLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    if (!token) {
      alert("Please log in first before booking a service.");
      navigate("/login");
      return;
    }

    loadPets();
  }, [token, navigate]);

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

    if (name === "pet_id") {
      setSelectedPetId(value);
      const selectedPet = pets.find((pet) => String(pet.id) === String(value));
      setFormData((prev) => ({
        ...prev,
        pet_id: value,
        pet_name: selectedPet?.name || "",
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

    // Ensure a pet is selected
    if (!formData.pet_id) {
      alert("Please select a pet for this service request.");
      return;
    }

    try {
      setLoading(true);

      const selectedPet = pets.find((pet) => String(pet.id) === String(selectedPetId));

      const payload = {
        customer_name: customerName,
        customer_email: localStorage.getItem("email") || formData.customer_email,

        pet_id: selectedPet?.id,
        pet_name: selectedPet?.name,

        request_type: formData.service_type || formData.request_type,

        requested_date: formData.preferred_date || formData.requested_date,
        requested_time: formData.preferred_time || formData.requested_time,

        notes: formData.notes || "",
        special_request: formData.notes || "",
      };

      console.log("BOOKING PAYLOAD:", payload);

      const data = await apiRequest("/customer/requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (data.success) {
        alert("Booking request submitted successfully. Please wait for receptionist approval.");

        setFormData({
          customer_name: customerName,
          customer_email: localStorage.getItem("email") || "",
          pet_id: "",
          pet_name: "",
          service_type: "grooming",
          service_name: "Grooming",
          preferred_date: "",
          preferred_time: "",
          notes: "",
        });
        setSelectedPetId("");
      } else {
        alert(data.message || "Failed to submit request.");
      }
    } catch (error) {
      console.error("BOOKING SUBMIT ERROR:", error);
      console.error("BOOKING ERROR RESPONSE:", error.response?.data || error.data || error.message);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.data?.message ||
        error.message ||
        "Server error while submitting booking request.";

      alert(message);
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
                readOnly
                className="readonly-input"
                placeholder="Your name will be auto-filled"
              />
            </label>

            <label>
              Pet Name
              {petsLoading ? (
                <div className="loading-pets">Loading your pets...</div>
              ) : pets.length === 0 ? (
                <div className="no-pets-message">
                  <p>No pets found. Please add your pet first in My Pets before booking a service.</p>
                </div>
              ) : (
                <select
                  name="pet_id"
                  value={formData.pet_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your pet</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} — {pet.species}
                      {pet.breed ? ` (${pet.breed})` : ""}
                    </option>
                  ))}
                </select>
              )}
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
                  name="preferred_date"
                  value={formData.preferred_date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>

            <label>
              Preferred Time
              <div className="select-wrapper">
                <FaClock />
                <select
                  name="preferred_time"
                  value={formData.preferred_time}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select available time</option>
                  {availableTimeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
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

          <button 
            className="submit-booking-btn" 
            type="submit" 
            disabled={loading || pets.length === 0}
          >
            <FaPaperPlane />
            {loading ? "Submitting..." : "Submit Booking Request"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default CustomerBookingForm;
