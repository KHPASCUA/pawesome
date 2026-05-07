import React from "react";
import AdminLiveReport from "./AdminLiveReport";

const OrderReports = () => (
  <AdminLiveReport
    title="Order Reports"
    subtitle="Customer order status, payment state, sales amount, and order drill-down records."
    endpoint="/admin/reports/orders"
    dataKey="orders"
    exportName="admin-order-reports"
    icon="orders"
    searchPlaceholder="Search orders, customers, payment status, or receipt numbers..."
    statusOptions={[
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
      { value: "rejected", label: "Rejected" },
    ]}
    summaryBuilder={(summary) => [
      {
        id: "total-orders",
        label: "Total Orders",
        value: summary.total_orders,
        icon: "faShoppingCart",
        color: "primary",
      },
      {
        id: "completed-orders",
        label: "Completed/Approved",
        value: summary.completed_orders,
        icon: "faCheckCircle",
        color: "success",
      },
      {
        id: "pending-orders",
        label: "Pending",
        value: summary.pending_orders,
        icon: "faClock",
        color: "warning",
      },
      {
        id: "cancelled-orders",
        label: "Cancelled/Rejected",
        value: summary.cancelled_orders,
        icon: "faTimesCircle",
        color: "danger",
      },
      {
        id: "total-revenue",
        label: "Paid Revenue",
        value: summary.total_revenue,
        currency: true,
        icon: "faMoneyBillWave",
        color: "secondary",
      },
    ]}
    columns={[
      { key: "id", label: "Order ID", sortable: true },
      { key: "customer_display", label: "Customer", sortable: true },
      { key: "total_amount", label: "Amount", format: "currency", sortable: true },
      { key: "status", label: "Order Status", sortable: true },
      { key: "payment_status", label: "Payment Status", sortable: true },
      { key: "payment_method", label: "Method", sortable: true },
      { key: "receipt_number", label: "Receipt", sortable: true },
      { key: "created_at", label: "Date", format: "datetime", sortable: true },
    ]}
  />
);

export default OrderReports;