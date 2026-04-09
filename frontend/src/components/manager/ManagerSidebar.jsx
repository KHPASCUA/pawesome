import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUsers,
  faHistory,
  faChartBar,
  faSignOutAlt,
  faBars,
  faUser,
  faClipboardList,
  faTasks,
} from "@fortawesome/free-solid-svg-icons";
import "./ManagerSidebar.css";

const ManagerSidebar = ({ collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/");
  };

  return (
    <aside className={`manager-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="collapse-btn" onClick={onToggleCollapse}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        {!collapsed && (
          <div className="sidebar-logo">
            <FontAwesomeIcon icon={faUsers} />
            <span>Manager Portal</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink
              to="/manager"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Dashboard"
            >
              <FontAwesomeIcon icon={faHome} />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/manager/staff"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Staff"
            >
              <FontAwesomeIcon icon={faUsers} />
              {!collapsed && <span>Staff</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/manager/attendance"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Attendance"
            >
              <FontAwesomeIcon icon={faClipboardList} />
              {!collapsed && <span>Attendance</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/manager/tasks"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Tasks"
            >
              <FontAwesomeIcon icon={faTasks} />
              {!collapsed && <span>Tasks</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/manager/history"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="History"
            >
              <FontAwesomeIcon icon={faHistory} />
              {!collapsed && <span>History</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/manager/reports"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Reports"
            >
              <FontAwesomeIcon icon={faChartBar} />
              {!collapsed && <span>Reports</span>}
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/manager/profile"
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

export default ManagerSidebar;