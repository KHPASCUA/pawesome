import React, { useEffect, useState, useCallback } from "react";
import "./GroomingForm.css";

const GroomingForm = () => {
  const [activeTab, setActiveTab] = useState("book");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

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

      const response = await fetch(
        `http://127.0.0.1:8000/api/customer/my-requests?email=${customerEmail}`
      );
      const data = await response.json();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/api/customer/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

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