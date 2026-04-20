import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faCalendarAlt,
  faDownload,
  faFileExport,
  faChartBar,
  faPaw,
  faUser,
  faStethoscope,
  faSyringe,
  faNotesMedical,
  faSpinner,
  faExclamationTriangle,
  faEdit,
  faTrash,
  faPlus,
  faSort,
  faUsers,
  faHeart,
  faClock,
  faStar,
  faMoneyBillWave,
  faChartLine,
  faDollarSign,
  faCalendarCheck,
  faArrowUp,
  faArrowDown,
  faClipboardList,
  faHospital,
  faBandAid,
  faHeartbeat,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import "./VetReports.css";

const VetReports = () => {
  const [reports, setReports] = useState(null); // Now an object, not array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterVet, setFilterVet] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [viewMode, setViewMode] = useState("table");
  const [dateRange, setDateRange] = useState("all");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/veterinary/reports");
      // data is { monthly_completed, monthly_revenue, service_breakdown, period }
      setReports(data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setError("Failed to load reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!reports) return {};
    
    const totalRevenue = reports.monthly_revenue || 0;
    const totalCompleted = reports.monthly_completed || 0;
    
    // Calculate profit as 40% of revenue (example)
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

  const getTypeIcon = (type) => {
    switch (type) {
      case "checkup": return faStethoscope;
      case "vaccination": return faSyringe;
      case "surgery": return faHospital;
      case "emergency": return faHeartbeat;
      case "dental": return faNotesMedical;
      case "grooming": return faBandAid;
      default: return faCalendarAlt;
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case "checkup": return "type-checkup";
      case "vaccination": return "type-vaccination";
      case "surgery": return "type-surgery";
      case "emergency": return "type-emergency";
      case "dental": return "type-dental";
      case "grooming": return "type-grooming";
      default: return "type-consultation";
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

  return (
    <div className="vet-reports">
      <div className="reports-header">
        <div className="header-content">
          <h2>Veterinary Analytics & Reports</h2>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => console.log("Add Report")}>
              <FontAwesomeIcon icon={faPlus} />
              Add Report
            </button>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <div className="search-filters">
          <div className="search-container">
            <div className="search-input-wrapper">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <label>Type</label>
              <select
                className="filter-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="checkup">Checkups</option>
                <option value="vaccination">Vaccinations</option>
                <option value="surgery">Surgeries</option>
                <option value="emergency">Emergency</option>
                <option value="dental">Dental</option>
                <option value="grooming">Grooming</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Veterinarian</label>
              <select
                className="filter-select"
                value={filterVet}
                onChange={(e) => setFilterVet(e.target.value)}
              >
                <option value="all">All Vets</option>
                <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
                <option value="Dr. Michael Chen">Dr. Michael Chen</option>
                <option value="Dr. Lisa Anderson">Dr. Lisa Anderson</option>
                <option value="Dr. David Miller">Dr. David Miller</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Status</label>
              <select
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Sort By</label>
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Date</option>
                <option value="cost">Cost</option>
                <option value="revenue">Revenue</option>
                <option value="profit">Profit</option>
              </select>
            </div>
            
            <div className="export-controls">
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
            <div className="financial-icon">
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <div className="financial-content">
              <div className="financial-value">{formatCurrency(stats.totalProfit)}</div>
              <div className="financial-label">Total Profit</div>
              <div className="financial-trend">
                <FontAwesomeIcon icon={faArrowUp} />
                <span>Margin: 76.9%</span>
              </div>
            </div>
          </div>

          <div className="financial-card expenses">
            <div className="financial-icon">
              <FontAwesomeIcon icon={faDollarSign} />
            </div>
            <div className="financial-content">
              <div className="financial-value">{formatCurrency(stats.totalExpenses)}</div>
              <div className="financial-label">Total Expenses</div>
              <div className="financial-trend">
                <FontAwesomeIcon icon={faArrowDown} />
                <span>Operational costs</span>
              </div>
            </div>
          </div>

          <div className="financial-card pending">
            <div className="financial-icon">
              <FontAwesomeIcon icon={faCalendarCheck} />
            </div>
            <div className="financial-content">
              <div className="financial-value">{formatCurrency(stats.pendingRevenue)}</div>
              <div className="financial-label">Pending Revenue</div>
              <div className="financial-trend">
                <FontAwesomeIcon icon={faArrowUp} />
                <span>Awaiting payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="performance-dashboard">
        <h3>Performance Metrics</h3>
        <div className="performance-grid">
          <div className="performance-card">
            <div className="performance-icon">
              <FontAwesomeIcon icon={faClipboardList} />
            </div>
            <div className="performance-content">
              <div className="performance-value">8</div>
              <div className="performance-label">Total Appointments</div>
              <div className="performance-subtitle">All time records</div>
            </div>
          </div>

          <div className="performance-card">
            <div className="performance-icon">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className="performance-content">
              <div className="performance-value">4</div>
              <div className="performance-label">Active Veterinarians</div>
              <div className="performance-subtitle">Staff members</div>
            </div>
          </div>

          <div className="performance-card">
            <div className="performance-icon">
              <FontAwesomeIcon icon={faStar} />
            </div>
            <div className="performance-content">
              <div className="performance-value">4.8</div>
              <div className="performance-label">Average Rating</div>
              <div className="performance-subtitle">Customer satisfaction</div>
            </div>
          </div>

          <div className="performance-card">
            <div className="performance-icon">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className="performance-content">
              <div className="performance-value">23 min</div>
              <div className="performance-label">Avg. Duration</div>
              <div className="performance-subtitle">Service time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Type Distribution */}
      <div className="service-distribution">
        <h3>Service Type Distribution</h3>
        <div className="service-grid">
          <div className="service-card">
            <div className="service-icon">
              <FontAwesomeIcon icon={faStethoscope} />
            </div>
            <div className="service-content">
              <div className="service-value">2</div>
              <div className="service-label">Checkup</div>
              <div className="service-percentage">25.0%</div>
            </div>
          </div>
          
          <div className="service-card">
            <div className="service-icon">
              <FontAwesomeIcon icon={faSyringe} />
            </div>
            <div className="service-content">
              <div className="service-value">2</div>
              <div className="service-label">Vaccination</div>
              <div className="service-percentage">25.0%</div>
            </div>
          </div>
          
          <div className="service-card">
            <div className="service-icon">
              <FontAwesomeIcon icon={faHospital} />
            </div>
            <div className="service-content">
              <div className="service-value">1</div>
              <div className="service-label">Surgery</div>
              <div className="service-percentage">12.5%</div>
            </div>
          </div>
          
          <div className="service-card">
            <div className="service-icon">
              <FontAwesomeIcon icon={faHeartbeat} />
            </div>
            <div className="service-content">
              <div className="service-value">1</div>
              <div className="service-label">Emergency</div>
              <div className="service-percentage">12.5%</div>
            </div>
          </div>
          
          <div className="service-card">
            <div className="service-icon">
              <FontAwesomeIcon icon={faNotesMedical} />
            </div>
            <div className="service-content">
              <div className="service-value">1</div>
              <div className="service-label">Dental</div>
              <div className="service-percentage">12.5%</div>
            </div>
          </div>
          
          <div className="service-card">
            <div className="service-icon">
              <FontAwesomeIcon icon={faBandAid} />
            </div>
            <div className="service-content">
              <div className="service-value">1</div>
              <div className="service-label">Grooming</div>
              <div className="service-percentage">12.5%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports Table */}
      <div className="reports-table">
        <div className="table-header">
          <h3 className="table-title">Detailed Reports</h3>
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
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Pet</th>
                <th>Owner</th>
                <th>Type</th>
                <th>Veterinarian</th>
                <th>Cost</th>
                <th>Revenue</th>
                <th>Profit</th>
                <th>Rating</th>
                <th>Duration</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report, index) => (
                <tr key={report.id || index}>
                  <td>{new Date(report.date).toLocaleDateString()}</td>
                  <td>
                    <div className="cell-with-icon">
                      <FontAwesomeIcon icon={faPaw} />
                      {report.pet_name}
                    </div>
                  </td>
                  <td>
                    <div className="cell-with-icon">
                      <FontAwesomeIcon icon={faUser} />
                      {report.owner_name}
                    </div>
                  </td>
                  <td>
                    <span className={`service-type-badge ${getTypeClass(report.type)}`}>
                      <FontAwesomeIcon icon={getTypeIcon(report.type)} />
                      {report.type?.charAt(0).toUpperCase() + report.type?.slice(1)}
                    </span>
                  </td>
                  <td>{report.vet_name}</td>
                  <td className="cost-cell">{formatCurrency(report.cost)}</td>
                  <td className="revenue-cell">{formatCurrency(report.revenue)}</td>
                  <td className="profit-cell">{formatCurrency(report.profit)}</td>
                  <td>
                    <div className="rating-cell">
                      <div className="rating-stars">
                        {[...Array(5)].map((_, i) => (
                          <FontAwesomeIcon
                            key={i}
                            icon={faStar}
                            className={i < report.rating ? "star-filled" : "star-empty"}
                          />
                        ))}
                      </div>
                      <span>{report.rating}/5</span>
                    </div>
                  </td>
                  <td>{report.duration}</td>
                  <td>
                    <span className={`payment-badge ${report.payment_status}`}>
                      {report.payment_status?.charAt(0).toUpperCase() + report.payment_status?.slice(1)}
                    </span>
                  </td>
                  <td>
                    <button className="btn-view">
                      <FontAwesomeIcon icon={faChartBar} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VetReports;
