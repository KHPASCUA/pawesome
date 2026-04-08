import React from "react";

const VetReports = ({ appointments }) => {
  const totalAppointments = appointments.length;
  const vaccinations = appointments.filter(a => a.service === "Vaccination").length;

  return (
    <div>
      <h2>Veterinary Reports</h2>
      <p>Total Appointments: {totalAppointments}</p>
      <p>Vaccinations: {vaccinations}</p>
    </div>
  );
};

export default VetReports;