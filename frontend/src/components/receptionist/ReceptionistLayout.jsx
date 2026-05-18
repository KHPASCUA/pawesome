import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ReceptionistSidebar from "./ReceptionistSidebar";
import { FaRedoAlt, FaMoon, FaUserTie } from "react-icons/fa";
import NotificationDropdown from "../shared/NotificationDropdown";
import { useTheme } from "../../utils/theme";
import "./ReceptionistLayout.css";

const ReceptionistLayout = () => {
  const navigate = useNavigate();
  const { toggle } = useTheme();

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

            <NotificationDropdown role="receptionist" />

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
              onClick={toggle}
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
