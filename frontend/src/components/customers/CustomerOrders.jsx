import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faSearch,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faCreditCard,
  faReceipt,
  faEye,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import "./CustomerOrders.css";
import { apiRequest } from "../../api/client";

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/customer/store/orders");
      setOrders(Array.isArray(data) ? data : (data.orders || []));
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load orders");
      console.error("Customer orders fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <FontAwesomeIcon icon={faClock} className="status-icon pending" />;
      case "approved":
        return <FontAwesomeIcon icon={faCheckCircle} className="status-icon approved" />;
      case "rejected":
        return <FontAwesomeIcon icon={faTimesCircle} className="status-icon rejected" />;
      case "completed":
        return <FontAwesomeIcon icon={faCheckCircle} className="status-icon completed" />;
      default:
        return <FontAwesomeIcon icon={faClock} className="status-icon" />;
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "unpaid":
        return <FontAwesomeIcon icon={faTimesCircle} className="status-icon unpaid" />;
      case "pending":
        return <FontAwesomeIcon icon={faClock} className="status-icon pending" />;
      case "paid":
        return <FontAwesomeIcon icon={faCheckCircle} className="status-icon paid" />;
      case "rejected":
        return <FontAwesomeIcon icon={faTimesCircle} className="status-icon rejected" />;
      default:
        return <FontAwesomeIcon icon={faClock} className="status-icon" />;
    }
  };

  const getActionButtons = (order) => {
    const buttons = [];

    // View Details button (always available)
    buttons.push(
      <button key="view" className="action-btn primary" onClick={() => viewOrderDetails(order)}>
        <FontAwesomeIcon icon={faEye} />
        View Details
      </button>
    );

    // Upload Payment Proof button (only for approved + unpaid orders)
    if (order.status === "approved" && order.payment_status === "unpaid") {
      buttons.push(
        <button key="payment" className="action-btn warning" onClick={() => uploadPaymentProof(order)}>
          <FontAwesomeIcon icon={faCreditCard} />
          Upload Payment
        </button>
      );
    }

    // View Receipt button (only for paid orders)
    if (order.payment_status === "paid") {
      buttons.push(
        <button key="receipt" className="action-btn success" onClick={() => viewReceipt(order)}>
          <FontAwesomeIcon icon={faReceipt} />
          View Receipt
        </button>
      );
    }

    return buttons;
  };

  const viewOrderDetails = (order) => {
    // Could open a modal or navigate to detailed view
    alert(`Order #${order.order_id}\nItems: ${order.items?.length || 0}\nTotal: ₱${order.total_amount || 0}`);
  };

  const uploadPaymentProof = (order) => {
    // Navigate to payment upload page with order pre-selected
    window.location.href = `/customer/payments?order_id=${order.id}`;
  };

  const viewReceipt = (order) => {
    // Navigate to receipt view
    window.location.href = `/customer/store/orders/${order.id}/receipt`;
  };

  const filteredOrders = orders.filter((order) => {
    const keyword = searchTerm.toLowerCase();
    return (
      order.order_id?.toLowerCase().includes(keyword) ||
      order.reference_number?.toLowerCase().includes(keyword) ||
      order.customer_name?.toLowerCase().includes(keyword) ||
      order.status?.toLowerCase().includes(keyword)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="customer-orders">
        <div className="orders-loading">
          <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner" />
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-orders">
        <div className="orders-error">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <h3>Failed to load orders</h3>
          <p>{error}</p>
          <button onClick={fetchOrders} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-orders">
      <section className="orders-hero">
        <span className="orders-badge">Customer Portal</span>
        <h1>My Orders</h1>
        <p>
          Track your store orders, upload payment proof after approval, and view receipts.
        </p>
      </section>

      <section className="orders-toolbar">
        <div className="orders-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search order number, reference, or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section className="orders-grid">
        {filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <FontAwesomeIcon icon={faBox} />
            <h3>No orders found</h3>
            <p>
              {searchTerm
                ? "No orders match your search criteria."
                : "You haven't placed any store orders yet."}
            </p>
            <button 
              onClick={() => window.location.href = "/customer/store"}
              className="shop-now-btn"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.order_id || order.id}</h3>
                  <p>{formatDate(order.created_at)}</p>
                </div>
                <div className="order-amount">
                  <strong>₱{order.total_amount || 0}</strong>
                  <small>Total Amount</small>
                </div>
              </div>

              <div className="order-details">
                <div className="order-meta">
                  <span className={`order-status ${order.status}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                  <span className={`payment-status ${order.payment_status}`}>
                    {getPaymentStatusIcon(order.payment_status)}
                    {order.payment_status}
                  </span>
                </div>

                <div className="order-customer">
                  <strong>Customer:</strong> {order.customer_name || "Guest"}
                </div>

                <div className="order-reference">
                  <strong>Reference:</strong> {order.reference_number || "N/A"}
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="order-items">
                    <strong>Items ({order.items.length}):</strong>
                    <div className="items-list">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="order-item">
                          <span>{item.name || item.product_name}</span>
                          <small>Qty: {item.quantity} × ₱{item.price}</small>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <small className="more-items">+{order.items.length - 3} more items</small>
                      )}
                    </div>
                  </div>
                )}

                {order.rejection_reason && (
                  <div className="order-rejection">
                    <strong>Rejection Reason:</strong> {order.rejection_reason}
                  </div>
                )}

                {order.cashier_remarks && (
                  <div className="order-remarks">
                    <strong>Cashier Remarks:</strong> {order.cashier_remarks}
                  </div>
                )}
              </div>

              <div className="order-actions">
                {getActionButtons(order)}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};

export default CustomerOrders;
