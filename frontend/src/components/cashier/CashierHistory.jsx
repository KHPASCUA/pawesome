import React, { useState } from "react";
import "./CashierHistory_Polished.css";

const sampleTransactions = [
  { id: "TXN-001", customer: "Kristin Watson", amount: 312.5, method: "Card" },
  { id: "TXN-002", customer: "Theresa Webb", amount: 129.0, method: "Cash" },
  { id: "TXN-003", customer: "Admin User", amount: 564.25, method: "Gcash" },
  { id: "TXN-004", customer: "John Doe", amount: 78.5, method: "Cash" },
];

const CashierHistory = ({ transactions = sampleTransactions } = {}) => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const historyItems = Array.isArray(transactions) ? transactions : sampleTransactions;

  const handleRefresh = () => {
    setLastUpdated(new Date());
  };

  const getMethodBadgeClass = (method) => {
    const lowerMethod = method.toLowerCase();
    if (lowerMethod.includes('card')) return 'card';
    if (lowerMethod.includes('gcash')) return 'gcash';
    return 'cash';
  };

  return (
    <div className="cashier-history-page">
      <div className="history-header">
        <div className="header-content">
          <h1>📜 Transaction History</h1>
          <p>Review recent sales and payment details</p>
        </div>
        <div className="last-updated">
          Last updated: {lastUpdated.toLocaleTimeString()}
          <button className="refresh-mini" onClick={handleRefresh} title="Refresh">
            🔄
          </button>
        </div>
      </div>

      <div className="history-content">
        {historyItems.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">📋</div>
            <h3>No History Available</h3>
            <p>Transaction history will appear here once sales are recorded</p>
          </div>
        ) : (
          <div className="history-table-container">
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {historyItems.map((t) => (
                    <tr key={t.id}>
                      <td><strong>{t.id}</strong></td>
                      <td>{t.customer}</td>
                      <td>₱{t.amount.toFixed(2)}</td>
                      <td>
                        <span className={`method-badge ${getMethodBadgeClass(t.method)}`}>
                          {t.method === 'Cash' ? '💵' : t.method === 'Card' ? '💳' : '📱'} {t.method}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierHistory;