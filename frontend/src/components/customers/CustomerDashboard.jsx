import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoon,
  faSun,
  faUserCircle,
  faPaw,
  faCalendarAlt,
  faHeart,
  faClock,
  faCheckCircle,
  faGift,
  faSpinner,
  faTriangleExclamation,
  faPlus,
  faCalendarCheck,
  faList,
  faHeadset,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import CustomerSidebar from "./CustomerSidebar";
import CustomerDashboardChatbot from "../CustomerDashboardChatbot";
import NotificationDropdown from "../shared/NotificationDropdown";
import { apiRequest } from "../../api/client";
import "../../styles/dashboardGlobal.css";
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await apiRequest("/customer/dashboard");
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

  const formatDate = (dateValue) => {
    if (!dateValue) return "No date";
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "No date";

    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const summaryCards = dashboardData
    ? [
        {
          title: "Active Bookings",
          value: dashboardData.active_bookings || 0,
          subtitle: "Current reservations",
          icon: faCalendarAlt,
          tone: "pink",
        },
        {
          title: "Total Pets",
          value: dashboardData.total_pets || 0,
          subtitle: "Registered pets",
          icon: faPaw,
          tone: "soft",
        },
        {
          title: "Completed Services",
          value: dashboardData.completed_services || 0,
          subtitle: "This month",
          icon: faCheckCircle,
          tone: "success",
        },
        {
          title: "Loyalty Points",
          value: dashboardData.loyalty_points || 0,
          subtitle: "Available rewards",
          icon: faGift,
          tone: "gold",
        },
      ]
    : [];

  const recentBookings = dashboardData
    ? (dashboardData.recent_bookings || []).map((booking) => ({
        petName: booking.pet?.name || "Pet",
        service: booking.service?.name || "Service",
        date: formatDate(booking.scheduled_at),
        status: booking.status || "pending",
        id: booking.id,
      }))
    : [];

  const getBookingProgress = (status) => {
    const steps = [
      { key: "requested", label: "Requested" },
      { key: "confirmed", label: "Confirmed" },
      { key: "in_progress", label: "In Progress" },
      { key: "completed", label: "Completed" },
    ];

    const statusMap = {
      pending: 0,
      requested: 0,
      confirmed: 1,
      scheduled: 1,
      in_progress: 2,
      completed: 3,
      cancelled: -1,
      canceled: -1,
    };

    const currentIndex = statusMap[status?.toLowerCase()] || 0;

    return steps.map((step, index) => ({
      ...step,
      active: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  const upcomingAppointment = recentBookings.find(
    (booking) => booking.status === "confirmed" || booking.status === "scheduled"
  );

  const quickActions = [
    { label: "Book Service", icon: faCalendarCheck, link: "/customer/bookings", tone: "pink" },
    { label: "Add Pet", icon: faPlus, link: "/customer/pets", tone: "soft" },
    { label: "View Bookings", icon: faList, link: "/customer/bookings", tone: "success" },
    { label: "Contact Support", icon: faHeadset, link: "/customer/support", tone: "gold" },
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
            <span className="eyebrow">Pawesome Customer Portal</span>
            <h1>Customer Dashboard</h1>
            <p>Manage your pets, bookings, rewards, and service updates in one place.</p>
          </div>

          <div className="search-group">
            <input type="text" placeholder="Search bookings, pets, services..." />
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
              title="Toggle theme"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
            </button>
          </div>
        </header>

        {showOverview ? (
          <section className="customer-overview-page">
            {loading ? (
              <div className="loading-container">
                <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner" />
                <p>Loading your customer dashboard...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                <h3>Dashboard unavailable</h3>
                <p>{error}</p>
              </div>
            ) : (
              <>
                <section className="customer-hero-panel">
                  <div>
                    <span className="eyebrow">Welcome back</span>
                    <h2>Hello, {name}!</h2>
                    <p>
                      Here is your latest pet care summary, active reservations, and reward status.
                    </p>
                  </div>

                  <div className="hero-status-card">
                    <FontAwesomeIcon icon={faHeart} />
                    <div>
                      <strong>{dashboardData?.member_status || "Standard"}</strong>
                      <span>Member Status</span>
                    </div>
                  </div>
                </section>

                <section className="overview-cards">
                  {summaryCards.map((card) => (
                    <article key={card.title} className={`overview-card ${card.tone}`}>
                      <div className="card-icon">
                        <FontAwesomeIcon icon={card.icon} />
                      </div>
                      <div>
                        <h3>{card.value}</h3>
                        <p>{card.title}</p>
                        <small>{card.subtitle}</small>
                      </div>
                    </article>
                  ))}
                </section>

                <section className="quick-actions-section">
                  <div className="panel-header">
                    <span className="eyebrow">Quick Actions</span>
                    <h2>What would you like to do?</h2>
                  </div>
                  <div className="quick-actions-grid">
                    {quickActions.map((action) => (
                      <NavLink key={action.label} to={action.link} className={`quick-action-card ${action.tone}`}>
                        <div className="quick-action-icon">
                          <FontAwesomeIcon icon={action.icon} />
                        </div>
                        <span>{action.label}</span>
                        <FontAwesomeIcon icon={faArrowRight} className="action-arrow" />
                      </NavLink>
                    ))}
                  </div>
                </section>

                {upcomingAppointment && (
                  <section className="upcoming-appointment-section">
                    <div className="panel-header">
                      <span className="eyebrow">Next Appointment</span>
                      <h2>Upcoming Service</h2>
                    </div>
                    <div className="upcoming-appointment-card">
                      <div className="appointment-visual">
                        <FontAwesomeIcon icon={faCalendarAlt} className="appointment-icon" />
                        <div className="appointment-date-badge">
                          <span className="date-day">{new Date(upcomingAppointment.date).getDate()}</span>
                          <span className="date-month">{new Date(upcomingAppointment.date).toLocaleDateString("en-US", { month: "short" })}</span>
                        </div>
                      </div>
                      <div className="appointment-details">
                        <h3>{upcomingAppointment.petName}</h3>
                        <p>{upcomingAppointment.service}</p>
                        <div className="appointment-meta">
                          <span>
                            <FontAwesomeIcon icon={faCalendarAlt} /> {upcomingAppointment.date}
                          </span>
                          <span className={`status-badge ${upcomingAppointment.status.toLowerCase()}`}>
                            {upcomingAppointment.status}
                          </span>
                        </div>
                      </div>
                      <NavLink to="/customer/bookings" className="appointment-action-btn">
                        View Details
                      </NavLink>
                    </div>
                  </section>
                )}

                <section className="dashboard-grid">
                  <article className="panel overview-panel">
                    <div className="panel-header space-between">
                      <div>
                        <span className="eyebrow">Pet Summary</span>
                        <h2>Your Pets</h2>
                        <p>
                          You have {dashboardData?.total_pets || 0} registered pets under your care.
                        </p>
                      </div>
                      <span className="badge">{dashboardData?.total_pets || 0} Pets</span>
                    </div>

                    <div className="pets-list">
                      {(dashboardData?.recent_bookings || []).slice(0, 3).map((booking, idx) => (
                        <div key={idx} className="pet-card">
                          <div className="pet-card-header">
                            <div className="pet-avatar">
                              <FontAwesomeIcon icon={faPaw} />
                            </div>
                            <div>
                              <strong>{booking.pet?.name || "Pet"}</strong>
                              <span className="pet-type">Dog</span>
                            </div>
                          </div>
                          <div className="pet-card-body">
                            <div className="pet-service-tag">
                              <FontAwesomeIcon icon={faCalendarAlt} />
                              {booking.service?.name || "Service"}
                            </div>
                            <p className="pet-last-visit">
                              Last visit: {formatDate(booking.scheduled_at)}
                            </p>
                          </div>
                        </div>
                      ))}

                      {(dashboardData?.recent_bookings || []).length === 0 && (
                        <div className="empty-state compact">
                          <FontAwesomeIcon icon={faPaw} />
                          <p>No recent pet bookings yet.</p>
                        </div>
                      )}
                    </div>
                  </article>

                  <article className="panel rewards-panel">
                    <div className="metric-card accent">
                      <FontAwesomeIcon icon={faGift} />
                      <h3>{dashboardData?.loyalty_points || 0}</h3>
                      <p>Loyalty Points</p>
                      <small>Redeemable for future services</small>
                    </div>

                    <div className="loyalty-progress-card">
                      <div className="loyalty-progress-header">
                        <FontAwesomeIcon icon={faGift} />
                        <div>
                          <strong>{dashboardData?.loyalty_points || 0} / 1000</strong>
                          <span>Points to Premium</span>
                        </div>
                      </div>
                      <div className="loyalty-progress-bar">
                        <div
                          className="loyalty-progress-fill"
                          style={{ width: `${Math.min((dashboardData?.loyalty_points || 0) / 10, 100)}%` }}
                        />
                      </div>
                      <p className="loyalty-progress-text">
                        {1000 - (dashboardData?.loyalty_points || 0)} more points to unlock Premium Member benefits
                      </p>
                    </div>

                    <div className="metric-card">
                      <FontAwesomeIcon icon={faUserCircle} />
                      <h3>{dashboardData?.member_status || "Standard"}</h3>
                      <p>Member Status</p>
                    </div>
                  </article>
                </section>

                <section className="dashboard-bottom">
                  <article className="panel bookings-panel">
                    <div className="panel-header space-between">
                      <div>
                        <span className="eyebrow">Appointments</span>
                        <h2>Recent Bookings</h2>
                      </div>

                      <NavLink to="/customer/bookings" className="see-all-link">
                        See all
                      </NavLink>
                    </div>

                    <div className="booking-list">
                      {recentBookings.length > 0 ? (
                        recentBookings.map((booking, index) => (
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

                            <div className="booking-info">
                              <div>
                                <strong>Pet</strong>
                                <p>{booking.petName}</p>
                              </div>

                              <div>
                                <strong>Service</strong>
                                <p>{booking.service}</p>
                              </div>

                              <div>
                                <strong>Date</strong>
                                <p>{booking.date}</p>
                              </div>
                            </div>

                            <div className="booking-timeline">
                              {getBookingProgress(booking.status).map((step, stepIndex) => (
                                <div
                                  key={step.key}
                                  className={`timeline-step ${step.active ? "active" : ""} ${step.current ? "current" : ""}`}
                                >
                                  <div className="timeline-dot" />
                                  <span className="timeline-label">{step.label}</span>
                                </div>
                              ))}
                            </div>

                            <div className="booking-footer">
                              <span>
                                <FontAwesomeIcon icon={faCalendarAlt} /> {booking.date}
                              </span>

                              <NavLink to="/customer/bookings" className="secondary-btn">
                                View Details
                              </NavLink>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state">
                          <FontAwesomeIcon icon={faCalendarAlt} className="empty-icon" />
                          <h3>No bookings yet</h3>
                          <p>Your recent bookings will appear here once you schedule a service.</p>
                          <NavLink to="/customer/bookings" className="primary-btn">
                            Book a Service
                          </NavLink>
                        </div>
                      )}
                    </div>
                  </article>

                  <article className="panel activity-panel">
                    <div className="panel-header">
                      <span className="eyebrow">Activity</span>
                      <h2>Recent Activity</h2>
                      <p>Your latest service and appointment overview.</p>
                    </div>

                    <div className="activity-metrics">
                      <div className="status-card success">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <strong>{dashboardData?.completed_services || 0}</strong>
                        <p>Completed Services</p>
                      </div>

                      <div className="status-card info">
                        <FontAwesomeIcon icon={faClock} />
                        <strong>{dashboardData?.active_bookings || 0}</strong>
                        <p>Upcoming Appointments</p>
                      </div>
                    </div>

                    <div className="activity-summary">
                      <p>
                        You currently have <strong>{dashboardData?.active_bookings || 0}</strong>{" "}
                        active bookings and <strong>{dashboardData?.total_pets || 0}</strong>{" "}
                        registered pets.
                      </p>
                    </div>
                  </article>

                  <article className="panel reminders-panel">
                    <div className="panel-header">
                      <span className="eyebrow">Reminders</span>
                      <h2>Before Your Visit</h2>
                    </div>
                    <div className="reminders-list">
                      <div className="reminder-item">
                        <FontAwesomeIcon icon={faPaw} />
                        <span>Bring your pet vaccination card</span>
                      </div>
                      <div className="reminder-item">
                        <FontAwesomeIcon icon={faClock} />
                        <span>Arrive 10 minutes before schedule</span>
                      </div>
                      <div className="reminder-item">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>Check your booking status before visiting</span>
                      </div>
                      <div className="reminder-item">
                        <FontAwesomeIcon icon={faHeart} />
                        <span>Ensure your pet is well-rested and fed</span>
                      </div>
                    </div>
                  </article>
                </section>
              </>
            )}
          </section>
        ) : (
          <section className="dashboard-content">
            <Outlet />
          </section>
        )}
      </main>

      <CustomerDashboardChatbot />
    </div>
  );
};

export default CustomerDashboard;
