import React from "react";
import AdminLiveReport from "./AdminLiveReport";

const PaymentReports = () => (
  <AdminLiveReport
    title="Payment Reports"
    subtitle="Payments across sales, orders, and service requests with verification status."
    endpoint="/admin/reports/payments"
    dataKey="payments"
    exportName="admin-payment-reports"
    icon="payments"
    searchPlaceholder="Search payments, customers, references, methods, or records..."
    statusOptions={[
      { value: "paid", label: "Paid" },
      { value: "completed", label: "Completed" },
      { value: "verified", label: "Verified" },
      { value: "pending", label: "Pending" },
      { value: "rejected", label: "Rejected" },
      { value: "refunded", label: "Refunded" },
    ]}
    summaryBuilder={(summary) => [
      {
        id: "total-payments",
        label: "Total Payments",
        value: summary.total_payments,
        icon: "faReceipt",
        color: "primary",
      },
      {
        id: "total-amount",
        label: "Total Amount",
        value: summary.total_amount,
        currency: true,
        icon: "faMoneyBillWave",
        color: "success",
      },
      {
        id: "paid",
        label: "Paid/Verified",
        value: summary.paid,
        icon: "faCheckCircle",
        color: "success",
      },
      {
        id: "pending",
        label: "Pending",
        value: summary.pending,
        icon: "faClock",
        color: "warning",
      },
      {
        id: "rejected",
        label: "Rejected",
        value: summary.rejected,
        icon: "faTimesCircle",
        color: "danger",
      },
    ]}
    columns={[
      { key: "payment_number", label: "Payment Ref", sortable: true },
      { key: "customer_name", label: "Customer", sortable: true },
      { key: "association_type", label: "Type", sortable: true },
      { key: "associated_record", label: "Associated Record", sortable: true },
      { key: "payment_method", label: "Method", sortable: true },
      { key: "amount", label: "Amount", format: "currency", sortable: true },
      { key: "status", label: "Status", sortable: true },
      { key: "created_at", label: "Date", format: "datetime", sortable: true },
    ]}
  />
);

export default PaymentReports;