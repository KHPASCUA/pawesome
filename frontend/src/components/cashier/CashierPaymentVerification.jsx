import React, { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";
import CashierSidebar from "./CashierSidebar";
import "./CashierPaymentVerification.css";

const CashierPaymentVerification = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/cashier/payment-requests");
      setRequests(data || []);
    } catch (err) {
      console.error("Failed to load payment requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (id) => {
    try {
      await apiRequest(`/api/cashier/payment-requests/${id}/verify`, {
        method: "PUT",
      });
      fetchRequests();
    } catch (err) {
      console.error("Failed to verify payment:", err);
      alert("Failed to verify payment.");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="app-dashboard">
      <aside className="app-sidebar">
        <CashierSidebar />
      </aside>

      <main className="app-main">
        <header className="app-topbar">
          <div>
            <h1>Payment Verification</h1>
            <p>Verify and process approved bookings and orders</p>
          </div>
        </header>

        <section className="app-content">
          <div className="cashier-payment-verification">
            <div className="payment-hero premium-card fade-up">
              <h1>Approved Requests</h1>
              <p>Process payments for customer-approved bookings and orders</p>
              <div className="badge badge-info">Payment Control Panel</div>
            </div>

            {loading ? (
              <div className="loading-container">
                <p>Loading payment requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="payment-card">
                <p>No approved requests pending payment.</p>
              </div>
            ) : (
              <div className="payment-card">
                <h2>Pending Payments</h2>
                <div className="payment-table-wrapper">
                  <table className="payment-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Type</th>
                        <th>Service / Order</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {requests.map((item) => (
                        <tr key={item.id}>
                          <td>{item.customer_name}</td>
                          <td>{item.request_type}</td>
                          <td>{item.service_name}</td>
                          <td>{item.request_date}</td>
                          <td>
                            <span className={`status-badge ${item.status}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="payment-actions">
                            <button
                              className="verify-btn"
                              onClick={() => verifyPayment(item.id)}
                            >
                              Verify Payment
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CashierPaymentVerification;
