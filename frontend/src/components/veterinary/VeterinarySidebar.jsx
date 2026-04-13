import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faCalendarAlt,
  faUsers,
  faHistory,
  faChartBar,
  faUserMd,
  faSignOutAlt,
  faBars,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import "./VeterinarySidebar.css";

const VeterinarySidebar = ({ collapsed, onToggleCollapse }) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <aside className={`veterinary-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="collapse-btn" onClick={onToggleCollapse}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        {!collapsed && (
          <div className="sidebar-logo">
            <FontAwesomeIcon icon={faUserMd} />
            <span>Vet Portal</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink
              to="/veterinary"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Dashboard"
            >
              <FontAwesomeIcon icon={faHome} />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/veterinary/appointments"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Appointments"
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
              {!collapsed && <span>Appointments</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/veterinary/customer-profiles"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Customer Profiles"
            >
              <FontAwesomeIcon icon={faUsers} />
              {!collapsed && <span>Customer Profiles</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/veterinary/history"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="History"
            >
              <FontAwesomeIcon icon={faHistory} />
              {!collapsed && <span>History</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/veterinary/reports"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Reports"
            >
              <FontAwesomeIcon icon={faChartBar} />
              {!collapsed && <span>Reports</span>}
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/veterinary/profile"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Profile"
            >
              <FontAwesomeIcon icon={faUser} />
              {!collapsed && <span>Profile</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <FontAwesomeIcon icon={faSignOutAlt} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default VeterinarySidebar;