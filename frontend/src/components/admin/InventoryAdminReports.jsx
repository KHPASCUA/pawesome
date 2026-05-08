import React from "react";
import AdminLiveReport from "./AdminLiveReport";

const InventoryAdminReports = () => (
  <AdminLiveReport
    title="Inventory Monitoring Reports"
    subtitle="Read-only stock levels, low-stock alerts, valuation, and movement logs."
    endpoint="/admin/reports/inventory"
    dataKey="items"
    exportName="admin-inventory-monitoring-reports"
    icon="inventory"
    searchPlaceholder="Search inventory items, SKUs, categories, or stock status..."
    statusOptions={[
      { value: "in_stock", label: "In Stock" },
      { value: "low_stock", label: "Low Stock" },
      { value: "out_of_stock", label: "Out of Stock" },
      { value: "critical", label: "Critical" },
    ]}
    summaryBuilder={(summary) => [
      {
        id: "total-items",
        label: "Total Items",
        value: summary.total_items,
        icon: "faBoxes",
        color: "primary",
      },
      {
        id: "low-stock",
        label: "Low Stock",
        value: summary.low_stock_items,
        icon: "faExclamationTriangle",
        color: "warning",
      },
      {
        id: "out-stock",
        label: "Out of Stock",
        value: summary.out_of_stock_items,
        icon: "faTimesCircle",
        color: "danger",
      },
      {
        id: "stock-value",
        label: "Inventory Value",
        value: summary.stock_value,
        currency: true,
        icon: "faChartLine",
        color: "success",
      },
      {
        id: "adjustments",
        label: "Manual Adjustments",
        value: summary.manual_adjustments,
        icon: "faClipboardList",
        color: "secondary",
      },
    ]}
    columns={[
      { key: "id", label: "Item ID", sortable: true },
      { key: "name", label: "Item", sortable: true },
      { key: "sku", label: "SKU", sortable: true },
      { key: "category", label: "Category", sortable: true },
      { key: "stock", label: "Stock", sortable: true },
      { key: "reorder_level", label: "Reorder Level", sortable: true },
      { key: "price", label: "Price", format: "currency", sortable: true },
      { key: "updated_at", label: "Updated", format: "datetime", sortable: true },
    ]}
  />
);

export default InventoryAdminReports;
