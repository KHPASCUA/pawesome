import React from "react";
import AdminLiveReport from "./AdminLiveReport";

const ServiceRequestReports = () => (
  <AdminLiveReport
    title="Service Request Reports"
    subtitle="Unified grooming, veterinary, hotel, and other service request status tracking."
    endpoint="/admin/reports/service-requests"
    dataKey="requests"
    exportName="admin-service-request-reports"
    icon="services"
    searchPlaceholder="Search service requests, customers, pets, service type, or payment status..."
    statusOptions={[
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "scheduled", label: "Scheduled" },
      { value: "confirmed", label: "Confirmed" },
      { value: "checked_in", label: "Checked In" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
      { value: "rejected", label: "Rejected" },
    ]}
    summaryBuilder={(summary) => [
      {
        id: "total-requests",
        label: "Total Requests",
        value: summary.total_requests,
        icon: "faClipboardList",
        color: "primary",
      },
      {
        id: "pending",
        label: "Pending",
        value: summary.pending,
        icon: "faClock",
        color: "warning",
      },
      {
        id: "in-progress",
        label: "In Progress",
        value: summary.in_progress,
        icon: "faSpinner",
        color: "info",
      },
      {
        id: "completed",
        label: "Completed",
        value: summary.completed,
        icon: "faCheckCircle",
        color: "success",
      },
      {
        id: "cancelled",
        label: "Cancelled",
        value: summary.cancelled,
        icon: "faTimesCircle",
        color: "danger",
      },
    ]}
    columns={[
      { key: "id", label: "Request ID", sortable: true },
      { key: "source", label: "Source", sortable: true },
      { key: "service_type", label: "Type", sortable: true },
      { key: "service_name", label: "Service", sortable: true },
      { key: "customer_name", label: "Customer", sortable: true },
      { key: "pet_name", label: "Pet", sortable: true },
      { key: "status", label: "Status", sortable: true },
      { key: "payment_status", label: "Payment", sortable: true },
      { key: "created_at", label: "Date", format: "datetime", sortable: true },
    ]}
  />
);

export default ServiceRequestReports;