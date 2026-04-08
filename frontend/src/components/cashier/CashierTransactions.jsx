import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faPlus,
  faEdit,
  faTrash,
  faReceipt,
  faCreditCard,
  faMoneyBillWave,
  faCalendarAlt,
  faUser,
  faShoppingCart,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import "./CashierTransactions.css";

const CashierTransactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const transactions = [
    {
      id: "TRX-001",
      customer: "John Smith",
      email: "john.smith@email.com",
      amount: "$125.50",
      items: 3,
      payment: "Credit Card",
      paymentMethod: "visa",
      date: "2026-04-01",
      time: "10:23 AM",
      status: "completed",
      products: [
        { name: "Premium Dog Food", quantity: 2, price: "$45.00" },
        { name: "Cat Toy Bundle", quantity: 1, price: "$35.50" },
      ],
    },
    {
      id: "TRX-002",
      customer: "Sarah Johnson",
      email: "sarah.j@email.com",
      amount: "$89.25",
      items: 2,
      payment: "Cash",
      paymentMethod: "cash",
      date: "2026-04-01",
      time: "10:45 AM",
      status: "completed",
      products: [
        { name: "Pet Shampoo", quantity: 1, price: "$25.00" },
        { name: "Dog Leash", quantity: 1, price: "$64.25" },
      ],
    },
    {
      id: "TRX-003",
      customer: "Mike Davis",
      email: "mike.davis@email.com",
      amount: "$234.80",
      items: 5,
      payment: "Credit Card",
      paymentMethod: "mastercard",
      date: "2026-04-01",
      time: "11:02 AM",
      status: "completed",
      products: [
        { name: "Cat Food Premium", quantity: 3, price: "$89.40" },
        { name: "Pet Bed Large", quantity: 1, price: "$120.00" },
        { name: "Water Bowl", quantity: 1, price: "$25.40" },
      ],
    },
    {
      id: "TRX-004",
      customer: "Emma Wilson",
      email: "emma.w@email.com",
      amount: "$67.99",
      items: 1,
      payment: "Credit Card",
      paymentMethod: "amex",
      date: "2026-04-01",
      time: "11:30 AM",
      status: "pending",
      products: [
        { name: "Grooming Service Package", quantity: 1, price: "$67.99" },
      ],
    },
    {
      id: "TRX-005",
      customer: "Robert Brown",
      email: "robert.b@email.com",
      amount: "$156.75",
      items: 4,
      payment: "Cash",
      paymentMethod: "cash",
      date: "2026-04-01",
      time: "12:15 PM",
      status: "completed",
      products: [
        { name: "Bird Cage Medium", quantity: 1, price: "$89.99" },
        { name: "Bird Food Premium", quantity: 2, price: "$33.38" },
        { name: "Bird Toys Set", quantity: 1, price: "$33.50" },
      ],
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || transaction.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "info";
    }
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case "visa":
      case "mastercard":
      case "amex":
        return faCreditCard;
      case "cash":
        return faMoneyBillWave;
      default:
        return faReceipt;
    }
  };

  return (
    <div className="cashier-transactions">
      <div className="transactions-header">
        <div className="header-left">
          <h1>Transaction Management</h1>
          <p>View and manage all customer transactions</p>
        </div>
        <div className="header-actions">
          <button className="primary-btn">
            <FontAwesomeIcon icon={faPlus} />
            New Transaction
          </button>
        </div>
      </div>

      <div className="transactions-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search by customer, transaction ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <FontAwesomeIcon icon={faFilter} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="transaction-row">
                <td className="transaction-id">
                  <FontAwesomeIcon icon={faReceipt} />
                  {transaction.id}
                </td>
                <td className="customer-info">
                  <div className="customer-details">
                    <span className="customer-name">{transaction.customer}</span>
                    <span className="customer-email">{transaction.email}</span>
                  </div>
                </td>
                <td className="items-count">
                  <FontAwesomeIcon icon={faShoppingCart} />
                  {transaction.items} items
                </td>
                <td className="amount">{transaction.amount}</td>
                <td className="payment-method">
                  <FontAwesomeIcon icon={getPaymentIcon(transaction.paymentMethod)} />
                  {transaction.payment}
                </td>
                <td className="datetime">
                  <div>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    {transaction.date}
                  </div>
                  <span className="time">{transaction.time}</span>
                </td>
                <td className="status">
                  <span className={`status-badge ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => setSelectedTransaction(transaction)}
                    title="View Details"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button className="action-btn edit-btn" title="Edit">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button className="action-btn delete-btn" title="Delete">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTransaction && (
        <div className="transaction-modal-overlay" onClick={() => setSelectedTransaction(null)}>
          <div className="transaction-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transaction Details</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedTransaction(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="transaction-overview">
                <div className="overview-item">
                  <label>Transaction ID:</label>
                  <span>{selectedTransaction.id}</span>
                </div>
                <div className="overview-item">
                  <label>Customer:</label>
                  <span>{selectedTransaction.customer}</span>
                </div>
                <div className="overview-item">
                  <label>Email:</label>
                  <span>{selectedTransaction.email}</span>
                </div>
                <div className="overview-item">
                  <label>Date:</label>
                  <span>{selectedTransaction.date} at {selectedTransaction.time}</span>
                </div>
                <div className="overview-item">
                  <label>Payment Method:</label>
                  <span>{selectedTransaction.payment}</span>
                </div>
                <div className="overview-item">
                  <label>Status:</label>
                  <span className={`status-badge ${getStatusColor(selectedTransaction.status)}`}>
                    {selectedTransaction.status}
                  </span>
                </div>
              </div>
              
              <div className="transaction-products">
                <h3>Products</h3>
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Quantity</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransaction.products.map((product, index) => (
                      <tr key={index}>
                        <td>{product.name}</td>
                        <td>{product.quantity}</td>
                        <td>{product.price}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan="2">Total:</td>
                      <td className="total-amount">{selectedTransaction.amount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierTransactions;