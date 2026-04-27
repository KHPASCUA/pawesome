import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faCalendarCheck,
  faPaw,
  faShoppingCart,
  faSignOutAlt,
  faUser,
  faBone,
  faHotel,
  faCut,
  faStethoscope,
} from "@fortawesome/free-solid-svg-icons";
import "./CustomerSidebar.css";

const CustomerSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/");
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <FontAwesomeIcon icon={faBone} />
          <span>Customer Portal</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink to="/customer" end className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <FontAwesomeIcon icon={faHome} />
              <span>Dashboard</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/customer/bookings" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <FontAwesomeIcon icon={faCalendarCheck} />
              <span>Bookings</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/customer/pets" end className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <FontAwesomeIcon icon={faPaw} />
              <span>My Pets</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/customer/hotel" end className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <FontAwesomeIcon icon={faHotel} />
              <span>Hotel</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/customer/grooming" end className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <FontAwesomeIcon icon={faCut} />
              <span>Grooming</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/customer/vet" end className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <FontAwesomeIcon icon={faStethoscope} />
              <span>Vet</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/customer/store" end className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <FontAwesomeIcon icon={faShoppingCart} />
              <span>Store</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/customer/profile" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <FontAwesomeIcon icon={faUser} />
              <span>Profile</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default CustomerSidebar;