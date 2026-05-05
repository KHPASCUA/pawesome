import React, { useEffect, useMemo, useState } from "react";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSearch,
  FaEye,
  FaUndoAlt,
  FaPaw,
  FaCut,
  FaHotel,
  FaStethoscope,
  FaCashRegister,
} from "react-icons/fa";
import DashboardProfile from "../shared/DashboardProfile";
import "./ReceptionistDashboard.css";
import { apiRequest, uploadProfilePhoto } from "../../api/client";

const ReceptionistDashboard = () => {
  const name = localStorage.getItem("name") || "Receptionist";
  const profilePhoto = localStorage.getItem("profile_photo") || "";
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleProfilePhotoUpload = async (file) => {
    try {
      const data = await uploadProfilePhoto(file);
      localStorage.setItem("profile_photo", data.url || data.profile_photo);
      window.location.reload();
    } catch (err) {
      alert("Failed to upload profile photo: " + err.message);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/receptionist/requests", {
        method: "GET",
      });
      
      // Transform backend data to match frontend format
      const requestData = Array.isArray(data) ? data : (data.requests || []);
      const transformedRequests = requestData.map((item) => ({
        id: `REQ-${item.id}`,
        customer: item.customer,
        pet: item.pet,
        service: item.service,
        type: item.type,
        date: item.date,
        time: item.time,
        status: item.status,
        payment: item.payment === "unpaid" ? "unpaid" : item.payment === "paid" ? "paid" : "pending",
        notes: item.notes || "",
      }));
      
      setRequests(transformedRequests);
    } catch (err) {
      console.error("Fetch requests error:", err);
      setError(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((item) => item.status === "pending").length,
      approved: requests.filter((item) => item.status === "approved").length,
      rejected: requests.filter((item) => item.status === "rejected").length,
      paymentPending: requests.filter((item) => item.payment === "pending").length,
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const safeSearch = (searchTerm || "").toLowerCase();

    return (requests || []).filter((item) => {
      const customer = (item.customer || "").toLowerCase();
      const pet = (item.pet || "").toLowerCase();
      const service = (item.service || "").toLowerCase();
      const id = (item.id || "").toLowerCase();

      const matchesSearch =
        customer.includes(safeSearch) ||
        pet.includes(safeSearch) ||
        service.includes(safeSearch) ||
        id.includes(safeSearch);

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      
      const matchesType =
        typeFilter === "all" || item.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [requests, searchTerm, statusFilter, typeFilter]);

  const updateStatus = async (id, newStatus) => {
    try {
      // Extract numeric ID from REQ-{id} format
      const numericId = id.replace("REQ-", "");
      
      let endpoint = "";
      if (newStatus === "approved") {
        endpoint = `/receptionist/requests/${numericId}/status`;
      } else if (newStatus === "rejected") {
        endpoint = `/receptionist/requests/${numericId}/status`;
      } else if (newStatus === "pending") {
        endpoint = `/receptionist/requests/${numericId}/status`;
      }

      await apiRequest(endpoint, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      
      // Refresh the requests after update
      await fetchRequests();
    } catch (err) {
      console.error("Update status error:", err);
      alert("Failed to update request status");
    }
  };

  const getServiceIcon = (type) => {
    if (type === "grooming") return <FaCut />;
    if (type === "hotel") return <FaHotel />;
    if (type === "vet") return <FaStethoscope />;
    return <FaPaw />;
  };

  return (
    <div className="receptionist-dashboard">
      <header className="receptionist-navbar">
        <div className="navbar-left">
          <h1>Receptionist Dashboard</h1>
        </div>
        <div className="navbar-actions">
          <DashboardProfile
            name={name}
            role="Receptionist"
            image={profilePhoto}
            onUpload={handleProfilePhotoUpload}
          />
        </div>
      </header>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner">Loading requests...</div>
        </div>
      ) : error ? (
        <div className="error-state">
          <div className="error-message">{error}</div>
          <button onClick={fetchRequests} className="retry-btn">Retry</button>
        </div>
      ) : (
        <>
          <section className="receptionist-hero fade-up">
            <div>
              <span className="hero-badge">Receptionist Portal</span>
              <h1>Receptionist Dashboard</h1>
              <p>
                Manage customer bookings, approve service requests, and forward
                approved transactions to cashier and service departments.
              </p>
            </div>

            <div className="hero-mini-card">
              <FaCalendarCheck />
              <div>
                <strong>{stats.pending}</strong>
                <span>Pending approvals</span>
              </div>
            </div>
          </section>

          <section className="receptionist-stats">
            <div className="receptionist-stat-card fade-up">
              <FaPaw />
              <div>
                <h3>{stats.total}</h3>
                <p>Total Requests</p>
              </div>
            </div>

            <div className="receptionist-stat-card fade-up">
              <FaClock />
              <div>
                <h3>{stats.pending}</h3>
                <p>Pending</p>
              </div>
            </div>

            <div className="receptionist-stat-card fade-up">
              <FaCheckCircle />
              <div>
                <h3>{stats.approved}</h3>
                <p>Approved</p>
              </div>
            </div>

            <div className="receptionist-stat-card fade-up">
              <FaTimesCircle />
              <div>
                <h3>{stats.rejected}</h3>
                <p>Rejected</p>
              </div>
            </div>

            <div className="receptionist-stat-card fade-up">
              <FaCashRegister />
              <div>
                <h3>{stats.paymentPending}</h3>
                <p>For Payment</p>
              </div>
            </div>
          </section>

          <section className="receptionist-toolbar fade-up">
            <div className="receptionist-search">
              <FaSearch />
              <input
                type="text"
                placeholder="Search request, customer, pet, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Services</option>
              <option value="vet">Veterinary</option>
              <option value="grooming">Grooming</option>
              <option value="hotel">Hotel/Boarding</option>
            </select>
          </section>

          <section className="request-table-card fade-up">
            <div className="table-header">
              <div>
                <h2>Customer Requests</h2>
                <p>Receptionist approval is required before payment and service.</p>
              </div>
            </div>

            <div className="table-scroll">
              <table className="request-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Service</th>
                    <th>Customer</th>
                    <th>Pet</th>
                    <th>Schedule</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="request-id">{item.id}</span>
                      </td>

                      <td>
                        <div className="service-cell">
                          <span>{getServiceIcon(item.type)}</span>
                          {item.service}
                        </div>
                      </td>

                      <td>{item.customer}</td>
                      <td>{item.pet}</td>
                      <td>
                        <strong>{item.date}</strong>
                        <small>{item.time}</small>
                      </td>

                      <td>
                        <span className={`status-pill ${item.status}`}>
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <span className={`payment-pill ${item.payment}`}>
                          {item.payment}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            className="view"
                            onClick={() => setSelectedRequest(item)}
                            title="View"
                          >
                            <FaEye />
                          </button>

                          <button
                            className="approve"
                            onClick={() => updateStatus(item.id, "approved")}
                            title="Approve"
                            disabled={item.status === "approved"}
                          >
                            <FaCheckCircle />
                          </button>

                          <button
                            className="reject"
                            onClick={() => updateStatus(item.id, "rejected")}
                            title="Reject"
                            disabled={item.status === "rejected"}
                          >
                            <FaTimesCircle />
                          </button>

                          <button
                            className="reset"
                            onClick={() => updateStatus(item.id, "pending")}
                            title="Back to Pending"
                          >
                            <FaUndoAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRequests.length === 0 && (
                <div className="empty-state">
                  <FaSearch />
                  <h3>No requests found</h3>
                  <p>Try changing your search keyword or status filter.</p>
                </div>
              )}
            </div>
          </section>

          {selectedRequest && (
            <div
              className="request-modal-overlay"
              onClick={() => setSelectedRequest(null)}
            >
              <div
                className="request-modal fade-up"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="request-modal-header">
                  <div>
                    <span className="hero-badge">Request Details</span>
                    <h2>{selectedRequest.id}</h2>
                  </div>

                  <button onClick={() => setSelectedRequest(null)}>×</button>
                </div>

                <div className="request-modal-body">
                  <p>
                    <strong>Customer:</strong> {selectedRequest.customer}
                  </p>
                  <p>
                    <strong>Pet:</strong> {selectedRequest.pet}
                  </p>
                  <p>
                    <strong>Service:</strong> {selectedRequest.service}
                  </p>
                  <p>
                    <strong>Schedule:</strong> {selectedRequest.date} at{" "}
                    {selectedRequest.time}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={`status-pill ${selectedRequest.status}`}>
                      {selectedRequest.status}
                    </span>
                  </p>
                  <p>
                    <strong>Payment:</strong>{" "}
                    <span className={`payment-pill ${selectedRequest.payment}`}>
                      {selectedRequest.payment}
                    </span>
                  </p>
                  <p>
                    <strong>Notes:</strong> {selectedRequest.notes}
                  </p>
                </div>

                <div className="request-modal-actions">
                  <button
                    className="approve-action"
                    onClick={() => {
                      updateStatus(selectedRequest.id, "approved");
                      setSelectedRequest(null);
                    }}
                  >
                    Approve Request
                  </button>

                  <button
                    className="reject-action"
                    onClick={() => {
                      updateStatus(selectedRequest.id, "rejected");
                      setSelectedRequest(null);
                    }}
                  >
                    Reject Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReceptionistDashboard;
