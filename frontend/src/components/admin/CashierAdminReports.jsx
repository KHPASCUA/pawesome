import React from "react";
import AdminLiveReport from "./AdminLiveReport";

const CashierAdminReports = () => (
  <AdminLiveReport
    title="Cashier Monitoring Reports"
    subtitle="Read-only cashier activity, payment verification, receipt, and POS monitoring."
    endpoint="/admin/reports/cashier"
    dataKey="payment_verifications"
    exportName="admin-cashier-monitoring-reports"
    icon="payments"
    searchPlaceholder="Search cashier payments, customers, references, receipts, or methods..."
    statusOptions={[
      { value: "pending", label: "Pending Proofs" },
      { value: "paid", label: "Paid" },
      { value: "rejected", label: "Rejected" },
      { value: "refunded", label: "Refunded" },
    ]}
    summaryBuilder={(summary) => [
      {
        id: "total-revenue",
        label: "Collected Revenue",
        value: summary.total_revenue,
        currency: true,
        icon: "faMoneyBillWave",
        color: "success",
      },
      {
        id: "pos-sales",
        label: "POS Sales",
        value: summary.pos_sales,
        currency: true,
        icon: "faCashRegister",
        color: "primary",
      },
      {
        id: "pending-proofs",
        label: "Pending Proofs",
        value: summary.pending_payment_proofs,
        icon: "faClock",
        color: "warning",
      },
      {
        id: "verified",
        label: "Verified",
        value: summary.verified_payments,
        icon: "faCheckCircle",
        color: "success",
      },
      {
        id: "rejected",
        label: "Rejected",
        value: summary.rejected_payments,
        icon: "faTimesCircle",
        color: "danger",
      },
    ]}
    columns={[
      { key: "payment_number", label: "Payment Ref", sortable: true },
      { key: "customer_name", label: "Customer", sortable: true },
      { key: "source", label: "Source", sortable: true },
      { key: "amount", label: "Amount", format: "currency", sortable: true },
      { key: "payment_status", label: "Payment Status", sortable: true },
      { key: "payment_method", label: "Method", sortable: true },
      { key: "receipt_number", label: "Receipt", sortable: true },
      { key: "created_at", label: "Date", format: "datetime", sortable: true },
    ]}
  />
);

export default CashierAdminReports;
