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
  faBox,
  faCalendarAlt,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";
import "./CustomerSidebar.css";

const CustomerSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    navigate("/");
  };

  const navItems = [
    {
      to: "/customer",
      label: "Dashboard",
      icon: faHome,
    },
    {
      to: "/customer/pets",
      label: "My Pets",
      icon: faPaw,
    },
    {
      to: "/customer/booking",
      label: "Book Service",
      icon: faCalendarCheck,
    },
    {
      to: "/customer/store",
      label: "Store",
      icon: faShoppingCart,
    },
    {
      to: "/customer/orders",
      label: "My Orders",
      icon: faBox,
    },
    {
      to: "/customer/bookings",
      label: "My Requests",
      icon: faCalendarAlt,
    },
    {
      to: "/customer/payments",
      label: "Payments",
      icon: faCreditCard,
    },
    {
      to: "/customer/profile",
      label: "Profile",
      icon: faUser,
    },
  ];

  return (
    <aside className="app-sidebar customer-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <FontAwesomeIcon icon={faBone} />
          <span>Customer Portal</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li className="nav-item" key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <FontAwesomeIcon icon={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
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