import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoon,
  faSun,
  faUserCircle,
  faUsers,
  faClipboardList,
  faArrowTrendUp,
  faCalendarCheck,
  faBoxOpen,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { faBars } from "@fortawesome/free-solid-svg-icons/faBars";
import AdminSidebar from "./AdminSidebar";
import RoleAwareChatbot from "../chatbot/RoleAwareChatbot";
import NotificationDropdown from "../shared/NotificationDropdown";
import "./AdminDashboard.css";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";

const AdminDashboard = () => {
  const name = localStorage.getItem("name") || "Admin";
  const [theme, setTheme] = useState("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizedPath = location.pathname.replace(/\/+$/, "");
  const showOverview = normalizedPath === "/admin";

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

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const time = new Date(timestamp).getTime();
    const diff = Date.now() - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const summaryCards = dashboardData
    ? [
        {
          title: "Total Users",
          value: dashboardData.total_users || 0,
          subtitle: "Registered accounts",
          icon: faUsers,
        },
        {
          title: "Active Users",
          value: dashboardData.active_users || 0,
          subtitle: "Enabled team members",
          icon: faUserShield,
        },
        {
          title: "Total Customers",
          value: dashboardData.total_customers || 0,
          subtitle: "Customer records",
          icon: faUsers,
        },
        {
          title: "Today's Appointments",
          value: dashboardData.today_appointments || 0,
          subtitle: "Scheduled for today",
          icon: faCalendarCheck,
        },
        {
          title: "Total Revenue",
          value: formatCurrency(dashboardData.total_revenue || 0),
          subtitle: "All-time collections",
          icon: faArrowTrendUp,
        },
        {
          title: "Low Stock Items",
          value: dashboardData.low_stock_items || 0,
          subtitle: "Need replenishment",
          icon: faBoxOpen,
        },
      ]
    : [];

  const completionRate = dashboardData?.total_appointments
    ? Math.round((dashboardData.completed_appointments / dashboardData.total_appointments) * 100)
    : 0;
  const activeUserRate = dashboardData?.total_users
    ? Math.round(((dashboardData.active_users || 0) / dashboardData.total_users) * 100)
    : 0;
  const pendingAppointments = Math.max(
    (dashboardData?.total_appointments || 0) - (dashboardData?.completed_appointments || 0),
    0
  );
  const lowStockMessage = dashboardData?.low_stock_items
    ? `${dashboardData.low_stock_items} inventory item(s) need restocking.`
    : "Inventory is currently within safe stock levels.";

  const orderRequests = dashboardData
    ? [
        ...(dashboardData.recent_appointments || []).map((apt) => ({
          id: apt.id,
          name: apt.customer?.name || "Unknown Customer",
          time: formatRelativeTime(apt.scheduled_at),
          date: new Date(apt.scheduled_at).toLocaleDateString(),
          service: apt.service?.name || "Service",
          pet: apt.pet?.name || "Pet",
          status: apt.status || "scheduled",
          type: "appointment",
        })),
        ...(dashboardData.recent_users || []).map((user) => ({
          id: user.id,
          name: user.name || user.username,
          time: formatRelativeTime(user.created_at),
          date: new Date(user.created_at).toLocaleDateString(),
          role: user.role || "user",
          status: user.is_active ? "active" : "inactive",
          type: "user",
        })),
      ].slice(0, 10)
    : [];

  const pageCopy = showOverview
    ? {
        title: "Admin Command Center",
        subtitle:
          "Track service flow, staff activity, revenue, and stock pressure from one polished workspace.",
      }
    : {
        title: "Admin Workspace",
        subtitle: "Manage users, reports, payroll, and operations with live context always in reach.",
      };

  return (
    <div className={`admin-dashboard ${theme} ${sidebarCollapsed ? "collapsed" : ""} ${mobileMenuOpen ? "mobile-open" : ""}`}>
      <AdminSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
      />

      <main className="admin-main">
        <header className="admin-navbar top-navbar">
          <div className="navbar-left">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            <h1>{pageCopy.title}</h1>
            <p>{pageCopy.subtitle}</p>
          </div>

          <div className="search-group admin-status-strip">
            <span className="status-strip-pill">
              <strong>{completionRate}%</strong> completion rate
            </span>
            <span className="status-strip-pill">
              <strong>{activeUserRate}%</strong> users active
            </span>
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
                <div className="loading-spinner">
                  <div className="loading-spinner-wrapper">
                    <div className="loading-spinner-circle primary"></div>
                    <div className="loading-spinner-circle secondary"></div>
                    <div className="loading-spinner-circle tertiary"></div>
                  </div>
                  <div>Loading dashboard...</div>
                  <div className="loading-spinner-dots">
                    <div className="loading-spinner-dot"></div>
                    <div className="loading-spinner-dot"></div>
                    <div className="loading-spinner-dot"></div>
                  </div>
                </div>
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
                    <article key={card.title} className="overview-card">
                      <div className="overview-card-copy">
                        <span className="overview-card-icon">
                          <FontAwesomeIcon icon={card.icon} />
                        </span>
                        <h3>{card.value}</h3>
                        <p>{card.title}</p>
                        <small>{card.subtitle}</small>
                      </div>
                    </article>
                  ))}
                </section>

                <section className="dashboard-grid">
                  <article className="panel overview-panel">
                    <div className="panel-header">
                      <div>
                        <h2>Appointment Status</h2>
                        <p>Live appointment rundown grouped by service progress.</p>
                      </div>
                      <span className="badge">{dashboardData?.today_appointments || 0} today</span>
                    </div>

                    <div className="status-summary-grid">
                      {(dashboardData?.appointments_by_status || []).map((status) => (
                        <div key={status.status} className={`status-pill status-${status.status}`}>
                          <strong>{status.count}</strong>
                          <span>{status.status}</span>
                        </div>
                      ))}
                    </div>

                    <div className="status-bars">
                      {(dashboardData?.appointments_by_status || []).map((status) => (
                        <div key={status.status} className="status-bar-row">
                          <span>{status.status}</span>
                          <div className="status-bar-track">
                            <div
                              className="status-bar-fill"
                              style={{
                                width: `${Math.min(
                                  (status.count / Math.max(dashboardData.total_appointments || 1, 1)) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                          <strong>{status.count}</strong>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="panel quick-stat-panel">
                    <div className="metric-card accent spotlight-card">
                      <span className="metric-kicker">Daily Pulse</span>
                      <h3>{formatCurrency(dashboardData?.today_revenue || 0)}</h3>
                      <p>Revenue collected today</p>
                      <small>Use this to gauge service demand and cashier throughput.</small>
                    </div>

                    <div className="metric-card">
                      <span className="metric-kicker">Service Flow</span>
                      <h3>{pendingAppointments}</h3>
                      <p>Appointments still in progress</p>
                      <small>{lowStockMessage}</small>
                    </div>

                    <div className="metric-card compact-metric">
                      <span className="metric-kicker">Staff Readiness</span>
                      <h3>{dashboardData?.active_users || 0}</h3>
                      <p>Active accounts with dashboard access</p>
                    </div>
                  </article>
                </section>

                <section className="dashboard-bottom">
                  <div className="panel orders-panel">
                    <div className="panel-header space-between">
                      <div>
                        <h2>Recent Operational Activity</h2>
                        <p>Newest appointments and user registrations in one stream.</p>
                      </div>
                      <NavLink to="/admin/reports" className="see-all-link">
                        See all ({orderRequests.length})
                      </NavLink>
                    </div>

                    <div className="request-list">
                      {orderRequests.length > 0 ? (
                        orderRequests.map((order) => (
                          <div key={`${order.type}-${order.id}`} className="request-card">
                            <div className="request-card-top">
                              <div>
                                <h3>{order.name}</h3>
                                <p>
                                  {order.time} • {order.date}
                                </p>
                              </div>
                              <span className={`status-badge ${order.status}`}>
                                {order.type === "appointment" ? order.status : order.role}
                              </span>
                            </div>
                            <div className="request-info">
                              {order.type === "appointment" ? (
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
                                <FontAwesomeIcon icon={faUsers} />{" "}
                                {order.type === "appointment" ? "Customer" : "New User"}
                              </span>
                              <span>
                                <FontAwesomeIcon icon={faClipboardList} /> {order.type}
                              </span>
                              <button className="secondary-btn" type="button">
                                {order.type === "appointment" ? "View Appointment" : "View User"}
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-panel-state">
                          <h3>No recent requests</h3>
                          <p>New appointments and registrations will show up here as activity comes in.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="panel completion-panel">
                    <div className="panel-header space-between">
                      <div>
                        <h2>Operations Snapshot</h2>
                        <p>Quick indicators for service completion, volume, and inventory pressure.</p>
                      </div>
                      <NavLink to="/admin/reports" className="see-all-link">
                        See report
                      </NavLink>
                    </div>
                    <div className="completion-metrics">
                      <div className="status-card success">
                        <strong>{completionRate}%</strong>
                        <p>Completion rate</p>
                      </div>
                      <div className="status-card info">
                        <strong>{dashboardData?.total_appointments || 0}</strong>
                        <p>Total appointments</p>
                      </div>
                      <div className="status-card danger">
                        <strong>{dashboardData?.low_stock_items || 0}</strong>
                        <p>Low stock alerts</p>
                      </div>
                    </div>
                    <div className="mini-chart-placeholder">
                      <div className="insight-stack">
                        <div>
                          <strong>{dashboardData?.today_appointments || 0}</strong>
                          <span>Scheduled today</span>
                        </div>
                        <div>
                          <strong>{dashboardData?.completed_appointments || 0}</strong>
                          <span>Completed overall</span>
                        </div>
                        <div>
                          <strong>{dashboardData?.total_customers || 0}</strong>
                          <span>Customer records</span>
                        </div>
                      </div>
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
        title="Admin Assistant"
        subtitle="Logs, navigation, and RBAC guidance"
      />
    </div>
  );
};

export default AdminDashboard;
