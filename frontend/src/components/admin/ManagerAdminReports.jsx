import React from "react";
import AdminLiveReport from "./AdminLiveReport";

const ManagerAdminReports = () => (
  <AdminLiveReport
    title="Management Summary Reports"
    subtitle="Read-only executive analytics for revenue, operations, inventory health, and staff activity."
    endpoint="/admin/reports/manager"
    dataKey="transactions"
    exportName="admin-management-summary-reports"
    icon="manager"
    searchPlaceholder="Search management transactions, staff activity, customers, or operations..."
    statusOptions={[
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
      { value: "rejected", label: "Rejected" },
    ]}
    summaryBuilder={(summary) => [
      {
        id: "revenue",
        label: "Revenue",
        value: summary.total_revenue,
        currency: true,
        icon: "faMoneyBillWave",
        color: "success",
      },
      {
        id: "customers",
        label: "Customers",
        value: summary.total_customers || summary.active_customers,
        icon: "faUsers",
        color: "primary",
      },
      {
        id: "orders",
        label: "Orders",
        value: summary.total_orders,
        icon: "faShoppingCart",
        color: "secondary",
      },
      {
        id: "pending",
        label: "Pending Operations",
        value: summary.pending_approvals,
        icon: "faClock",
        color: "warning",
      },
      {
        id: "inventory",
        label: "Inventory Value",
        value: summary.inventory_value,
        currency: true,
        icon: "faBoxes",
        color: "info",
      },
    ]}
    columns={[
      { key: "id", label: "Record ID", sortable: true },
      { key: "transaction_number", label: "Transaction", sortable: true },
      { key: "customer_name", label: "Customer", sortable: true },
      { key: "type", label: "Type", sortable: true },
      { key: "amount", label: "Amount", format: "currency", sortable: true },
      { key: "status", label: "Status", sortable: true },
      { key: "date", label: "Date", format: "date", sortable: true },
    ]}
  />
);

export default ManagerAdminReports;
