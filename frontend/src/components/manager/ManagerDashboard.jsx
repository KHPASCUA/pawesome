import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faMoon,
  faSun,
  faUserCircle,
  faUsers,
  faClipboardList,
  faCalendarAlt,
  faArrowUp,
  faArrowDown,
  faSearch,
  faTimes,
  faCheck,
  faClock,
  faArrowTrendUp,
  faArrowTrendDown,
  faExclamationTriangle,
  faSpinner,
  faRefresh,
  faFilter,
  faDownload,
  faEye,
  faEdit,
  faTrash,
  faPlus,
  faChartLine,
  faBullseye,
  faHeartbeat,
} from "@fortawesome/free-solid-svg-icons";
import ManagerSidebar from "./ManagerSidebar";
import RoleAwareChatbot from "../chatbot/RoleAwareChatbot";
import "./ManagerDashboard.css";

const ManagerDashboard = () => {
  const name = localStorage.getItem("name") || "Manager";
  const [theme, setTheme] = useState("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");
  const [animatedStats, setAnimatedStats] = useState(false);
  const location = useLocation();

  // Enhanced data with more realistic metrics
  const [realTimeData, setRealTimeData] = useState({
    onlineStaff: 18,
    totalTasks: 156,
    completedTasks: 142,
    pendingTasks: 14,
    systemHealth: 98,
    serverLoad: 45,
    activeProjects: 8,
  });

  const notifications = [
    { id: 1, type: "success", message: "Q1 Performance Review completed", time: "2 min ago", read: false },
    { id: 2, type: "warning", message: "Server load above 80% threshold", time: "15 min ago", read: false },
    { id: 3, type: "info", message: "New staff onboarding scheduled", time: "1 hour ago", read: true },
    { id: 4, type: "error", message: "Backup process failed", time: "2 hours ago", read: false },
    { id: 5, type: "success", message: "Monthly report generated", time: "3 hours ago", read: true },
  ];

  const normalizedPath = location.pathname.replace(/\/+$/, "");
  const showOverview = normalizedPath === "/manager";

  // Enhanced summary cards with real-time data
  const summaryCards = useMemo(() => [
    {
      title: "Team Members",
      value: realTimeData.onlineStaff,
      subtitle: `${realTimeData.onlineStaff} online now`,
      change: "+2",
      icon: faUsers,
      color: "blue",
      trend: "up",
    },
    {
      title: "Active Projects",
      value: realTimeData.activeProjects,
      subtitle: "In progress",
      change: "+1",
      icon: faBullseye,
      color: "green",
      trend: "up",
    },
    {
      title: "Tasks Completed",
      value: realTimeData.completedTasks,
      subtitle: `${realTimeData.pendingTasks} pending`,
      change: "+23",
      icon: faCheck,
      color: "purple",
      trend: "up",
    },
    {
      title: "System Health",
      value: realTimeData.systemHealth,
      subtitle: `Server load: ${realTimeData.serverLoad}%`,
      change: realTimeData.serverLoad > 80 ? "-2%" : "+1%",
      icon: faHeartbeat,
      color: realTimeData.serverLoad > 80 ? "red" : "orange",
      trend: realTimeData.serverLoad > 80 ? "down" : "up",
    },
  ], [realTimeData]);

  const teamPerformance = [
    {
      department: "Veterinary",
      efficiency: 96,
      tasks: 45,
      staff: 8,
      completedToday: 12,
      avgResponseTime: "2.3 min",
      satisfaction: 4.8,
      trend: "up",
    },
    {
      department: "Customer Service",
      efficiency: 92,
      tasks: 38,
      staff: 6,
      completedToday: 8,
      avgResponseTime: "1.8 min",
      satisfaction: 4.6,
      trend: "stable",
    },
    {
      department: "Inventory",
      efficiency: 88,
      tasks: 28,
      staff: 4,
      completedToday: 6,
      avgResponseTime: "3.1 min",
      satisfaction: 4.4,
      trend: "down",
    },
    {
      department: "Cashier",
      efficiency: 95,
      tasks: 45,
      staff: 6,
      completedToday: 15,
      avgResponseTime: "1.2 min",
      satisfaction: 4.7,
      trend: "up",
    },
  ];

  // Optimized interactive functions with useCallback
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate data refresh with error handling
      await new Promise(resolve => setTimeout(resolve, 1500));
      setRealTimeData(prev => ({
        ...prev,
        onlineStaff: Math.max(15, Math.min(25, prev.onlineStaff + Math.floor(Math.random() * 5) - 2)),
        serverLoad: Math.max(20, Math.min(90, prev.serverLoad + Math.floor(Math.random() * 10) - 5)),
      }));
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const markNotificationAsRead = useCallback((id) => {
    setUnreadNotifications(prev => Math.max(0, prev - 1));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setUnreadNotifications(0);
    setShowNotifications(false);
  }, []);

  // Memoized filtered data for search functionality
  const filteredTeamPerformance = useMemo(() => {
    if (!searchTerm) return teamPerformance;
    return teamPerformance.filter(dept => 
      dept.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teamPerformance, searchTerm]);

  // Loading state component
  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <FontAwesomeIcon icon={faSpinner} className="spinning" />
      <span>Loading...</span>
    </div>
  );

  // Auto-refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        onlineStaff: Math.max(15, Math.min(25, prev.onlineStaff + Math.floor(Math.random() * 3) - 1)),
        serverLoad: Math.max(20, Math.min(90, prev.serverLoad + Math.floor(Math.random() * 6) - 3)),
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Animation effect
  useEffect(() => {
    setTimeout(() => setAnimatedStats(true), 500);
  }, []);

  return (
    <div className={`manager-dashboard ${theme} ${sidebarCollapsed ? "collapsed" : ""}`}>
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
            <div className="time-range-selector">
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="time-range-select"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>

            <button 
              className="icon-btn refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh data"
            >
              <FontAwesomeIcon icon={refreshing ? faSpinner : faRefresh} className={refreshing ? "spinning" : ""} />
            </button>

            <div className="notification-dropdown">
              <button 
                className="icon-btn notification-btn" 
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FontAwesomeIcon icon={faBell} />
                {unreadNotifications > 0 && (
                  <span className="notification-badge pulse">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notifications-panel">
                  <div className="notifications-header">
                    <h3>Notifications</h3>
                    <button onClick={clearAllNotifications} className="clear-all">
                      Clear all
                    </button>
                  </div>
                  <div className="notifications-list">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${notification.type} ${!notification.read ? 'unread' : ''}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="notification-icon">
                          {notification.type === 'success' && <FontAwesomeIcon icon={faCheck} />}
                          {notification.type === 'warning' && <FontAwesomeIcon icon={faExclamationTriangle} />}
                          {notification.type === 'error' && <FontAwesomeIcon icon={faTimes} />}
                          {notification.type === 'info' && <FontAwesomeIcon icon={faClock} />}
                        </div>
                        <div className="notification-content">
                          <p>{notification.message}</p>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/manager/profile" className="manager-profile-btn">
              <span className="profile-avatar-icon">
                <FontAwesomeIcon icon={faUserCircle} />
              </span>
              <span className="profile-info">
                <span className="profile-action-name">{name}</span>
                <span className="profile-action-role">Manager</span>
              </span>
            </NavLink>

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

            <section className="dashboard-grid">
              <article className="panel overview-panel">
                <div className="panel-header">
                  <div>
                    <h2>Team Performance</h2>
                    <p>Department efficiency and task completion rates</p>
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
                  <h3>94%</h3>
                  <p>Overall Efficiency</p>
                  <small>+3% from last month</small>
                </div>

                <div className="metric-card">
                  <h3>24</h3>
                  <p>Team Members</p>
                </div>

                <div className="metric-card">
                  <h3>8</h3>
                  <p>Active Projects</p>
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
                  <div className="task-item">
                    <div className="task-header">
                      <h3>Q1 Performance Review</h3>
                      <span className="status-badge completed">Completed</span>
                    </div>
                    <div className="task-info">
                      <span>
                        <FontAwesomeIcon icon={faUsers} /> All Departments
                      </span>
                      <span>
                        <FontAwesomeIcon icon={faCalendarAlt} /> Due: Mar 31
                      </span>
                    </div>
                  </div>
                  
                  <div className="task-item">
                    <div className="task-header">
                      <h3>Staff Training Schedule</h3>
                      <span className="status-badge in-progress">In Progress</span>
                    </div>
                    <div className="task-info">
                      <span>
                        <FontAwesomeIcon icon={faUsers} /> Veterinary Team
                      </span>
                      <span>
                        <FontAwesomeIcon icon={faCalendarAlt} /> Due: Apr 15
                      </span>
                    </div>
                  </div>

                  <div className="task-item">
                    <div className="task-header">
                      <h3>Inventory Audit</h3>
                      <span className="status-badge pending">Pending</span>
                    </div>
                    <div className="task-info">
                      <span>
                        <FontAwesomeIcon icon={faClipboardList} /> Inventory Dept
                      </span>
                      <span>
                        <FontAwesomeIcon icon={faCalendarAlt} /> Due: Apr 5
                      </span>
                    </div>
                  </div>
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
                    <strong>156</strong>
                    <p>Tasks Completed</p>
                    <small>This month</small>
                  </div>
                  <div className="status-card info">
                    <strong>94%</strong>
                    <p>Team Efficiency</p>
                    <small>Average score</small>
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
