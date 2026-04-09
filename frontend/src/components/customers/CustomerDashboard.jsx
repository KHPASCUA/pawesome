import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faMoon,
  faSun,
  faUserCircle,
  faPaw,
  faCalendarAlt,
  faClipboardList,
  faHistory,
  faUser,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import CustomerSidebar from "./CustomerSidebar";
import CustomerChatbot from "./CustomerChatbot";
import "./CustomerDashboard.css";

const CustomerDashboard = () => {
  const name = localStorage.getItem("name") || "Customer";
  const [theme, setTheme] = useState("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadNotifications] = useState(3);
  const location = useLocation();

  const normalizedPath = location.pathname.replace(/\/+$/, "");
  const showOverview = normalizedPath === "/customer";

  const summaryCards = [
    {
      title: "Active Bookings",
      value: 3,
      subtitle: "Current reservations",
      change: "+1",
    },
    {
      title: "Total Pets",
      value: 5,
      subtitle: "Registered pets",
      change: "+2",
    },
    {
      title: "Completed Services",
      value: 24,
      subtitle: "This month",
      change: "+8",
    },
    {
      title: "Loyalty Points",
      value: 850,
      subtitle: "Available points",
      change: "+50",
    },
  ];

  const recentBookings = [
    {
      petName: "Max",
      service: "Grooming",
      date: "2026-03-28",
      status: "confirmed",
    },
    {
      petName: "Bella",
      service: "Boarding",
      date: "2026-03-30",
      status: "pending",
    },
    {
      petName: "Charlie",
      service: "Veterinary Checkup",
      date: "2026-04-02",
      status: "confirmed",
    },
  ];

  return (
    <div className={`customer-dashboard ${theme} ${sidebarCollapsed ? "collapsed" : ""}`}>
      <CustomerSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <main className="customer-main">
        <header className="customer-navbar top-navbar">
          <div className="navbar-left">
            <h1>Customer Dashboard</h1>
            <p>Manage your pet services and bookings here.</p>
          </div>

          <div className="search-group">
            <input
              type="text"
              placeholder="Search bookings, pets, services..."
            />
          </div>

          <div className="navbar-actions">
            <NavLink to="/customer/profile" className="customer-profile-btn">
              <span className="profile-avatar-icon">
                <FontAwesomeIcon icon={faUserCircle} />
              </span>
              <span className="profile-info">
                <span className="profile-action-name">{name}</span>
                <span className="profile-action-role">Customer</span>
              </span>
            </NavLink>

            <button className="icon-btn notification-btn" type="button">
              <FontAwesomeIcon icon={faBell} />
              {unreadNotifications > 0 && (
                <span className="notification-badge">
                  {unreadNotifications}
                </span>
              )}
            </button>

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
                    <h2>Your Pets</h2>
                    <p>
                      You have {summaryCards[1].value} registered pets under your care.
                    </p>
                  </div>
                  <span className="badge">{summaryCards[1].value} Pets</span>
                </div>
                <div className="chart-placeholder">Pets Overview Chart</div>
              </article>

              <article className="panel quick-stat-panel">
                <div className="metric-card accent">
                  <h3>850</h3>
                  <p>Loyalty Points</p>
                  <small>Redeemable for services</small>
                </div>

                <div className="metric-card">
                  <h3>Gold</h3>
                  <p>Member Status</p>
                </div>
              </article>
            </section>

            <section className="dashboard-bottom">
              <div className="panel bookings-panel">
                <div className="panel-header space-between">
                  <div>
                    <h2>Recent Bookings</h2>
                  </div>
                  <NavLink to="/customer/bookings" className="see-all-link">
                    See all ({recentBookings.length})
                  </NavLink>
                </div>

                <div className="booking-list">
                  {recentBookings.map((booking, index) => (
                    <div key={index} className="booking-card">
                      <div className="booking-card-top">
                        <div>
                          <h3>{booking.petName}</h3>
                          <p>{booking.service}</p>
                        </div>
                        <span className={`status-badge ${booking.status.toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p>{booking.date}</p>
                      <div className="booking-info">
                        <div>
                          <strong>Pet</strong>
                          <p>{booking.petName}</p>
                        </div>
                        <div>
                          <strong>Service</strong>
                          <p>{booking.service}</p>
                        </div>
                      </div>
                      <div className="booking-footer">
                        <span>
                          <FontAwesomeIcon icon={faCalendarAlt} /> {booking.date}
                        </span>
                        <span>
                          <FontAwesomeIcon icon={faPaw} /> {booking.petName}
                        </span>
                        <button className="secondary-btn" type="button">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel activity-panel">
                <div className="panel-header space-between">
                  <div>
                    <h2>Recent Activity</h2>
                  </div>
                  <NavLink to="/customer/history" className="see-all-link">
                    See all
                  </NavLink>
                </div>
                <div className="activity-metrics">
                  <div className="status-card success">
                    <strong>24</strong>
                    <p>Services completed this month</p>
                  </div>
                  <div className="status-card info">
                    <strong>3</strong>
                    <p>Upcoming appointments</p>
                  </div>
                </div>
                <div className="mini-chart-placeholder">
                  <FontAwesomeIcon icon={faArrowUp} />
                  <span>Activity Trend</span>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="dashboard-content">
            <Outlet />
          </section>
        )}
      </main>
      
      {/* Floating Chatbot */}
      <CustomerChatbot />
    </div>
  );
};

export default CustomerDashboard;