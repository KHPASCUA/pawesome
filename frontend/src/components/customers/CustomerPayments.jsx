import React, { useMemo } from "react";
import "./CustomerPayments.css";

const payments = [
  {
    id: "PAY-001",
    date: "April 26, 2026",
    service: "Pet Grooming Package",
    method: "GCash",
    amount: 920,
    status: "Paid",
  },
  {
    id: "PAY-002",
    date: "April 20, 2026",
    service: "Pet Bath & Nail Trim",
    method: "Cash",
    amount: 650,
    status: "Paid",
  },
  {
    id: "PAY-003",
    date: "April 12, 2026",
    service: "Vet Consultation",
    method: "Card",
    amount: 1200,
    status: "Pending",
  },
];

const formatCurrency = (value) =>
  `₱${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const CustomerPayments = () => {
  const summary = useMemo(() => {
    const totalPaid = payments
      .filter((payment) => payment.status === "Paid")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const pendingCount = payments.filter(
      (payment) => payment.status === "Pending"
    ).length;

    return {
      totalTransactions: payments.length,
      totalPaid,
      pendingCount,
    };
  }, []);

  return (
    <section className="customer-payments-page">
      <div className="customer-payments-bg-orb orb-one" />
      <div className="customer-payments-bg-orb orb-two" />

      <header className="customer-payments-header">
        <div>
          <span className="customer-payments-kicker">Customer Portal</span>
          <h3>Payment History</h3>
          <p>
            Review your past transactions, payment methods, and receipts in one
            organized dashboard.
          </p>
        </div>

        <button type="button" className="customer-payments-main-btn">
          Download Summary
        </button>
      </header>

      <div className="customer-payments-summary-grid">
        <article className="customer-payment-summary-card">
          <div className="summary-icon">💳</div>
          <div>
            <h4>{summary.totalTransactions}</h4>
            <p>Total Transactions</p>
          </div>
        </article>

        <article className="customer-payment-summary-card">
          <div className="summary-icon">₱</div>
          <div>
            <h4>{formatCurrency(summary.totalPaid)}</h4>
            <p>Total Paid</p>
          </div>
        </article>

        <article className="customer-payment-summary-card">
          <div className="summary-icon">⏳</div>
          <div>
            <h4>{summary.pendingCount}</h4>
            <p>Pending Payments</p>
          </div>
        </article>
      </div>

      <div className="customer-payments-panel">
        <div className="customer-payments-panel-header">
          <div>
            <span className="customer-payments-kicker">Transactions</span>
            <h4>Recent Payments</h4>
            <p>Track your completed and pending payment records.</p>
          </div>
        </div>

        <div className="customer-payments-table-wrapper">
          <table className="customer-payments-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Date</th>
                <th>Service</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <strong>{payment.id}</strong>
                  </td>
                  <td>{payment.date}</td>
                  <td>{payment.service}</td>
                  <td>
                    <span className="payment-method-badge">
                      {payment.method}
                    </span>
                  </td>
                  <td className="payment-amount">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td>
                    <span
                      className={`payment-status ${payment.status.toLowerCase()}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="receipt-btn">
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default CustomerPayments;