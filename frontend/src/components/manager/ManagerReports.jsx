import React, { useMemo } from "react";

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
    <div>
      <h3>📊 Manager Reports</h3>

      {/* Staff Overview */}
      <section>
        <h4>Staff Activity</h4>
        <p>Active Staff: {activeStaff}</p>
        <p>Inactive Staff: {inactiveStaff}</p>
      </section>

      {/* Revenue Overview */}
      <section style={{ marginTop: "20px" }}>
        <h4>Revenue Summary</h4>
        <p>Total Revenue: ₱{totalRevenue}</p>
        <table border="1" cellPadding="8">
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
                <td>₱{amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default ManagerReports;