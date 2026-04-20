import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoon,
  faSun,
  faUserCircle,
  faPaw,
  faCalendarAlt,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import CustomerSidebar from "./CustomerSidebar";
import RoleAwareChatbot from "../chatbot/RoleAwareChatbot";
import NotificationDropdown from "../shared/NotificationDropdown";
import { apiRequest } from "../../api/client";
import "./CustomerDashboard.css";

const CustomerDashboard = () => {
  const name = localStorage.getItem("name") || "Customer";
  const [theme, setTheme] = useState("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();

  const normalizedPath = location.pathname.replace(/\/+$/, "");
  const showOverview = normalizedPath === "/customer";

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await apiRequest("/customer/overview");
        setDashboardData(data);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
        console.error("Customer dashboard fetch error:", err);
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
      title: "Active Bookings",
      value: dashboardData.active_bookings || 0,
      subtitle: "Current reservations",
      change: "",
    },
    {
      title: "Total Pets",
      value: dashboardData.total_pets || 0,
      subtitle: "Registered pets",
      change: "",
    },
    {
      title: "Completed Services",
      value: dashboardData.completed_services || 0,
      subtitle: "This month",
      change: "",
    },
    {
      title: "Loyalty Points",
      value: dashboardData.loyalty_points || 0,
      subtitle: "Available points",
      change: "",
    },
  ] : [];

  const recentBookings = dashboardData ? (dashboardData.recent_bookings || []).map((booking) => ({
    petName: booking.pet?.name || "Pet",
    service: booking.service?.name || "Service",
    date: new Date(booking.scheduled_at).toLocaleDateString(),
    status: booking.status || "pending",
  })) : [];

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
                      You have {dashboardData?.total_pets || 0} registered pets under your care.
                    </p>
                  </div>
                  <span className="badge">{dashboardData?.total_pets || 0} Pets</span>
                </div>
                <div className="pets-list">
                  {(dashboardData?.recent_bookings || []).slice(0, 3).map((booking, idx) => (
                    <div key={idx} className="pet-summary-item">
                      <FontAwesomeIcon icon={faPaw} />
                      <span>{booking.pet?.name || "Pet"}</span>
                      <span className="pet-service">{booking.service?.name || "Service"}</span>
                    </div>
                  ))}
                  {(dashboardData?.recent_bookings || []).length === 0 && (
                    <p className="no-data">No recent bookings</p>
                  )}
                </div>
              </article>

              <article className="panel quick-stat-panel">
                <div className="metric-card accent">
                  <h3>{dashboardData?.loyalty_points || 0}</h3>
                  <p>Loyalty Points</p>
                  <small>Redeemable for services</small>
                </div>

                <div className="metric-card">
                  <h3>{dashboardData?.member_status || "Standard"}</h3>
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
                  <NavLink to="/customer/reports" className="see-all-link">
                    See all
                  </NavLink>
                </div>
                <div className="activity-metrics">
                  <div className="status-card success">
                    <strong>{dashboardData?.completed_services || 0}</strong>
                    <p>Services completed this month</p>
                  </div>
                  <div className="status-card info">
                    <strong>{dashboardData?.active_bookings || 0}</strong>
                    <p>Upcoming appointments</p>
                  </div>
                </div>
                <div className="activity-summary">
                  <p>You have {dashboardData?.active_bookings || 0} active bookings and {dashboardData?.total_pets || 0} registered pets.</p>
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
      <RoleAwareChatbot
        mode="widget"
        title="Customer Assistant"
        subtitle="Bookings, pets, services, and support"
      />
    </div>
  );
};

export default CustomerDashboard;
