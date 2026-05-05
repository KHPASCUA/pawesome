import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStethoscope } from "@fortawesome/free-solid-svg-icons";
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
  LineChart,
  Line,
} from "recharts";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import StandardReportLayout from "../shared/StandardReportLayout";
import StandardSummaryCards from "../shared/StandardSummaryCards";
import StandardTable from "../shared/StandardTable";
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

const CHART_COLORS = ["#ff5f93", "#ff8db5", "#ffc8dd", "#f59e0b", "#10b981", "#3b82f6"];

const VetReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");

  const safeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.service_breakdown)) return value.service_breakdown;
    if (Array.isArray(value?.services)) return value.services;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.records)) return value.records;
    return [];
  };

  const normalizeReportData = (data) => {
    const reportData = Array.isArray(data) ? data[0] : data?.data || data || {};
    const summary = reportData.summary || {};

    return {
      monthly_revenue:
        Number(
          reportData.monthly_revenue ||
            summary.total_revenue ||
            reportData.total_revenue ||
            reportData.revenue ||
            0
        ) || 0,
      monthly_completed:
        Number(
          reportData.monthly_completed ||
            summary.completed_appointments ||
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

  useEffect(() => {
    const { startDate: defaultStart, endDate: defaultEnd } = getDateRangePreset("month");
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  }, []);

  useEffect(() => {
    fetchVetReports();
  }, []);

  const fetchVetReports = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await apiRequest("/veterinary/reports");
      const data = normalizeReportData(result);

      setReports(data);
    } catch (err) {
      console.error("Failed to fetch veterinary reports:", err);
      setError("Failed to load live veterinary report data.");
      setReports({
        monthly_revenue: 0,
        monthly_completed: 0,
        period: "Current Month",
        service_breakdown: [],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVetReports();
  };

  const handleDateChange = (key, value) => {
    if (key === "startDate") setStartDate(value);
    if (key === "endDate") setEndDate(value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setServiceTypeFilter("all");

    const { startDate: defaultStart, endDate: defaultEnd } = getDateRangePreset("month");
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  };

  const exportColumns = [
    { key: "service.name", label: "Service Name" },
    { key: "count", label: "Appointments" },
    { key: "revenue", label: "Revenue", format: "currency" },
    { key: "average_revenue", label: "Average Revenue", format: "currency" },
  ];

  const handleExportCSV = () => {
    const exportData = reports?.service_breakdown?.map(item => ({
      ...item,
      average_revenue: item.count > 0 ? item.revenue / item.count : 0,
    })) || [];
    exportToCSV(exportData, exportColumns, "veterinary-reports");
  };

  const handleExportPDF = () => {
    const exportData = reports?.service_breakdown?.map(item => ({
      ...item,
      average_revenue: item.count > 0 ? item.revenue / item.count : 0,
    })) || [];
    exportToPDF(exportData, exportColumns, "Veterinary Reports", "veterinary-reports");
  };

  const handleExportExcel = () => {
    const exportData = reports?.service_breakdown?.map(item => ({
      ...item,
      average_revenue: item.count > 0 ? item.revenue / item.count : 0,
    })) || [];
    exportToExcel(exportData, exportColumns, "veterinary-reports");
  };

  // Prepare summary cards data
  const summaryCards = [
    {
      id: "monthly-revenue",
      label: "Monthly Revenue",
      value: formatCurrency(reports?.monthly_revenue || 0),
      icon: "faMoneyBillWave",
      color: "primary",
      trend: "up",
      change: "+15.3%"
    },
    {
      id: "monthly-completed",
      label: "Completed Appointments",
      value: reports?.monthly_completed || 0,
      icon: "faCalendarCheck",
      color: "success",
      trend: "up",
      change: "+8.7%"
    },
    {
      id: "total-services",
      label: "Total Services",
      value: reports?.service_breakdown?.length || 0,
      icon: "faStethoscope",
      color: "secondary",
      trend: "neutral",
      change: "0%"
    },
    {
      id: "average-revenue",
      label: "Average Revenue per Service",
      value: formatCurrency(
        reports?.service_breakdown?.length > 0 
          ? reports.monthly_revenue / reports.service_breakdown.length 
          : 0
      ),
      icon: "faChartLine",
      color: "warning",
      trend: "up",
      change: "+5.2%"
    }
  ];

  // Prepare table columns
  const tableColumns = [
    { key: "service.name", label: "Service Name", sortable: true },
    { key: "count", label: "Appointments", sortable: true },
    { key: "revenue", label: "Revenue", format: "currency", sortable: true },
    { key: "average_revenue", label: "Average Revenue", format: "currency", sortable: true },
  ];

  // Filter and prepare data
  const filteredServices = useMemo(() => {
    if (!reports?.service_breakdown) return [];

    let filtered = [...reports.service_breakdown];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        item.service.name?.toLowerCase().includes(search)
      );
    }

    if (serviceTypeFilter !== "all") {
      filtered = filtered.filter((item) =>
        item.service.name?.toLowerCase().includes(serviceTypeFilter.toLowerCase())
      );
    }

    return filtered.map(item => ({
      ...item,
      average_revenue: item.count > 0 ? item.revenue / item.count : 0,
    }));
  }, [reports, searchTerm, serviceTypeFilter]);

  // Chart data preparation
  const serviceRevenueData = useMemo(() => {
    return filteredServices.map(item => ({
      name: item.service.name,
      revenue: item.revenue,
      count: item.count,
    }));
  }, [filteredServices]);

  const renderVeterinaryContent = () => (
    <div className="veterinary-reports-content">
      <StandardSummaryCards cards={summaryCards} />
      
      <div className="charts-section">
        <div className="chart-container full-width">
          <h3 className="section-title">Service Revenue Breakdown</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={serviceRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="revenue" fill="#ff5f93" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="data-table-section">
        <h3 className="section-title">Service Performance</h3>
        <StandardTable
          columns={tableColumns}
          data={filteredServices}
          emptyMessage="No veterinary services found"
        />
      </div>
    </div>
  );

  const filterProps = {
    searchTerm,
    onSearchChange: setSearchTerm,
    startDate,
    endDate,
    onDateChange: handleDateChange,
    statusFilter,
    onStatusChange: setStatusFilter,
    statusOptions: [
      { value: "completed", label: "Completed" },
      { value: "scheduled", label: "Scheduled" },
      { value: "cancelled", label: "Cancelled" },
    ],
    serviceTypeFilter,
    onServiceTypeChange: setServiceTypeFilter,
    serviceTypeOptions: [
      { value: "all", label: "All Services" },
      ...(reports?.service_breakdown?.map(item => ({
        value: item.service.name,
        label: item.service.name
      })) || [])
    ],
    showServiceType: true,
    onExportCSV: handleExportCSV,
    onExportPDF: handleExportPDF,
    onExportExcel: handleExportExcel,
    loading,
    onRefresh: handleRefresh,
    onClearFilters: handleClearFilters,
    searchPlaceholder: "Search veterinary services...",
  };

  return (
    <StandardReportLayout
      title="Veterinary Reports"
      subtitle="Service performance, appointment analytics, and revenue tracking"
      icon={faStethoscope}
      loading={loading}
      error={error}
      onRefresh={handleRefresh}
      lastUpdated={new Date().toLocaleTimeString()}
      filterProps={filterProps}
    >
      <div className="reports-content">
        {renderVeterinaryContent()}
      </div>
    </StandardReportLayout>
  );
};

export default VetReports;
