import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import {
  faChartBar,
  faMoneyBillWave,
  faBox,
  faCalendarCheck,
  faStethoscope,
  faUsers,
  faRefresh,
  faBuilding,
  faCalendarAlt,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import "./AdminReports.css";

const AdminReports = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/reports") {
      setActiveTab("overview");
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const data = await apiRequest("/admin/reports/summary");
        setReportData(data);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load report data");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const formatPercentage = (value) => {
    return `${Number(value || 0).toFixed(1)}%`;
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyTrend = reportData?.monthly_revenue?.map((item) => ({
    month: monthNames[(item.month ?? 1) - 1] || "N/A",
    revenue: Number(item.total) || 0,
  })) || [];

  const renderOverview = () => (
    <div className="simple-reports">
      <h3>Overview</h3>
      <div className="simple-stats">
        <div className="simple-stat">
          <strong>Total Revenue:</strong> {formatCurrency(reportData?.total_revenue)}
        </div>
        <div className="simple-stat">
          <strong>Total Transactions:</strong> {reportData?.total_transactions || 0}
        </div>
        <div className="simple-stat">
          <strong>Total Customers:</strong> {reportData?.total_customers || 0}
        </div>
        <div className="simple-stat">
          <strong>New Customers (30d):</strong> {reportData?.new_customers || 0}
        </div>
        <div className="simple-stat">
          <strong>Total Users:</strong> {reportData?.total_users || 0}
        </div>
      </div>
      
      <h4>Monthly Revenue Trend</h4>
      <div className="column-line-chart">
        <div className="chart-container">
          <svg width="100%" height="220" viewBox="0 0 400 220">
            {[0, 50, 100, 150, 200].map((y) => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#e9ecef" strokeWidth="1" />
            ))}
            <polyline
              fill="none"
              stroke="#007bff"
              strokeWidth="2"
              points={monthlyTrend.map((month, index) => {
                const x = index * 60 + 50;
                const y = 200 - Math.min(month.revenue / Math.max(reportData?.total_revenue || 1, 1) * 150, 180);
                return `${x},${y}`;
              }).join(" ")}
            />
            {monthlyTrend.map((month, index) => {
              const x = index * 60 + 50;
              const y = 200 - Math.min(month.revenue / Math.max(reportData?.total_revenue || 1, 1) * 150, 180);
              return (
                <g key={month.month}>
                  <circle cx={x} cy={y} r="4" fill="#007bff" />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );

  const renderCashier = () => (
    <div className="simple-reports">
      <h3>Cashier Metrics</h3>
      <div className="simple-stats">
        <div className="simple-stat">
          <strong>Total Sales:</strong> {formatCurrency(reportData?.total_revenue)}
        </div>
        <div className="simple-stat">
          <strong>Today&apos;s Transactions:</strong> {reportData?.today_transactions || 0}
        </div>
        <div className="simple-stat">
          <strong>Total Transactions:</strong> {reportData?.total_transactions || 0}
        </div>
      </div>
      <h4>Top Services</h4>
      <div className="top-list">
        {reportData?.top_services?.map((service, index) => (
          <div key={`${service.service}-${index}`} className="top-list-item">
            <span>{service.service}</span>
            <strong>{service.count} orders</strong>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="simple-reports">
      <h3>Inventory Metrics</h3>
      <div className="simple-stats">
        <div className="simple-stat">
          <strong>Total Items:</strong> {reportData?.total_inventory_items || 0}
        </div>
        <div className="simple-stat">
          <strong>Low Stock Items:</strong> {reportData?.low_stock_items || 0}
        </div>
        <div className="simple-stat">
          <strong>Out of Stock:</strong> {reportData?.out_of_stock_items || 0}
        </div>
      </div>
    </div>
  );

  const renderReception = () => (
    <div className="simple-reports">
      <h3>Reception Metrics</h3>
      <div className="simple-stats">
        <div className="simple-stat">
          <strong>Total Appointments:</strong> {reportData?.total_appointments || 0}
        </div>
        <div className="simple-stat">
          <strong>Completed Appointments:</strong> {reportData?.completed_appointments || 0}
        </div>
        <div className="simple-stat">
          <strong>Today&apos;s Revenue:</strong> {formatCurrency(reportData?.today_revenue)}
        </div>
      </div>
    </div>
  );

  const renderVeterinary = () => (
    <div className="simple-reports">
      <h3>Veterinary Metrics</h3>
      <div className="simple-stats">
        <div className="simple-stat">
          <strong>Total Patients:</strong> {reportData?.total_pets || 0}
        </div>
        <div className="simple-stat">
          <strong>Total Appointments:</strong> {reportData?.total_appointments || 0}
        </div>
        <div className="simple-stat">
          <strong>Completed Appointments:</strong> {reportData?.completed_appointments || 0}
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="simple-reports">
      <h3>Customer Metrics</h3>
      <div className="simple-stats">
        <div className="simple-stat">
          <strong>Total Customers:</strong> {reportData?.total_customers || 0}
        </div>
        <div className="simple-stat">
          <strong>New Customers (30d):</strong> {reportData?.new_customers || 0}
        </div>
      </div>
      <h4>Top Customers</h4>
      <div className="top-list">
        {reportData?.top_customers?.map((customer, index) => (
          <div key={`${customer.customer}-${index}`} className="top-list-item">
            <span>{customer.customer}</span>
            <strong>{customer.visits} visits</strong>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "cashier":
        return renderCashier();
      case "inventory":
        return renderInventory();
      case "reception":
        return renderReception();
      case "veterinary":
        return renderVeterinary();
      case "customers":
        return renderCustomers();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="admin-reports-page">
      <section className="report-header">
        <div>
          <h1>Admin Reports</h1>
          <p>Live business metrics and activity trends from the backend.</p>
        </div>
        <div className="report-actions">
          <button
            className={activeTab === "overview" ? "active" : ""}
            type="button"
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={activeTab === "cashier" ? "active" : ""}
            type="button"
            onClick={() => setActiveTab("cashier")}
          >
            Cashier
          </button>
          <button
            className={activeTab === "inventory" ? "active" : ""}
            type="button"
            onClick={() => setActiveTab("inventory")}
          >
            Inventory
          </button>
          <button
            className={activeTab === "reception" ? "active" : ""}
            type="button"
            onClick={() => setActiveTab("reception")}
          >
            Reception
          </button>
          <button
            className={activeTab === "veterinary" ? "active" : ""}
            type="button"
            onClick={() => setActiveTab("veterinary")}
          >
            Veterinary
          </button>
          <button
            className={activeTab === "customers" ? "active" : ""}
            type="button"
            onClick={() => setActiveTab("customers")}
          >
            Customers
          </button>
        </div>
      </section>

      {loading ? (
        <div className="loading-container">Loading live report metrics...</div>
      ) : error ? (
        <div className="error-container">
          <div className="error-message">{error}</div>
        </div>
      ) : (
        <div className="report-content">{renderActiveTab()}</div>
      )}
    </div>
  );
};

export default AdminReports;
