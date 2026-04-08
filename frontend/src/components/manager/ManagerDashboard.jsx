import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faMoon,
  faSun,
  faUserCircle,
  faHome,
  faUsers,
  faChartBar,
  faClipboardList,
  faCog,
  faSignOutAlt,
  faBars,
  faUser,
  faCalendarAlt,
  faTasks,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import ManagerSidebar from "./ManagerSidebar";
import "./ManagerDashboard.css";

const ManagerDashboard = () => {
  const name = localStorage.getItem("name") || "Manager";
  const [theme, setTheme] = useState("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadNotifications] = useState(5);
  const location = useLocation();

  const normalizedPath = location.pathname.replace(/\/+$/, "");
  const showOverview = normalizedPath === "/manager";

  const summaryCards = [
    {
      title: "Team Members",
      value: 24,
      subtitle: "Active staff",
      change: "+2",
    },
    {
      title: "Projects Active",
      value: 8,
      subtitle: "In progress",
      change: "+1",
    },
    {
      title: "Tasks Completed",
      value: 156,
      subtitle: "This month",
      change: "+23",
    },
    {
      title: "Efficiency Rate",
      value: 94,
      subtitle: "Performance score",
      change: "+3%",
    },
  ];

  const teamPerformance = [
    {
      department: "Veterinary",
      efficiency: 96,
      tasks: 45,
      staff: 8,
    },
    {
      department: "Customer Service",
      efficiency: 92,
      tasks: 38,
      staff: 6,
    },
    {
      department: "Inventory",
      efficiency: 88,
      tasks: 28,
      staff: 4,
    },
    {
      department: "Cashier",
      efficiency: 95,
      tasks: 45,
      staff: 6,
    },
  ];

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
            <input
              type="text"
              placeholder="Search staff, projects, tasks..."
            />
          </div>

          <div className="navbar-actions">
            <NavLink to="/manager/profile" className="manager-profile-btn">
              <span className="profile-avatar-icon">
                <FontAwesomeIcon icon={faUserCircle} />
              </span>
              <span className="profile-info">
                <span className="profile-action-name">{name}</span>
                <span className="profile-action-role">Manager</span>
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
                    <h2>Team Performance</h2>
                    <p>Department efficiency and task completion rates</p>
                  </div>
                  <span className="badge">4 Departments</span>
                </div>
                <div className="performance-grid">
                  {teamPerformance.map((dept, index) => (
                    <div key={index} className="performance-card">
                      <div className="performance-header">
                        <h3>{dept.department}</h3>
                        <div className="efficiency-badge">
                          {dept.efficiency}%
                        </div>
                      </div>
                      <div className="performance-metrics">
                        <div className="metric">
                          <span className="metric-value">{dept.tasks}</span>
                          <span className="metric-label">Tasks</span>
                        </div>
                        <div className="metric">
                          <span className="metric-value">{dept.staff}</span>
                          <span className="metric-label">Staff</span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${dept.efficiency}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
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
                  <NavLink to="/manager/tasks" className="see-all-link">
                    See all tasks
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
                  <NavLink to="/manager/analytics" className="see-all-link">
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
    </div>
  );
};

export default ManagerDashboard;