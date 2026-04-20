import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoon,
  faSun,
  faUserCircle,
  faCalendarAlt,
  faUsers,
  faHotel,
  faPaw,
  faBed,
  faPhone,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import VeterinarySidebar from "./VeterinarySidebar";
import RoleAwareChatbot from "../chatbot/RoleAwareChatbot";
import NotificationDropdown from "../shared/NotificationDropdown";
import "./VetDashboard.css";

const VetDashboard = () => {
  const name = localStorage.getItem("name") || "Veterinarian";
  const [theme, setTheme] = useState("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [currentBoarders, setCurrentBoarders] = useState([]);
  const [loadingBoarders, setLoadingBoarders] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const normalizedPath = location.pathname.replace(/\/+$/, "");
  const showOverview = normalizedPath === "/veterinary" || normalizedPath === "/vet";

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setLoadingBoarders(true);
        const [data, boarders] = await Promise.all([
          apiRequest("/veterinary/dashboard"),
          apiRequest("/veterinary/boardings/current-boarders"),
        ]);
        setDashboardData(data);
        setCurrentBoarders(Array.isArray(boarders) ? boarders : []);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
        console.error("Vet dashboard fetch error:", err);
      } finally {
        setLoading(false);
        setLoadingBoarders(false);
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
      subtitle: "Scheduled today",
      change: "",
    },
    {
      title: "Active Patients",
      value: dashboardData.total_patients || 0,
      subtitle: "Patient records",
      change: "",
    },
    {
      title: "Completed Checkups",
      value: dashboardData.completed_appointments || 0,
      subtitle: "Total completed",
      change: "",
    },
    {
      title: "Pending Appointments",
      value: dashboardData.pending_appointments || 0,
      subtitle: "Awaiting confirmation",
      change: "",
    },
  ] : [];

  const todayAppointments = dashboardData ? (dashboardData.upcoming_appointments || []).map((apt) => ({
    petName: apt.pet?.name || "Pet",
    ownerName: apt.customer?.name || "Customer",
    time: new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: apt.service?.name || "Service",
    status: apt.status || "pending",
  })) : [];

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
            <NavLink to="/veterinary/profile" className="vet-profile-btn">
              <span className="profile-avatar-icon">
                <FontAwesomeIcon icon={faUserCircle} />
              </span>
              <span className="profile-info">
                <span className="profile-action-name">{name}</span>
                <span className="profile-action-role">Veterinarian</span>
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
                      You have {summaryCards[0]?.value ?? 0} appointments scheduled for today.
                    </p>
                  </div>
                  <span className="badge">{summaryCards[0]?.value ?? 0} Appointments</span>
                </div>
                <div className="appointments-preview">
                  {(dashboardData?.upcoming_appointments || []).slice(0, 3).map((apt, idx) => (
                    <div key={idx} className="preview-appointment-item">
                      <span className="apt-time">{new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="apt-pet">{apt.pet?.name || "Pet"}</span>
                      <span className="apt-service">{apt.service?.name || "Service"}</span>
                    </div>
                  ))}
                  {(dashboardData?.upcoming_appointments || []).length === 0 && (
                    <p className="no-data">No upcoming appointments</p>
                  )}
                </div>
              </article>

              <article className="panel quick-stat-panel">
                <div className="metric-card accent">
                  <h3>{dashboardData?.new_patients_this_month || 0}</h3>
                  <p>New Patients This Month</p>
                  <small>New registrations</small>
                </div>

                <div className="metric-card">
                  <h3>{dashboardData?.completed_appointments || 0}</h3>
                  <p>Completed Appointments</p>
                </div>
              </article>
            </section>

            {/* Current Boarders Section */}
            {currentBoarders.length > 0 && (
              <section className="dashboard-boarders">
                <div className="panel boarders-panel">
                  <div className="panel-header space-between">
                    <div>
                      <h2><FontAwesomeIcon icon={faHotel} /> Current Boarders</h2>
                      <p>Pets currently staying at the hotel that may need veterinary attention</p>
                    </div>
                    <span className="badge">{currentBoarders.length} Pets</span>
                  </div>

                  {loadingBoarders ? (
                    <div className="loading-boarders">Loading...</div>
                  ) : (
                    <div className="boarders-list">
                      {currentBoarders.slice(0, 5).map((boarder) => (
                        <div key={boarder.id} className="boarder-card">
                          <div className="boarder-card-top">
                            <div className="boarder-pet-info">
                              <FontAwesomeIcon icon={faPaw} className="pet-icon" />
                              <div>
                                <h4>{boarder.pet?.name || "Unknown"}</h4>
                                <p>{boarder.pet?.species || "Unknown"} - {boarder.pet?.breed || "Unknown"}</p>
                              </div>
                            </div>
                            <span className="room-badge">
                              <FontAwesomeIcon icon={faBed} /> Room {boarder.hotel_room?.room_number || "N/A"}
                            </span>
                          </div>

                          <div className="boarder-details">
                            <div className="detail-item">
                              <strong>Owner</strong>
                              <p>{boarder.customer?.name || "Unknown"}</p>
                            </div>
                            <div className="detail-item">
                              <strong>Contact</strong>
                              <p><FontAwesomeIcon icon={faPhone} /> {boarder.customer?.phone || "N/A"}</p>
                            </div>
                            <div className="detail-item">
                              <strong>Check-out</strong>
                              <p>{boarder.check_out ? new Date(boarder.check_out).toLocaleDateString() : "TBD"}</p>
                            </div>
                          </div>

                          {boarder.special_requests && (
                            <div className="special-requests">
                              <FontAwesomeIcon icon={faExclamationTriangle} />
                              <span>{boarder.special_requests}</span>
                            </div>
                          )}

                          <div className="boarder-actions">
                            <NavLink 
                              to="/veterinary/customer-profiles" 
                              className="view-pet-btn"
                            >
                              View Pet Records
                            </NavLink>
                          </div>
                        </div>
                      ))}
                      {currentBoarders.length > 5 && (
                        <div className="more-boarders">
                          <span className="see-all-link">
                            {currentBoarders.length} boarders total
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="dashboard-bottom">
              <div className="panel appointments-panel">
                <div className="panel-header space-between">
                  <div>
                    <h2>Upcoming Appointments</h2>
                  </div>
                  <NavLink to="/veterinary/appointments" className="see-all-link">
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
                  <NavLink to="/veterinary/history" className="see-all-link">
                    See all
                  </NavLink>
                </div>
                <div className="activity-metrics">
                  <div className="status-card success">
                    <strong>{dashboardData?.today_appointments || 0}</strong>
                    <p>Appointments today</p>
                  </div>
                  <div className="status-card info">
                    <strong>{dashboardData?.pending_appointments || 0}</strong>
                    <p>Pending appointments</p>
                  </div>
                </div>
                <div className="activity-summary">
                  <p>Total patients: {dashboardData?.total_patients || 0} | New this month: {dashboardData?.new_patients_this_month || 0}</p>
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
        title="Veterinary Assistant"
        subtitle="Appointments, patient workflow, and dashboard help"
      />
    </div>
  );
};

export default VetDashboard;
