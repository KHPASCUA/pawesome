import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoon,
  faSun,
  faUserCircle,
  faShoppingCart,
  faReceipt,
  faCalendarAlt,
  faCreditCard,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import CashierSidebar from "./CashierSidebar";
import RoleAwareChatbot from "../chatbot/RoleAwareChatbot";
import NotificationDropdown from "../shared/NotificationDropdown";
import "./CashierDashboard.css";
import { apiRequest } from "../../api/client";

const CashierDashboard = () => {
  const name = localStorage.getItem("name") || "Cashier";
  const [theme, setTheme] = useState("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Notification state
  // Backend data states
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizedPath = location.pathname.replace(/\/+$/, "");
  const showOverview = normalizedPath === "/cashier";

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await apiRequest("/cashier/dashboard");
        setDashboardData(data);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
        console.error("Cashier dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (showOverview) {
      fetchDashboardData();
    }
  }, [showOverview]);

  const summaryCards = dashboardData ? [
    {
      title: "Today's Sales",
      value: `$${dashboardData.today_sales || 0}`,
      subtitle: "Total revenue",
      change: "",
    },
    {
      title: "Transactions",
      value: dashboardData.today_transactions || 0,
      subtitle: "Completed today",
      change: "",
    },
    {
      title: "Monthly Sales",
      value: `$${dashboardData.monthly_sales || 0}`,
      subtitle: "This month",
      change: "",
    },
    {
      title: "Pending Payments",
      value: dashboardData.pending_payments || 0,
      subtitle: "Awaiting payment",
      change: "",
    },
  ] : [];

  const recentTransactions = dashboardData ? (dashboardData.recent_sales || []).map((sale, index) => ({
    id: `TRX-${String(sale.id).padStart(3, '0')}`,
    customer: sale.type === 'appointment' ? 'Appointment Payment' : (sale.type === 'boarding' ? 'Boarding Payment' : 'Product Sale'),
    amount: `$${sale.amount}`,
    items: 1,
    payment: sale.type || 'Cash',
    time: new Date(sale.created_at).toLocaleTimeString(),
    status: 'completed',
  })) : [];

  // Payment methods data from backend
  const salesByType = dashboardData?.sales_by_type || [];

  return (
    <div className={`cashier-dashboard ${theme} ${sidebarCollapsed ? "collapsed" : ""}`}>
      <CashierSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <main className="cashier-main">
        <header className="cashier-navbar top-navbar">
          <div className="navbar-left">
            <h1>Point of Sale</h1>
            <p>Process transactions and manage sales</p>
          </div>

          <div className="search-group">
            <input
              type="text"
              placeholder="Search products, customers, transactions..."
            />
          </div>

          <div className="navbar-actions">
            <NavLink to="/cashier/profile" className="cashier-profile-btn">
              <span className="profile-avatar-icon">
                <FontAwesomeIcon icon={faUserCircle} />
              </span>
              <span className="profile-info">
                <span className="profile-action-name">{name}</span>
                <span className="profile-action-role">Cashier</span>
              </span>
            </NavLink>

            <NotificationDropdown />

            <button
              className="theme-toggle-btn"
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
            </button>
          </div>
        </header>

        {showOverview ? (
          <>
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner">Loading dashboard...</div>
              </div>
            ) : error ? (
              <div className="error-container">
                <div className="error-message">{error}</div>
                <button onClick={() => window.location.reload()} className="retry-btn">
                  Retry
                </button>
              </div>
            ) : (
              <>
                <section className="overview-cards">
                  {summaryCards.map((card) => (
                    <div key={card.title} className="overview-card">
                      <div>
                        <h3>{card.value}</h3>
                        <p>{card.title}</p>
                      </div>
                      <span>{card.change}</span>
                    </div>
                  ))}
                </section>

                <section className="dashboard-grid">
                  <article className="panel overview-panel">
                    <div className="panel-header">
                      <div>
                        <h2>Recent Transactions</h2>
                        <p>Latest sales and payment processing</p>
                      </div>
                      <span className="badge">Today</span>
                    </div>
                    <div className="transaction-list">
                      {recentTransactions.map((transaction, index) => (
                        <div key={index} className="transaction-item">
                          <div className="transaction-header">
                            <div className="transaction-info">
                              <h3>{transaction.id}</h3>
                              <p>{transaction.customer}</p>
                            </div>
                            <div className="transaction-amount">
                              <strong>{transaction.amount}</strong>
                              <span className={`status-badge ${transaction.status}`}>
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                          <div className="transaction-details">
                            <span>
                              <FontAwesomeIcon icon={faShoppingCart} /> {transaction.items} items
                            </span>
                            <span>
                              <FontAwesomeIcon icon={faCreditCard} /> {transaction.payment}
                            </span>
                            <span>
                              <FontAwesomeIcon icon={faCalendarAlt} /> {transaction.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="panel quick-stat-panel">
                    <div className="metric-card accent">
                      <h3>${dashboardData?.today_sales || 0}</h3>
                      <p>Today's Revenue</p>
                      <small>From {dashboardData?.today_transactions || 0} transactions</small>
                    </div>

                    <div className="metric-card">
                      <h3>{dashboardData?.today_transactions || 0}</h3>
                      <p>Transactions</p>
                    </div>

                    <div className="metric-card">
                      <h3>{dashboardData?.pending_payments || 0}</h3>
                      <p>Pending</p>
                    </div>
                  </article>
                </section>

                <section className="dashboard-bottom">
                  <div className="panel sales-panel">
                    <div className="panel-header space-between">
                      <div>
                        <h2>Sales by Type</h2>
                      </div>
                      <NavLink to="/cashier/transactions" className="see-all-link">
                        View all
                      </NavLink>
                    </div>

                    <div className="payment-methods">
                      {salesByType.map((type, index) => (
                        <div key={index} className="payment-method-item">
                          <div className="payment-icon">
                            <FontAwesomeIcon icon={type.type === 'appointment' ? faCreditCard : (type.type === 'boarding' ? faCalendarAlt : faReceipt)} />
                          </div>
                          <div className="payment-info">
                            <h4>{type.type.charAt(0).toUpperCase() + type.type.slice(1)}</h4>
                            <p>{type.count} transactions</p>
                          </div>
                          <div className="payment-amount">${type.total}</div>
                        </div>
                      ))}
                      {salesByType.length === 0 && (
                        <div className="no-data">No sales data available</div>
                      )}
                    </div>
                  </div>

                  <div className="panel performance-panel">
                    <div className="panel-header space-between">
                      <div>
                        <h2>Sales Performance</h2>
                      </div>
                      <NavLink to="/cashier/reports" className="see-all-link">
                        View reports
                      </NavLink>
                    </div>
                    
                    <div className="sales-metrics">
                      <div className="status-card success">
                        <strong>${dashboardData?.today_sales > 0 && dashboardData?.today_transactions > 0 
                          ? (dashboardData.today_sales / dashboardData.today_transactions).toFixed(2) 
                          : 0}</strong>
                        <p>Average Order</p>
                        <small>Today's average</small>
                      </div>
                      <div className="status-card info">
                        <strong>{dashboardData?.monthly_transactions || 0}</strong>
                        <p>Monthly Transactions</p>
                        <small>This month</small>
                      </div>
                    </div>
                    
                    <div className="mini-chart-placeholder">
                      <FontAwesomeIcon icon={faArrowUp} />
                      <span>Sales Trend</span>
                    </div>
                  </div>
                </section>
              </>
            )}
          </>
        ) : (
          <section className="dashboard-content">
            <Outlet />
          </section>
        )}
      </main>
      <RoleAwareChatbot
        mode="widget"
        title="Cashier Assistant"
        subtitle="Transactions, payments, and cashier workflow help"
      />
    </div>
  );
};

export default CashierDashboard;
