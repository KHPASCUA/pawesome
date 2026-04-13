import React, { useMemo } from "react";
import "./ManagerReports.css";

const ManagerReports = ({ staff = [], revenue = [] }) => {
  // Staff activity summary
  const activeStaff = staff.filter(s => s.active).length;
  const inactiveStaff = staff.length - activeStaff;

  // Revenue summary
  const totalRevenue = useMemo(() => {
    return revenue.reduce((sum, r) => sum + r.amount, 0);
  }, [revenue]);

  const monthlyRevenue = useMemo(() => {
    const summary = {};
    revenue.forEach(r => {
      const month = new Date(r.date).toLocaleString("default", { month: "short" });
      summary[month] = (summary[month] || 0) + r.amount;
    });
    return summary;
  }, [revenue]);

  return (
    <div className="manager-reports">
      <div className="reports-container">
        {/* Header */}
        <div className="reports-header">
          <h1 className="reports-title">Manager Reports</h1>
          <p className="reports-subtitle">Business analytics and insights</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{staff.length}</div>
            <div className="stat-label">Total Staff</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{activeStaff}</div>
            <div className="stat-label">Active Staff</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{inactiveStaff}</div>
            <div className="stat-label">Inactive Staff</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{Object.keys(monthlyRevenue).length}</div>
            <div className="stat-label">Active Months</div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="total-revenue">
          <div className="total-revenue-label">Total Revenue</div>
          <div className="total-revenue-amount">₱{totalRevenue.toLocaleString()}</div>
        </div>

        {/* Staff Section */}
        <div className="reports-section">
          <h2 className="section-title">Staff Overview</h2>
          <div className="staff-grid">
            <div className="staff-item">
              <div className="staff-number">{staff.length}</div>
              <div className="staff-label">Total Staff</div>
            </div>
            
            <div className="staff-item">
              <div className="staff-number">{activeStaff}</div>
              <div className="staff-label">Active</div>
            </div>
            
            <div className="staff-item">
              <div className="staff-number">{inactiveStaff}</div>
              <div className="staff-label">Inactive</div>
            </div>
          </div>
        </div>

        {/* Revenue Section */}
        <div className="reports-section">
          <h2 className="section-title">Revenue Details</h2>
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(monthlyRevenue).map(([month, amount]) => (
                <tr key={month}>
                  <td>{month}</td>
                  <td>₱{amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerReports;