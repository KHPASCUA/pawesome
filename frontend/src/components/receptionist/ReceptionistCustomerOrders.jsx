import React, { useEffect, useMemo, useState } from "react";
import "./ReceptionistCustomerOrders.css";
import Swal from "sweetalert2";

export default function ReceptionistCustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
        "http://127.0.0.1:8000/api";

      const res = await fetch(`${apiUrl}/receptionist/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch orders");
      }

      setOrders(data.orders || data.data || data || []);
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
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const keyword = searchTerm.toLowerCase();

      const matchesSearch =
        order.id?.toString().includes(keyword) ||
        order.customer_name?.toLowerCase().includes(keyword) ||
        order.customer_email?.toLowerCase().includes(keyword) ||
        order.order_type?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const updateStatus = async (orderId, status) => {
    const confirm = await Swal.fire({
      icon: status === "rejected" ? "warning" : "question",
      title: "Confirm Status Update",
      text: `Do you want to mark this order as ${status}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, continue",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ff5f93",
    });

    if (!confirm.isConfirmed) return;

    setUpdatingId(orderId);

    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
        "http://127.0.0.1:8000/api";

      const res = await fetch(`${apiUrl}/receptionist/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update status");
      }

      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Order marked as ${status}`,
        timer: 1500,
        showConfirmButton: false,
      });

      await fetchOrders();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
        confirmButtonColor: "#ff5f93",
      });
    } finally {
      setUpdatingId(null);
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
                {order.status === "pending" && (
                  <>
                    <button
                      className="action-btn approve"
                      onClick={() => updateStatus(order.id, "approved")}
                      disabled={updatingId === order.id}
                    >
                      {updatingId === order.id ? "Updating..." : "✅ Approve"}
                    </button>

                    <button
                      className="action-btn reject"
                      onClick={() => updateStatus(order.id, "rejected")}
                      disabled={updatingId === order.id}
                    >
                      {updatingId === order.id ? "Updating..." : "❌ Reject"}
                    </button>
                  </>
                )}

                {order.status === "approved" && (
                  <div className="payment-waiting">
                    Waiting for cashier payment verification
                  </div>
                )}

                {order.status === "paid" && (
                  <button
                    className="action-btn preparing"
                    onClick={() => updateStatus(order.id, "preparing")}
                    disabled={updatingId === order.id}
                  >
                    {updatingId === order.id ? "Updating..." : "📦 Start Preparing"}
                  </button>
                )}

                {order.status === "preparing" && (
                  <button
                    className="action-btn complete"
                    onClick={() => updateStatus(order.id, "completed")}
                    disabled={updatingId === order.id}
                  >
                    {updatingId === order.id ? "Updating..." : "✨ Complete Order"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
