import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faMoon,
  faSun,
  faUserCircle,
  faCalendarAlt,
  faUsers,
  faClipboardList,
  faHistory,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import VeterinarySidebar from "./VeterinarySidebar";
import "./VetDashboard.css";

const VetDashboard = () => {
  const name = localStorage.getItem("name") || "Veterinarian";
  const [theme, setTheme] = useState("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadNotifications] = useState(3);
  const location = useLocation();

  const normalizedPath = location.pathname.replace(/\/+$/, "");
  const showOverview = normalizedPath === "/vet";

  const summaryCards = [
    {
      title: "Today's Appointments",
      value: 8,
      subtitle: "Scheduled today",
      change: "+2",
    },
    {
      title: "Active Patients",
      value: 42,
      subtitle: "Under care",
      change: "+5",
    },
    {
      title: "Completed Checkups",
      value: 156,
      subtitle: "This month",
      change: "+12",
    },
    {
      title: "Pending Reports",
      value: 7,
      subtitle: "Awaiting review",
      change: "-1",
    },
  ];

  const todayAppointments = [
    {
      petName: "Max",
      ownerName: "John Smith",
      time: "09:00 AM",
      type: "Regular Checkup",
      status: "Confirmed",
    },
    {
      petName: "Bella",
      ownerName: "Sarah Johnson",
      time: "10:30 AM",
      type: "Vaccination",
      status: "Confirmed",
    },
    {
      petName: "Charlie",
      ownerName: "Mike Davis",
      time: "02:00 PM",
      type: "Surgery Consultation",
      status: "Pending",
    },
  ];

  return (
    <div className={`vet-dashboard ${theme} ${sidebarCollapsed ? "collapsed" : ""}`}>
      <VeterinarySidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <main className="vet-main">
        <header className="vet-navbar top-navbar">
          <div className="navbar-left">
            <h1>Overview</h1>
            <p>Manage your veterinary appointments and patient care here.</p>
          </div>

          <div className="search-group">
            <input
              type="text"
              placeholder="Search appointments, patients, records..."
            />
          </div>

          <div className="navbar-actions">
            <NavLink to="/vet/profile" className="vet-profile-btn">
              <span className="profile-avatar-icon">
                <FontAwesomeIcon icon={faUserCircle} />
              </span>
              <span className="profile-info">
                <span className="profile-action-name">{name}</span>
                <span className="profile-action-role">Veterinarian</span>
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
                    <h2>Today's Schedule</h2>
                    <p>
                      You have {summaryCards[0].value} appointments scheduled for today.
                    </p>
                  </div>
                  <span className="badge">{summaryCards[0].value} Appointments</span>
                </div>
                <div className="chart-placeholder">Schedule Overview Chart</div>
              </article>

              <article className="panel quick-stat-panel">
                <div className="metric-card accent">
                  <h3>95%</h3>
                  <p>Patient Satisfaction</p>
                  <small>Based on recent feedback</small>
                </div>

                <div className="metric-card">
                  <h3>24h</h3>
                  <p>Average Response Time</p>
                </div>
              </article>
            </section>

            <section className="dashboard-bottom">
              <div className="panel appointments-panel">
                <div className="panel-header space-between">
                  <div>
                    <h2>Upcoming Appointments</h2>
                  </div>
                  <NavLink to="/vet/appointments" className="see-all-link">
                    See all ({todayAppointments.length})
                  </NavLink>
                </div>

                <div className="appointment-list">
                  {todayAppointments.map((appointment, index) => (
                    <div key={index} className="appointment-card">
                      <div className="appointment-card-top">
                        <div>
                          <h3>{appointment.petName}</h3>
                          <p>{appointment.ownerName}</p>
                        </div>
                        <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p>{appointment.time} - {appointment.type}</p>
                      <div className="appointment-info">
                        <div>
                          <strong>Pet</strong>
                          <p>{appointment.petName}</p>
                        </div>
                        <div>
                          <strong>Owner</strong>
                          <p>{appointment.ownerName}</p>
                        </div>
                      </div>
                      <div className="appointment-footer">
                        <span>
                          <FontAwesomeIcon icon={faCalendarAlt} /> {appointment.time}
                        </span>
                        <span>
                          <FontAwesomeIcon icon={faUsers} /> {appointment.ownerName}
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
                  <NavLink to="/vet/history" className="see-all-link">
                    See all
                  </NavLink>
                </div>
                <div className="activity-metrics">
                  <div className="status-card success">
                    <strong>12</strong>
                    <p>Checkups completed today</p>
                  </div>
                  <div className="status-card info">
                    <strong>3</strong>
                    <p>Vaccinations administered</p>
                  </div>
                </div>
                <div className="mini-chart-placeholder">Activity Chart</div>
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

export default VetDashboard;