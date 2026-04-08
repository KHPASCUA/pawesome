import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faCalendarCheck,
  faPaw,
  faShoppingCart,
  faSignOutAlt,
  faBars,
  faUser,
  faBone,
} from "@fortawesome/free-solid-svg-icons";
import "./CustomerSidebar.css";

const CustomerSidebar = ({ collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/");
  };

  return (
    <aside className={`customer-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="collapse-btn" onClick={onToggleCollapse}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        {!collapsed && (
          <div className="sidebar-logo">
            <FontAwesomeIcon icon={faBone} />
            <span>Customer Portal</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink
              to="/customer"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Dashboard"
            >
              <FontAwesomeIcon icon={faHome} />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/customer/bookings"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Bookings"
            >
              <FontAwesomeIcon icon={faCalendarCheck} />
              {!collapsed && <span>Bookings</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/customer/pets"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="My Pets"
            >
              <FontAwesomeIcon icon={faPaw} />
              {!collapsed && <span>My Pets</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/customer/store"
              className={({ isActive }) => (isActive ? "active" : "")}
              title="Store"
            >
              <FontAwesomeIcon icon={faShoppingCart} />
              {!collapsed && <span>Store</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/customer/profile"
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

export default CustomerSidebar;