import React, { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api/client";
import { normalizeList } from "../../utils/normalizeList";
import "./CustomerPayments.css";

const formatCurrency = (value) =>
  `₱${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const canUploadProof = (order) => {
  const orderStatus = order.order_status || order.status;
  const paymentStatus = order.payment_status || "unpaid";
  return orderStatus === "approved" && ["unpaid", "rejected"].includes(paymentStatus);
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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/customer/store/orders");
      setOrders(normalizeList(data, ["orders", "data"]));
    } catch (err) {
      console.error("Failed to load customer payments:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const summary = useMemo(() => {
    const paidOrders = orders.filter((order) => (order.payment_status || "unpaid") === "paid");
    const pendingCount = orders.filter((order) => (order.payment_status || "unpaid") === "pending").length;

    return {
      totalTransactions: orders.length,
      totalPaid: paidOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
      pendingCount,
    };
  }, [orders]);

  const uploadProof = async (order) => {
    const payment_proof = window.prompt("Enter payment proof filename/reference:");
    if (!payment_proof) return;

    const payment_reference = window.prompt("Enter payment reference number (optional):") || "";

    try {
      setUploadingId(order.id);
      await apiRequest(`/customer/store/orders/${order.id}/payment-proof`, {
        method: "POST",
        body: JSON.stringify({
          payment_method: order.payment_method || "Online Payment",
          payment_reference,
          payment_proof,
        }),
      });
      await fetchOrders();
    } catch (err) {
      alert(err.message || "Failed to upload payment proof.");
    } finally {
      setUploadingId(null);
    }
  };

  const viewReceipt = async (order) => {
    try {
      const data = await apiRequest(`/customer/store/orders/${order.id}/receipt`);
      const receipt = data?.receipt;
      if (!receipt) throw new Error("Receipt details not found.");

      alert(
        `Receipt ${receipt.receipt_number}\n` +
          `Order #${receipt.order_id}\n` +
          `Amount: ${formatCurrency(receipt.total_amount)}\n` +
          `Paid At: ${receipt.paid_at || "N/A"}\n` +
          `Verified By: ${receipt.verified_by || "Cashier"}\n` +
          `Remarks: ${receipt.cashier_remarks || "None"}`
      );
    } catch (err) {
      alert(err.message || "Receipt is not available yet.");
    }
  };

  return (
    <section className="customer-payments-page">
      <header className="customer-payments-header">
        <div>
          <span className="customer-payments-kicker">Customer Portal</span>
          <h3>Payment History</h3>
          <p>Track order payments and upload proof only after receptionist approval.</p>
        </div>
      </header>

      <div className="customer-payments-summary-grid">
        <article className="customer-payment-summary-card">
          <div className="summary-icon">#</div>
          <div>
            <h4>{summary.totalTransactions}</h4>
            <p>Total Orders</p>
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
            <span className="customer-payments-kicker">Orders</span>
            <h4>Store Order Payments</h4>
            <p>Cashier verification is required before payment becomes paid.</p>
          </div>
        </div>

        <div className="customer-payments-table-wrapper">
          <table className="customer-payments-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Order</th>
                <th>Payment</th>
                <th>Proof</th>
                <th>Receipt / Remarks</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8">Loading payments...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8">No store orders yet.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.id}</strong>
                    </td>
                    <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}</td>
                    <td>{(order.items || []).map((item) => `${item.product_name} x${item.quantity}`).join(", ") || "N/A"}</td>
                    <td className="payment-amount">{formatCurrency(order.total_amount)}</td>
                    <td>
                      <span className={`payment-status ${(order.order_status || order.status || "pending").toLowerCase()}`}>
                        {order.order_status || order.status || "pending"}
                        {orderLabels[order.order_status || order.status] ? ` - ${orderLabels[order.order_status || order.status]}` : ""}
                      </span>
                    </td>
                    <td>
                      <span className={`payment-status ${(order.payment_status || "unpaid").toLowerCase()}`}>
                        {paymentLabels[order.payment_status || "unpaid"] || order.payment_status || "unpaid"}
                      </span>
                    </td>
                    <td>
                      {canUploadProof(order) ? (
                        <button
                          type="button"
                          className="receipt-btn"
                          disabled={uploadingId === order.id}
                          onClick={() => uploadProof(order)}
                        >
                          {uploadingId === order.id ? "Uploading..." : "Upload Proof"}
                        </button>
                      ) : (
                        order.payment_proof || "Not allowed yet"
                      )}
                    </td>
                    <td>
                      {order.payment_status === "paid" ? (
                        <button type="button" className="receipt-btn" onClick={() => viewReceipt(order)}>
                          {order.receipt_number || "View Receipt"}
                        </button>
                      ) : (
                        <>
                          {order.rejection_reason && <div>Reason: {order.rejection_reason}</div>}
                          {order.cashier_remarks && <div>Cashier: {order.cashier_remarks}</div>}
                          {order.paid_at && <div>Paid: {new Date(order.paid_at).toLocaleString()}</div>}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default CustomerPayments;
