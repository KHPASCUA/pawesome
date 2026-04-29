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
  faHotel,
  faFileInvoice,
  faArrowRight,
  faMoneyBill,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import ManagerSidebar from "./ManagerSidebar";
import RoleAwareChatbot from "../chatbot/RoleAwareChatbot";
import NotificationDropdown from "../shared/NotificationDropdown";
import "./ManagerDashboard.css";

const ManagerDashboard = () => {
  const name = localStorage.getItem("name") || "Manager";
  const [theme, setTheme] = useState("light");
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
  const location = useLocation();

  // Enhanced data with more realistic metrics
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [staffStats, setStaffStats] = useState({
    onlineStaff: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });

  const normalizedPath = location.pathname.replace(/\/+$/, "");
  const showOverview =
    normalizedPath === "/manager" || normalizedPath === "/manager/";

  // Chart data
  const revenueChartData = [
    { month: "Jan", revenue: 125000 },
    { month: "Feb", revenue: 145000 },
    { month: "Mar", revenue: 138000 },
    { month: "Apr", revenue: 162000 },
    { month: "May", revenue: 175000 },
    { month: "Jun", revenue: 158000 },
  ];

  const staffChartData = [
    { department: "Reception", staff: 4 },
    { department: "Cashier", staff: 3 },
    { department: "Inventory", staff: 2 },
    { department: "Vet", staff: 3 },
    { department: "Manager", staff: 1 },
  ];

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        let data;
        
        try {
          data = await apiRequest("/manager/dashboard");
        } catch (err) {
          console.warn("Using demo dashboard data");
          data = {
            total_staff: 12,
            active_staff: 9,
            today_appointments: 18,
            completed_appointments: 14,
            pending_appointments: 4,
            today_revenue: 12500,
            monthly_revenue: 158000,
            recent_tasks: [
              {
                title: "Inventory restock",
                status: "completed",
                department: "Inventory",
                due_date: "Today"
              },
              {
                title: "Staff meeting",
                status: "pending",
                department: "HR",
                due_date: "Tomorrow"
              }
            ],
            staff_performance: []
          };
        }
        
        setDashboardData(data);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
        console.error("Manager dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (showOverview) {
      fetchDashboardData();
    }
  }, [showOverview]);

  // Enhanced summary cards with real-time data
  const summaryCards = useMemo(() => dashboardData ? [
    {
      title: "Team Members",
      value: dashboardData.total_staff || 0,
      subtitle: `${dashboardData.active_staff || 0} active`,
      change: "",
      icon: faUsers,
      color: "blue",
      trend: "up",
    },
    {
      title: "Today's Appointments",
      value: dashboardData.today_appointments || 0,
      subtitle: "Scheduled",
      change: "",
      icon: faCalendarAlt,
      color: "green",
      trend: "up",
    },
    {
      title: "Tasks Completed",
      value: dashboardData.completed_appointments || 0,
      subtitle: `${dashboardData.pending_appointments || 0} pending`,
      change: "",
      icon: faCheck,
      color: "purple",
      trend: "up",
    },
    {
      title: "Revenue Today",
      value: formatCurrency(dashboardData.today_revenue || 0),
      subtitle: `Month: ${formatCurrency(dashboardData.monthly_revenue || 0)}`,
      change: "",
      icon: faChartLine,
      color: dashboardData.monthly_revenue > 5000 ? "green" : "orange",
      trend: dashboardData.monthly_revenue > 5000 ? "up" : "stable",
    },
    {
      title: "Hotel Occupancy",
      value: `${hotelStats.occupancyRate}%`,
      subtitle: `${hotelStats.occupiedRooms}/${hotelStats.totalRooms} rooms occupied`,
      change: `${hotelStats.todayCheckIns} in / ${hotelStats.todayCheckOuts} out today`,
      icon: faHotel,
      color: hotelStats.occupancyRate > 80 ? "green" : hotelStats.occupancyRate > 50 ? "blue" : "orange",
      trend: hotelStats.occupancyRate > 60 ? "up" : "stable",
    },
  ] : [], [dashboardData, hotelStats]);

  const [teamPerformance, setTeamPerformance] = useState([]);

  // Transform backend staff_performance to frontend format
  const transformStaffPerformance = (staffData) => {
    if (!staffData || !Array.isArray(staffData)) return [];
    
    // Group staff by role/department
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

    // Calculate efficiency and format
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

  // Refresh dashboard data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [dashData, staffData] = await Promise.all([
        apiRequest("/manager/dashboard"),
        apiRequest("/manager/staff")
      ]);
      setDashboardData(dashData);
      
      // Transform staff_performance from dashboard or staff endpoint
      const staffList = dashData.staff_performance || staffData?.staff || [];
      setTeamPerformance(transformStaffPerformance(staffList));
      
      // Create staff stats from data
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

  // Filtered data for search functionality
  const filteredTeamPerformance = useMemo(() => {
    if (!searchTerm) return teamPerformance;
    return teamPerformance.filter(dept => 
      dept.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teamPerformance, searchTerm]);

  // Loading state component
  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <FontAwesomeIcon icon={faSpinner} className="spinning" />
      <span>Loading...</span>
    </div>
  );

  // Fetch data on mount
  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  // Animation effect with hotel stats fetch
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedStats(true), 100);
    
    // Fetch hotel occupancy stats from Laravel
    const fetchHotelStats = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/receptionist/requests");
        const data = await response.json();
        
        // Calculate hotel stats from service_requests
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

            <NotificationDropdown />

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