import React, { useState } from "react";
import "./CashierReports.css";

const reportItems = [
  { id: 'daily', title: 'Daily Sales', subtitle: "Today's sales summary for the cashier shift." },
  { id: 'weekly', title: 'Weekly Revenue', subtitle: 'Performance across the current week.' },
  { id: 'monthly', title: 'Monthly Report', subtitle: 'Revenue and order trends this month.' },
  { id: 'transactions', title: 'Transactions', subtitle: 'Detailed transaction log and order history.' },
  { id: 'top-items', title: 'Top Items', subtitle: 'Best selling products and categories.' },
  { id: 'refunds', title: 'Refunds', subtitle: 'Refunds, returns, and adjustments.' },
  { id: 'customer', title: 'Customer Activity', subtitle: 'Customer visits, loyalty and order frequency.' },
  { id: 'inventory', title: 'Inventory Alerts', subtitle: 'Stock levels and low inventory warnings.' },
];

const summaries = {
  daily: { value: '$3,420', label: 'Today’s total sales' },
  weekly: { value: '$22,480', label: 'This week’s revenue' },
  monthly: { value: '$89,740', label: 'This month’s total' },
  transactions: { value: '124', label: 'Total transactions' },
  'top-items': { value: '12', label: 'Best selling items' },
  refunds: { value: '$520', label: 'Refunds processed' },
  customer: { value: '63', label: 'Active customers' },
  inventory: { value: '8', label: 'Restock alerts' },
};

const CashierReports = () => {
  const [activeReport, setActiveReport] = useState('daily');
  const activeSummary = summaries[activeReport];

  return (
    <section className="cashier-reports-page">
      <aside className="reports-menu-panel">
        <div className="reports-menu-header">
          <div>
            <p className="small-label">Reports</p>
            <h2>Cashier Insights</h2>
          </div>
        </div>

        <div className="reports-menu-list">
          {reportItems.map((item) => (
            <button
              key={item.id}
              className={item.id === activeReport ? 'report-item active' : 'report-item'}
              onClick={() => setActiveReport(item.id)}
            >
              <span className="report-item-title">{item.title}</span>
              <span className="report-item-subtitle">{item.subtitle}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="reports-content-panel">
        <div className="reports-overview-card">
          <div>
            <p className="small-label">Active report</p>
            <h3>{reportItems.find((item) => item.id === activeReport)?.title}</h3>
            <p className="overview-note">{reportItems.find((item) => item.id === activeReport)?.subtitle}</p>
          </div>
          <div className="overview-metric">
            <span>{activeSummary.value}</span>
            <p>{activeSummary.label}</p>
          </div>
        </div>

        <div className="reports-grid">
          <div className="report-card">
            <h4>Summary</h4>
            <p>Review the selected report and use the details below to act faster. The summary updates instantly when you switch reports.</p>
          </div>
          <div className="report-card report-stat-card">
            <h4>Current Status</h4>
            <ul>
              <li><strong>Updated</strong> 5 minutes ago</li>
              <li><strong>Orders</strong> {activeReport === 'transactions' ? '124' : '86'}</li>
              <li><strong>Conversion</strong> 74%</li>
            </ul>
          </div>
        </div>
      </main>
    </section>
  );
};

export default CashierReports;
