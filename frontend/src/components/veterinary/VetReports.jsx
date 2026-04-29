import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faFileExport,
  faStethoscope,
  faSpinner,
  faMoneyBillWave,
  faChartLine,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import "./VetReports.css";

// Demo data for fallback when API fails
const demoVetReports = {
  monthly_revenue: 125000,
  monthly_completed: 156,
  period: 'Current Month',
  service_breakdown: [
    { service: { name: 'General Consultation' }, count: 45, revenue: 22500 },
    { service: { name: 'Vaccination' }, count: 38, revenue: 19000 },
    { service: { name: 'Surgery' }, count: 12, revenue: 48000 },
    { service: { name: 'Dental Care' }, count: 25, revenue: 12500 },
    { service: { name: 'Grooming' }, count: 36, revenue: 23000 }
  ]
};

const VetReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        let data;
        try {
          const apiData = await apiRequest("/veterinary/reports");
          data = Array.isArray(apiData) ? apiData[0] : apiData || demoVetReports;
        } catch (apiErr) {
          console.warn("API fetch failed, using demo data:", apiErr);
          data = demoVetReports;
        }
        setReports(data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError("Failed to load reports");
        setReports(demoVetReports);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();

    // Real-time updates: poll every 5 seconds
    const interval = setInterval(() => {
      fetchReports();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const calculateStats = () => {
    if (!reports) return { totalRevenue: 0, estimatedProfit: 0, totalCompleted: 0, serviceStats: {}, period: 'Current Month' };
    
    const totalRevenue = reports.monthly_revenue || 0;
    const totalCompleted = reports.monthly_completed || 0;
    const estimatedProfit = totalRevenue * 0.4;
    
    const serviceStats = {};
    const breakdown = reports.service_breakdown || [];
    if (Array.isArray(breakdown)) {
      breakdown.forEach(service => {
        const name = service.service?.name || 'Unknown';
        serviceStats[name] = {
          count: service.count || 0,
          revenue: service.revenue || 0
        };
      });
    }
    
    return {
      totalRevenue,
      estimatedProfit,
      totalCompleted,
      serviceStats,
      period: reports.period || 'Current Month'
    };
  };

  const stats = calculateStats();

  const serviceChartData = Object.entries(stats.serviceStats || {}).map(
    ([name, data]) => ({
      name,
      appointments: data.count,
      revenue: data.revenue,
    })
  );

  const handleExportCSV = async () => {
    try {
      const csvContent = [
        ["Service", "Count", "Revenue"],
        ...(reports?.service_breakdown || []).map(service => [
          service.service?.name || 'Unknown',
          service.count || 0,
          service.revenue || 0
        ])
      ].map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
      
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

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Veterinary Reports", 14, 18);

    doc.setFontSize(11);
    doc.text(`Period: ${stats.period}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36);

    doc.setFontSize(13);
    doc.text("Financial Overview", 14, 50);

    autoTable(doc, {
      startY: 56,
      head: [["Metric", "Value"]],
      body: [
        ["Total Revenue", formatCurrency(stats.totalRevenue)],
        ["Estimated Profit", formatCurrency(stats.estimatedProfit)],
        ["Completed Appointments", stats.totalCompleted],
      ],
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 12,
      head: [["Service", "Appointments", "Revenue"]],
      body: Object.entries(stats.serviceStats || {}).map(([serviceName, data]) => [
        serviceName,
        data.count,
        formatCurrency(data.revenue),
      ]),
    });

    doc.save("veterinary-reports.pdf");
  };

  if (loading) {
    return (
      <section className="app-content vet-reports">
        <div className="premium-card vet-loading-state">
          <FontAwesomeIcon icon={faSpinner} className="spin-animation" />
          <span>Loading veterinary reports...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="app-content vet-reports">
      {error && (
        <div className="premium-card vet-error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError("")} type="button">×</button>
        </div>
      )}

      <div className="premium-card vet-reports-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
          <h2 className="premium-title" style={{ margin: 0 }}>
            <FontAwesomeIcon icon={faChartLine} /> Veterinary Analytics & Reports
          </h2>
          <span className="premium-badge live">LIVE</span>
        </div>
        <p className="premium-muted">Financial overview and service breakdown (auto-updating)</p>
      </div>

      {/* Financial Overview */}
      <div className="premium-card vet-financial-panel">
        <h3>Financial Overview - {stats.period}</h3>
        <div className="app-grid-3 vet-financial-grid">
          <div className="app-stat-card vet-financial-card">
            <div className="vet-financial-icon">
              <FontAwesomeIcon icon={faMoneyBillWave} />
            </div>
            <div>
              <h3>{stats.totalRevenue ? formatCurrency(stats.totalRevenue) : "₱0"}</h3>
              <p>Total Revenue</p>
            </div>
          </div>

          <div className="app-stat-card vet-financial-card">
            <div className="vet-financial-icon profit">
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <div>
              <h3>{stats.estimatedProfit ? formatCurrency(stats.estimatedProfit) : "₱0"}</h3>
              <p>Estimated Profit</p>
            </div>
          </div>

          <div className="app-stat-card vet-financial-card">
            <div className="vet-financial-icon">
              <FontAwesomeIcon icon={faCalendarCheck} />
            </div>
            <div>
              <h3>{stats.totalCompleted}</h3>
              <p>Completed Appointments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="app-grid-2">
        <div className="premium-card vet-chart-panel">
          <h3>Revenue by Service</h3>
          <div className="vet-chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card vet-chart-panel">
          <h3>Appointments by Service</h3>
          <div className="vet-chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceChartData}
                  dataKey="appointments"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {serviceChartData.map((entry, index) => (
                    <Cell key={index} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Service Breakdown */}
      <div className="premium-card vet-services-panel">
        <h3>Service Breakdown</h3>
        {Object.keys(stats.serviceStats || {}).length === 0 ? (
          <div className="vet-empty-state">
            <FontAwesomeIcon icon={faStethoscope} />
            <h3>No service data available</h3>
            <p>Service breakdown will appear here when data is available</p>
          </div>
        ) : (
          <div className="vet-services-grid">
            {Object.entries(stats.serviceStats || {}).map(([serviceName, data]) => (
              <div key={serviceName} className="premium-card vet-service-card">
                <div className="vet-service-header">
                  <FontAwesomeIcon icon={faStethoscope} />
                  <span>{serviceName}</span>
                </div>
                <div className="vet-service-stats">
                  <div>
                    <strong>{data.count}</strong>
                    <p>Appointments</p>
                  </div>
                  <div>
                    <strong>{data.revenue ? formatCurrency(data.revenue) : "₱0"}</strong>
                    <p>Revenue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="premium-card vet-export-panel">
        <h3>Export Reports</h3>
        <div className="vet-export-actions">
          <button className="btn-primary" onClick={handleExportPDF} type="button">
            <FontAwesomeIcon icon={faDownload} /> Export PDF
          </button>
          <button className="btn-secondary" onClick={handleExportCSV} type="button">
            <FontAwesomeIcon icon={faDownload} /> Export CSV
          </button>
          <button className="btn-secondary" onClick={handleExportJSON} type="button">
            <FontAwesomeIcon icon={faFileExport} /> Export JSON
          </button>
        </div>
      </div>
    </section>
  );
};

export default VetReports;