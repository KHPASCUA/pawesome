import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBoxes,
  faWarehouse,
  faHistory,
  faChartBar,
  faSignOutAlt,
  faListCheck,
  faBars,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import "./InventorySidebar.css";

const InventorySidebar = ({ collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/");
  };

  return (
    <aside className={`inventory-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="collapse-btn" onClick={onToggleCollapse}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        {!collapsed && (
          <div className="sidebar-logo">
            <FontAwesomeIcon icon={faWarehouse} />
            <span>Inventory Portal</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink
              to="/inventory"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Dashboard"
            >
              <FontAwesomeIcon icon={faHome} />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/inventory/products"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Products"
            >
              <FontAwesomeIcon icon={faBoxes} />
              {!collapsed && <span>Products</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/inventory/stock"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Stock Management"
            >
              <FontAwesomeIcon icon={faListCheck} />
              {!collapsed && <span>Stock Management</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/inventory/history"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="History"
            >
              <FontAwesomeIcon icon={faHistory} />
              {!collapsed && <span>History</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/inventory/reports"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Reports"
            >
              <FontAwesomeIcon icon={faChartBar} />
              {!collapsed && <span>Reports</span>}
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/inventory/profile"
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

export default InventorySidebar;
