import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faMoon,
  faSun,
  faUserCircle,
  faCalendarAlt,
  faUsers,
  faPhone,
  faClipboardList,
  faClock,
  faCheckCircle,
  faArrowUp,
  faPaw,
} from "@fortawesome/free-solid-svg-icons";
import ReceptionistSidebar from "./ReceptionistSidebar";
import "./ReceptionistDashboard.css";
import { apiRequest } from "../../api/client";

const ReceptionistDashboard = () => {
  const name = localStorage.getItem("name") || "Receptionist";
  const [theme, setTheme] = useState("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadNotifications] = useState(8);
  const location = useLocation();

  // Backend data states
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizedPath = location.pathname.replace(/\/+$/, "");
  const showOverview = normalizedPath === "/receptionist";

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await apiRequest("/receptionist/dashboard");
        setDashboardData(data);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
        console.error("Receptionist dashboard fetch error:", err);
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
      title: "Today's Appointments",
      value: dashboardData.today_appointments || 0,
      subtitle: "Scheduled",
      change: "",
    },
    {
      title: "Check-ins",
      value: dashboardData.check_ins_today || 0,
      subtitle: "Completed",
      change: "",
    },
    {
      title: "Pending",
      value: dashboardData.pending_appointments || 0,
      subtitle: "Awaiting confirmation",
      change: "",
    },
    {
      title: "Total Customers",
      value: dashboardData.total_customers || 0,
      subtitle: "Registered",
      change: "",
    },
  ] : [];

  const todayAppointments = dashboardData ? (dashboardData.upcoming_appointments || []).map((apt) => ({
    id: `APT-${String(apt.id).padStart(3, '0')}`,
    customer: apt.customer?.name || 'Unknown Customer',
    pet: apt.pet?.name ? `${apt.pet.name} (${apt.pet.species || 'Pet'})` : 'Unknown Pet',
    time: new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    service: apt.service?.name || 'Service',
    status: apt.status || 'scheduled',
  })) : [];

  const recentCustomers = dashboardData ? (dashboardData.recent_customers || []).map((cust) => ({
    id: cust.id,
    name: cust.name,
    phone: cust.phone || 'No phone',
    pets: cust.pets?.length || 0,
  })) : [];

  return (
    <div className={`receptionist-dashboard ${theme} ${sidebarCollapsed ? "collapsed" : ""}`}>
      <ReceptionistSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <main className="receptionist-main">
        <header className="receptionist-navbar top-navbar">
          <div className="navbar-left">
            <h1>Reception Desk</h1>
            <p>Manage appointments and customer check-ins</p>
          </div>

          <div className="search-group">
            <input
              type="text"
              placeholder="Search customers, appointments, pets..."
            />
          </div>

          <div className="navbar-actions">
            <NavLink to="/receptionist/profile" className="receptionist-profile-btn">
              <span className="profile-avatar-icon">
                <FontAwesomeIcon icon={faUserCircle} />
              </span>
              <span className="profile-info">
                <span className="profile-action-name">{name}</span>
                <span className="profile-action-role">Receptionist</span>
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
                        <h2>Today's Appointments</h2>
                        <p>Upcoming visits and check-ins</p>
                      </div>
                      <span className="badge">{dashboardData?.today_appointments || 0} Total</span>
                    </div>
                    <div className="appointment-list">
                      {todayAppointments.map((apt, index) => (
                        <div key={index} className="appointment-item">
                          <div className="appointment-header">
                            <div className="appointment-info">
                              <h3>{apt.id}</h3>
                              <p><FontAwesomeIcon icon={faUsers} /> {apt.customer}</p>
                              <p><FontAwesomeIcon icon={faPaw} /> {apt.pet}</p>
                            </div>
                            <div className="appointment-time">
                              <strong><FontAwesomeIcon icon={faClock} /> {apt.time}</strong>
                              <span className={`status-badge ${apt.status}`}>
                                {apt.status}
                              </span>
                            </div>
                          </div>
                          <div className="appointment-details">
                            <span>
                              <FontAwesomeIcon icon={faClipboardList} /> {apt.service}
                            </span>
                            <span>
                              <FontAwesomeIcon icon={faCheckCircle} /> {apt.status === 'checked-in' ? 'Ready' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {todayAppointments.length === 0 && (
                        <div className="no-data">No appointments scheduled today</div>
                      )}
                    </div>
                  </article>

                  <article className="panel quick-stat-panel">
                    <div className="metric-card accent">
                      <h3>{dashboardData?.total_pets || 0}</h3>
                      <p>Total Pets</p>
                      <small>Registered</small>
                    </div>

                    <div className="metric-card">
                      <h3>{dashboardData?.confirmed_appointments || 0}</h3>
                      <p>Confirmed</p>
                    </div>

                    <div className="metric-card">
                      <h3>{dashboardData?.completed_appointments || 0}</h3>
                      <p>Completed Today</p>
                    </div>
                  </article>
                </section>

                <section className="dashboard-bottom">
                  <div className="panel customers-panel">
                    <div className="panel-header space-between">
                      <div>
                        <h2>Recent Customers</h2>
                      </div>
                      <NavLink to="/receptionist/customers" className="see-all-link">
                        View all
                      </NavLink>
                    </div>

                    <div className="customer-list">
                      {recentCustomers.map((cust, index) => (
                        <div key={index} className="customer-item">
                          <div className="customer-icon">
                            <FontAwesomeIcon icon={faUsers} />
                          </div>
                          <div className="customer-info">
                            <h4>{cust.name}</h4>
                            <p><FontAwesomeIcon icon={faPhone} /> {cust.phone}</p>
                          </div>
                          <div className="customer-pets">
                            <span><FontAwesomeIcon icon={faPaw} /> {cust.pets} pets</span>
                          </div>
                        </div>
                      ))}
                      {recentCustomers.length === 0 && (
                        <div className="no-data">No customers found</div>
                      )}
                    </div>
                  </div>

                  <div className="panel performance-panel">
                    <div className="panel-header space-between">
                      <div>
                        <h2>Reception Metrics</h2>
                      </div>
                      <NavLink to="/receptionist/analytics" className="see-all-link">
                        View analytics
                      </NavLink>
                    </div>
                    
                    <div className="reception-metrics">
                      <div className="status-card success">
                        <strong>{dashboardData?.check_ins_today || 0}</strong>
                        <p>Check-ins</p>
                        <small>Today's completed</small>
                      </div>
                      <div className="status-card info">
                        <strong>{dashboardData?.pending_appointments || 0}</strong>
                        <p>Pending</p>
                        <small>Need confirmation</small>
                      </div>
                    </div>
                    
                    <div className="mini-chart-placeholder">
                      <FontAwesomeIcon icon={faArrowUp} />
                      <span>Daily Trends</span>
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
    </div>
  );
};

export default ReceptionistDashboard;
