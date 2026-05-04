import React, { useEffect, useMemo, useState } from "react";
import { inventoryApi } from "../../api/inventory";
import { exportToCSV, exportToPDF } from "../../utils/reportExport";
import "./MonthlyInventoryAudit.css";

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const MonthlyInventoryAudit = () => {
  const [month, setMonth] = useState(getCurrentMonth());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAuditItems = async () => {
    try {
      setLoading(true);
      const res = await inventoryApi.getMonthlyAudit(month);
      let allItems = res.items || [];
      
      // Filter out service items - only include physical inventory items
      const physicalItems = allItems.filter((item) => {
        const category = String(item.category || "").toLowerCase();
        const type = String(item.type || item.item_type || "").toLowerCase();

        return (
          category !== "services" &&
          category !== "service" &&
          type !== "service"
        );
      });
      
      setItems(physicalItems);
    } catch (err) {
      console.error("Failed to load monthly audit:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditItems();
  }, [month]);

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const next = {
          ...item,
          [field]: value,
        };

        const actual = Number(next.actual_stock || 0);
        const system = Number(next.system_stock || 0);

        next.variance = actual - system;
        next.audit_status = next.variance === 0 ? "matched" : "discrepancy";

        return next;
      })
    );
  };

  const stats = useMemo(() => {
    const checked = items.filter((item) => item.actual_stock !== "").length;
    const matched = items.filter((item) => item.audit_status === "matched").length;
    const discrepancy = items.filter((item) => item.audit_status === "discrepancy").length;
    const totalVariance = items.reduce((sum, item) => sum + Number(item.variance || 0), 0);

    return {
      total: items.length,
      checked,
      matched,
      discrepancy,
      totalVariance,
    };
  }, [items]);

  const handleSave = async () => {
    const checkedItems = items.filter((item) => item.actual_stock !== "");

    if (checkedItems.length === 0) {
      alert("Please enter actual stock for at least one item.");
      return;
    }

    const invalid = checkedItems.find(
      (item) => item.audit_status === "discrepancy" && !item.reason?.trim()
    );

    if (invalid) {
      alert(`Please add a reason for discrepancy: ${invalid.name}`);
      return;
    }

    try {
      setSaving(true);

      await inventoryApi.saveMonthlyAudit({
        audit_month: month,
        items: checkedItems.map((item) => ({
          inventory_item_id: item.id,
          actual_stock: Number(item.actual_stock),
          reason: item.reason || "",
        })),
      });

      alert("Monthly inventory audit saved successfully.");
      fetchAuditItems();
    } catch (err) {
      console.error("Failed to save monthly audit:", err);
      alert(err?.response?.data?.message || "Failed to save monthly audit.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    const checkedItems = items.filter((item) => item.actual_stock !== "");
    
    if (checkedItems.length === 0) {
      alert("No checked items to export.");
      return;
    }

    const columns = [
      { key: "name", label: "Product Name" },
      { key: "sku", label: "SKU" },
      { key: "category", label: "Category" },
      { key: "brand", label: "Brand" },
      { key: "system_stock", label: "System Stock" },
      { key: "actual_stock", label: "Actual Stock" },
      { key: "variance", label: "Variance" },
      { key: "audit_status", label: "Audit Status" },
      { key: "reason", label: "Reason" },
    ];

    const exportData = checkedItems.map(item => ({
      ...item,
      system_stock: Number(item.system_stock || 0),
      actual_stock: Number(item.actual_stock || 0),
      variance: Number(item.variance || 0),
    }));

    exportToCSV(exportData, columns, `monthly-audit-${month}`);
  };

  const handleExportPDF = () => {
    const checkedItems = items.filter((item) => item.actual_stock !== "");
    
    if (checkedItems.length === 0) {
      alert("No checked items to export.");
      return;
    }

    const columns = [
      { key: "name", label: "Product" },
      { key: "sku", label: "SKU" },
      { key: "category", label: "Category" },
      { key: "system_stock", label: "System Stock" },
      { key: "actual_stock", label: "Actual Stock" },
      { key: "variance", label: "Variance" },
      { key: "audit_status", label: "Status" },
      { key: "reason", label: "Reason" },
    ];

    const exportData = checkedItems.map(item => ({
      ...item,
      system_stock: Number(item.system_stock || 0),
      actual_stock: Number(item.actual_stock || 0),
      variance: Number(item.variance || 0),
    }));

    exportToPDF(exportData, columns, `Monthly Audit Report - ${month}`, `monthly-audit-${month}`);
  };

  return (
    <div className="monthly-audit-page">
      <div className="monthly-audit-hero">
        <div>
          <h2>Monthly Inventory Audit</h2>
          <p>Compare system stock with physical stock count and record discrepancies.</p>
        </div>

        <div className="audit-month-control">
          <label>Audit Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </div>

      <div className="audit-stats-grid">
        <div className="audit-stat-card">
          <span>Total Items</span>
          <strong>{stats.total}</strong>
        </div>

        <div className="audit-stat-card">
          <span>Checked</span>
          <strong>{stats.checked}</strong>
        </div>

        <div className="audit-stat-card good">
          <span>Matched</span>
          <strong>{stats.matched}</strong>
        </div>

        <div className="audit-stat-card warning">
          <span>Discrepancies</span>
          <strong>{stats.discrepancy}</strong>
        </div>

        <div className="audit-stat-card">
          <span>Total Variance</span>
          <strong>{stats.totalVariance}</strong>
        </div>
      </div>

      {loading ? (
        <div className="audit-loading-card">
          <div className="spinner"></div>
          <p>Loading monthly audit...</p>
        </div>
      ) : (
        <div className="audit-table-card">
          <div className="audit-table-header">
            <div>
              <h3>Stock Count Sheet</h3>
              <p>Enter the actual physical count for each item.</p>
            </div>

            <div className="audit-header-actions">
              <button onClick={handleExportCSV} className="btn-export-csv">
                📥 Export CSV
              </button>
              <button onClick={handleExportPDF} className="btn-export-pdf">
                📄 Export PDF
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-save-audit">
                {saving ? "Saving..." : "Save Monthly Audit"}
              </button>
            </div>
          </div>

          <div className="audit-table-scroll">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>System Stock</th>
                  <th>Actual Stock</th>
                  <th>Variance</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <small>{item.brand || "No brand"}</small>
                    </td>

                    <td>{item.sku || "N/A"}</td>
                    <td>{item.category || "N/A"}</td>
                    <td>{item.system_stock}</td>

                    <td>
                      <input
                        type="number"
                        min="0"
                        value={item.actual_stock}
                        onChange={(e) =>
                          updateItem(item.id, "actual_stock", e.target.value)
                        }
                        placeholder="Count"
                      />
                    </td>

                    <td className={Number(item.variance) < 0 ? "negative" : Number(item.variance) > 0 ? "positive" : ""}>
                      {item.actual_stock === "" ? "-" : item.variance}
                    </td>

                    <td>
                      <span className={`audit-status ${item.audit_status}`}>
                        {item.audit_status}
                      </span>
                    </td>

                    <td>
                      <input
                        type="text"
                        value={item.reason || ""}
                        onChange={(e) =>
                          updateItem(item.id, "reason", e.target.value)
                        }
                        placeholder={
                          item.audit_status === "discrepancy"
                            ? "Required reason"
                            : "Optional"
                        }
                      />
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td colSpan="8" className="audit-empty">
                      No inventory items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyInventoryAudit;
