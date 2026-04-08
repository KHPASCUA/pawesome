import React from "react";

const Reports = () => {
  const reports = [
    { id: 1, title: "Daily Check-ins", count: 12 },
    { id: 2, title: "Vet Appointments", count: 5 },
    { id: 3, title: "Hotel Bookings", count: 7 },
    { id: 4, title: "Grooming Sessions", count: 4 }
  ];

  return (
    <div>
      <h2>Receptionist Reports</h2>
      <ul>
        {reports.map((r) => (
          <li key={r.id}>
            {r.title}: {r.count}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reports;