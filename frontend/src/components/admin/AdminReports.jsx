import React, { useState } from "react";
import "./AdminReports.css";

const AdminReports = () => {
  const [reports] = useState([
    { id: 1, title: "User Activity Report", type: "User", date: "2026-03-01", status: "Completed" },
    { id: 2, title: "Payroll Summary", type: "Payroll", date: "2026-02-28", status: "Completed" },
    { id: 3, title: "Attendance Overview", type: "Attendance", date: "2026-02-25", status: "Pending" },
  ]);

  return (
    <div className="admin-reports">
      <div className="section-header">
        <h2>Reports</h2>
        <button className="generate-btn">+ Generate Report</button>
      </div>

      <div className="reports-search">
        <input type="text" placeholder="Search reports..." />
      </div>

      <table className="reports-table">
        <thead>
          <tr>
            <th>ID</th><th>Title</th><th>Type</th><th>Date</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>{report.title}</td>
              <td>{report.type}</td>
              <td>{report.date}</td>
              <td>
                <span className={`status ${report.status.toLowerCase()}`}>
                  {report.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Chart placeholders */}
      <div className="reports-charts">
        <div className="chart-card">
          <h3>Revenue & Expenses</h3>
          <div className="chart-placeholder">[Line Chart Placeholder]</div>
        </div>

        <div className="chart-card">
          <h3>Weekly Attendance</h3>
          <div className="chart-placeholder">[Bar Chart Placeholder]</div>
        </div>

        <div className="chart-card">
          <h3>User Role Distribution</h3>
          <div className="chart-placeholder">[Pie Chart Placeholder]</div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;