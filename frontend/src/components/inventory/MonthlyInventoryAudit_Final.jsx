import React, { useState, useEffect } from "react";
import { inventoryApi } from "../../api/inventory";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import "./MonthlyInventoryAudit.css";

const MonthlyInventoryAudit = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [auditItems, setAuditItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real audit items from backend
  useEffect(() => {
    const fetchAudit = async () => {
      setLoading(true);
      try {
        console.log("🔍 Fetching audit items for month:", month);
        const res = await inventoryApi.getMonthlyAudit(month);
        console.log("🔍 API Response:", res);
        
        if (res && res.audits && Array.isArray(res.audits)) {
          setAuditItems(res.audits);
          console.log("🔍 Loaded", res.audits.length, "audit items");
        } else {
          console.warn("🔍 Unexpected API response structure:", res);
          setAuditItems([]);
        }
      } catch (err) {
        console.error("🔍 Failed to fetch audit:", err);
        setAuditItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, [month]);

  // Handle input changes for Actual Stock and Reason
  const handleInputChange = (id, field, value) => {
    // Validate negative stock
    if (field === "actual_stock" && Number(value) < 0) {
      alert("Actual stock cannot be negative!");
      return;
    }

    setAuditItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          
          // Calculate variance and status in real-time
          if (field === "actual_stock") {
            const actual = Number(value || 0);
            const system = Number(item.system_stock || 0);
            updated.variance = actual - system;
            updated.status = updated.variance === 0 ? "matched" : "discrepancy";
          }
          
          return updated;
        }
        return item;
      })
    );
  };

  // Save audit data to backend
  const handleSave = async () => {
    const checkedItems = auditItems.filter(item => item.actual_stock !== null && item.actual_stock !== "");
    
    if (checkedItems.length === 0) {
      alert("Please enter actual stock for at least one item.");
      return;
    }

    // Validate discrepancies have reasons
    const invalid = checkedItems.find(
      item => item.status === "discrepancy" && (!item.reason || item.reason.trim() === "")
    );

    if (invalid) {
      alert(`Please add a reason for discrepancy: ${invalid.item?.name || 'Unknown item'}`);
      return;
    }

    try {
      console.log("🔍 Saving audit data...");
      await inventoryApi.saveMonthlyAudit({
        audit_month: month,
        items: checkedItems.map(item => ({
          id: item.id,
          inventory_item_id: item.inventory_item_id,
          actual_stock: Number(item.actual_stock),
          variance: item.variance,
          status: item.status,
          reason: item.reason || "",
        })),
      });
      
      alert("Monthly audit saved successfully!");
      console.log("🔍 Audit saved successfully");
    } catch (err) {
      console.error("🔍 Failed to save audit:", err);
      alert("Failed to save monthly audit. Please try again.");
    }
  };

  // CSV Export
  const exportCSV = () => {
    const checkedItems = auditItems.filter(item => item.actual_stock !== null && item.actual_stock !== "");
    
    if (checkedItems.length === 0) {
      alert("No checked items to export.");
      return;
    }

    const csvData = checkedItems.map(item => ({
      "Product Name": item.item?.name || "Unknown",
      "SKU": item.item?.sku || "N/A",
      "Category": item.item?.category || "N/A",
      "Brand": item.item?.brand || "N/A",
      "System Stock": Number(item.system_stock || 0),
      "Actual Stock": Number(item.actual_stock || 0),
      "Variance": Number(item.variance || 0),
      "Status": item.status,
      "Reason": item.reason || ""
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `monthly_audit_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // PDF Export
  const exportPDF = () => {
    const checkedItems = auditItems.filter(item => item.actual_stock !== null && item.actual_stock !== "");
    
    if (checkedItems.length === 0) {
      alert("No checked items to export.");
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Monthly Inventory Audit Report", 14, 22);
    
    // Add month info
    doc.setFontSize(12);
    doc.text(`Audit Month: ${month}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 40);
    
    // Add summary stats
    const checked = checkedItems.length;
    const matched = checkedItems.filter(item => item.status === "matched").length;
    const discrepancy = checkedItems.filter(item => item.status === "discrepancy").length;
    const totalVariance = checkedItems.reduce((sum, item) => sum + Number(item.variance || 0), 0);
    
    doc.text(`Total Items: ${checked}`, 14, 50);
    doc.text(`Matched: ${matched}`, 14, 58);
    doc.text(`Discrepancies: ${discrepancy}`, 14, 66);
    doc.text(`Total Variance: ${totalVariance}`, 14, 74);
    
    // Prepare table data
    const tableData = checkedItems.map(item => [
      item.item?.name || "Unknown",
      item.item?.sku || "N/A",
      item.item?.category || "N/A",
      item.system_stock,
      item.actual_stock || 0,
      item.variance,
      item.status,
      item.reason || ""
    ]);

    // Add table
    doc.autoTable({
      head: [["Product", "SKU", "Category", "System Stock", "Actual Stock", "Variance", "Status", "Reason"]],
      body: tableData,
      startY: 85,
      styles: { 
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [255, 95, 147],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Product
        1: { cellWidth: 20 }, // SKU
        2: { cellWidth: 25 }, // Category
        3: { cellWidth: 25, halign: 'center' }, // System Stock
        4: { cellWidth: 25, halign: 'center' }, // Actual Stock
        5: { cellWidth: 20, halign: 'center' }, // Variance
        6: { cellWidth: 20, halign: 'center' }, // Status
        7: { cellWidth: 35 }, // Reason
      }
    });

    doc.save(`monthly_audit_${month}.pdf`);
  };

  // Excel Export
  const exportExcel = () => {
    const checkedItems = auditItems.filter(item => item.actual_stock !== null && item.actual_stock !== "");
    
    if (checkedItems.length === 0) {
      alert("No checked items to export.");
      return;
    }

    const wsData = checkedItems.map(item => ({
      "Product Name": item.item?.name || "Unknown",
      "SKU": item.item?.sku || "N/A",
      "Category": item.item?.category || "N/A",
      "Brand": item.item?.brand || "N/A",
      "System Stock": Number(item.system_stock || 0),
      "Actual Stock": Number(item.actual_stock || 0),
      "Variance": Number(item.variance || 0),
      "Status": item.status,
      "Reason": item.reason || ""
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Audit");
    XLSX.writeFile(wb, `monthly_audit_${month}.xlsx`);
  };

  // Calculate statistics
  const stats = {
    total: auditItems.length,
    checked: auditItems.filter(item => item.actual_stock !== null && item.actual_stock !== "").length,
    matched: auditItems.filter(item => item.status === "matched").length,
    discrepancy: auditItems.filter(item => item.status === "discrepancy").length,
    totalVariance: auditItems.reduce((sum, item) => sum + Number(item.variance || 0), 0)
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

      {/* Debug Info */}
      <div style={{background: '#f0f0f0', padding: '10px', margin: '10px 0', borderRadius: '5px', fontSize: '12px'}}>
        <strong>🔍 DEBUG INFO:</strong><br/>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px'}}>
          <div>
            <strong>Loading:</strong> {loading ? 'YES' : 'NO'}<br/>
            <strong>Items Count:</strong> {auditItems.length}<br/>
            <strong>Month:</strong> {month}<br/>
            <strong>API Endpoint:</strong> /inventory/monthly-audit?month={month}
          </div>
          <div>
            <strong>First Item:</strong> {auditItems.length > 0 ? auditItems[0]?.item?.name || 'No name' : 'No items'}<br/>
            <strong>Checked Items:</strong> {stats.checked}<br/>
            <strong>Matched Items:</strong> {stats.matched}<br/>
            <strong>Discrepancies:</strong> {stats.discrepancy}
          </div>
        </div>
        
        {auditItems.length === 0 && (
          <div style={{marginTop: '10px', padding: '10px', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '3px'}}>
            <strong>⚠️ NO ITEMS FOUND</strong><br/>
            Check: 1) Backend API is implemented, 2) Database has inventory items, 3) API returns correct structure
          </div>
        )}
      </div>

      {/* Summary Statistics */}
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
          <p>Loading audit items...</p>
        </div>
      ) : (
        <div className="audit-table-card">
          <div className="audit-table-header">
            <div>
              <h3>Stock Count Sheet</h3>
              <p>Enter the actual physical count for each item.</p>
            </div>

            <div className="audit-header-actions">
              <button onClick={exportCSV} className="btn-export-csv">
                📥 Export CSV
              </button>
              <button onClick={exportPDF} className="btn-export-pdf">
                📄 Export PDF
              </button>
              <button onClick={exportExcel} className="btn-export-excel">
                📊 Export Excel
              </button>
              <button onClick={handleSave} className="btn-save-audit">
                Save Monthly Audit
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
                {auditItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                      No inventory items found. Please ensure your backend API is implemented and returning audit rows.
                    </td>
                  </tr>
                ) : (
                  auditItems.map((row) => {
                    const variance = Number(row.variance || 0);
                    const status = row.status || (row.actual_stock === null ? "pending" : (variance === 0 ? "matched" : "discrepancy"));
                    
                    return (
                      <tr key={row.id}>
                        <td>
                          <strong>{row.item?.name || "Unknown"}</strong>
                          <small>{row.item?.brand || "No brand"}</small>
                        </td>

                        <td>{row.item?.sku || "N/A"}</td>
                        <td>{row.item?.category || "N/A"}</td>
                        <td>{row.system_stock}</td>

                        <td>
                          <input
                            type="number"
                            min="0"
                            value={row.actual_stock || ""}
                            onChange={(e) =>
                              handleInputChange(row.id, "actual_stock", e.target.value)
                            }
                            placeholder="Count"
                            className="audit-input"
                          />
                        </td>

                        <td 
                          style={{
                            backgroundColor: variance === 0 ? "#d4f7dc" : "#ffe6e6",
                            color: variance === 0 ? "#059669" : "#dc2626",
                            fontWeight: "bold",
                            textAlign: "center",
                            padding: "8px",
                            borderRadius: "4px"
                          }}
                        >
                          {variance}
                        </td>

                        <td>
                          <span 
                            className={`audit-status ${
                              status === "matched" ? "matched" : 
                              status === "discrepancy" ? "discrepancy" : 
                              "pending"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td>
                          <input
                            type="text"
                            value={row.reason || ""}
                            onChange={(e) =>
                              handleInputChange(row.id, "reason", e.target.value)
                            }
                            placeholder={
                              status === "discrepancy" ? "Enter reason..." : "Optional"
                            }
                            className="audit-input"
                          />
                        </td>
                      </tr>
                    );
                  })
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
