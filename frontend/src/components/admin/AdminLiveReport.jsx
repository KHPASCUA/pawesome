import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faReceipt,
  faClipboardList,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import StandardReportLayout from "../shared/StandardReportLayout";
import StandardSummaryCards from "../shared/StandardSummaryCards";
import StandardTable from "../shared/StandardTable";
import { exportToCSV, exportToPDF, getDateRangePreset } from "../../utils/reportExport";
import { useRealTimeSync } from "../../hooks/useRealTimeSync";
import "./AdminReports.css";

const icons = {
  payments: faReceipt,
  orders: faShoppingCart,
  services: faClipboardList,
  logistics: faTruck,
};

const AdminLiveReport = ({
  title,
  subtitle,
  endpoint,
  dataKey,
  summaryBuilder,
  columns,
  exportName,
  icon = "orders",
  statusOptions = [],
  searchPlaceholder = "Search report...",
}) => {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    const preset = getDateRangePreset("month");
    setStartDate(preset.startDate);
    setEndDate(preset.endDate);
  }, []);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (startDate) params.append("from", startDate);
    if (endDate) params.append("to", endDate);
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (searchTerm) params.append("search", searchTerm);
    return params.toString();
  }, [startDate, endDate, statusFilter, searchTerm]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiRequest(`${endpoint}?${buildQuery()}`);
      const data = response?.data || response || {};
      setRows(Array.isArray(data[dataKey]) ? data[dataKey] : []);
      setSummary(data.summary || {});
    } catch (err) {
      setError(err.message || `Failed to load ${title.toLowerCase()}.`);
      setRows([]);
      setSummary({});
    } finally {
      setLoading(false);
    }
  }, [endpoint, dataKey, title, buildQuery]);

  // Use real-time sync hook for automatic polling every 30 seconds
  useRealTimeSync(fetchData, [
    startDate, 
    endDate, 
    statusFilter, 
    searchTerm
  ], 30000);

  const filteredRows = useMemo(() => rows, [rows]);

  const cards = summaryBuilder(summary).map((card) => ({
    ...card,
    value: card.currency ? formatCurrency(card.value || 0) : card.value || 0,
  }));

  const handleDateChange = (key, value) => {
    if (key === "startDate") setStartDate(value);
    if (key === "endDate") setEndDate(value);
  };

  const clearFilters = () => {
    const preset = getDateRangePreset("month");
    setSearchTerm("");
    setStatusFilter("all");
    setStartDate(preset.startDate);
    setEndDate(preset.endDate);
  };

  const exportColumns = columns.filter((column) => column.key !== "actions");

  return (
    <StandardReportLayout
      title={title}
      subtitle={subtitle}
      icon={icons[icon]}
      loading={loading}
      error={error}
      onRefresh={fetchData}
      lastUpdated={new Date().toLocaleTimeString()}
      filterProps={{
        searchTerm,
        onSearchChange: setSearchTerm,
        startDate,
        endDate,
        onDateChange: handleDateChange,
        statusFilter,
        onStatusChange: setStatusFilter,
        statusOptions,
        onExportCSV: () => exportToCSV(filteredRows, exportColumns, exportName),
        onExportPDF: () => exportToPDF(filteredRows, exportColumns, title, exportName),
        loading,
        onRefresh: fetchData,
        onClearFilters: clearFilters,
        searchPlaceholder,
      }}
    >
      <div className="reports-content">
        <StandardSummaryCards cards={cards} />
        <div className="data-table-section">
          <h3 className="section-title">{title} Details</h3>
          <StandardTable
            columns={[
              ...columns,
              {
                key: "actions",
                label: "Details",
                render: (_, row) => (
                  <button className="action-btn" type="button" onClick={() => setSelectedRow(row)}>
                    <FontAwesomeIcon icon={faClipboardList} />
                  </button>
                ),
              },
            ]}
            data={filteredRows}
            emptyMessage={`No ${title.toLowerCase()} found`}
          />
        </div>

        {selectedRow && (
          <div className="modal-overlay" onClick={() => setSelectedRow(null)}>
            <div className="modal-content" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h2>{title} Detail</h2>
                <button className="modal-close" type="button" onClick={() => setSelectedRow(null)}>
                  x
                </button>
              </div>
              <div className="modal-body">
                <div className="info-grid">
                  {Object.entries(selectedRow).map(([key, value]) => (
                    <div className="info-item" key={key}>
                      <label>{key.replace(/_/g, " ")}</label>
                      <span>{value === null || value === undefined ? "N/A" : String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="action-btn refresh-btn" type="button" onClick={() => setSelectedRow(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StandardReportLayout>
  );
};

export default AdminLiveReport;
