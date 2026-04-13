import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faCashRegister,
  faHistory,
  faChartBar,
  faSignOutAlt,
  faBars,
  faUser,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import "./CashierSidebar.css";

const CashierSidebar = ({ collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/");
  };

  return (
    <aside className={`cashier-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="collapse-btn" onClick={onToggleCollapse}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        {!collapsed && (
          <div className="sidebar-logo">
            <FontAwesomeIcon icon={faCashRegister} />
            <span>Cashier Portal</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink
              to="/cashier"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Dashboard"
            >
              <FontAwesomeIcon icon={faHome} />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/cashier/pos"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="POS"
            >
              <FontAwesomeIcon icon={faCashRegister} />
              {!collapsed && <span>POS</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/cashier/transactions"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Transactions"
            >
              <FontAwesomeIcon icon={faReceipt} />
              {!collapsed && <span>Transactions</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/cashier/history"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="History"
            >
              <FontAwesomeIcon icon={faHistory} />
              {!collapsed && <span>History</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/cashier/reports"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Reports"
            >
              <FontAwesomeIcon icon={faChartBar} />
              {!collapsed && <span>Reports</span>}
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/cashier/profile"
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

export default CashierSidebar;
