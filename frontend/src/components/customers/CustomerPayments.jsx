import React, { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api/client";
import "./CustomerPayments.css";

const formatCurrency = (value) =>
  `₱${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;


const getStatus = (item) =>
  String(item.order_status || item.status || item.request_status || "pending").toLowerCase();

const getPaymentStatus = (item) =>
  String(item.payment_status || "unpaid").toLowerCase();

const canUploadProof = (item) => {
  const status = getStatus(item);
  const paymentStatus = getPaymentStatus(item);

  return status === "approved" && ["unpaid", "rejected"].includes(paymentStatus);
};

const orderLabels = {
  pending: "Waiting for approval",
  approved: "Approved, ready for payment",
  rejected: "Rejected",
  cancelled: "Cancelled",
  completed: "Completed",
};

const paymentLabels = {
  unpaid: "Not yet paid",
  pending: "Under cashier verification",
  paid: "Payment verified",
  rejected: "Payment rejected",
  refunded: "Refunded",
};

const CustomerPayments = () => {
  console.log("✅ REAL CustomerPayments.jsx is rendering");
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [error, setError] = useState("");

  
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const email = localStorage.getItem("email") || "customer@example.com";

      const result = await apiRequest(
        `/customer/my-requests?email=${encodeURIComponent(email)}`,
        "GET"
      );

      console.log("CUSTOMER PAYMENT REQUESTS RESULT:", result);

      const requests = Array.isArray(result)
        ? result
        : result.requests ||
          result.service_requests ||
          result.data ||
          [];

      const payableRequests = requests
        .filter((request) => {
          const status = String(request.status || "").toLowerCase();
          const paymentStatus = String(
            request.payment_status || request.payment || "unpaid"
          ).toLowerCase();

          console.log(`FILTERING REQUEST ${request.id}: status=${status}, payment_status=${paymentStatus}`);

          return (
            status === "approved" &&
            ["unpaid", "pending", "rejected", "paid"].includes(paymentStatus)
          );
        })
        .map((request) => ({
          ...request,
          payment_source: "service_request",
          display_id: `REQ-${request.id}`,
          display_type: "Service Request",
          display_name:
            request.service_name ||
            request.service ||
            request.request_type ||
            request.service_type ||
            "Service Request",
          total_amount:
            request.total_amount ||
            request.price ||
            request.service_price ||
            request.amount ||
            500,
          order_status: request.status || "approved",
          payment_status: request.payment_status || request.payment || "unpaid",
          items: [
            {
              product_name:
                request.service_name ||
                request.service ||
                request.request_type ||
                request.service_type ||
                "Service Request",
              quantity: 1,
            },
          ],
        }));

      console.log("PAYABLE SERVICE REQUESTS:", payableRequests);

      setPayments(payableRequests);
    } catch (err) {
      console.error("LOAD CUSTOMER PAYMENTS ERROR:", err);
      setError(err.message || "Failed to load payments.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("CustomerPayments mounted");
    fetchPayments();
  }, []);

  const summary = useMemo(() => {
    const paid = payments.filter((item) => getPaymentStatus(item) === "paid");
    const pending = payments.filter((item) => getPaymentStatus(item) === "pending");

    return {
      totalTransactions: payments.length,
      totalPaid: paid.reduce((sum, item) => sum + Number(item.total_amount || 0), 0),
      pendingCount: pending.length,
    };
  }, [payments]);

  const uploadProof = async (payment, file) => {
    if (!file) return;

    try {
      setUploadingId(`${payment.payment_source}-${payment.id}`);

      const formData = new FormData();
      formData.append("payment_method", "Online Payment");
      formData.append("payment_reference", `REF-${Date.now()}`);
      formData.append("payment_proof", file);

      if (payment.payment_source === "service_request") {
        await apiRequest(`/customer/requests/${payment.id}/payment-proof`, "POST", formData);
      } else {
        await apiRequest(`/customer/store/orders/${payment.id}/payment-proof`, "POST", formData);
      }

      alert("Payment proof uploaded. Waiting for cashier verification.");
      await fetchPayments();
    } catch (err) {
      console.error("UPLOAD PAYMENT PROOF ERROR:", err);
      alert(err.message || "Failed to upload payment proof.");
    } finally {
      setUploadingId(null);
    }
  };

  const handleFileSelect = (payment, event) => {
    const file = event.target.files[0];
    if (file) {
      uploadProof(payment, file);
    }
    // Reset file input
    event.target.value = '';
  };

  const viewReceipt = async (payment) => {
    try {
      if (payment.payment_source === "service_request" || payment.type === "service_request" || payment.payable_type === "service_request") {
        const data = await apiRequest(`/customer/requests/${payment.id}/receipt`, "GET");

        const receipt = data?.receipt || data?.data || data;

        if (!receipt) {
          throw new Error("Service receipt is not available yet.");
        }

        alert(
          `Receipt ${receipt.receipt_number || payment.receipt_number}\n` +
            `Service Request #${receipt.request_id || payment.id}\n` +
            `Service: ${receipt.service_type || receipt.request_type || receipt.service_name || "Service"}\n` +
            `Pet: ${receipt.pet_name || payment.pet_name || "N/A"}\n` +
            `Amount: ${formatCurrency(receipt.total_amount || payment.total_amount)}\n` +
            `Paid At: ${receipt.paid_at || payment.paid_at || "N/A"}\n` +
            `Verified By: ${receipt.verified_by || "Cashier"}\n` +
            `Remarks: ${receipt.cashier_remarks || payment.cashier_remarks || "None"}`
        );

        return;
      }

      const data = await apiRequest(`/customer/store/orders/${payment.id}/receipt`, "GET");
      const receipt = data?.receipt;

      if (!receipt) {
        throw new Error("Receipt details not found.");
      }

      alert(
        `Receipt ${receipt.receipt_number}\n` +
          `Order #${payment.id}\n` +
          `Amount: ${formatCurrency(receipt.total_amount)}\n` +
          `Paid At: ${receipt.paid_at || "N/A"}\n` +
          `Verified By: ${receipt.verified_by || "Cashier"}\n` +
          `Remarks: ${receipt.cashier_remarks || "None"}`
      );
    } catch (err) {
      alert(err.message || "Receipt is not available yet.");
    }
  };

  console.log("RENDERING CUSTOMER PAYMENTS:");
  console.log("Loading:", loading);
  console.log("Error:", error);
  console.log("Payments length:", payments.length);

  return (
    <section className="customer-payments-page">
      <header className="customer-payments-header">
        <div>
          <span className="customer-payments-kicker">Customer Portal</span>
          <h3>Payment Center</h3>
          <p>
            Track approved store orders and service requests. Upload proof only after
            receptionist approval.
          </p>
        </div>

        <button type="button" className="customer-payments-main-btn" onClick={fetchPayments}>
          Refresh
        </button>
      </header>

      {error && (
        <div className="customer-payments-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{margin: '1rem 0', padding: '1rem', background: '#f0f0f0', borderRadius: '8px'}}>
        <strong>DEBUG INFO:</strong><br/>
        Loading: {loading ? 'Yes' : 'No'}<br/>
        Error: {error || 'None'}<br/>
        Payments Count: {payments.length}<br/>
        Email: {localStorage.getItem('email') || 'Not found'}
      </div>

      <div className="customer-payments-summary-grid">
        <article className="customer-payment-summary-card">
          <div className="summary-icon">#</div>
          <div>
            <h4>{summary.totalTransactions}</h4>
            <p>Total Payables</p>
          </div>
        </article>

        <article className="customer-payment-summary-card">
          <div className="summary-icon">₱</div>
          <div>
            <h4>{formatCurrency(summary.totalPaid)}</h4>
            <p>Total Paid</p>
          </div>
        </article>

        <article className="customer-payment-summary-card">
          <div className="summary-icon">...</div>
          <div>
            <h4>{summary.pendingCount}</h4>
            <p>Under Verification</p>
          </div>
        </article>
      </div>

      <div className="customer-payments-panel">
        <div className="customer-payments-panel-header">
          <div>
            <span className="customer-payments-kicker">Payments</span>
            <h4>Approved Orders & Service Requests</h4>
            <p>Cashier verification is required before payment becomes paid.</p>
          </div>
        </div>

        <div className="customer-payments-table-wrapper">
          <table className="customer-payments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Type</th>
                <th>Details</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Proof</th>
                <th>Receipt / Remarks</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9">Loading payments...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    No approved orders or service requests ready for payment yet.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const rowKey = `${payment.payment_source}-${payment.id}`;
                  const status = getStatus(payment);
                  const paymentStatus = getPaymentStatus(payment);

                  return (
                    <tr key={rowKey}>
                      <td>
                        <strong>{payment.display_id}</strong>
                      </td>

                      <td>
                        {payment.created_at
                          ? new Date(payment.created_at).toLocaleDateString("en-PH")
                          : "N/A"}
                      </td>

                      <td>
                        <span className="payment-method-badge">
                          {payment.payment_source === "service_request"
                            ? "Service"
                            : "Store"}
                        </span>
                      </td>

                      <td>
                        <strong>{payment.display_name}</strong>
                        {payment.pet_name && <div>Pet: {payment.pet_name}</div>}
                        {payment.customer_name && <div>Customer: {payment.customer_name}</div>}
                      </td>

                      <td className="payment-amount">
                        {formatCurrency(payment.total_amount)}
                      </td>

                      <td>
                        <span className={`payment-status ${status}`}>
                          {status}
                          {orderLabels[status] ? ` - ${orderLabels[status]}` : ""}
                        </span>
                      </td>

                      <td>
                        <span className={`payment-status ${paymentStatus}`}>
                          {paymentLabels[paymentStatus] || paymentStatus}
                        </span>
                      </td>

                      <td>
                        {canUploadProof(payment) ? (
                          <div>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileSelect(payment, e)}
                              disabled={uploadingId === rowKey}
                              style={{ display: 'none' }}
                              id={`file-upload-${rowKey}`}
                            />
                            <label
                              htmlFor={`file-upload-${rowKey}`}
                              className="receipt-btn"
                              style={{
                                display: 'inline-block',
                                cursor: uploadingId === rowKey ? 'not-allowed' : 'pointer',
                                opacity: uploadingId === rowKey ? 0.6 : 1
                              }}
                            >
                              {uploadingId === rowKey ? "Uploading..." : "Upload Proof"}
                            </label>
                          </div>
                        ) : (
                          payment.payment_proof ? (
                            <span style={{ color: '#16a34a', fontSize: '0.85rem' }}>
                              ✓ Proof uploaded
                            </span>
                          ) : (
                            "Not allowed yet"
                          )
                        )}
                      </td>

                      <td>
                        {paymentStatus === "paid" ? (
                          <button
                            type="button"
                            className="receipt-btn"
                            onClick={() => viewReceipt(payment)}
                          >
                            {payment.receipt_number || "View Receipt"}
                          </button>
                        ) : (
                          <>
                            {payment.rejection_reason && (
                              <div>Reason: {payment.rejection_reason}</div>
                            )}
                            {payment.cashier_remarks && (
                              <div>Cashier: {payment.cashier_remarks}</div>
                            )}
                            {payment.paid_at && (
                              <div>
                                Paid: {new Date(payment.paid_at).toLocaleString("en-PH")}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default CustomerPayments;
