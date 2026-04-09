import React from "react";

export default function CustomerReports() {
  return (
    <div className="customer-reports">
      <h2>Customer Reports</h2>
      <p>Welcome to your reports dashboard. Here you can view summaries of bookings, pets, payments, and store activity.</p>

      <div className="report-section">
        <h3>Bookings Overview</h3>
        <p>Track your upcoming and past reservations.</p>
      </div>

      <div className="report-section">
        <h3>Pets Overview</h3>
        <p>See details about your registered pets and their medical history.</p>
      </div>

      <div className="report-section">
        <h3>Payments Overview</h3>
        <p>Review your recent transactions and uploaded receipts.</p>
      </div>

      <div className="report-section">
        <h3>Store Activity</h3>
        <p>Check your purchases and delivery status.</p>
      </div>
    </div>
  );
}