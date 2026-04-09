import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faMoon,
  faSun,
  faUserCircle,
  faHome,
  faBoxes,
  faChartBar,
  faTruck,
  faCog,
  faSignOutAlt,
  faBars,
  faUser,
  faCalendarAlt,
  faBox,
  faWarehouse,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import InventorySidebar from "./InventorySidebar";
import "./InventoryDashboard.css";

const InventoryDashboard = () => {
  const name = localStorage.getItem("name") || "Inventory Manager";
  const [theme, setTheme] = useState("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadNotifications] = useState(6);
  const location = useLocation();

  const normalizedPath = location.pathname.replace(/\/+$/, "");
  const showOverview = normalizedPath === "/inventory";

  const summaryCards = [
    {
      title: "Total Products",
      value: "1,247",
      subtitle: "In inventory",
      change: "+45",
    },
    {
      title: "Low Stock Items",
      value: 23,
      subtitle: "Need reorder",
      change: "-5",
    },
    {
      title: "Warehouse Capacity",
      value: 78,
      subtitle: "% utilized",
      change: "+3%",
    },
    {
      title: "Pending Orders",
      value: 12,
      subtitle: "Awaiting delivery",
      change: "+2",
    },
  ];

  const recentActivity = [
    {
      action: "New shipment received",
      product: "Premium Pet Food",
      quantity: 50,
      time: "2 hours ago",
      status: "completed",
    },
    {
      action: "Stock level critical",
      product: "Cat Toys Variety Pack",
      quantity: 3,
      time: "4 hours ago",
      status: "warning",
    },
    {
      action: "Order placed",
      product: "Dog Shampoo Bulk",
      quantity: 100,
      time: "6 hours ago",
      status: "pending",
    },
  ];

  return (
    <div className={`inventory-dashboard ${theme} ${sidebarCollapsed ? "collapsed" : ""}`}>
      <InventorySidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <main className="inventory-main">
        <header className="inventory-navbar top-navbar">
          <div className="navbar-left">
            <h1>Inventory Management</h1>
            <p>Monitor stock levels and manage warehouse operations</p>
          </div>

          <div className="search-group">
            <input
              type="text"
              placeholder="Search products, suppliers, orders..."
            />
          </div>

          <div className="navbar-actions">
            <NavLink to="/inventory/profile" className="inventory-profile-btn">
              <span className="profile-avatar-icon">
                <FontAwesomeIcon icon={faUserCircle} />
              </span>
              <span className="profile-info">
                <span className="profile-action-name">{name}</span>
                <span className="profile-action-role">Inventory</span>
              </span>
            </NavLink>

            <button className="icon-btn notification-btn" type="button">
              <FontAwesomeIcon icon={faBell} />
              {unreadNotifications > 0 && (
                <span className="notification-badge">
                  {unreadNotifications}
                </span>
              )}
            </button>

            <button
              className="theme-toggle-btn"
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
            </button>
          </div>
        </header>

        {showOverview ? (
          <>
            <section className="overview-cards">
              {summaryCards.map((card) => (
                <div key={card.title} className="overview-card">
                  <div>
                    <h3>{card.value}</h3>
                    <p>{card.title}</p>
                  </div>
                  <span>{card.change}</span>
                </div>
              ))}
            </section>

            <section className="dashboard-grid">
              <article className="panel overview-panel">
                <div className="panel-header">
                  <div>
                    <h2>Recent Activity</h2>
                    <p>Latest inventory movements and updates</p>
                  </div>
                  <span className="badge">Live</span>
                </div>
                <div className="activity-list">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-header">
                        <div className="activity-info">
                          <h3>{activity.action}</h3>
                          <p>{activity.product}</p>
                        </div>
                        <div className="activity-quantity">
                          <strong>{activity.quantity} units</strong>
                          <span className={`status-badge ${activity.status}`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                      <div className="activity-details">
                        <span>
                          <FontAwesomeIcon icon={faBox} /> {activity.quantity} units
                        </span>
                        <span>
                          <FontAwesomeIcon icon={faCalendarAlt} /> {activity.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="panel quick-stat-panel">
                <div className="metric-card accent">
                  <h3>78%</h3>
                  <p>Warehouse Capacity</p>
                  <small>+3% from last week</small>
                </div>

                <div className="metric-card">
                  <h3>23</h3>
                  <p>Low Stock Alerts</p>
                </div>

                <div className="metric-card">
                  <h3>12</h3>
                  <p>Pending Orders</p>
                </div>
              </article>
            </section>

            <section className="dashboard-bottom">
              <div className="panel stock-panel">
                <div className="panel-header space-between">
                  <div>
                    <h2>Stock Status</h2>
                  </div>
                  <NavLink to="/inventory/stock" className="see-all-link">
                    View all products
                  </NavLink>
                </div>

                <div className="stock-categories">
                  <div className="stock-category-item">
                    <div className="category-icon">
                      <FontAwesomeIcon icon={faBox} />
                    </div>
                    <div className="category-info">
                      <h4>Pet Food</h4>
                      <p>342 products</p>
                    </div>
                    <div className="category-status">
                      <div className="status-indicator good"></div>
                      <span>In Stock</span>
                    </div>
                  </div>
                  
                  <div className="stock-category-item">
                    <div className="category-icon">
                      <FontAwesomeIcon icon={faWarehouse} />
                    </div>
                    <div className="category-info">
                      <h4>Accessories</h4>
                      <p>156 products</p>
                    </div>
                    <div className="category-status">
                      <div className="status-indicator warning"></div>
                      <span>Low Stock</span>
                    </div>
                  </div>
                  
                  <div className="stock-category-item">
                    <div className="category-icon">
                      <FontAwesomeIcon icon={faTruck} />
                    </div>
                    <div className="category-info">
                      <h4>Toys</h4>
                      <p>89 products</p>
                    </div>
                    <div className="category-status">
                      <div className="status-indicator good"></div>
                      <span>In Stock</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel performance-panel">
                <div className="panel-header space-between">
                  <div>
                    <h2>Inventory Analytics</h2>
                  </div>
                  <NavLink to="/inventory/analytics" className="see-all-link">
                    View reports
                  </NavLink>
                </div>
                
                <div className="inventory-metrics">
                  <div className="status-card success">
                    <strong>1,247</strong>
                    <p>Total Products</p>
                    <small>+45 new items</small>
                  </div>
                  <div className="status-card warning">
                    <strong>23</strong>
                    <p>Low Stock Items</p>
                    <small>Need attention</small>
                  </div>
                </div>
                
                <div className="mini-chart-placeholder">
                  <FontAwesomeIcon icon={faArrowUp} />
                  <span>Stock Movement Trend</span>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="dashboard-content">
            <Outlet />
          </section>
        )}
      </main>
    </div>
  );
};

export default InventoryDashboard;