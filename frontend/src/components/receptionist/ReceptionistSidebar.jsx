import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faCalendarAlt,
  faUsers,
  faPhone,
  faClipboardList,
  faSignOutAlt,
  faBars,
  faUser,
  faChartBar,
  faHotel,
  faStethoscope,
  faCut,
  faRobot,
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "./ReceptionistSidebar.css";

const ReceptionistSidebar = ({ collapsed, onToggleCollapse }) => {
  const [bookingsExpanded, setBookingsExpanded] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/");
  };

  return (
    <aside className={`receptionist-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="collapse-btn" onClick={onToggleCollapse}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        {!collapsed && (
          <div className="sidebar-logo">
            <FontAwesomeIcon icon={faPhone} />
            <span>Reception Portal</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink
              to="/receptionist"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Dashboard"
            >
              <FontAwesomeIcon icon={faHome} />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/receptionist/bookings"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Bookings"
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
              {!collapsed && <span>Bookings</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/receptionist/hotel"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Pet Hotel"
            >
              <FontAwesomeIcon icon={faHotel} />
              {!collapsed && <span>Pet Hotel</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/receptionist/customer-profile"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Customer Profile"
            >
              <FontAwesomeIcon icon={faUser} />
              {!collapsed && <span>Customer Profile</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/receptionist/chatbot"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Chatbot"
            >
              <FontAwesomeIcon icon={faRobot} />
              {!collapsed && <span>Chatbot</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/receptionist/profile"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Profile"
            >
              <FontAwesomeIcon icon={faUser} />
              {!collapsed && <span>Profile</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/receptionist/reports"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Reports"
            >
              <FontAwesomeIcon icon={faChartBar} />
              {!collapsed && <span>Reports</span>}
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

export default ReceptionistSidebar;