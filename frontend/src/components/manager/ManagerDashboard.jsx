import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  faMoon,
  faSun,
  faUsers,
  faCalendarAlt,
  faArrowUp,
  faSearch,
  faTimes,
  faCheck,
  faClock,
  faArrowTrendUp,
  faArrowTrendDown,
  faExclamationTriangle,
  faSpinner,
  faRefresh,
  faChartLine,
  faHotel,
  faFileInvoice,
  faArrowRight,
  faMoneyBill,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest, uploadProfilePhoto } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import ManagerSidebar from "./ManagerSidebar";
import RoleAwareChatbot from "../chatbot/RoleAwareChatbot";
import NotificationDropdown from "../shared/NotificationDropdown";
import DashboardProfile from "../shared/DashboardProfile";
import "./ManagerDashboard.css";

const ManagerDashboard = () => {
  const name = localStorage.getItem("name") || "Manager";
  const profilePhoto = localStorage.getItem("profile_photo") || "";
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");
  const [animatedStats, setAnimatedStats] = useState(false);
  const [hotelStats, setHotelStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    occupancyRate: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    revenue: 0,
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staffStats, setStaffStats] = useState({
    onlineStaff: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const location = useLocation();

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

  const normalizedPath = location.pathname.replace(/\/+$/, "");
  const showOverview =
    normalizedPath === "/manager" || normalizedPath === "/manager/";

  const revenueChartData = useMemo(() => {
    if (!dashboardData?.monthly_revenue) return [];
    // Generate from actual monthly revenue data if available
    return Array.isArray(dashboardData.monthly_revenue) 
      ? dashboardData.monthly_revenue.map(item => ({
          month: new Date(item.month || Date.now()).toLocaleDateString('en-US', { month: 'short' }),
          revenue: Number(item.revenue || item.amount || 0),
        }))
      : [];
  }, [dashboardData]);

  const staffChartData = useMemo(() => {
    if (!dashboardData?.staff_performance) return [];
    // Generate from actual staff data
    const roleCounts = {};
    dashboardData.staff_performance.forEach(staff => {
      const role = staff.role || 'Other';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
    return Object.entries(roleCounts).map(([department, staff]) => ({
      department: department.charAt(0).toUpperCase() + department.slice(1),
      staff,
    }));
  }, [dashboardData]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/manager/dashboard");
      
      setDashboardData(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
      console.error("Manager dashboard fetch error:", err);
      // Set empty state on error, not demo data
      setDashboardData({
        total_staff: 0,
        active_staff: 0,
        today_appointments: 0,
        completed_appointments: 0,
        pending_appointments: 0,
        today_revenue: 0,
        monthly_revenue: 0,
        recent_tasks: [],
        staff_performance: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showOverview) {
      fetchDashboardData();
    }
  }, [showOverview]);

  const summaryCards = useMemo(() => dashboardData ? [
    {
      title: "Total Orders",
      value: dashboardData.total_orders || 0,
      subtitle: `${dashboardData.approved_orders || 0} approved`,
      change: "",
      icon: faFileInvoice,
      color: "blue",
      trend: "up",
    },
    {
      title: "Paid Orders",
      value: dashboardData.paid_orders || 0,
      subtitle: `${dashboardData.pending_payments || 0} pending payments`,
      change: "",
      icon: faMoneyBill,
      color: "green",
      trend: "up",
    },
    {
      title: "Rejected Orders",
      value: dashboardData.rejected_orders || 0,
      subtitle: "Rejected or cancelled",
      change: "",
      icon: faExclamationTriangle,
      color: "orange",
      trend: "stable",
    },
    {
      title: "Sales Total",
      value: formatCurrency(dashboardData.sales_total || dashboardData.monthly_revenue || 0),
      subtitle: `Today: ${formatCurrency(dashboardData.today_revenue || 0)}`,
      change: "",
      icon: faChartLine,
      color: dashboardData.monthly_revenue > 5000 ? "green" : "orange",
      trend: dashboardData.monthly_revenue > 5000 ? "up" : "stable",
    },
    {
      title: "Low Stock",
      value: dashboardData.low_stock_count || 0,
      subtitle: `${dashboardData.completed_services || 0} completed services`,
      change: "",
      icon: faExclamationTriangle,
      color: (dashboardData.low_stock_count || 0) > 0 ? "red" : "green",
      trend: "stable",
    },
  ] : [], [dashboardData, hotelStats]);

  const [teamPerformance, setTeamPerformance] = useState([]);

  const transformStaffPerformance = (staffData) => {
    if (!staffData || !Array.isArray(staffData)) return [];

    const byRole = staffData.reduce((acc, staff) => {
      const role = staff.role || 'Other';
      if (!acc[role]) {
        acc[role] = { 
          department: role.charAt(0).toUpperCase() + role.slice(1),
          staff: 0, 
          active: 0,
          efficiency: 0 
        };
      }
      acc[role].staff++;
      if (staff.is_active) acc[role].active++;
      return acc;
    }, {});

    return Object.values(byRole).map(dept => ({
      department: dept.department,
      efficiency: Math.round((dept.active / Math.max(dept.staff, 1)) * 100),
      tasks: dept.staff * 5, // Estimate based on staff count
      staff: dept.staff,
      completedToday: dept.active * 2, // Estimate
      avgResponseTime: "2.5 min",
      satisfaction: 4.5,
      trend: dept.active > dept.staff * 0.7 ? "up" : "stable"
    }));
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [dashData, staffData] = await Promise.all([
        apiRequest("/manager/dashboard"),
        apiRequest("/manager/staff")
      ]);
      setDashboardData(dashData);

      const staffList = dashData.staff_performance || staffData?.staff || [];
      setTeamPerformance(transformStaffPerformance(staffList));

      const activeStaff = staffList.filter(s => s.is_active).length;
      setStaffStats({
        onlineStaff: activeStaff,
        totalTasks: staffList.length * 5,
        completedTasks: activeStaff * 3,
        pendingTasks: staffList.length * 2
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filteredTeamPerformance = useMemo(() => {
    if (!searchTerm) return teamPerformance;
    return teamPerformance.filter(dept => 
      dept.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teamPerformance, searchTerm]);

  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <FontAwesomeIcon icon={faSpinner} className="spinning" />
      <span>Loading...</span>
    </div>
  );

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedStats(true), 100);

    const fetchHotelStats = async () => {
      try {
        const data = await apiRequest("/receptionist/requests");

        const hotelRequests = data.requests.filter(item => item.type === "hotel");
        const totalRooms = 50; // Fixed total rooms
        const occupiedRooms = hotelRequests.filter(r => r.status === "checked_in").length;
        const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

        setHotelStats({
          totalRooms,
          occupiedRooms,
          occupancyRate,
          todayCheckIns: hotelRequests.filter(r => r.status === "approved").length,
          todayCheckOuts: hotelRequests.filter(r => r.status === "checked_out").length,
          revenue: 0, // Would need separate revenue endpoint
        });
      } catch (error) {
        console.error("Failed to fetch hotel stats:", error);
      }
    };

    fetchHotelStats();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`manager-dashboard ${sidebarCollapsed ? "collapsed" : ""}`}>
      <ManagerSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <main className="manager-main">
        <header className="manager-navbar top-navbar">
          <div className="navbar-left">
            <h1>Management Overview</h1>
            <p>Monitor team performance and operational metrics</p>
          </div>

          <div className="search-group">
            <div className="search-input-wrapper">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search staff, projects, tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={searchTerm ? "has-value" : ""}
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm("")}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
          </div>

          <div className="navbar-actions">
            <DashboardProfile
              name={name}
              role="Manager"
              image={profilePhoto}
              onUpload={handleProfilePhotoUpload}
            />

            <NotificationDropdown />

            <button 
              className="icon-btn refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh data"
            >
              <FontAwesomeIcon icon={refreshing ? faSpinner : faRefresh} className={refreshing ? "spinning" : ""} />
            </button>

            <button
              className="theme-toggle-btn"
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              title="Toggle theme"
            >
              <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
            </button>
          </div>
        </header>

        {showOverview ? (
          <>
            <section className="overview-cards">
              {summaryCards.map((card, index) => (
                <div 
                  key={card.title} 
                  className={`overview-card ${card.color} ${animatedStats ? 'animate' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="card-content">
                    <div className="card-icon">
                      <FontAwesomeIcon icon={card.icon} />
                    </div>
                    <div className="card-info">
                      <h3 className={`stat-value ${animatedStats ? 'count-up' : ''}`}>
                        {card.value}
                        {card.title.includes("Rate") && "%"}
                      </h3>
                      <p className="stat-label">{card.title}</p>
                      <span className="stat-subtitle">{card.subtitle}</span>
                    </div>
                  </div>
                  <div className={`card-change ${card.trend}`}>
                    <FontAwesomeIcon icon={card.trend === 'up' ? faArrowTrendUp : faArrowTrendDown} />
                    <span>{card.change}</span>
                  </div>
                  {card.color === 'red' && (
                    <div className="warning-indicator">
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                    </div>
                  )}
                </div>
              ))}
            </section>

            <section className="manager-quick-actions">
              <NavLink to="/manager/payroll" className="quick-action-card">
                <span className="quick-action-icon">
                  <FontAwesomeIcon icon={faMoneyBill} />
                </span>
                <span className="quick-action-content">
                  <strong>Payroll</strong>
                  <small>Generate and approve payroll</small>
                </span>
                <FontAwesomeIcon icon={faArrowRight} className="quick-action-arrow" />
              </NavLink>
              <NavLink to="/manager/reports" className="quick-action-card">
                <span className="quick-action-icon">
                  <FontAwesomeIcon icon={faFileInvoice} />
                </span>
                <span className="quick-action-content">
                  <strong>View Reports</strong>
                  <small>Open monthly and operational reports</small>
                </span>
                <FontAwesomeIcon icon={faArrowRight} className="quick-action-arrow" />
              </NavLink>
              <NavLink to="/manager/staff" className="quick-action-card">
                <span className="quick-action-icon">
                  <FontAwesomeIcon icon={faUsers} />
                </span>
                <span className="quick-action-content">
                  <strong>Monitor Staff</strong>
                  <small>Check active employees and team status</small>
                </span>
                <FontAwesomeIcon icon={faArrowRight} className="quick-action-arrow" />
              </NavLink>
              <NavLink to="/manager/attendance" className="quick-action-card">
                <span className="quick-action-icon">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </span>
                <span className="quick-action-content">
                  <strong>Attendance</strong>
                  <small>Review attendance and time tracking</small>
                </span>
                <FontAwesomeIcon icon={faArrowRight} className="quick-action-arrow" />
              </NavLink>
            </section>

            <section className="manager-charts">
              <div className="chart-card">
                <h3>Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <h3>Staff Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={staffChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="staff" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="dashboard-grid">
              <article className="panel overview-panel">
                <div className="panel-header">
                  <div>
                    <h2>Team Performance</h2>
                  </div>
                  <span className="badge">4 Departments</span>
                </div>
                {refreshing ? (
                  <div className="loading-container">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="performance-grid">
                    {filteredTeamPerformance.length > 0 ? (
                      filteredTeamPerformance.map((dept, index) => (
                        <div key={index} className={`performance-card ${dept.trend}`}>
                          <div className="performance-header">
                            <div className="dept-info">
                              <h3>{dept.department}</h3>
                              <div className="trend-indicator">
                                <FontAwesomeIcon icon={dept.trend === 'up' ? faArrowTrendUp : dept.trend === 'down' ? faArrowTrendDown : faChartLine} />
                                <span>{dept.trend}</span>
                              </div>
                            </div>
                            <div className="efficiency-badge">
                              {dept.efficiency}%
                            </div>
                          </div>
                          <div className="performance-metrics">
                            <div className="metric">
                              <span className="metric-value">{dept.tasks}</span>
                              <span className="metric-label">Total Tasks</span>
                            </div>
                            <div className="metric">
                              <span className="metric-value">{dept.completedToday}</span>
                              <span className="metric-label">Today</span>
                            </div>
                            <div className="metric">
                              <span className="metric-value">{dept.staff}</span>
                              <span className="metric-label">Staff</span>
                            </div>
                          </div>
                          <div className="performance-details">
                            <div className="detail-item">
                              <FontAwesomeIcon icon={faClock} />
                              <span>{dept.avgResponseTime}</span>
                            </div>
                            <div className="detail-item">
                              <span className="satisfaction-score">{'\u2b50'.repeat(Math.floor(dept.satisfaction))}</span>
                              <span>{dept.satisfaction}/5.0</span>
                            </div>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${dept.efficiency}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-results">
                        <FontAwesomeIcon icon={faSearch} />
                        <p>No departments found matching "{searchTerm}"</p>
                      </div>
                    )}
                  </div>
                )}
              </article>

              <article className="panel quick-stat-panel">
                <div className="metric-card accent">
                  <h3>{staffStats.completedTasks}</h3>
                  <p>Tasks Completed</p>
                  <small>Team productivity</small>
                </div>

                <div className="metric-card">
                  <h3>{staffStats.onlineStaff}</h3>
                  <p>Staff Online</p>
                </div>

                <div className="metric-card">
                  <h3>{staffStats.pendingTasks}</h3>
                  <p>Pending Tasks</p>
                </div>
              </article>
            </section>

            <section className="dashboard-bottom">
              <div className="panel tasks-panel">
                <div className="panel-header space-between">
                  <div>
                    <h2>Recent Tasks</h2>
                  </div>
                  <NavLink to="/manager/reports" className="see-all-link">
                    See all activity
                  </NavLink>
                </div>

                <div className="task-list">
                  {dashboardData?.recent_tasks?.length > 0 ? (
                    dashboardData.recent_tasks.map((task, index) => (
                      <div className="task-item" key={index}>
                        <div className="task-header">
                          <h3>{task.title}</h3>
                          <span className={`status-badge ${task.status}`}>{task.status}</span>
                        </div>
                        <div className="task-info">
                          <span>
                            <FontAwesomeIcon icon={faUsers} /> {task.department}
                          </span>
                          <span>
                            <FontAwesomeIcon icon={faCalendarAlt} /> Due: {task.due_date}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">No active tasks</div>
                  )}
                </div>
              </div>

              <div className="panel analytics-panel">
                <div className="panel-header space-between">
                  <div>
                    <h2>Performance Analytics</h2>
                  </div>
                  <NavLink to="/manager/reports" className="see-all-link">
                    View details
                  </NavLink>
                </div>
                
                <div className="analytics-metrics">
                  <div className="status-card success">
                    <strong>{staffStats.completedTasks}</strong>
                    <p>Tasks Completed</p>
                    <small>This month</small>
                  </div>
                  <div className="status-card info">
                    <strong>{staffStats.onlineStaff}</strong>
                    <p>Staff Online</p>
                    <small>Currently active</small>
                  </div>
                </div>
                
                <div className="mini-chart-placeholder">
                  <FontAwesomeIcon icon={faArrowUp} />
                  <span>Performance Trend</span>
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
      <RoleAwareChatbot
        mode="widget"
        title="Manager Assistant"
        subtitle="Operations guidance and dashboard shortcuts"
      />
    </div>
  );
};

export default ManagerDashboard;
