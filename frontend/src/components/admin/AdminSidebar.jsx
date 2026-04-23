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
  faTimes,
  faUser,
  faBuilding,
  faMoneyBillWave,
  faDollarSign,
  faFileInvoiceDollar,
  faRobot,
  faCog,
  faCashRegister,
  faBox,
  faUserTie,
  faStethoscope,
  faUserFriends,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import "./AdminSidebar.css";

const AdminSidebar = ({ collapsed, mobileOpen, onToggleCollapse, onMobileMenuToggle }) => {
  const [payrollExpanded, setPayrollExpanded] = React.useState(false);
  const [reportsExpanded, setReportsExpanded] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    // Redirect to landing page
    navigate("/");
  };

  return (
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-header">
        <button className="collapse-btn" onClick={onToggleCollapse}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        <button className="mobile-close-btn" onClick={onMobileMenuToggle}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        {!collapsed && (
          <div className="sidebar-logo">
            <FontAwesomeIcon icon={faBuilding} />
            <span>Admin Portal</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink
              to="/admin"
              className={({ isActive }) => isActive ? "active" : ""}
              end
              title="Dashboard"
            >
              <FontAwesomeIcon icon={faHome} />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/admin/users"
              className={({ isActive }) => isActive ? "active" : ""}
              end
              title="Users"
            >
              <FontAwesomeIcon icon={faUsers} />
              {!collapsed && <span>Users</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/admin/profile"
              className={({ isActive }) => isActive ? "active" : ""}
              end
              title="Profile"
            >
              <FontAwesomeIcon icon={faUser} />
              {!collapsed && <span>Profile</span>}
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/admin/chatbot"
              className={({ isActive }) => isActive ? "active" : ""}
              end
              title="Chatbot Logs"
            >
              <FontAwesomeIcon icon={faRobot} />
              {!collapsed && <span>Chatbot</span>}
            </NavLink>
          </li>

          <li className="nav-item">
            <div 
              className="nav-dropdown-header"
              onClick={() => !collapsed && setPayrollExpanded(!payrollExpanded)}
              title="Payroll"
            >
              <FontAwesomeIcon icon={faMoneyBillWave} />
              {!collapsed && <span>Payroll</span>}
            </div>
            {!collapsed && (
              <ul className={`nav-sublist ${payrollExpanded ? 'expanded' : ''}`}>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/payroll"
                    className={({ isActive }) => isActive ? "active" : ""}
                    end
                    title="Payroll Overview"
                  >
                    <FontAwesomeIcon icon={faMoneyBillWave} />
                    <span>Payroll Overview</span>
                  </NavLink>
                </li>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/payroll/salaries"
                    className={({ isActive }) => isActive ? "active" : ""}
                    end
                    title="Salary Management"
                  >
                    <FontAwesomeIcon icon={faDollarSign} />
                    <span>Salary Management</span>
                  </NavLink>
                </li>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/payroll/reports"
                    className={({ isActive }) => isActive ? "active" : ""}
                    end
                    title="Payroll Reports"
                  >
                    <FontAwesomeIcon icon={faFileInvoiceDollar} />
                    <span>Payroll Reports</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          <li className="nav-item">
            <NavLink
              to="/admin/history"
              className={({ isActive }) => isActive ? "active" : ""}
              end
              title="System History"
            >
              <FontAwesomeIcon icon={faHistory} />
              {!collapsed && <span>History</span>}
            </NavLink>
          </li>

          <li className="nav-item">
            <div
              className="nav-dropdown-header"
              onClick={() => !collapsed && setReportsExpanded(!reportsExpanded)}
              title="Reports"
            >
              <FontAwesomeIcon icon={faChartBar} />
              {!collapsed && <span>Reports</span>}
            </div>
            {!collapsed && (
              <ul className={`nav-sublist ${reportsExpanded ? 'expanded' : ''}`}>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/reports"
                    className={({ isActive }) => isActive ? "active" : ""}
                    end
                    title="All Reports Overview"
                  >
                    <FontAwesomeIcon icon={faChartBar} />
                    <span>Overview</span>
                  </NavLink>
                </li>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/reports/cashier"
                    className={({ isActive }) => isActive ? "active" : ""}
                    end
                    title="Cashier Reports"
                  >
                    <FontAwesomeIcon icon={faCashRegister} />
                    <span>Cashier</span>
                  </NavLink>
                </li>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/reports/inventory"
                    className={({ isActive }) => isActive ? "active" : ""}
                    end
                    title="Inventory Reports"
                  >
                    <FontAwesomeIcon icon={faBox} />
                    <span>Inventory</span>
                  </NavLink>
                </li>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/reports/manager"
                    className={({ isActive }) => isActive ? "active" : ""}
                    end
                    title="Manager Reports"
                  >
                    <FontAwesomeIcon icon={faUserTie} />
                    <span>Manager</span>
                  </NavLink>
                </li>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/reports/veterinary"
                    className={({ isActive }) => isActive ? "active" : ""}
                    end
                    title="Veterinary Reports"
                  >
                    <FontAwesomeIcon icon={faStethoscope} />
                    <span>Veterinary</span>
                  </NavLink>
                </li>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/reports/customers"
                    className={({ isActive }) => isActive ? "active" : ""}
                    end
                    title="Customer Reports"
                  >
                    <FontAwesomeIcon icon={faUserFriends} />
                    <span>Customers</span>
                  </NavLink>
                </li>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/reports/reception"
                    className={({ isActive }) => isActive ? "active" : ""}
                    end
                    title="Reception Reports"
                  >
                    <FontAwesomeIcon icon={faCalendarCheck} />
                    <span>Reception</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          </ul>
      </nav>

      <div className="sidebar-footer">
        <ul className="nav-list footer-nav">
          <li className="nav-item">
            <NavLink
              to="/admin/settings"
              className="nav-link"
              title="Settings"
            >
              <FontAwesomeIcon icon={faCog} />
              {!collapsed && <span>Settings</span>}
            </NavLink>
          </li>
        </ul>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <FontAwesomeIcon icon={faSignOutAlt} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
