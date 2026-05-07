import React from "react";
import AdminLiveReport from "./AdminLiveReport";

const LogisticsReports = () => (
  <AdminLiveReport
    title="Logistics Reports"
    subtitle="Shipment, delivery, delay, and return tracking when logistics data is available"
    endpoint="/admin/reports/logistics"
    dataKey="shipments"
    exportName="admin-logistics-reports"
    icon="logistics"
    statusOptions={[
      { value: "pending", label: "Pending" },
      { value: "in_transit", label: "In Transit" },
      { value: "delayed", label: "Delayed" },
      { value: "delivered", label: "Delivered" },
      { value: "returned", label: "Returned" },
    ]}
    summaryBuilder={(summary) => [
      { id: "total-shipments", label: "Total Shipments", value: summary.total_shipments, icon: "faTruck", color: "primary" },
      { id: "delayed", label: "Delayed", value: summary.delayed_shipments, icon: "faClock", color: "warning" },
      { id: "completed", label: "Completed", value: summary.completed_deliveries, icon: "faCheckCircle", color: "success" },
      { id: "returned", label: "Returned", value: summary.returned_shipments, icon: "faUndo", color: "danger" },
      { id: "source", label: "Data Source", value: summary.source_table || "Not configured", icon: "faDatabase", color: "info" },
    ]}
    columns={[
      { key: "id", label: "Shipment ID", sortable: true },
      { key: "tracking_number", label: "Tracking #", sortable: true },
      { key: "status", label: "Status", sortable: true },
      { key: "delivery_time", label: "Delivery Time", sortable: true },
      { key: "created_at", label: "Date", format: "datetime", sortable: true },
    ]}
  />
);

export default LogisticsReports;
