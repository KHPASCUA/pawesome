import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faExclamationTriangle,
  faChartLine,
  faWarehouse,
  faArrowUp,
  faArrowDown,
  faSync,
  faSearch,
  faFilter,
  faDownload,
  faPlus,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { inventoryApi } from "../../api/inventory";
import { formatCurrency } from "../../utils/currency";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "./AdvancedInventoryDashboard.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdvancedInventoryDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Demo data for fallback - Pet store items only (₱ Philippine Peso)
  const demoData = {
    total_items: 48,
    low_stock_items: 5,
    out_of_stock_items: 2,
    total_stock_value: 45280.50,
    inventory_turnover: 3.8,
    avg_days_in_stock: 12,
    top_moving_products: [
      { name: "Premium Dog Food 5kg", sold: 45, revenue: 54000.00 },
      { name: "Cat Kibble 2kg", sold: 38, revenue: 32300.00 },
      { name: "Pet Grooming Service", sold: 52, revenue: 33800.00 },
    ],
    stock_trend: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      in_stock: [42, 40, 45, 43, 46, 48, 48],
      low_stock: [5, 8, 6, 7, 5, 5, 5],
      out_of_stock: [2, 2, 1, 2, 1, 2, 2],
    },
    category_distribution: {
      labels: ["Food", "Accessories", "Grooming", "Toys", "Health", "Services"],
      values: [18, 12, 8, 5, 3, 2],
    },
    recent_movements: [
      { id: 1, type: "in", item: "Premium Dog Food 5kg", quantity: 24, date: "2024-04-21 09:30", user: "Admin" },
      { id: 2, type: "out", item: "Cat Kibble 2kg", quantity: 5, date: "2024-04-21 10:15", user: "Cashier" },
      { id: 3, type: "adjust", item: "Leather Dog Collar", quantity: -2, date: "2024-04-21 11:00", user: "Manager" },
      { id: 4, type: "in", item: "Pet Shampoo 500ml", quantity: 30, date: "2024-04-21 14:20", user: "Admin" },
    ],
  };

  // Auto-refresh every 30 seconds for live data
  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await inventoryApi.getDashboard({ period: timeRange });
      // Use API data if response exists (even if empty) - only use demo on API failure
      if (response) {
        setDashboardData(response);
        setUsingDemoData(false);
      } else {
        // API returned null/undefined - use demo
        setDashboardData(demoData);
        setUsingDemoData(true);
      }
    } catch (err) {
      console.error("Dashboard API fetch failed, using demo fallback:", err);
      setDashboardData(demoData);
      setUsingDemoData(true);
    } finally {
      setLoading(false);
    }
  };

  // Stock trend chart data
  const stockTrendData = {
    labels: dashboardData?.stock_trend?.labels || [],
    datasets: [
      {
        label: "In Stock",
        data: dashboardData?.stock_trend?.in_stock || [],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Low Stock",
        data: dashboardData?.stock_trend?.low_stock || [],
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Out of Stock",
        data: dashboardData?.stock_trend?.out_of_stock || [],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Category distribution chart data
  const categoryData = {
    labels: dashboardData?.category_distribution?.labels || [],
    datasets: [
      {
        data: dashboardData?.category_distribution?.values || [],
        backgroundColor: [
          "#3b82f6",
          "#8b5cf6",
          "#10b981",
          "#f59e0b",
          "#ef4444",
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
    },
  };

  const statsCards = [
    {
      title: "Total Products",
      value: dashboardData?.total_items || 0,
      subtitle: "Active SKUs",
      icon: faBox,
      color: "#3b82f6",
      trend: "up",
      trendValue: "+5.2%",
    },
    {
      title: "Stock Value",
      value: formatCurrency(dashboardData?.total_stock_value || 0),
      subtitle: "Current inventory worth",
      icon: faWarehouse,
      color: "#10b981",
      trend: "up",
      trendValue: "+8.1%",
    },
    {
      title: "Low Stock Alert",
      value: dashboardData?.low_stock_items || 0,
      subtitle: "Items need reorder",
      icon: faExclamationTriangle,
      color: "#f59e0b",
      trend: "up",
      trendValue: "+2",
      alert: true,
    },
    {
      title: "Out of Stock",
      value: dashboardData?.out_of_stock_items || 0,
      subtitle: "Unavailable items",
      icon: faChartLine,
      color: "#ef4444",
      trend: "down",
      trendValue: "-1",
      alert: true,
    },
  ];

  const quickActions = [
    { icon: faPlus, label: "Add Product", color: "#3b82f6" },
    { icon: faSync, label: "Sync Stock", color: "#10b981" },
    { icon: faDownload, label: "Export Data", color: "#8b5cf6" },
    { icon: faBell, label: "Alerts", color: "#f59e0b", count: notifications.length },
  ];

  if (loading) {
    return (
      <div className="advanced-inventory-loading">
        <div className="spinner"></div>
        <p>Loading advanced inventory dashboard...</p>
      </div>
    );
  }

  return (
    <div className="advanced-inventory-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Advanced Inventory Management</h1>
          <p>Real-time stock control, analytics, and optimization</p>
          {usingDemoData && (
            <span className="demo-badge">Demo Mode - Using Sample Data</span>
          )}
        </div>
        <div className="header-right">
          <div className="time-range-selector">
            <button
              className={timeRange === "24h" ? "active" : ""}
              onClick={() => setTimeRange("24h")}
            >
              24h
            </button>
            <button
              className={timeRange === "7d" ? "active" : ""}
              onClick={() => setTimeRange("7d")}
            >
              7 Days
            </button>
            <button
              className={timeRange === "30d" ? "active" : ""}
              onClick={() => setTimeRange("30d")}
            >
              30 Days
            </button>
          </div>
          <button
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FontAwesomeIcon icon={faBell} />
            {notifications.length > 0 && (
              <span className="badge">{notifications.length}</span>
            )}
          </button>
        </div>
      </header>

      {/* Quick Actions */}
      <section className="quick-actions">
        {quickActions.map((action, index) => (
          <button key={index} className="action-card" style={{ borderColor: action.color }}>
            <div className="action-icon" style={{ background: action.color }}>
              <FontAwesomeIcon icon={action.icon} />
            </div>
            <span>{action.label}</span>
            {action.count > 0 && <span className="action-badge">{action.count}</span>}
          </button>
        ))}
      </section>

      {/* Stats Cards */}
      <section className="stats-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.alert ? "alert" : ""}`}>
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              <FontAwesomeIcon icon={stat.icon} />
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
              <p className="stat-subtitle">{stat.subtitle}</p>
            </div>
            <div className={`stat-trend ${stat.trend}`}>
              <FontAwesomeIcon icon={stat.trend === "up" ? faArrowUp : faArrowDown} />
              <span>{stat.trendValue}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Charts Section */}
      <section className="charts-grid">
        <div className="chart-card large">
          <div className="chart-header">
            <h3>Stock Level Trends</h3>
            <p>Monitor inventory health over time</p>
          </div>
          <div className="chart-body">
            <Line data={stockTrendData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Category Distribution</h3>
            <p>Inventory by product category</p>
          </div>
          <div className="chart-body doughnut">
            <Doughnut data={categoryData} options={doughnutOptions} />
          </div>
        </div>
      </section>

      {/* Bottom Section */}
      <section className="bottom-grid">
        {/* Top Moving Products */}
        <div className="panel-card">
          <div className="panel-header">
            <h3>Top Moving Products</h3>
            <button className="view-all">View All</button>
          </div>
          <div className="panel-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Sold</th>
                  <th>Revenue</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.top_moving_products?.map((product, index) => (
                  <tr key={index}>
                    <td>
                      <div className="product-cell">
                        <span className="product-rank">#{index + 1}</span>
                        <span className="product-name">{product.name}</span>
                      </div>
                    </td>
                    <td>{product.sold}</td>
                    <td>{formatCurrency(product.revenue)}</td>
                    <td>
                      <span className="trend-badge up">
                        <FontAwesomeIcon icon={faArrowUp} /> {(Math.random() * 20 + 5).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div className="panel-card">
          <div className="panel-header">
            <h3>Recent Stock Movements</h3>
            <button className="view-all">View History</button>
          </div>
          <div className="panel-body">
            <div className="movement-list">
              {dashboardData?.recent_movements?.map((movement) => (
                <div key={movement.id} className="movement-item">
                  <div className={`movement-icon ${movement.type}`}>
                    <FontAwesomeIcon
                      icon={
                        movement.type === "in"
                          ? faArrowUp
                          : movement.type === "out"
                          ? faArrowDown
                          : faSync
                      }
                    />
                  </div>
                  <div className="movement-details">
                    <p className="movement-item-name">{movement.item}</p>
                    <p className="movement-meta">
                      {movement.type === "in"
                        ? `Stock In: +${movement.quantity}`
                        : movement.type === "out"
                        ? `Stock Out: -${movement.quantity}`
                        : `Adjustment: ${movement.quantity > 0 ? "+" : ""}${movement.quantity}`}
                      {" "}• {movement.user} • {movement.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdvancedInventoryDashboard;
