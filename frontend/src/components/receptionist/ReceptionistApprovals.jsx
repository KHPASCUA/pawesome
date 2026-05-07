import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearch,
  FaPaw,
  FaUserMd,
} from "react-icons/fa";
import { apiRequest } from "../../api/client";
import "./ReceptionistApprovals.css";

const ReceptionistApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [vetAssignments, setVetAssignments] = useState({});
  const [vetError, setVetError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const isVetRequest = (item) => {
    const values = [
      item.request_type,
      item.service_type,
      item.type,
      item.category,
      item.service_name,
      item.service,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    return values.some(
      (value) =>
        value === "vet" ||
        value === "veterinary" ||
        value.includes("veterinary") ||
        value.includes("consult") ||
        value.includes("vaccination")
    );
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const result = await apiRequest("/receptionist/requests/pending", "GET");

      console.log("RECEPTIONIST PENDING REQUESTS RESULT:", result);

      const list = Array.isArray(result)
        ? result
        : result.requests ||
          result.service_requests ||
          result.data ||
          result.pending_requests ||
          [];

      console.log("NORMALIZED APPROVAL REQUESTS:", list);

      setRequests(list);
    } catch (error) {
      console.error("Failed to load approvals:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVeterinarians = async () => {
    try {
      const result = await apiRequest("/receptionist/veterinarians/available", "GET");
      const list = Array.isArray(result)
        ? result
        : result.veterinarians || result.data || [];

      setVeterinarians(Array.isArray(list) ? list : []);
      setVetError(
        Array.isArray(list) && list.length === 0
          ? "No active veterinarian accounts found. Create or activate a veterinarian before approving vet requests."
          : ""
      );
    } catch (error) {
      console.error("Failed to load veterinarians:", error);
      setVeterinarians([]);
      setVetError("Could not load veterinarians. Refresh the page before approving vet requests.");
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchVeterinarians();
  }, []);

  const handleApprove = async (item) => {
    const requestId = item.id;
    const veterinarianId = vetAssignments[requestId];
    const vetRequest = isVetRequest(item);

    if (vetRequest && !veterinarianId) {
      alert("Please choose a veterinarian before approving this vet request.");
      return;
    }

    try {
      const payload = {
        receptionist_remarks: "Approved by receptionist",
      };

      if (vetRequest) {
        payload.veterinarian_id = Number(veterinarianId);
      }

      await apiRequest(`/receptionist/requests/${requestId}/approve`, "POST", payload);

      alert("Request approved successfully.");
      setVetAssignments((current) => {
        const next = { ...current };
        delete next[requestId];
        return next;
      });
      await fetchRequests();
    } catch (error) {
      console.error("APPROVE REQUEST ERROR:", error);
      alert(error.message || "Failed to approve request.");
    }
  };

  const handleReject = async (requestId) => {
    const reason = window.prompt("Enter rejection reason:");

    if (!reason) return;

    try {
      await apiRequest(`/receptionist/requests/${requestId}/reject`, "POST", {
        rejection_reason: reason,
        receptionist_remarks: reason,
      });

      alert("Request rejected successfully.");
      await fetchRequests();
    } catch (error) {
      console.error("REJECT REQUEST ERROR:", error);
      alert(error.message || "Failed to reject request.");
    }
  };

  const filteredRequests = requests.filter((item) => {
    const keyword = searchTerm.toLowerCase();
    const requestType = item.request_type || item.service_type || item.type || "";
    const customerName = item.customer_name || item.customer || "";
    const petName = item.pet_name || item.pet || "";
    const serviceName = item.service_name || item.service || "";

    return (
      customerName.toLowerCase().includes(keyword) ||
      petName.toLowerCase().includes(keyword) ||
      serviceName.toLowerCase().includes(keyword) ||
      requestType.toLowerCase().includes(keyword)
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
            {filteredRequests.map((item) => {
              const vetRequest = isVetRequest(item);

              return (
              <div className="approval-item" key={item.id}>
                <div className="approval-main">
                  <span className={`type-pill ${item.request_type || item.service_type || item.type}`}>
                    {item.request_type || item.service_type || item.type}
                  </span>

                  <h3>{item.service_name || item.service}</h3>

                  <p>
                    <strong>Customer:</strong> {item.customer_name || item.customer}
                  </p>

                  <p>
                    <strong>Pet:</strong> {item.pet_name || item.pet || "N/A"}
                  </p>

                  <p>
                    <strong>Schedule:</strong>{" "}
                    {item.request_date || item.date || "No date"}{" "}
                    {item.request_time || item.time ? `at ${item.request_time || item.time}` : ""}
                  </p>

                  {item.notes && (
                    <p>
                      <strong>Notes:</strong> {item.notes}
                    </p>
                  )}

                  {vetRequest && (
                    <label className="vet-assignment-field">
                      <span>
                        <FaUserMd />
                        Veterinarian
                      </span>
                      <select
                        value={vetAssignments[item.id] || ""}
                        onChange={(event) =>
                          setVetAssignments((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                      >
                        <option value="">
                          {veterinarians.length ? "Choose veterinarian" : "No active vets"}
                        </option>
                        {veterinarians.map((vet) => (
                          <option key={vet.id} value={vet.id}>
                            {vet.name}
                          </option>
                        ))}
                      </select>
                      {vetError && <small>{vetError}</small>}
                    </label>
                  )}
                </div>

                <div className="approval-actions">
                  <button
                    className="approve-btn"
                    onClick={() => handleApprove(item)}
                    disabled={vetRequest && veterinarians.length === 0}
                  >
                    <FaCheckCircle />
                    Approve
                  </button>

                  <button
                    className="reject-btn"
                    onClick={() => handleReject(item.id)}
                  >
                    <FaTimesCircle />
                    Reject
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default ReceptionistApprovals;
