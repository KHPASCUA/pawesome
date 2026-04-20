import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faFileExport,
  faStethoscope,
  faSpinner,
  faExclamationTriangle,
  faMoneyBillWave,
  faChartLine,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import ReportFilters from "../shared/ReportFilters";
import {
  exportToCSV,
  exportToPDF,
  exportToExcel,
  filterByDateRange,
  filterByStatus,
  getDateRangePreset,
} from "../../utils/reportExport";
import "./VetReports.css";

const VetReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/veterinary/reports");
      setReports(data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setError("Failed to load reports");
      setReports(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!reports) return {};
    
    const totalRevenue = reports.monthly_revenue || 0;
    const totalCompleted = reports.monthly_completed || 0;
    const totalProfit = totalRevenue * 0.4;
    
    const serviceStats = {};
    if (reports.service_breakdown) {
      reports.service_breakdown.forEach(service => {
        serviceStats[service.service?.name || 'Unknown'] = {
          count: service.count || 0,
          revenue: service.revenue || 0
        };
      });
    }
    
    return {
      totalRevenue,
      totalProfit,
      totalCompleted,
      serviceStats,
      period: reports.period || 'Current Month'
    };
  };

  const stats = calculateStats();

  const handleExportCSV = async () => {
    try {
      const csvContent = [
        ["Service", "Count", "Revenue"],
        ...(reports?.service_breakdown || []).map(service => [
          service.service?.name || 'Unknown',
          service.count || 0,
          service.revenue || 0
        ])
      ].map(row => row.join(",")).join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "veterinary-reports.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export error:", err);
    }
  };

  const handleExportJSON = async () => {
    try {
      const jsonContent = JSON.stringify({
        reports: reports,
        statistics: stats,
        generatedAt: new Date().toISOString()
      }, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "veterinary-reports.json";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("JSON export error:", err);
    }
  };

  if (loading) {
    return (
      <div className="vet-reports">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Loading veterinary reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vet-reports">
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="vet-reports">
      <div className="reports-header">
        <div className="header-content">
          <h2>Veterinary Analytics & Reports</h2>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="financial-dashboard">
        <h3>Financial Overview - {stats.period}</h3>
        <div className="financial-grid">
          <div className="financial-card revenue">
            <div className="financial-icon">
              <FontAwesomeIcon icon={faMoneyBillWave} />
            </div>
            <div className="financial-content">
              <div className="financial-value">{formatCurrency(stats.totalRevenue)}</div>
              <div className="financial-label">Total Revenue</div>
            </div>
          </div>

          <div className="financial-card profit">
            <div className="financial-icon">
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <div className="financial-content">
              <div className="financial-value">{formatCurrency(stats.totalProfit)}</div>
              <div className="financial-label">Estimated Profit</div>
            </div>
          </div>

          <div className="financial-card appointments">
            <div className="financial-icon">
              <FontAwesomeIcon icon={faCalendarCheck} />
            </div>
            <div className="financial-content">
              <div className="financial-value">{stats.totalCompleted}</div>
              <div className="financial-label">Completed Appointments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Breakdown */}
      <div className="service-breakdown">
        <h3>Service Breakdown</h3>
        <div className="breakdown-grid">
          {Object.entries(stats.serviceStats || {}).map(([serviceName, data]) => (
            <div key={serviceName} className="breakdown-card">
              <div className="breakdown-header">
                <FontAwesomeIcon icon={faStethoscope} />
                <span className="service-name">{serviceName}</span>
              </div>
              <div className="breakdown-stats">
                <div className="stat">
                  <span className="stat-value">{data.count}</span>
                  <span className="stat-label">Appointments</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{formatCurrency(data.revenue)}</span>
                  <span className="stat-label">Revenue</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="export-section">
        <h3>Export Reports</h3>
        <div className="export-buttons">
          <button className="btn-export" onClick={handleExportCSV}>
            <FontAwesomeIcon icon={faDownload} />
            Export CSV
          </button>
          <button className="btn-export" onClick={handleExportJSON}>
            <FontAwesomeIcon icon={faFileExport} />
            Export JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default VetReports;