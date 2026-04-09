import React from "react";
import "./CashierHistory.css";

const sampleTransactions = [
  { id: "TXN-001", customer: "Kristin Watson", amount: 312.5, method: "Card" },
  { id: "TXN-002", customer: "Theresa Webb", amount: 129.0, method: "Cash" },
  { id: "TXN-003", customer: "Admin User", amount: 564.25, method: "Gcash" },
  { id: "TXN-004", customer: "John Doe", amount: 78.5, method: "Cash" },
];

const CashierHistory = ({ transactions = sampleTransactions } = {}) => {
  const historyItems = Array.isArray(transactions) ? transactions : sampleTransactions;

  return (
    <div className="cashier-history-page">
      <div className="history-header">
        <h3>📜 Transaction History</h3>
        <p>Review recent sales and payment details.</p>
      </div>

      {historyItems.length === 0 ? (
        <div className="history-empty">No history available yet.</div>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {historyItems.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.customer}</td>
                  <td>₱{t.amount.toFixed(2)}</td>
                  <td>{t.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CashierHistory;