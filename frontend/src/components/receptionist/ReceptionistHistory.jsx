import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCalendarAlt,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faSpinner,
  faExclamationTriangle,
  faDownload,
  faEye,
  faSort,
  faPaw,
  faHotel,
  faCut,
  faStethoscope,
  faClipboardCheck,
  faRefresh,
  faTimes,
  faUser,
  faMoneyBillWave,
  faClipboardList,
  faHistory,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { useTheme } from "../../utils/theme";
import "./ReceptionistHistory.css";

const HISTORY_TABS = [
  {
    id: "approvals",
    label: "Order Approvals",
    icon: faCheckCircle,
    endpoint: "/receptionist/orders/approval-history",
    keys: ["data", "approvals", "history", "orders"],
    emptyText: "Order approval history will appear here once records are available.",
  },
  {
    id: "services",
    label: "Service Approvals",
    icon: faClipboardCheck,
    endpoint: "/receptionist/requests/approval-history",
    keys: ["data", "approvals", "history", "requests"],
    emptyText: "Service approval history will appear here once records are available.",
  },
  {
    id: "scheduling",
    label: "Scheduling",
    icon: faCalendarAlt,
    endpoint: "/receptionist/scheduling/history",
    keys: ["data", "history", "schedules", "appointments"],
    emptyText: "Scheduling history will appear here once records are available.",
  },
  {
    id: "rejected",
    label: "Rejected",
    icon: faTimesCircle,
    endpoint: "/receptionist/requests/rejected-history",
    keys: ["data", "rejected", "history", "requests"],
    emptyText: "Rejected request history will appear here once records are available.",
  },
];

const INITIAL_HISTORY = {
  approvals: [],
  services: [],
  scheduling: [],
  rejected: [],
};

const normalizeList = (result, keys = []) => {
  if (Array.isArray(result)) return result;

  for (const key of keys) {
    if (Array.isArray(result?.[key])) return result[key];
    if (Array.isArray(result?.data?.[key])) return result.data[key];
    if (Array.isArray(result?.[key]?.data)) return result[key].data;
    if (Array.isArray(result?.data?.[key]?.data)) return result.data[key].data;
  }

  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.records)) return result.records;
  if (Array.isArray(result?.approvals)) return result.approvals;
  if (Array.isArray(result?.history)) return result.history;
  if (Array.isArray(result?.requests)) return result.requests;

  return [];
};

const normalizeStatus = (value) =>
  String(value || "recorded").toLowerCase().replace(/\s+/g, "_");

const formatLabel = (value) =>
  String(value || "N/A")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getRecordId = (record) =>
  record.id ||
  record.order_id ||
  record.request_id ||
  record.booking_id ||
  record.appointment_id ||
  "N/A";

const getCustomerName = (record) =>
  record.customer_name ||
  record.customer?.name ||
  record.customer ||
  record.client_name ||
  record.owner_name ||
  "N/A";

const getPetName = (record) =>
  record.pet_name || record.pet?.name || record.pet || record.petName || "";

const getServiceType = (record) =>
  record.service_type ||
  record.request_type ||
  record.type ||
  record.category ||
  record.service_name ||
  record.service?.name ||
  "General";

const getDateValue = (record) =>
  record.approved_at ||
  record.rejected_at ||
  record.scheduled_at ||
  record.completed_at ||
  record.updated_at ||
  record.created_at ||
  record.date ||
  "";

const getActionBy = (record) =>
  record.approved_by ||
  record.rejected_by ||
  record.scheduled_by ||
  record.created_by ||
  record.user_name ||
  record.receptionist_name ||
  "N/A";

const getAmount = (record) =>
  record.total_amount || record.amount || record.price || record.grand_total || "";

const getReason = (record) =>
  record.rejection_reason ||
  record.cancellation_reason ||
  record.reason ||
  record.remarks ||
  record.notes ||
  "";

const getStatusBadgeClass = (status) => {
  const normalized = normalizeStatus(status);

  if (["approved", "verified", "confirmed", "paid"].includes(normalized)) {
    return "approved";
  }

  if (["rejected", "cancelled", "canceled", "failed"].includes(normalized)) {
    return "rejected";
  }

  if (["completed", "done", "closed"].includes(normalized)) {
    return "completed";
  }

  if (["scheduled", "rescheduled"].includes(normalized)) {
    return "scheduled";
  }

  if (["in_progress", "processing", "ongoing"].includes(normalized)) {
    return "in-progress";
  }

  return "pending";
};

const getServiceIcon = (serviceType) => {
  const type = String(serviceType || "").toLowerCase();

  if (type.includes("hotel") || type.includes("boarding") || type.includes("board")) {
    return faHotel;
  }

  if (type.includes("groom")) {
    return faCut;
  }

  if (
    type.includes("vet") ||
    type.includes("medical") ||
    type.includes("consult") ||
    type.includes("vaccination")
  ) {
    return faStethoscope;
  }

  return faPaw;
};

const escapeCsvValue = (value) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

const ReceptionistHistory = () => {
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState("approvals");
  const [historyData, setHistoryData] = useState(INITIAL_HISTORY);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const activeConfig = useMemo(
    () => HISTORY_TABS.find((tab) => tab.id === activeTab) || HISTORY_TABS[0],
    [activeTab]
  );

  const fetchHistory = useCallback(
    async (tabId = activeTab, { silent = false } = {}) => {
      const config = HISTORY_TABS.find((tab) => tab.id === tabId);

      if (!config) return;

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await apiRequest(config.endpoint);
        const records = normalizeList(response, config.keys);

        setHistoryData((prev) => ({
          ...prev,
          [tabId]: records,
        }));

        setLastUpdated(new Date().toLocaleString("en-PH"));
      } catch (err) {
        console.error(`Failed to fetch ${tabId} history:`, err);

        setHistoryData((prev) => ({
          ...prev,
          [tabId]: [],
        }));

        setError(err.message || `Failed to load ${config.label.toLowerCase()} history.`);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    fetchHistory(activeTab);
  }, [activeTab, fetchHistory]);

  const activeRecords = historyData[activeTab] || [];

  const summary = useMemo(() => {
    const allRecords = Object.values(historyData).flat();

    return {
      total: allRecords.length,
      approvals: historyData.approvals.length,
      services: historyData.services.length,
      scheduling: historyData.scheduling.length,
      rejected: historyData.rejected.length,
    };
  }, [historyData]);

  const filteredData = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    const filtered = activeRecords.filter((record) => {
      const searchableFields = [
        getRecordId(record),
        record.order_id,
        record.request_id,
        getCustomerName(record),
        getPetName(record),
        getServiceType(record),
        record.status,
        getActionBy(record),
        getAmount(record),
        getReason(record),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !keyword || searchableFields.includes(keyword);
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "date_desc") {
        return new Date(getDateValue(b) || 0) - new Date(getDateValue(a) || 0);
      }

      if (sortBy === "date_asc") {
        return new Date(getDateValue(a) || 0) - new Date(getDateValue(b) || 0);
      }

      if (sortBy === "customer") {
        return getCustomerName(a).toLowerCase().localeCompare(
          getCustomerName(b).toLowerCase()
        );
      }

      if (sortBy === "status") {
        return normalizeStatus(a.status).localeCompare(normalizeStatus(b.status));
      }

      return 0;
    });
  }, [activeRecords, searchTerm, sortBy]);

  const handleRefresh = () => {
    fetchHistory(activeTab, { silent: true });
  };

  const handleExport = () => {
    if (filteredData.length === 0) {
      setError("No records available to export.");
      return;
    }

    const headers = [
      "Record ID",
      "Tab",
      "Customer",
      "Pet",
      "Service Type",
      "Status",
      "Amount",
      "Action By",
      "Date",
      "Time",
      "Reason or Remarks",
    ];

    const rows = filteredData.map((record) => {
      const dateValue = getDateValue(record);

      return [
        getRecordId(record),
        activeConfig.label,
        getCustomerName(record),
        getPetName(record) || "N/A",
        getServiceType(record),
        formatLabel(record.status || "recorded"),
        getAmount(record) ? formatCurrency(getAmount(record)) : "N/A",
        getActionBy(record),
        formatDate(dateValue),
        formatTime(dateValue) || "N/A",
        getReason(record) || "N/A",
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `receptionist-${activeTab}-history-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className={`receptionist-history ${theme || ""}`}>
        <div className="rh-loading-state">
          <FontAwesomeIcon icon={faSpinner} spin />
          <h3>Loading history...</h3>
          <p>Please wait while receptionist history records are loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`receptionist-history ${theme || ""}`}>
      {error && (
        <div className="rh-toast error">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}

      <section className="rh-hero">
        <div>
          <span className="rh-eyebrow">
            <FontAwesomeIcon icon={faHistory} />
            Receptionist Activity History
          </span>

          <h1>Receptionist History</h1>

          <p>
            Track order approvals, service request approvals, scheduling updates,
            and rejected requests handled by the receptionist.
          </p>

          <small>Last updated: {lastUpdated || "Not refreshed yet"}</small>
        </div>

        <div className="rh-hero-actions">
          <button
            type="button"
            className={`rh-secondary-btn ${refreshing ? "loading" : ""}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FontAwesomeIcon icon={refreshing ? faSpinner : faRefresh} spin={refreshing} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button type="button" className="rh-secondary-btn" onClick={handleExport}>
            <FontAwesomeIcon icon={faDownload} />
            Export CSV
          </button>
        </div>
      </section>

      <section className="rh-summary-grid">
        <button type="button" className="rh-summary-card" onClick={() => setActiveTab("approvals")}>
          <span>
            <FontAwesomeIcon icon={faCheckCircle} />
          </span>
          <div>
            <strong>{summary.approvals}</strong>
            <p>Order Approvals</p>
          </div>
        </button>

        <button type="button" className="rh-summary-card services" onClick={() => setActiveTab("services")}>
          <span>
            <FontAwesomeIcon icon={faClipboardCheck} />
          </span>
          <div>
            <strong>{summary.services}</strong>
            <p>Service Approvals</p>
          </div>
        </button>

        <button type="button" className="rh-summary-card scheduling" onClick={() => setActiveTab("scheduling")}>
          <span>
            <FontAwesomeIcon icon={faCalendarAlt} />
          </span>
          <div>
            <strong>{summary.scheduling}</strong>
            <p>Scheduling Records</p>
          </div>
        </button>

        <button type="button" className="rh-summary-card rejected" onClick={() => setActiveTab("rejected")}>
          <span>
            <FontAwesomeIcon icon={faTimesCircle} />
          </span>
          <div>
            <strong>{summary.rejected}</strong>
            <p>Rejected Requests</p>
          </div>
        </button>
      </section>

      <section className="rh-tabs">
        {HISTORY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchTerm("");
              setSelectedRecord(null);
            }}
          >
            <FontAwesomeIcon icon={tab.icon} />
            {tab.label}
          </button>
        ))}
      </section>

      <section className="rh-toolbar">
        <div className="rh-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder={`Search ${activeConfig.label.toLowerCase()}...`}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          {searchTerm && (
            <button type="button" onClick={clearSearch}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        <label className="rh-sort-box">
          <FontAwesomeIcon icon={faSort} />
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="customer">Customer Name</option>
            <option value="status">Status</option>
          </select>
        </label>

        <div className="rh-result-count">
          Showing <strong>{filteredData.length}</strong> of{" "}
          <strong>{activeRecords.length}</strong> record(s)
        </div>
      </section>

      <section className="rh-content-card">
        <div className="rh-content-header">
          <div>
            <span className="rh-eyebrow">
              <FontAwesomeIcon icon={activeConfig.icon} />
              {activeConfig.label}
            </span>

            <h2>{activeConfig.label} History</h2>

            <p>{activeConfig.emptyText}</p>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="rh-empty-state">
            <FontAwesomeIcon icon={faClipboardCheck} />
            <h3>No history found</h3>
            <p>
              {searchTerm
                ? "Try adjusting your search term or clear the search filter."
                : activeConfig.emptyText}
            </p>
          </div>
        ) : (
          <div className="rh-history-list">
            {filteredData.map((record, index) => {
              const recordDate = getDateValue(record);
              const serviceType = getServiceType(record);
              const status = normalizeStatus(record.status || activeTab);
              const amount = getAmount(record);
              const reason = getReason(record);

              return (
                <article
                  key={`${activeTab}-${getRecordId(record)}-${index}`}
                  className="rh-history-card"
                >
                  <div className="rh-card-main">
                    <div className="rh-card-top">
                      <span className="rh-record-id">#{getRecordId(record)}</span>
                      <span className={`rh-status-badge ${getStatusBadgeClass(status)}`}>
                        {formatLabel(status)}
                      </span>
                    </div>

                    <div className="rh-record-title-row">
                      <div className="rh-record-icon">
                        <FontAwesomeIcon icon={getServiceIcon(serviceType)} />
                      </div>

                      <div>
                        <h3>{serviceType}</h3>
                        <p>
                          {formatDate(recordDate)}{" "}
                          {formatTime(recordDate) ? `at ${formatTime(recordDate)}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="rh-detail-grid">
                      <DetailItem
                        icon={faUser}
                        label="Customer"
                        value={getCustomerName(record)}
                      />

                      <DetailItem
                        icon={faPaw}
                        label="Pet"
                        value={getPetName(record) || "N/A"}
                      />

                      <DetailItem
                        icon={faClipboardList}
                        label="Action By"
                        value={getActionBy(record)}
                      />

                      <DetailItem
                        icon={faMoneyBillWave}
                        label="Amount"
                        value={amount ? formatCurrency(amount) : "N/A"}
                      />
                    </div>

                    {reason && (
                      <div className="rh-note-box">
                        <strong>Reason / Remarks</strong>
                        <p>{reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="rh-card-actions">
                    <button
                      type="button"
                      className="rh-view-btn"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                      View Details
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selectedRecord && (
        <div className="rh-modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="rh-modal" onClick={(event) => event.stopPropagation()}>
            <div className="rh-modal-header">
              <div>
                <span className="rh-eyebrow">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  History Record Details
                </span>

                <h2>Record #{getRecordId(selectedRecord)}</h2>
              </div>

              <button
                type="button"
                className="rh-close-btn"
                onClick={() => setSelectedRecord(null)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="rh-modal-body">
              <div className="rh-modal-grid">
                <ModalItem label="Record ID" value={getRecordId(selectedRecord)} />
                <ModalItem label="Customer" value={getCustomerName(selectedRecord)} />
                <ModalItem label="Pet" value={getPetName(selectedRecord) || "N/A"} />
                <ModalItem label="Service Type" value={getServiceType(selectedRecord)} />
                <ModalItem
                  label="Status"
                  value={formatLabel(selectedRecord.status || activeTab)}
                />
                <ModalItem
                  label="Amount"
                  value={getAmount(selectedRecord) ? formatCurrency(getAmount(selectedRecord)) : "N/A"}
                />
                <ModalItem label="Action By" value={getActionBy(selectedRecord)} />
                <ModalItem label="Date" value={formatDate(getDateValue(selectedRecord))} />
                <ModalItem label="Time" value={formatTime(getDateValue(selectedRecord)) || "N/A"} />
                <ModalItem
                  label="Reason / Remarks"
                  value={getReason(selectedRecord) || "N/A"}
                  wide
                />
              </div>

              <details className="rh-raw-details">
                <summary>Show raw record data</summary>
                <pre>{JSON.stringify(selectedRecord, null, 2)}</pre>
              </details>
            </div>

            <div className="rh-modal-actions">
              <button
                type="button"
                className="rh-secondary-btn"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <div className="rh-detail-item">
    <span>
      <FontAwesomeIcon icon={icon} />
    </span>

    <div>
      <small>{label}</small>
      <strong>{value || "N/A"}</strong>
    </div>
  </div>
);

const ModalItem = ({ label, value, wide = false }) => (
  <div className={`rh-modal-item ${wide ? "wide" : ""}`}>
    <small>{label}</small>
    <strong>{value || "N/A"}</strong>
  </div>
);

export default ReceptionistHistory;