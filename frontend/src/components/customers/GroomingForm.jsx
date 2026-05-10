import React, { useEffect, useState, useCallback } from "react";
import "./GroomingForm.css";
import { apiRequest } from "../../api/client";

const GroomingForm = () => {
  const [activeTab, setActiveTab] = useState("book");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [groomingAvailability, setGroomingAvailability] = useState(null);
  const [dateAvailable, setDateAvailable] = useState(true);

  const customerEmail = localStorage.getItem("email");
  const customerName = localStorage.getItem("name") || "Customer";

  const [formData, setFormData] = useState({
    customer_name: customerName,
    customer_email: customerEmail || "",
    pet_name: "",
    service_type: "grooming",
    service_name: "Basic Bath",
    request_date: "",
    request_time: "",
    notes: "",
  });

  const fetchAppointments = useCallback(async () => {
    try {
      if (!customerEmail) {
        setAppointments([]);
        return;
      }

      const data = await apiRequest(`/customer/my-requests?email=${customerEmail}`);

      // Filter only grooming requests
      const groomingOnly = data.requests.filter(item => item.type === "grooming");
      
      setAppointments(groomingOnly);
    } catch (error) {
      console.error("Failed to load grooming appointments:", error);
    }
  }, [customerEmail]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const fetchGroomingAvailability = async (date) => {
    try {
      setAvailabilityLoading(true);
      
      const data = await apiRequest(`/customer/availability/grooming?date=${date}`);
      
      if (data.success) {
        setGroomingAvailability(data);
        setDateAvailable(data.available);
      } else {
        setGroomingAvailability(null);
        setDateAvailable(false);
        alert(data.message || "This grooming date is already reserved. Please choose another date.");
      }
    } catch (error) {
      console.error("Error fetching grooming availability:", error);
      setGroomingAvailability(null);
      setDateAvailable(false);
      alert("Failed to check availability. Please try again.");
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Check availability when date changes
    if (name === "request_date" && value) {
      fetchGroomingAvailability(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check availability before submitting
    if (!dateAvailable) {
      alert("This grooming date is already reserved. Please choose another date.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest("/customer/requests", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (data.success) {
        alert("Grooming appointment submitted! Waiting for receptionist approval.");

        setFormData({
          customer_name: customerName,
          customer_email: customerEmail || "",
          pet_name: "",
          service_type: "grooming",
          service_name: "Basic Bath",
          request_date: "",
          request_time: "",
          notes: "",
        });

        setGroomingAvailability(null);
        setDateAvailable(true);

        await fetchAppointments();
        setActiveTab("my");
      } else {
        alert(data.message || "Failed to submit grooming appointment");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit grooming appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grooming-container">
      <div className="grooming-header">
        <h1>Pet Grooming</h1>
        <p>Book grooming services for your pet.</p>
      </div>

      <div className="grooming-tabs">
        <button
          className={activeTab === "book" ? "active" : ""}
          onClick={() => setActiveTab("book")}
        >
          New Appointment
        </button>

        <button
          className={activeTab === "my" ? "active" : ""}
          onClick={() => setActiveTab("my")}
        >
          My Appointments ({appointments.length})
        </button>
      </div>

      {activeTab === "book" && (
        <div className="grooming-card">
          <h2>Grooming Appointment Form</h2>

          <form className="grooming-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="customer_name"
              placeholder="Customer Name"
              value={formData.customer_name}
              onChange={handleChange}
              required
              readOnly
              style={{ backgroundColor: "#f0f0f0" }}
            />

            <input
              type="text"
              name="pet_name"
              placeholder="Pet Name"
              value={formData.pet_name}
              onChange={handleChange}
              required
            />

            <select
              name="service_name"
              value={formData.service_name}
              onChange={handleChange}
            >
              <option value="Basic Bath">Basic Bath - ₱500</option>
              <option value="Full Grooming Package">Full Grooming Package - ₱1500</option>
              <option value="Haircut Only">Haircut Only - ₱800</option>
              <option value="Nail Trim">Nail Trim - ₱200</option>
              <option value="Teeth Cleaning">Teeth Cleaning - ₱350</option>
            </select>

            <input
              type="date"
              name="request_date"
              value={formData.request_date}
              onChange={handleChange}
              required
            />

            {/* Availability Display */}
            {groomingAvailability && (
              <div className="grooming-availability">
                {dateAvailable ? (
                  <div className="availability-success">
                    <span>✓</span>
                    <span>This grooming date is available for booking.</span>
                  </div>
                ) : (
                  <div className="no-availability">
                    <span>⚠</span>
                    <span>This grooming date is already reserved. Please choose another date.</span>
                    {groomingAvailability.existing_appointment && (
                      <div className="existing-booking">
                        <small>Existing booking: {groomingAvailability.existing_appointment.pet_name} - {groomingAvailability.existing_appointment.service}</small>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {availabilityLoading && (
              <div className="availability-loading">
                <span>Checking availability...</span>
              </div>
            )}

            <input
              type="time"
              name="request_time"
              value={formData.request_time}
              onChange={handleChange}
              required
            />

            <textarea
              name="notes"
              placeholder="Notes or special instructions"
              value={formData.notes}
              onChange={handleChange}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "my" && (
        <div className="grooming-card">
          {appointments.length === 0 ? (
            <p>No grooming appointments yet.</p>
          ) : (
            appointments.map((item) => (
              <div key={item.id} className="grooming-item">
                <h3>{item.pet}</h3>
                <p>Service: {item.service}</p>
                <p>Date: {item.date}</p>
                <p>Time: {item.time}</p>
                <p>Notes: {item.notes || "None"}</p>

                <span className={`status ${item.status}`}>
                  {item.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};

export default GroomingForm;
