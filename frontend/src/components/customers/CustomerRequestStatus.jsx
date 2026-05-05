import React, { useEffect, useState } from "react";
import {
  FaClipboardList,
  FaSearch,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaCashRegister,
  FaPaw,
} from "react-icons/fa";
import "./CustomerRequestStatus.css";
import { apiRequest } from "../../api/client";
import { normalizeList } from "../../utils/normalizeList";

const CustomerRequestStatus = () => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const email = localStorage.getItem("email");

      if (!email) {
        console.error("No email found in localStorage");
        setRequests([]);
        return;
      }

      const data = await apiRequest(`/customer/my-requests?email=${email}`);

      setRequests(normalizeList(data, ["requests", "service_requests", "grooming_requests"]));
    } catch (error) {
      console.error("Failed to fetch customer requests:", error);
    }
  };

  const filteredRequests = requests.filter((item) => {
    const keyword = searchTerm.toLowerCase();

    return (
      (item.customer || item.customer_name || "")?.toLowerCase().includes(keyword) ||
      (item.pet || item.pet_name || "")?.toLowerCase().includes(keyword) ||
      (item.service || item.service_name || "")?.toLowerCase().includes(keyword) ||
      String(item.id).toLowerCase().includes(keyword)
    );
  });

  const getStatusIcon = (status) => {
    if (status === "approved") return <FaCheckCircle />;
    if (status === "rejected") return <FaTimesCircle />;
    return <FaClock />;
  };

  return (
    <div className="customer-status-page">
      <section className="customer-status-hero">
        <span className="customer-status-badge">Customer Portal</span>
        <h1>My Booking Requests</h1>
        <p>
          Track your submitted pet service requests and see whether they are
          pending, approved, rejected, or waiting for payment.
        </p>
      </section>

      <section className="customer-status-toolbar">
        <div className="customer-status-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search request, pet, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section className="customer-status-grid">
        {filteredRequests.map((item) => (
          <div className="customer-status-card" key={item.id}>
            <div className="status-card-top">
              <div className="status-card-icon">
                <FaPaw />
              </div>

              <div>
                <h3>{item.service || item.service_name}</h3>
                <p>Request #{item.id}</p>
              </div>
            </div>

            <div className="status-card-details">
              <p>
                <strong>Customer:</strong> {item.customer || item.customer_name}
              </p>
              <p>
                <strong>Pet:</strong> {item.pet || item.pet_name || "N/A"}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {(item.date || item.request_date) ? new Date(item.date || item.request_date).toLocaleDateString() : "N/A"}
              </p>
              <p>
                <strong>Time:</strong> {item.time || item.request_time || "N/A"}
              </p>
            </div>

            <div className="status-card-footer">
              <span className={`customer-status-pill ${item.status}`}>
                {getStatusIcon(item.status)}
                {item.status}
              </span>

              <span className={`customer-payment-pill ${item.payment || item.payment_status || "unpaid"}`}>
                <FaCashRegister />
                {item.payment || item.payment_status || "unpaid"}
              </span>
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="customer-status-empty">
            <FaClipboardList />
            <h3>No requests found</h3>
            <p>Your booking requests will appear here after submission.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomerRequestStatus;
