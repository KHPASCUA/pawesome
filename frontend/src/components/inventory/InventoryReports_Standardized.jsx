import React, { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox } from "@fortawesome/free-solid-svg-icons";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { inventoryApi } from "../../api/inventory";
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
import "./InventoryReports.css";

const CHART_COLORS = ["#ff5f93", "#ff8db5", "#ffc8dd", "#f59e0b", "#10b981", "#3b82f6"];

const InventoryReports = () => {
  const [loading, setLoading] = useState(true);
  const [apiItems, setApiItems] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const itemsResponse = await inventoryApi.getItems();
        const items = itemsResponse.items || itemsResponse.data || [];

        setApiItems(items);
      } catch (err) {
        console.error("Failed to fetch live inventory report data:", err);
        setApiItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter out service items from inventory data
  const inventoryItems = useMemo(() => {
    return apiItems.filter((item) => {
      const category = String(item.category || "").toLowerCase();
      const type = String(item.type || item.item_type || "").toLowerCase();

      return (
        category !== "services" &&
        category !== "service" &&
        type !== "service"
      );
    });
  }, [apiItems]);

  // Helper functions
  const getQuantity = (item) => Number(item.quantity ?? item.stock ?? 0);
  const getPrice = (item) => Number(item.price ?? item.unit_price ?? 0);

  const getItemStatus = (item) => {
    const quantity = getQuantity(item);
    const minimum = Number(item.minimum_stock_level ?? item.reorder_level ?? 10);

    if (quantity <= 0) return "Out of stock";
    if (quantity <= minimum) return "Low stock";
    return "In stock";
  };

  // Apply filters to inventory items
  const filteredItems = useMemo(() => {
    let filtered = [...inventoryItems];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        item.name?.toLowerCase().includes(search) ||
        item.category?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search)
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) =>
        item.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => {
        const status = getItemStatus(item).toLowerCase().replace(" ", "-");
        return status === statusFilter;
      });
    }

    return filtered;
  }, [inventoryItems, searchTerm, categoryFilter, statusFilter]);

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const cats = [...new Set(inventoryItems.map(item => item.category).filter(Boolean))];
    return cats.sort();
  }, [inventoryItems]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalItems = inventoryItems.length;
    const inStockItems = inventoryItems.filter(item => getQuantity(item) > 0).length;
    const lowStockItems = inventoryItems.filter(item => {
      const quantity = getQuantity(item);
      const minimum = Number(item.minimum_stock_level ?? item.reorder_level ?? 10);
      return quantity > 0 && quantity <= minimum;
    }).length;
    const outOfStockItems = inventoryItems.filter(item => getQuantity(item) <= 0).length;
    const totalValue = inventoryItems.reduce((sum, item) => sum + (getQuantity(item) * getPrice(item)), 0);

    return {
      totalItems,
      inStockItems,
      lowStockItems,
      outOfStockItems,
      totalValue,
    };
  }, [inventoryItems]);

  const handleDateChange = (key, value) => {
    if (key === "startDate") setStartDate(value);
    if (key === "endDate") setEndDate(value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  const exportColumns = [
    { key: "name", label: "Item Name" },
    { key: "category", label: "Category" },
    { key: "quantity", label: "Quantity" },
    { key: "price", label: "Unit Price", format: "currency" },
    { key: "total_value", label: "Total Value", format: "currency" },
    { key: "status", label: "Status" },
  ];

  const handleExportCSV = () => {
    const exportData = filteredItems.map(item => ({
      ...item,
      total_value: getQuantity(item) * getPrice(item),
      status: getItemStatus(item),
    }));
    exportToCSV(exportData, exportColumns, "inventory-report");
  };

  const handleExportPDF = () => {
    const exportData = filteredItems.map(item => ({
      ...item,
      total_value: getQuantity(item) * getPrice(item),
      status: getItemStatus(item),
    }));
    exportToPDF(exportData, exportColumns, "Inventory Report", "inventory-report");
  };

  const handleExportExcel = () => {
    const exportData = filteredItems.map(item => ({
      ...item,
      total_value: getQuantity(item) * getPrice(item),
      status: getItemStatus(item),
    }));
    exportToExcel(exportData, exportColumns, "inventory-report");
  };

  // Prepare summary cards data
  const summaryCards = [
    {
      id: "total-items",
      label: "Total Items",
      value: summaryStats.totalItems,
      icon: "faBox",
      color: "primary",
      trend: "neutral",
      change: "0%"
    },
    {
      id: "in-stock",
      label: "In Stock",
      value: summaryStats.inStockItems,
      icon: "faCheckCircle",
      color: "success",
      trend: "up",
      change: "+2.1%"
    },
    {
      id: "low-stock",
      label: "Low Stock",
      value: summaryStats.lowStockItems,
      icon: "faExclamationTriangle",
      color: "warning",
      trend: "down",
      change: "-5.3%"
    },
    {
      id: "out-of-stock",
      label: "Out of Stock",
      value: summaryStats.outOfStockItems,
      icon: "faTimesCircle",
      color: "danger",
      trend: "down",
      change: "-1.2%"
    },
    {
      id: "total-value",
      label: "Total Value",
      value: formatCurrency(summaryStats.totalValue),
      icon: "faMoneyBillWave",
      color: "secondary",
      trend: "up",
      change: "+8.7%"
    }
  ];

  // Prepare table columns
  const tableColumns = [
    { key: "name", label: "Item Name", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { key: "quantity", label: "Quantity", sortable: true },
    { key: "price", label: "Unit Price", format: "currency", sortable: true },
    { key: "total_value", label: "Total Value", format: "currency", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

  // Chart data preparation
  const categoryData = useMemo(() => {
    const categoryCounts = {};
    filteredItems.forEach(item => {
      const category = item.category || 'Unknown';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    return Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));
  }, [filteredItems]);

  const statusData = useMemo(() => {
    const statusCounts = { 'In Stock': 0, 'Low Stock': 0, 'Out of Stock': 0 };
    filteredItems.forEach(item => {
      const status = getItemStatus(item);
      statusCounts[status]++;
    });
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  }, [filteredItems]);

  const renderInventoryContent = () => (
    <div className="inventory-reports-content">
      <StandardSummaryCards cards={summaryCards} />
      
      <div className="charts-section">
        <div className="chart-row">
          <div className="chart-container">
            <h3 className="section-title">Items by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ff5f93" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3 className="section-title">Stock Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="data-table-section">
        <h3 className="section-title">Inventory Items</h3>
        <StandardTable
          columns={tableColumns}
          data={filteredItems.map(item => ({
            ...item,
            total_value: getQuantity(item) * getPrice(item),
            status: getItemStatus(item),
          }))}
          emptyMessage="No inventory items found"
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
      { value: "in-stock", label: "In Stock" },
      { value: "low-stock", label: "Low Stock" },
      { value: "out-of-stock", label: "Out of Stock" },
    ],
    categoryFilter,
    onCategoryChange: setCategoryFilter,
    categoryOptions: [
      { value: "all", label: "All Categories" },
      ...categories.map(cat => ({ value: cat, label: cat }))
    ],
    showCategory: true,
    onExportCSV: handleExportCSV,
    onExportPDF: handleExportPDF,
    onExportExcel: handleExportExcel,
    loading,
    onRefresh: () => window.location.reload(),
    onClearFilters: handleClearFilters,
    searchPlaceholder: "Search inventory items...",
  };

  return (
    <StandardReportLayout
      title="Inventory Reports"
      subtitle="Stock levels, item analytics, and inventory valuation"
      icon={faBox}
      loading={loading}
      error=""
      onRefresh={() => window.location.reload()}
      lastUpdated={new Date().toLocaleTimeString()}
      filterProps={filterProps}
    >
      <div className="reports-content">
        {renderInventoryContent()}
      </div>
    </StandardReportLayout>
  );
};

export default InventoryReports;
