import React, { useEffect, useState, useCallback } from "react";
import "./VetForm.css";

const VetForm = () => {
  const [activeTab, setActiveTab] = useState("book");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const customerEmail = localStorage.getItem("email");
  const customerName = localStorage.getItem("name") || "Customer";

  const [formData, setFormData] = useState({
    customer_name: customerName,
    customer_email: customerEmail || "",
    pet_name: "",
    service_type: "vet",
    service_name: "Checkup",
    request_date: "",
    request_time: "",
    notes: "",
  });

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/customer/my-requests?email=${customerEmail}`
      );
      const data = await response.json();
      
      // Filter only vet requests
      const vetOnly = data.requests.filter(item => item.type === "vet");
      setAppointments(vetOnly);
    } catch (error) {
      console.error("Failed to load vet appointments:", error);
    }
  }, [customerEmail]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
        alert("Vet appointment submitted! Waiting for receptionist approval.");

        setFormData({
          customer_name: customerName,
          customer_email: customerEmail || "",
          pet_name: "",
          service_type: "vet",
          service_name: "Checkup",
          request_date: "",
          request_time: "",
          notes: "",
        });

        await fetchAppointments();
        setActiveTab("my");
      } else {
        alert(data.message || "Failed to submit vet appointment");
      }
    } catch (error) {
      alert("Failed to submit vet appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="vet-container">
      <div className="vet-header">
        <h1>Veterinary Appointment</h1>
        <p>Book checkups, vaccinations, and veterinary services for your pet.</p>
      </div>

      <div className="vet-tabs">
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
        <div className="vet-card">
          <h2>Vet Appointment Form</h2>

          <form className="vet-form" onSubmit={handleSubmit}>
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
              <option value="Checkup">Checkup</option>
              <option value="Vaccination">Vaccination</option>
              <option value="Surgery">Surgery</option>
              <option value="Dental">Dental Cleaning</option>
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
              placeholder="Describe pet concern or symptoms"
              value={formData.notes}
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "my" && (
        <div className="vet-card">
          {appointments.length === 0 ? (
            <p>No vet appointments yet.</p>
          ) : (
            appointments.map((item) => (
              <div key={item.id} className="vet-item">
                <h3>{item.pet_name}</h3>
                <p>Service: {item.service_name}</p>
                <p>Date: {item.request_date}</p>
                <p>Time: {item.request_time}</p>
                <p>Concern: {item.notes || "None"}</p>

                <span className={`vet-status ${item.status}`}>
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

export default VetForm;