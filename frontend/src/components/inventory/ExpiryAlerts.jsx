import React, { useEffect, useState } from "react";
import { inventoryApi } from "../../api/inventory";
import "./ExpiryAlerts.css";

const ExpiryAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await inventoryApi.getExpiryAlerts();
      setAlerts(res.alerts || res.data || []);
    } catch (err) {
      console.error("Failed to load expiry alerts:", err);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="expiry-alerts-card">
      <div className="expiry-alerts-header">
        <div>
          <h3>Expiry Alerts</h3>
          <p>Items expired or expiring within 30 days</p>
        </div>
        <button onClick={fetchAlerts}>Refresh</button>
      </div>

      {loading ? (
        <div className="expiry-empty">Loading expiry alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="expiry-empty">No expiry alerts found.</div>
      ) : (
        <div className="expiry-alerts-list">
          {alerts.map((alert) => (
            <div key={alert.batch_id} className={`expiry-alert-item ${alert.alert_level}`}>
              <div className="expiry-alert-icon">
                {alert.alert_level === "expired" ? "⛔" : alert.alert_level === "critical" ? "⚠️" : "⏳"}
              </div>

              <div className="expiry-alert-info">
                <strong>{alert.item_name}</strong>
                <span>{alert.item_sku} • Batch {alert.batch_no}</span>
                <small>
                  Qty: {alert.remaining_quantity} • Expiry:{" "}
                  {new Date(alert.expiration_date).toLocaleDateString()}
                </small>
              </div>

              <div className="expiry-alert-days">
                {alert.days_left <= 0 ? "Expired" : `${alert.days_left} days left`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpiryAlerts;
