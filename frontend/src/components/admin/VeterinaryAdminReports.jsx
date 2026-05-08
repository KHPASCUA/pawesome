import React from "react";
import AdminLiveReport from "./AdminLiveReport";

const VeterinaryAdminReports = () => (
  <AdminLiveReport
    title="Veterinary Monitoring Reports"
    subtitle="Read-only appointments, consultations, medical confinement, and service completion monitoring."
    endpoint="/admin/reports/veterinary"
    dataKey="appointments"
    exportName="admin-veterinary-monitoring-reports"
    icon="veterinary"
    searchPlaceholder="Search veterinary appointments, customers, pets, services, or status..."
    statusOptions={[
      { value: "scheduled", label: "Scheduled" },
      { value: "in_consultation", label: "In Consultation" },
      { value: "treated", label: "Treated" },
      { value: "needs_confinement", label: "Needs Confinement" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
      { value: "no_show", label: "No Show" },
    ]}
    summaryBuilder={(summary) => [
      {
        id: "completed",
        label: "Completed Appointments",
        value: summary.completed_appointments,
        icon: "faCheckCircle",
        color: "success",
      },
      {
        id: "scheduled",
        label: "Scheduled",
        value: summary.scheduled_appointments,
        icon: "faCalendarCheck",
        color: "primary",
      },
      {
        id: "confinements",
        label: "Medical Confinements",
        value: summary.medical_confinements,
        icon: "faClipboardList",
        color: "secondary",
      },
      {
        id: "observation",
        label: "Under Care",
        value: summary.pets_under_observation,
        icon: "faStethoscope",
        color: "warning",
      },
      {
        id: "completion-rate",
        label: "Completion Rate",
        value: `${summary.completion_rate || 0}%`,
        icon: "faChartLine",
        color: "info",
      },
    ]}
    columns={[
      { key: "id", label: "Appointment ID", sortable: true },
      { key: "serviceName", label: "Service", sortable: true },
      { key: "customer", label: "Customer", sortable: true },
      { key: "pet", label: "Pet", sortable: true },
      { key: "veterinarian", label: "Veterinarian", sortable: true },
      { key: "status", label: "Status", sortable: true },
      { key: "date", label: "Date", format: "date", sortable: true },
      { key: "revenue", label: "Revenue", format: "currency", sortable: true },
    ]}
  />
);

export default VeterinaryAdminReports;
