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

const AdminSidebar = ({ collapsed, onToggleCollapse }) => {
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
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="collapse-btn" onClick={onToggleCollapse}>
          <FontAwesomeIcon icon={faBars} />
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
              className="nav-link"
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
              className="nav-link"
              title="Users"
            >
              <FontAwesomeIcon icon={faUsers} />
              {!collapsed && <span>Users</span>}
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink
              to="/admin/profile"
              className="nav-link"
              title="Profile"
            >
              <FontAwesomeIcon icon={faUser} />
              {!collapsed && <span>Profile</span>}
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/admin/chatbot"
              className="nav-link"
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
                    className="nav-link"
                    title="Payroll Overview"
                  >
                    <FontAwesomeIcon icon={faMoneyBillWave} />
                    <span>Payroll Overview</span>
                  </NavLink>
                </li>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/payroll/salaries"
                    className="nav-link"
                    title="Salary Management"
                  >
                    <FontAwesomeIcon icon={faDollarSign} />
                    <span>Salary Management</span>
                  </NavLink>
                </li>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/payroll/reports"
                    className="nav-link"
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
              className="nav-link"
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
                    className="nav-link"
                    title="All Reports Overview"
                  >
                    <FontAwesomeIcon icon={faChartBar} />
                    <span>Overview</span>
                  </NavLink>
                </li>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/reports/cashier"
                    className="nav-link"
                    title="Cashier Reports"
                  >
                    <FontAwesomeIcon icon={faCashRegister} />
                    <span>Cashier</span>
                  </NavLink>
                </li>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/reports/inventory"
                    className="nav-link"
                    title="Inventory Reports"
                  >
                    <FontAwesomeIcon icon={faBox} />
                    <span>Inventory</span>
                  </NavLink>
                </li>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/reports/manager"
                    className="nav-link"
                    title="Manager Reports"
                  >
                    <FontAwesomeIcon icon={faUserTie} />
                    <span>Manager</span>
                  </NavLink>
                </li>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/reports/veterinary"
                    className="nav-link"
                    title="Veterinary Reports"
                  >
                    <FontAwesomeIcon icon={faStethoscope} />
                    <span>Veterinary</span>
                  </NavLink>
                </li>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/reports/customers"
                    className="nav-link"
                    title="Customer Reports"
                  >
                    <FontAwesomeIcon icon={faUserFriends} />
                    <span>Customers</span>
                  </NavLink>
                </li>
                <li className="nav-subitem">
                  <NavLink
                    to="/admin/reports/reception"
                    className="nav-link"
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
