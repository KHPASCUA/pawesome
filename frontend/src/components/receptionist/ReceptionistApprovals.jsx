import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearch,
  FaPaw,
} from "react-icons/fa";
import { API_URL, apiRequest } from "../../api/client";
import "./ReceptionistApprovals.css";

const API_BASE = API_URL;

const ReceptionistApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const data = await apiRequest(
        "/receptionist/requests/pending",
        { method: "GET" },
        API_BASE
      );

      const list = Array.isArray(data)
        ? data
        : data.requests || data.data || [];

      setRequests(list);
    } catch (error) {
      console.error("Failed to load approvals:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await apiRequest(
        `/receptionist/requests/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
        API_BASE
      );

      await fetchRequests();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update request status.");
    }
  };

  const filteredRequests = requests.filter((item) => {
    const keyword = searchTerm.toLowerCase();

    return (
      item.customer_name?.toLowerCase().includes(keyword) ||
      item.pet_name?.toLowerCase().includes(keyword) ||
      item.service_name?.toLowerCase().includes(keyword) ||
      item.request_type?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="approvals-page">
      <section className="approvals-header">
        <div>
          <span className="approval-badge">Receptionist Approval</span>
          <h1>Booking & Order Approvals</h1>
          <p>
            Review customer requests before payment and service processing.
          </p>
        </div>
      </section>

      <section className="approvals-tools">
        <div className="approvals-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search customer, pet, service, or request type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section className="approval-card">
        <div className="approval-card-header">
          <div>
            <h2>Pending Requests</h2>
            <p>{filteredRequests.length} request(s) waiting for approval</p>
          </div>

          <div className="approval-counter">
            <FaClock />
            <span>{filteredRequests.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="approval-empty">
            <FaClock />
            <h3>Loading requests...</h3>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="approval-empty">
            <FaPaw />
            <h3>No pending requests found</h3>
            <p>New customer bookings and orders will appear here.</p>
          </div>
        ) : (
          <div className="approval-list">
            {filteredRequests.map((item) => (
              <div className="approval-item" key={item.id}>
                <div className="approval-main">
                  <span className={`type-pill ${item.request_type}`}>
                    {item.request_type}
                  </span>

                  <h3>{item.service_name}</h3>

                  <p>
                    <strong>Customer:</strong> {item.customer_name}
                  </p>

                  <p>
                    <strong>Pet:</strong> {item.pet_name || "N/A"}
                  </p>

                  <p>
                    <strong>Schedule:</strong>{" "}
                    {item.request_date || "No date"}{" "}
                    {item.request_time ? `at ${item.request_time}` : ""}
                  </p>

                  {item.notes && (
                    <p>
                      <strong>Notes:</strong> {item.notes}
                    </p>
                  )}
                </div>

                <div className="approval-actions">
                  <button
                    className="approve-btn"
                    onClick={() => updateStatus(item.id, "approved")}
                  >
                    <FaCheckCircle />
                    Approve
                  </button>

                  <button
                    className="reject-btn"
                    onClick={() => updateStatus(item.id, "rejected")}
                  >
                    <FaTimesCircle />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ReceptionistApprovals;
