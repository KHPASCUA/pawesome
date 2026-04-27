import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ReceptionistSidebar from "./ReceptionistSidebar";
import { FaBell, FaRedoAlt, FaMoon, FaUserTie } from "react-icons/fa";
import "./ReceptionistLayout.css";

const ReceptionistLayout = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => {
    const currentTheme = document.body.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    document.body.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", savedTheme);
  }, []);

  return (
    <div className="app-dashboard receptionist-layout">
      <ReceptionistSidebar />

      <main className="app-main receptionist-main">
        <header className="app-topbar receptionist-topbar">
          <div className="topbar-title">
            <h1>Receptionist Portal</h1>
            <p>Manage bookings, customers, approvals, and service requests.</p>
          </div>

          <div className="topbar-actions">
            <button
              className="topbar-user"
              type="button"
              onClick={() => navigate("/receptionist/profile")}
            >
              <span className="topbar-avatar">
                <FaUserTie />
              </span>
              <span>
                <strong>Receptionist</strong>
                <small>Front Desk</small>
              </span>
            </button>

            <div className="notification-wrapper">
              <button
                className="topbar-icon"
                type="button"
                title="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell />
                <span className="notif-dot">3</span>
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notif-header">
                    <strong>Notifications</strong>
                    <small>Recent updates</small>
                  </div>

                  <button onClick={() => navigate("/receptionist/approvals")}>
                    <span>3</span>
                    <div>
                      <strong>Pending approvals</strong>
                      <small>Review booking and order requests</small>
                    </div>
                  </button>

                  <button onClick={() => navigate("/receptionist/bookings")}>
                    <span>!</span>
                    <div>
                      <strong>New bookings</strong>
                      <small>Check latest customer reservations</small>
                    </div>
                  </button>

                  <button onClick={() => navigate("/receptionist/orders")}>
                    <span>₱</span>
                    <div>
                      <strong>Orders for review</strong>
                      <small>Verify customer order status</small>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              className="topbar-icon"
              type="button"
              title="Refresh"
              onClick={() => window.location.reload()}
            >
              <FaRedoAlt />
            </button>

            <button
              className="topbar-icon"
              type="button"
              title="Dark Mode"
              onClick={toggleTheme}
            >
              <FaMoon />
            </button>
          </div>
        </header>

        <section className="app-content receptionist-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default ReceptionistLayout;
