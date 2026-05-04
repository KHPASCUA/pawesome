import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faFileExport,
  faStethoscope,
  faSpinner,
  faMoneyBillWave,
  faChartLine,
  faCalendarCheck,
  faRotateRight,
  faExclamationTriangle,
  faFileInvoice,
  faHospital,
  faSyringe,
  faHeartbeat,
  faPaw,
  faClipboardList,
  faDatabase,
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
  CartesianGrid,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import "./VetReports.css";

const demoVetReports = {
  monthly_revenue: 125000,
  monthly_completed: 156,
  period: "Current Month",
  service_breakdown: [
    { service: { name: "General Consultation" }, count: 45, revenue: 22500 },
    { service: { name: "Vaccination" }, count: 38, revenue: 19000 },
    { service: { name: "Surgery" }, count: 12, revenue: 48000 },
    { service: { name: "Dental Care" }, count: 25, revenue: 12500 },
    { service: { name: "Grooming" }, count: 36, revenue: 23000 },
  ],
};

const CHART_COLORS = ["#ff5f93", "#ff8db5", "#ffc8dd", "#f59e0b", "#10b981", "#3b82f6"];

const VetReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [error, setError] = useState("");

  const safeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.service_breakdown)) return value.service_breakdown;
    if (Array.isArray(value?.services)) return value.services;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.records)) return value.records;
    return [];
  };

  const normalizeReportData = (data) => {
    const reportData = Array.isArray(data) ? data[0] : data || demoVetReports;

    return {
      monthly_revenue:
        Number(
          reportData.monthly_revenue ||
            reportData.total_revenue ||
            reportData.revenue ||
            0
        ) || 0,
      monthly_completed:
        Number(
          reportData.monthly_completed ||
            reportData.completed_appointments ||
            reportData.total_completed ||
            0
        ) || 0,
      period: reportData.period || reportData.month || "Current Month",
      service_breakdown: safeArray(reportData.service_breakdown || reportData.services).map(
        (item) => ({
          service: {
            name:
              item?.service?.name ||
              item?.service_name ||
              item?.name ||
              "Unknown Service",
          },
          count: Number(item?.count || item?.appointments || item?.total || 0),
          revenue: Number(item?.revenue || item?.amount || item?.total_revenue || 0),
        })
      ),
    };
  };

  const fetchReports = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const apiData = await apiRequest("/veterinary/reports");
        const normalized = normalizeReportData(apiData);

        setReports(normalized);
        setUsingDemoData(false);
        setError("");
      } catch (apiErr) {
        console.warn("API fetch failed, using demo data:", apiErr);

        setReports(normalizeReportData(demoVetReports));
        setUsingDemoData(true);
        setError("Live reports API unavailable. Showing demo report data.");
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setReports(normalizeReportData(demoVetReports));
      setUsingDemoData(true);
      setError("Failed to load reports. Showing demo report data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports({ silent: false });

    const interval = setInterval(() => {
      fetchReports({ silent: true });
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchReports]);

  const stats = useMemo(() => {
    if (!reports) {
      return {
        totalRevenue: 0,
        estimatedProfit: 0,
        totalCompleted: 0,
        totalServices: 0,
        highestService: "N/A",
        serviceStats: {},
        period: "Current Month",
      };
    }

    const totalRevenue = Number(reports.monthly_revenue || 0);
    const totalCompleted = Number(reports.monthly_completed || 0);
    const estimatedProfit = totalRevenue * 0.4;

    const serviceStats = {};
    const breakdown = safeArray(reports.service_breakdown);

    breakdown.forEach((service) => {
      const name = service?.service?.name || service?.service_name || "Unknown Service";

      serviceStats[name] = {
        count: Number(service?.count || 0),
        revenue: Number(service?.revenue || 0),
      };
    });

    const highestService =
      Object.entries(serviceStats).sort(
        ([, a], [, b]) => Number(b.revenue || 0) - Number(a.revenue || 0)
      )[0]?.[0] || "N/A";

    return {
      totalRevenue,
      estimatedProfit,
      totalCompleted,
      totalServices: Object.keys(serviceStats).length,
      highestService,
      serviceStats,
      period: reports.period || "Current Month",
    };
  }, [reports]);

  const serviceChartData = useMemo(() => {
    return Object.entries(stats.serviceStats || {}).map(([name, data]) => ({
      name,
      appointments: Number(data.count || 0),
      revenue: Number(data.revenue || 0),
    }));
  }, [stats.serviceStats]);

  const serviceTableRows = useMemo(() => {
    const totalRevenue = serviceChartData.reduce(
      (sum, item) => sum + Number(item.revenue || 0),
      0
    );

    return serviceChartData
      .map((item) => ({
        ...item,
        percentage:
          totalRevenue > 0 ? Math.round((Number(item.revenue || 0) / totalRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [serviceChartData]);

  const handleExportCSV = () => {
    try {
      const csvContent = [
        ["Service", "Appointments", "Revenue", "Revenue Share"],
        ...serviceTableRows.map((service) => [
          service.name,
          service.appointments,
          service.revenue,
          `${service.percentage}%`,
        ]),
      ]
        .map((row) =>
          row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `veterinary_reports_${new Date().toISOString().split("T")[0]}.csv`;
      anchor.click();

      window.URL.revokeObjectURL(url);
      toast.success("CSV report exported.");
    } catch (err) {
      console.error("CSV export error:", err);
      toast.error("Failed to export CSV.");
    }
  };

  const handleExportJSON = () => {
    try {
      const jsonContent = JSON.stringify(
        {
          reports,
          statistics: stats,
          serviceTableRows,
          generatedAt: new Date().toISOString(),
          dataSource: usingDemoData ? "demo" : "live-api",
        },
        null,
        2
      );

      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `veterinary_reports_${new Date().toISOString().split("T")[0]}.json`;
      anchor.click();

      window.URL.revokeObjectURL(url);
      toast.success("JSON report exported.");
    } catch (err) {
      console.error("JSON export error:", err);
      toast.error("Failed to export JSON.");
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Veterinary Analytics & Reports", 14, 18);

      doc.setFontSize(11);
      doc.text(`Period: ${stats.period}`, 14, 28);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-PH")}`, 14, 36);
      doc.text(`Data Source: ${usingDemoData ? "Demo fallback data" : "Live API data"}`, 14, 44);

      doc.setFontSize(13);
      doc.text("Financial Overview", 14, 58);

      autoTable(doc, {
        startY: 64,
        head: [["Metric", "Value"]],
        body: [
          ["Total Revenue", formatCurrency(stats.totalRevenue)],
          ["Estimated Profit", formatCurrency(stats.estimatedProfit)],
          ["Completed Appointments", stats.totalCompleted],
          ["Services Tracked", stats.totalServices],
          ["Top Service", stats.highestService],
        ],
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 12,
        head: [["Service", "Appointments", "Revenue", "Revenue Share"]],
        body: serviceTableRows.map((item) => [
          item.name,
          item.appointments,
          formatCurrency(item.revenue),
          `${item.percentage}%`,
        ]),
      });

      doc.save(`veterinary_reports_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF report exported.");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to export PDF.");
    }
  };

  const handleRefresh = () => {
    fetchReports({ silent: true });
    toast.success("Reports refreshed.");
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
      <div className="premium-card vet-reports-hero">
        <div className="vet-reports-hero-copy">
          <span className="vet-reports-eyebrow">
            <FontAwesomeIcon icon={faChartLine} />
            Veterinary Analytics
          </span>

          <h2 className="premium-title">
            <FontAwesomeIcon icon={faChartLine} />
            Veterinary Analytics & Reports
          </h2>

          <p className="premium-muted">
            Track revenue, service performance, completed appointments, and export report summaries.
          </p>
        </div>

        <div className="vet-reports-hero-actions">
          <span className={`vet-data-source-badge ${usingDemoData ? "demo" : "live"}`}>
            <FontAwesomeIcon icon={usingDemoData ? faDatabase : faChartLine} />
            {usingDemoData ? "Demo Data" : "Live Data"}
          </span>

          <button
            className={`vet-reports-refresh-btn ${refreshing ? "refreshing" : ""}`}
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FontAwesomeIcon icon={faRotateRight} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="premium-card vet-error-banner">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
          <button onClick={() => setError("")} type="button" aria-label="Close alert">
            ×
          </button>
        </div>
      )}

      <div className="vet-report-stats">
        <article className="premium-card vet-report-stat-card">
          <span>
            <FontAwesomeIcon icon={faMoneyBillWave} />
          </span>
          <div>
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </article>

        <article className="premium-card vet-report-stat-card">
          <span>
            <FontAwesomeIcon icon={faChartLine} />
          </span>
          <div>
            <h3>{formatCurrency(stats.estimatedProfit)}</h3>
            <p>Estimated Profit</p>
          </div>
        </article>

        <article className="premium-card vet-report-stat-card">
          <span>
            <FontAwesomeIcon icon={faCalendarCheck} />
          </span>
          <div>
            <h3>{stats.totalCompleted}</h3>
            <p>Completed Appointments</p>
          </div>
        </article>

        <article className="premium-card vet-report-stat-card">
          <span>
            <FontAwesomeIcon icon={faStethoscope} />
          </span>
          <div>
            <h3>{stats.totalServices}</h3>
            <p>Services Tracked</p>
          </div>
        </article>
      </div>

      <div className="premium-card vet-financial-panel">
        <div className="vet-panel-header">
          <div>
            <h3>Financial Overview</h3>
            <p>{stats.period}</p>
          </div>

          <span className="vet-period-badge">
            <FontAwesomeIcon icon={faFileInvoice} />
            {stats.highestService}
          </span>
        </div>

        <div className="vet-financial-summary">
          <div>
            <small>Revenue</small>
            <strong>{formatCurrency(stats.totalRevenue)}</strong>
          </div>

          <div>
            <small>Estimated Profit</small>
            <strong>{formatCurrency(stats.estimatedProfit)}</strong>
          </div>

          <div>
            <small>Profit Basis</small>
            <strong>40%</strong>
          </div>
        </div>
      </div>

      <div className="app-grid-2 vet-report-chart-grid">
        <div className="premium-card vet-chart-panel">
          <div className="vet-panel-header">
            <div>
              <h3>Revenue by Service</h3>
              <p>Service income comparison</p>
            </div>
          </div>

          <div className="vet-chart-box">
            {serviceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={serviceChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#ff5f93" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="vet-chart-empty">
                <FontAwesomeIcon icon={faStethoscope} />
                <p>No revenue chart data yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="premium-card vet-chart-panel">
          <div className="vet-panel-header">
            <div>
              <h3>Appointments by Service</h3>
              <p>Completed service distribution</p>
            </div>
          </div>

          <div className="vet-chart-box">
            {serviceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={serviceChartData}
                    dataKey="appointments"
                    nameKey="name"
                    outerRadius={105}
                    label
                  >
                    {serviceChartData.map((entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="vet-chart-empty">
                <FontAwesomeIcon icon={faPaw} />
                <p>No appointment chart data yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="premium-card vet-services-panel">
        <div className="vet-panel-header">
          <div>
            <h3>Service Breakdown</h3>
            <p>Appointments, revenue, and revenue contribution per service.</p>
          </div>
        </div>

        {serviceTableRows.length === 0 ? (
          <div className="vet-empty-state">
            <FontAwesomeIcon icon={faStethoscope} />
            <h3>No service data available</h3>
            <p>Service breakdown will appear here when data is available.</p>
          </div>
        ) : (
          <div className="vet-services-grid">
            {serviceTableRows.map((service) => (
              <div key={service.name} className="premium-card vet-service-card">
                <div className="vet-service-header">
                  <span>
                    <FontAwesomeIcon icon={getServiceIcon(service.name)} />
                  </span>
                  <div>
                    <strong>{service.name}</strong>
                    <p>{service.percentage}% of revenue</p>
                  </div>
                </div>

                <div className="vet-service-stats">
                  <div>
                    <strong>{service.appointments}</strong>
                    <p>Appointments</p>
                  </div>

                  <div>
                    <strong>{formatCurrency(service.revenue)}</strong>
                    <p>Revenue</p>
                  </div>
                </div>

                <div className="vet-service-progress">
                  <span style={{ width: `${Math.min(service.percentage, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="premium-card vet-export-panel">
        <div className="vet-panel-header">
          <div>
            <h3>Export Reports</h3>
            <p>Download current analytics data for documentation or defense presentation.</p>
          </div>
        </div>

        <div className="vet-export-actions">
          <button className="btn-primary" onClick={handleExportPDF} type="button">
            <FontAwesomeIcon icon={faDownload} />
            Export PDF
          </button>

          <button className="btn-secondary" onClick={handleExportCSV} type="button">
            <FontAwesomeIcon icon={faDownload} />
            Export CSV
          </button>

          <button className="btn-secondary" onClick={handleExportJSON} type="button">
            <FontAwesomeIcon icon={faFileExport} />
            Export JSON
          </button>
        </div>
      </div>
    </section>
  );
};

const getServiceIcon = (serviceName) => {
  const value = String(serviceName || "").toLowerCase();

  if (value.includes("vacc")) return faSyringe;
  if (value.includes("surg")) return faHospital;
  if (value.includes("emerg")) return faHeartbeat;

  return faStethoscope;
};

export default VetReports;