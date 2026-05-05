import React, { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";
import CashierSidebar from "./CashierSidebar";
import { normalizeList } from "../../utils/normalizeList";
import "./CashierPaymentVerification.css";

const CashierPaymentVerification = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const data = await apiRequest("/cashier/payment-requests");

      const list = normalizeList(data, ["payments", "requests", "data"]);

      setRequests(list);
    } catch (err) {
      console.error("Failed to load payment requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (payment) => {
    try {
      const data = await apiRequest(`/cashier/payment-requests/${payment.id}/verify`, "POST", {
        type: payment.payable_type || payment.type || payment.payment_source || "service_request",
        cashier_remarks: "Payment verified by cashier",
      });

      alert(
        `Payment verified.\nReceipt: ${data.receipt_number || "Generated"}\nStatus: ${data.payment_status || "paid"}`
      );
      fetchRequests();
    } catch (err) {
      console.error("Failed to verify payment:", err);
      alert(err.message || "Failed to verify payment.");
    }
  };

  const rejectPayment = async (payment) => {
    const cashier_remarks = window.prompt("Reason for rejecting this payment proof:");
    if (cashier_remarks === null) return;

    try {
      await apiRequest(`/cashier/payment-requests/${payment.id}/reject`, "POST", {
        type: payment.payable_type || payment.type || payment.payment_source || "service_request",
        cashier_remarks,
        rejection_reason: cashier_remarks,
      });

      alert("Payment rejected.");
      fetchRequests();
    } catch (err) {
      console.error("Failed to reject payment:", err);
      alert(err.message || "Failed to reject payment.");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="app-dashboard cashier-payment-page">
      <CashierSidebar />

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
                        <th>Amount</th>
                        <th>Proof</th>
                        <th>Payment</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {requests.map((item) => (
                        <tr key={item.id}>
                          <td>{item.customer_name || item.customer?.name || "Customer"}</td>
                          <td>{item.request_type || item.type || "Request"}</td>
                          <td>{item.service_name || item.service?.name || item.order_name || "N/A"}</td>
                          <td>{item.request_date || item.date || "N/A"}</td>
                          <td>₱{Number(item.amount || item.total_amount || 0).toLocaleString("en-PH")}</td>
                          <td>
                            {item.proof_url ? (
                              <a
                                href={item.proof_url}
                                target="_blank"
                                rel="noreferrer"
                                className="proof-link"
                              >
                                View Proof
                              </a>
                            ) : item.payment_proof ? (
                              <a
                                href={`http://127.0.0.1:8000/storage/${item.payment_proof}`}
                                target="_blank"
                                rel="noreferrer"
                                className="proof-link"
                              >
                                View Proof
                              </a>
                            ) : (
                              "No proof"
                            )}
                          </td>
                          <td>
                            <span className={`status-badge ${String(item.payment_status || "pending").toLowerCase()}`}>
                              {item.payment_status || "pending"}
                            </span>
                          </td>
                          <td className="payment-actions">
                            <button
                              className="verify-btn"
                              type="button"
                              onClick={() => verifyPayment(item)}
                            >
                              Verify Payment
                            </button>
                            <button
                              className="reject-btn"
                              type="button"
                              onClick={() => rejectPayment(item)}
                            >
                              Reject
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
