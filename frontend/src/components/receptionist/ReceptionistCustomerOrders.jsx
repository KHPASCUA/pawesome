import React, { useEffect, useMemo, useState } from "react";
import "./ReceptionistCustomerOrders.css";
import Swal from "sweetalert2";
import { apiRequest } from "../../api/client";

const normalizeList = (result, keys = []) => {
  if (Array.isArray(result)) return result;

  for (const key of keys) {
    if (Array.isArray(result?.[key])) return result[key];
  }

  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.orders)) return result.orders;
  if (Array.isArray(result?.customer_orders)) return result.customer_orders;

  return [];
};

export default function ReceptionistCustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (paymentStatusFilter !== "all") params.append("payment_status", paymentStatusFilter);
      
      const endpoint = `/receptionist/customer-orders${params.toString() ? '?' + params.toString() : ''}`;
      const data = await apiRequest(endpoint);
      setOrders(normalizeList(data, ['data', 'orders', 'customer_orders']));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to load orders",
        text: err.message,
        confirmButtonColor: "#ff5f93",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentStatusFilter]); // fetchOrders is stable, no need to include it

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const keyword = searchTerm.toLowerCase();

      const matchesSearch =
        order.id?.toString().includes(keyword) ||
        order.order_number?.toString().includes(keyword) ||
        order.reference_number?.toString().includes(keyword) ||
        order.customer_name?.toLowerCase().includes(keyword) ||
        order.customer_email?.toLowerCase().includes(keyword) ||
        order.order_type?.toLowerCase().includes(keyword);

      return matchesSearch;
    });
  }, [orders, searchTerm]);

  const approveOrder = async (orderId) => {
    try {
      // First get order details to check stock
      const orderDetails = await apiRequest(`/receptionist/customer-orders/${orderId}`);
      
      if (!orderDetails.success || !orderDetails.data) {
        throw new Error("Failed to fetch order details");
      }

      const order = orderDetails.data;
      
      // Check for insufficient stock items
      const insufficientItems = order.items?.filter(item => !item.stock_available) || [];
      
      if (insufficientItems.length > 0) {
        const itemDetails = insufficientItems.map(item => 
          `${item.product_name}: Required ${item.quantity}, Available ${item.current_stock}`
        ).join('\n');
        
        await Swal.fire({
          icon: "error",
          title: "Insufficient Stock",
          html: `
            <div style="text-align: left;">
              <p>Cannot approve order due to insufficient stock:</p>
              <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 12px;">${itemDetails}</pre>
            </div>
          `,
          confirmButtonColor: "#ff5f93",
        });
        return;
      }

      const confirm = await Swal.fire({
        icon: "question",
        title: "Approve Order?",
        html: `
          <div style="text-align: left;">
            <p>Are you sure you want to approve this order?</p>
            <p><strong>Order:</strong> #${order.order_number || order.id}</p>
            <p><strong>Customer:</strong> ${order.customer_name}</p>
            <p><strong>Total:</strong> ₱${Number(order.total_amount || 0).toLocaleString()}</p>
            <p style="color: #10b981;">✅ All items have sufficient stock</p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Yes, Approve",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#10b981",
      });

      if (!confirm.isConfirmed) return;

      setUpdatingId(orderId);

      const result = await apiRequest(`/receptionist/customer-orders/${orderId}/approve`, "POST");

      if (result.success) {
        await Swal.fire({
          icon: "success",
          title: "Order Approved",
          html: `
            <div style="text-align: left;">
              <p>Order #${result.order_number || orderId} has been approved successfully!</p>
              <p style="color: #10b981;">✅ Stock has been deducted</p>
              <p>Customer can now upload payment proof.</p>
            </div>
          `,
          timer: 3000,
          showConfirmButton: false,
        });

        await fetchOrders();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Approval Failed",
        text: err.message || "Failed to approve order",
        confirmButtonColor: "#ff5f93",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const rejectOrder = async (orderId) => {
    const { value: reason } = await Swal.fire({
      icon: "warning",
      title: "Reject Order",
      input: "textarea",
      inputLabel: "Rejection Reason",
      inputPlaceholder: "Please provide a reason for rejection...",
      inputValidator: (value) => {
        if (!value) {
          return "Rejection reason is required";
        }
      },
      showCancelButton: true,
      confirmButtonText: "Reject Order",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });

    if (!reason) return;

    try {
      setUpdatingId(orderId);

      const result = await apiRequest(`/receptionist/customer-orders/${orderId}/reject`, "POST", {
        rejection_reason: reason
      });

      if (result.success) {
        await Swal.fire({
          icon: "success",
          title: "Order Rejected",
          html: `
            <div style="text-align: left;">
              <p>Order #${result.order_number || orderId} has been rejected.</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p style="color: #ef4444;">❌ Customer has been notified</p>
            </div>
          `,
          timer: 3000,
          showConfirmButton: false,
        });

        await fetchOrders();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Rejection Failed",
        text: err.message || "Failed to reject order",
        confirmButtonColor: "#ff5f93",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const cancelOrder = async (orderId) => {
    const { value: reason } = await Swal.fire({
      icon: "warning",
      title: "Cancel Order",
      input: "textarea",
      inputLabel: "Cancellation Reason",
      inputPlaceholder: "Please provide a reason for cancellation...",
      inputValidator: (value) => {
        if (!value) {
          return "Cancellation reason is required";
        }
      },
      showCancelButton: true,
      confirmButtonText: "Cancel Order",
      cancelButtonText: "Back",
      confirmButtonColor: "#f59e0b",
    });

    if (!reason) return;

    try {
      setUpdatingId(orderId);

      const result = await apiRequest(`/receptionist/customer-orders/${orderId}/cancel`, "POST", {
        cancellation_reason: reason
      });

      if (result.success) {
        await Swal.fire({
          icon: "success",
          title: "Order Cancelled",
          html: `
            <div style="text-align: left;">
              <p>Order #${result.order_number || orderId} has been cancelled.</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p style="color: #f59e0b;">🔄 Stock has been restored if applicable</p>
            </div>
          `,
          timer: 3000,
          showConfirmButton: false,
        });

        await fetchOrders();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Cancellation Failed",
        text: err.message || "Failed to cancel order",
        confirmButtonColor: "#ff5f93",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const result = await apiRequest(`/receptionist/customer-orders/${orderId}`);
      
      if (!result.success || !result.data) {
        throw new Error("Failed to fetch order details");
      }

      const order = result.data;
      
      Swal.fire({
        title: `Order #${order.order_number || order.id}`,
        html: `
          <div style="text-align: left;">
            <div style="margin-bottom: 20px;">
              <h4>Customer Information</h4>
              <p><strong>Name:</strong> ${order.customer_name}</p>
              <p><strong>Email:</strong> ${order.customer_email || 'N/A'}</p>
              <p><strong>Order Type:</strong> ${order.order_type || 'Pick-up'}</p>
              <p><strong>Total Amount:</strong> ₱${Number(order.total_amount || 0).toLocaleString()}</p>
              <p><strong>Payment Method:</strong> ${order.payment_method || 'N/A'}</p>
              <p><strong>Status:</strong> <span style="color: ${getStatusColor(order.status)}">${order.status?.toUpperCase() || 'PENDING'}</span></p>
              <p><strong>Payment Status:</strong> <span style="color: ${getPaymentStatusColor(order.payment_status)}">${order.payment_status?.toUpperCase() || 'UNPAID'}</span></p>
              <p><strong>Created:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            
            <div>
              <h4>Order Items</h4>
              ${order.items?.length ? order.items.map(item => `
                <div style="border: 1px solid #e5e7eb; padding: 10px; margin-bottom: 8px; border-radius: 5px;">
                  <p><strong>${item.product_name}</strong></p>
                  <p>Quantity: ${item.quantity} × ₱${Number(item.price).toLocaleString()} = ₱${Number(item.subtotal).toLocaleString()}</p>
                  <p>Current Stock: <span style="color: ${item.stock_available ? '#10b981' : '#ef4444'}">${item.current_stock} ${item.stock_available ? '✅' : '❌'}</span></p>
                </div>
              `).join('') : '<p>No items found</p>'}
            </div>
            
            ${order.rejection_reason ? `
              <div style="margin-top: 20px; padding: 10px; background: #fef2f2; border-radius: 5px;">
                <h4 style="color: #ef4444;">Rejection Reason</h4>
                <p>${order.rejection_reason}</p>
              </div>
            ` : ''}
          </div>
        `,
        width: "600px",
        confirmButtonColor: "#ff5f93",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
        confirmButtonColor: "#ff5f93",
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      approved: "#3b82f6",
      paid: "#10b981",
      preparing: "#8b5cf6",
      completed: "#22c55e",
      rejected: "#ef4444",
      cancelled: "#6b7280",
    };

    return colors[status] || "#6b7280";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      unpaid: "#f59e0b",
      pending: "#3b82f6",
      paid: "#10b981",
      rejected: "#ef4444",
    };

    return colors[status] || "#6b7280";
  };

  return (
    <div className="customer-orders">
      <div className="orders-header">
        <h2>🛍️ Customer Orders</h2>

        <button className="refresh-btn" onClick={fetchOrders}>
          🔄 Refresh
        </button>
      </div>

      <div className="orders-tools">
        <input
          type="text"
          placeholder="Search by order ID, customer, email, or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="paid">Paid</option>
          <option value="preparing">Preparing</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={paymentStatusFilter}
          onChange={(e) => setPaymentStatusFilter(e.target.value)}
        >
          <option value="all">All Payment Status</option>
          <option value="unpaid">Unpaid</option>
          <option value="pending">Payment Pending</option>
          <option value="paid">Paid</option>
          <option value="rejected">Payment Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="no-orders">
          <p>No matching orders found.</p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.id}</h3>
                  <p className="customer-name">
                    {order.customer_name || "Unknown Customer"}
                  </p>
                  <p className="customer-email">
                    {order.customer_email || "No email"}
                  </p>
                </div>

                <div className="order-status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status?.toUpperCase() || "PENDING"}
                  </span>
                </div>
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <span>Total:</span>
                  <strong>₱{Number(order.total_amount || 0).toLocaleString()}</strong>
                </div>

                <div className="detail-row">
                  <span>Type:</span>
                  <span>{order.order_type || "N/A"}</span>
                </div>

                <div className="detail-row">
                  <span>Payment:</span>
                  <span>{order.payment_method || "N/A"}</span>
                </div>

                <div className="detail-row">
                  <span>Date:</span>
                  <span>
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="order-items">
                <h4>Items:</h4>

                {order.items?.length ? (
                  order.items.map((item) => (
                    <div key={item.id} className="order-item">
                      <span>{item.product_name}</span>
                      <span>
                        {item.quantity} x ₱{item.price} = ₱{item.subtotal}
                      </span>
                    </div>
                  ))
                ) : (
                  <p>No items listed.</p>
                )}
              </div>

              <div className="order-actions">
                <button
                  className="action-btn view"
                  onClick={() => viewOrderDetails(order.id)}
                  disabled={updatingId === order.id}
                >
                  👁️ View Details
                </button>

                {order.status === "pending" && (
                  <>
                    <button
                      className="action-btn approve"
                      onClick={() => approveOrder(order.id)}
                      disabled={updatingId === order.id}
                    >
                      {updatingId === order.id ? "Processing..." : "✅ Approve"}
                    </button>

                    <button
                      className="action-btn reject"
                      onClick={() => rejectOrder(order.id)}
                      disabled={updatingId === order.id}
                    >
                      {updatingId === order.id ? "Processing..." : "❌ Reject"}
                    </button>

                    <button
                      className="action-btn cancel"
                      onClick={() => cancelOrder(order.id)}
                      disabled={updatingId === order.id}
                    >
                      {updatingId === order.id ? "Processing..." : "🔄 Cancel"}
                    </button>
                  </>
                )}

                {order.status === "approved" && (
                  <>
                    <div className="payment-status">
                      💳 Waiting for customer payment
                    </div>
                    <button
                      className="action-btn reject"
                      onClick={() => rejectOrder(order.id)}
                      disabled={updatingId === order.id}
                    >
                      {updatingId === order.id ? "Processing..." : "❌ Reject Order"}
                    </button>
                    <button
                      className="action-btn cancel"
                      onClick={() => cancelOrder(order.id)}
                      disabled={updatingId === order.id}
                    >
                      {updatingId === order.id ? "Processing..." : "🔄 Cancel Order"}
                    </button>
                  </>
                )}

                {(order.status === "rejected" || order.status === "cancelled") && (
                  <div className="status-info">
                    {order.status === "rejected" ? "❌ Order rejected" : "🔄 Order cancelled"}
                    {order.rejection_reason && (
                      <small>{order.rejection_reason}</small>
                    )}
                  </div>
                )}

                {order.status === "paid" && (
                  <div className="payment-status">
                    ✅ Paid - Ready for fulfillment
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
