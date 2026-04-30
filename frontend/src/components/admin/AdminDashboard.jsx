import React, { useState, useEffect, useMemo } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoon,
  faSun,
  faUsers,
  faClipboardList,
  faArrowTrendUp,
  faCalendarCheck,
  faBoxOpen,
  faUserShield,
  faBars,
  faServer,
  faDatabase,
  faSync,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";

import AdminSidebar from "./AdminSidebar";
import RoleAwareChatbot from "../chatbot/RoleAwareChatbot";
import NotificationDropdown from "../shared/NotificationDropdown";
import DashboardProfile from "../shared/DashboardProfile";
import "./AdminDashboard.css";
import { apiRequest, uploadProfilePhoto } from "../../api/client";
import { formatCurrency } from "../../utils/currency";

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const chartColors = ["#ff5f93", "#ff8db5", "#ffc8dd", "#f472b6", "#fb7185"];

const AdminDashboard = () => {
  const name = localStorage.getItem("name") || "Admin";
  const role = localStorage.getItem("role") || "admin";
  const profilePhoto = localStorage.getItem("profile_photo") || "";

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleProfilePhotoUpload = async (file) => {
    try {
      const data = await uploadProfilePhoto(file);
      localStorage.setItem("profile_photo", data.url || data.profile_photo);
      window.location.reload();
    } catch (err) {
      alert("Failed to upload profile photo: " + err.message);
    }
  };

  const location = useLocation();
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
      } finally {
        setLoading(false);
      }
    };

    if (showOverview) fetchDashboardData();
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

  const summaryCards = useMemo(() => {
    if (!dashboardData) return [];

    return [
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
        title: "Today’s Appointments",
        value: dashboardData.today_appointments || 0,
        subtitle: "Scheduled today",
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
    ];
  }, [dashboardData]);

  const appointmentStatusData = dashboardData?.appointments_by_status || [];
  const userRoleData = dashboardData?.users_by_role || [];

  const completionRate = dashboardData?.total_appointments
    ? Math.round(
        ((dashboardData.completed_appointments || 0) /
          dashboardData.total_appointments) *
          100
      )
    : 0;

  const activeUserRate = dashboardData?.total_users
    ? Math.round(
        ((dashboardData.active_users || 0) / dashboardData.total_users) * 100
      )
    : 0;

  const pendingAppointments = Math.max(
    (dashboardData?.total_appointments || 0) -
      (dashboardData?.completed_appointments || 0),
    0
  );

  const orderRequests = dashboardData
    ? [
        ...(dashboardData.recent_appointments || []).map((apt) => ({
          id: apt.id,
          name: apt.customer?.name || "Unknown Customer",
          time: formatRelativeTime(apt.scheduled_at),
          date: apt.scheduled_at
            ? new Date(apt.scheduled_at).toLocaleDateString()
            : "N/A",
          service: apt.service?.name || "Service",
          pet: apt.pet?.name || "Pet",
          status: apt.status || "scheduled",
          type: "appointment",
        })),
        ...(dashboardData.recent_users || []).map((user) => ({
          id: user.id,
          name: user.name || user.username,
          time: formatRelativeTime(user.created_at),
          date: user.created_at
            ? new Date(user.created_at).toLocaleDateString()
            : "N/A",
          role: user.role || "user",
          status: user.is_active ? "active" : "inactive",
          type: "user",
        })),
      ].slice(0, 8)
    : [];

  const pageCopy = showOverview
    ? {
        title: "Admin Command Center",
        subtitle:
          "Monitor appointments, users, revenue, and inventory performance in one premium workspace.",
      }
    : {
        title: "Admin Workspace",
        subtitle:
          "Manage platform operations with role-based access and live system context.",
      };

  return (
    <div className={`admin-dashboard ${mobileMenuOpen ? "mobile-open" : ""}`}>
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
      />

      <main className="admin-main">
        <header className="admin-navbar top-navbar">
          <div className="navbar-left">
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>

            <div>
              <h1>{pageCopy.title}</h1>
              <p>{pageCopy.subtitle}</p>
            </div>
          </div>

          <div className="search-group admin-status-strip">
            <span className="status-strip-pill">
              <strong>{completionRate}%</strong> completion
            </span>
            <span className="status-strip-pill">
              <strong>{activeUserRate}%</strong> active users
            </span>
            <span className="status-strip-pill role-pill">
              {role.toUpperCase()}
            </span>
          </div>

          <div className="navbar-actions">
            <DashboardProfile
              name={name}
              role="Administrator"
              image={profilePhoto}
              onUpload={handleProfilePhotoUpload}
            />

            <NotificationDropdown />

            <button
              className="theme-toggle-btn"
              type="button"
              onClick={() =>
                setTheme((prev) => (prev === "light" ? "dark" : "light"))
              }
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
                  <span>Loading dashboard...</span>
                </div>
              </div>
            ) : error ? (
              <div className="error-container">
                <div className="error-message">{error}</div>
                <button
                  onClick={() => window.location.reload()}
                  className="retry-btn"
                >
                  Retry
                </button>
              </div>
            ) : (
              <motion.div
                className="dashboard-motion-wrap"
                initial="hidden"
                animate="show"
                transition={{ staggerChildren: 0.08 }}
              >
                <section className="overview-cards">
                  {summaryCards.map((card) => (
                    <motion.article
                      key={card.title}
                      className="overview-card"
                      variants={cardVariants}
                      whileHover={{ y: -6, scale: 1.01 }}
                    >
                      <span className="overview-card-icon">
                        <FontAwesomeIcon icon={card.icon} />
                      </span>
                      <h3>{card.value}</h3>
                      <p>{card.title}</p>
                      <small>{card.subtitle}</small>
                    </motion.article>
                  ))}
                </section>

                <section className="dashboard-grid">
                  <motion.article className="panel" variants={cardVariants}>
                    <div className="panel-header">
                      <div>
                        <h2>Appointment Status</h2>
                        <p>Visual breakdown of appointment progress.</p>
                      </div>
                      <span className="badge">
                        {dashboardData?.total_appointments || 0} total
                      </span>
                    </div>

                    <div className="chart-box">
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={appointmentStatusData}>
                          <XAxis dataKey="status" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                            {appointmentStatusData.map((entry, index) => (
                              <Cell
                                key={entry.status}
                                fill={chartColors[index % chartColors.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.article>

                  <motion.article
                    className="panel quick-stat-panel"
                    variants={cardVariants}
                  >
                    <div className="metric-card accent">
                      <span className="metric-kicker">Daily Pulse</span>
                      <h3>
                        {formatCurrency(dashboardData?.today_revenue || 0)}
                      </h3>
                      <p>Revenue collected today</p>
                    </div>

                    <div className="metric-card">
                      <span className="metric-kicker">Service Flow</span>
                      <h3>{pendingAppointments}</h3>
                      <p>Appointments still in progress</p>
                    </div>

                    <div className="metric-card">
                      <span className="metric-kicker">Staff Readiness</span>
                      <h3>{dashboardData?.active_users || 0}</h3>
                      <p>Active dashboard accounts</p>
                    </div>

                    <div className="metric-card">
                      <span className="metric-kicker">System Status</span>
                      <h3>ONLINE</h3>
                      <p>All modules operational</p>
                    </div>
                  </motion.article>
                </section>

                <section className="dashboard-grid">
                  <motion.article className="panel" variants={cardVariants}>
                    <div className="panel-header">
                      <div>
                        <h2>Users by Role</h2>
                        <p>Role distribution across the system.</p>
                      </div>
                    </div>

                    <div className="chart-box">
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={userRoleData}
                            dataKey="count"
                            nameKey="role"
                            outerRadius={95}
                            innerRadius={55}
                            paddingAngle={4}
                          >
                            {userRoleData.map((entry, index) => (
                              <Cell
                                key={entry.role}
                                fill={chartColors[index % chartColors.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.article>

                  <motion.article className="panel" variants={cardVariants}>
                    <div className="panel-header">
                      <div>
                        <h2>Operations Snapshot</h2>
                        <p>Quick indicators for current performance.</p>
                      </div>
                    </div>

                    <div className="completion-metrics">
                      <div className="status-card success">
                        <strong>{completionRate}%</strong>
                        <p>Completion Rate</p>
                      </div>
                      <div className="status-card info">
                        <strong>{dashboardData?.total_appointments || 0}</strong>
                        <p>Total Appointments</p>
                      </div>
                      <div className="status-card danger">
                        <strong>{dashboardData?.low_stock_items || 0}</strong>
                        <p>Low Stock Alerts</p>
                      </div>
                    </div>
                  </motion.article>

                  <motion.article className="panel" variants={cardVariants}>
                    <div className="panel-header">
                      <div>
                        <h2>System Status</h2>
                        <p>Real-time platform health monitoring.</p>
                      </div>
                    </div>

                    <div className="system-status-grid">
                      <div className="system-status-item">
                        <span className="system-status-icon">
                          <FontAwesomeIcon icon={faServer} />
                        </span>
                        <div>
                          <strong>Backend</strong>
                          <p className="status-online">Online</p>
                        </div>
                      </div>
                      <div className="system-status-item">
                        <span className="system-status-icon">
                          <FontAwesomeIcon icon={faDatabase} />
                        </span>
                        <div>
                          <strong>Database</strong>
                          <p className="status-online">Connected</p>
                        </div>
                      </div>
                      <div className="system-status-item">
                        <span className="system-status-icon">
                          <FontAwesomeIcon icon={faSync} />
                        </span>
                        <div>
                          <strong>Last Sync</strong>
                          <p>Today</p>
                        </div>
                      </div>
                      <div className="system-status-item">
                        <span className="system-status-icon">
                          <FontAwesomeIcon icon={faLayerGroup} />
                        </span>
                        <div>
                          <strong>Active Role Modules</strong>
                          <p>7</p>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                </section>

                <section className="dashboard-bottom">
                  <motion.div
                    className="panel orders-panel"
                    variants={cardVariants}
                  >
                    <div className="panel-header space-between">
                      <div>
                        <h2>Recent Operational Activity</h2>
                        <p>Latest appointments and user registrations.</p>
                      </div>
                      <NavLink to="/admin/reports" className="see-all-link">
                        View reports
                      </NavLink>
                    </div>

                    <div className="request-list">
                      {orderRequests.length > 0 ? (
                        orderRequests.map((order) => (
                          <motion.div
                            key={`${order.type}-${order.id}`}
                            className="request-card"
                            whileHover={{ y: -4 }}
                          >
                            <div className="request-card-top">
                              <div>
                                <h3>{order.name}</h3>
                                <p>
                                  {order.time} • {order.date}
                                </p>
                              </div>
                              <span className={`status-badge ${order.status}`}>
                                {order.type === "appointment"
                                  ? order.status
                                  : order.role}
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
                                {order.type === "appointment"
                                  ? "Customer"
                                  : "New User"}
                              </span>
                              <span>
                                <FontAwesomeIcon icon={faClipboardList} />{" "}
                                {order.type}
                              </span>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="empty-panel-state">
                          <h3>System is running smoothly</h3>
                          <p>
                            No new activity detected. All operations are stable.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </section>
              </motion.div>
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