import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faMoon,
  faSun,
  faUserCircle,
  faUsers,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import AdminSidebar from "./AdminSidebar";
import "./AdminDashboard.css";
import { apiRequest } from "../../api/client";

const AdminDashboard = () => {
  const name = localStorage.getItem("name") || "Admin";
  const [theme, setTheme] = useState("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadNotifications] = useState(3);
  const location = useLocation();

  // Backend data states
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizedPath = location.pathname.replace(/\/+$/, "");
  const showOverview = normalizedPath === "/admin";

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await apiRequest("/admin/dashboard");
        setDashboardData(data);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
        console.error("Dashboard data fetch error:", err);
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
      title: "Total Users",
      value: dashboardData.total_users || 0,
      subtitle: "Registered users",
      change: "",
    },
    {
      title: "Active Users",
      value: dashboardData.active_users || 0,
      subtitle: "Currently active",
      change: "",
    },
    {
      title: "Total Customers",
      value: dashboardData.total_customers || 0,
      subtitle: "Registered customers",
      change: "",
    },
    {
      title: "Today's Appointments",
      value: dashboardData.today_appointments || 0,
      subtitle: "Scheduled today",
      change: "",
    },
    {
      title: "Total Appointments",
      value: dashboardData.total_appointments || 0,
      subtitle: "All appointments",
      change: "",
    },
    {
      title: "Completed Appointments",
      value: dashboardData.completed_appointments || 0,
      subtitle: "Finished services",
      change: "",
    },
    {
      title: "Total Revenue",
      value: `$${dashboardData.total_revenue || 0}`,
      subtitle: "All time revenue",
      change: "",
    },
    {
      title: "Today's Revenue",
      value: `$${dashboardData.today_revenue || 0}`,
      subtitle: "Revenue today",
      change: "",
    },
    {
      title: "Low Stock Items",
      value: dashboardData.low_stock_items || 0,
      subtitle: "Need restocking",
      change: "",
    },
  ] : [];

  const orderRequests = dashboardData ? [
    ...(dashboardData.recent_appointments || []).map(apt => ({
      id: apt.id,
      name: apt.customer?.name || 'Unknown Customer',
      time: 'Recently',
      date: new Date(apt.scheduled_at).toLocaleDateString(),
      service: apt.service?.name || 'Service',
      pet: apt.pet?.name || 'Pet',
      status: apt.status || 'scheduled',
      type: 'appointment'
    })),
    ...(dashboardData.recent_users || []).map(user => ({
      id: user.id,
      name: user.name || user.username,
      time: 'Recently',
      date: new Date(user.created_at).toLocaleDateString(),
      role: user.role || 'user',
      status: user.is_active ? 'active' : 'inactive',
      type: 'user'
    }))
  ].slice(0, 10) : [];

  return (
    <div className={`admin-dashboard ${theme} ${sidebarCollapsed ? "collapsed" : ""}`}>
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <main className="admin-main">
        <header className="admin-navbar top-navbar">
          <div className="navbar-left">
            <h1>Overview</h1>
            <p>Manage your team members and account permissions here.</p>
          </div>

          <div className="search-group">
            <input
              type="text"
              placeholder="Search orders, users, reports..."
            />
          </div>

          <div className="navbar-actions">
            <NavLink to="/admin/profile" className="admin-profile-btn">
              <span className="profile-avatar-icon">
                <FontAwesomeIcon icon={faUserCircle} />
              </span>
              <span className="profile-info">
                <span className="profile-action-name">{name}</span>
                <span className="profile-action-role">Administrator</span>
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
                    <h2>Monthly Overview</h2>
                    <p>
                      Total revenue and appointment performance
                    </p>
                  </div>
                  <span className="badge">{dashboardData?.today_appointments || 0} Appointments Today</span>
                </div>
                <div className="chart-placeholder">Chart placeholder</div>
              </article>

              <article className="panel quick-stat-panel">
                <div className="metric-card accent">
                  <h3>{dashboardData?.completed_appointments || 0}</h3>
                  <p>Completed Appointments</p>
                  <small>Total finished services</small>
                </div>

                <div className="metric-card">
                  <h3>${dashboardData?.today_revenue || 0}</h3>
                  <p>Today&apos;s Revenue</p>
                </div>
              </article>
            </section>

            <section className="dashboard-bottom">
              <div className="panel orders-panel">
                <div className="panel-header space-between">
                  <div>
                    <h2>New order requests</h2>
                  </div>
                  <NavLink to="/admin/reports" className="see-all-link">
                    See all ({orderRequests.length})
                  </NavLink>
                </div>

                <div className="request-list">
                  {orderRequests.map((order) => (
                    <div key={order.id} className="request-card">
                      <div className="request-card-top">
                        <div>
                          <h3>{order.name}</h3>
                          <p>{order.time} • {order.date}</p>
                        </div>
                        <span className={`status-badge ${order.status}`}>
                          {order.type === 'appointment' ? order.status : order.role}
                        </span>
                      </div>
                      <div className="request-info">
                        {order.type === 'appointment' ? (
                          <>
                            <div>
                              <strong>Service</strong>
                              <p>{order.service}</p>
                            </div>
                            <div>
                              <strong>Pet</strong>
                              <p>{order.pet}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <strong>Role</strong>
                              <p>{order.role}</p>
                            </div>
                            <div>
                              <strong>Status</strong>
                              <p>{order.status}</p>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="request-footer">
                        <span>
                          <FontAwesomeIcon icon={faUsers} /> {order.type === 'appointment' ? 'Customer' : 'New User'}
                        </span>
                        <span>
                          <FontAwesomeIcon icon={faClipboardList} /> {order.type}
                        </span>
                        <button className="secondary-btn" type="button">
                          {order.type === 'appointment' ? 'View Appointment' : 'View User'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel completion-panel">
                <div className="panel-header space-between">
                  <div>
                    <h2>Appointment Statistics</h2>
                  </div>
                  <NavLink to="/admin/reports" className="see-all-link">
                    See report
                  </NavLink>
                </div>
                <div className="completion-metrics">
                  <div className="status-card success">
                    <strong>{dashboardData?.total_appointments > 0 
                      ? Math.round((dashboardData.completed_appointments / dashboardData.total_appointments) * 100) 
                      : 0}%</strong>
                    <p>Completion rate</p>
                  </div>
                  <div className="status-card info">
                    <strong>{dashboardData?.total_appointments || 0}</strong>
                    <p>Total appointments</p>
                  </div>
                </div>
                <div className="mini-chart-placeholder">Chart placeholder</div>
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

export default AdminDashboard;
