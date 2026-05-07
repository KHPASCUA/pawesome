import React, { useMemo, useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faDownload,
  faFileExcel,
  faFilePdf,
  faArrowDown,
  faArrowUp,
  faBuilding,
  faDollarSign,
  faMinus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import "./PayrollReports.css";
import { formatCurrency } from "../../utils/currency";
import { apiRequest } from "../../api/client";
import { normalizeList } from "../../utils/normalizeList";

const CHART_COLORS = ["#ff5f93", "#ff8db5", "#ffc8dd", "#f472b6", "#fb7185", "#f9a8d4", "#ec4899"];

const PayrollReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [reportType, setReportType] = useState("summary");

  const departments = [
    "Veterinary",
    "Customer Service",
    "Management",
    "Grooming",
    "Reception",
    "Inventory",
    "Cashier",
  ];

  const periods = ["weekly", "monthly", "quarterly", "yearly"];

  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayrollData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      let endpoint = "/admin/payroll/reports";
      if (selectedPeriod !== "monthly") {
        endpoint += `?period=${selectedPeriod}`;
      }
      
      const result = await apiRequest(endpoint);
      setPayrollData({
        summary: result?.summary || {},
        departmentBreakdown: normalizeList(result?.departmentBreakdown, ["data", "employees", "salaries", "payrolls", "records"]),
        monthlyTrend: normalizeList(result?.monthlyTrend, ["data", "employees", "salaries", "payrolls", "records"]),
        topEarners: normalizeList(result?.topEarners, ["data", "employees", "salaries", "payrolls", "records"]),
        payrolls: normalizeList(result, ["data", "employees", "salaries", "payrolls", "records"]),
      });
    } catch (err) {
      setError(err.message || "Failed to load payroll data");
      setPayrollData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadPayrollData();
  }, [loadPayrollData]);

  const filteredDepartmentData = useMemo(() => {
    const departmentsList = normalizeList(payrollData?.departmentBreakdown, ["data", "employees", "salaries", "payrolls", "records"]);

    return selectedDepartment === "all"
      ? departmentsList
      : departmentsList.filter(
          (dept) => dept.department === selectedDepartment
        );
  }, [selectedDepartment, payrollData?.departmentBreakdown]);

  const monthlyTrendData = useMemo(
    () => normalizeList(payrollData?.monthlyTrend, ["data", "employees", "salaries", "payrolls", "records"]),
    [payrollData?.monthlyTrend]
  );

  const topEarnersData = useMemo(
    () => normalizeList(payrollData?.topEarners, ["data", "employees", "salaries", "payrolls", "records"]),
    [payrollData?.topEarners]
  );

  const getGrowthIcon = (growth) => {
    if (growth > 0) return faArrowUp;
    if (growth < 0) return faArrowDown;
    return faMinus;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return "positive";
    if (growth < 0) return "negative";
    return "neutral";
  };

  const exportCSV = () => {
    const headers = ["Department", "Employees", "Total Salary", "Average Salary", "Percentage", "Trend"];
    const rows = normalizeList(filteredDepartmentData, ["data", "employees", "salaries", "payrolls", "records"]).map((dept) => [
      dept.department,
      dept.employees,
      dept.totalSalary,
      dept.average,
      `${dept.percentage}%`,
      `${dept.trend || 0}%`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `payroll-report-${selectedPeriod}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="payroll-reports">
      <div className="reports-header">
        <div className="header-left">
          <h1>Payroll Reports & Analytics</h1>
          <p>Interactive payroll insights, department analytics, and salary reports.</p>
        </div>

        <div className="header-actions">
          <button className="secondary-btn" onClick={exportCSV}>
            <FontAwesomeIcon icon={faFileExcel} />
            Export Excel
          </button>

          <button className="secondary-btn" onClick={() => window.print()}>
            <FontAwesomeIcon icon={faFilePdf} />
            Print / PDF
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading payroll data...</div>
          <div className="loading-subtext">Please wait while we fetch the latest information</div>
        </div>
      )}

      {error && (
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button
            onClick={loadPayrollData}
            className="retry-btn"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && payrollData && (
        <>
          <div className="report-controls">
            <div className="control-group">
              <label>Report Type</label>

              <div className="report-type-selector">
                {["summary", "department", "trend", "topEarners"].map((type) => (
                  <button
                    key={type}
                    className={`report-type-btn ${reportType === type ? "active" : ""}`}
                    onClick={() => setReportType(type)}
                  >
                    {type === "summary" && "Summary"}
                    {type === "department" && "Department"}
                    {type === "trend" && "Trends"}
                    {type === "topEarners" && "Top Earners"}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-group">
              <label>Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {periods.map((period) => (
                  <option key={period} value={period}>
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {reportType === "summary" && (
            <div className="report-content">
              <div className="summary-cards">
                <div className="summary-card">
                  <div className="card-icon">
                    <FontAwesomeIcon icon={faDollarSign} />
                  </div>
                  <div className="card-content">
                    <h3>{formatCurrency(payrollData?.summary?.totalPayroll || 0)}</h3>
                    <p>Total Payroll</p>
                    <div className={`growth-indicator ${getGrowthColor(payrollData?.summary?.growth || 0)}`}>
                      <FontAwesomeIcon icon={getGrowthIcon(payrollData?.summary?.growth || 0)} />
                      {payrollData?.summary?.growth || 0}%
                    </div>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon">
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                  <div className="card-content">
                    <h3>{payrollData?.summary?.totalEmployees || 0}</h3>
                    <p>Total Employees</p>
                    <div className="growth-indicator positive">
                      <FontAwesomeIcon icon={faMinus} /> Live
                    </div>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon">
                    <FontAwesomeIcon icon={faChartBar} />
                  </div>
                  <div className="card-content">
                    <h3>{formatCurrency(payrollData?.summary?.averageSalary || 0)}</h3>
                    <p>Average Salary</p>
                    <div className="growth-indicator positive">
                      <FontAwesomeIcon icon={faMinus} /> Live
                    </div>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon">
                    <FontAwesomeIcon icon={faDollarSign} />
                  </div>
                  <div className="card-content">
                    <h3>{formatCurrency(payrollData?.summary?.totalBonuses || 0)}</h3>
                    <p>Total Bonuses</p>
                    <div className="growth-indicator positive">
                      <FontAwesomeIcon icon={faMinus} /> Live
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {reportType === "department" && (
            <div className="report-content">
              <div className="report-panel full-panel">
                <h3>Department Payroll Comparison</h3>
                <div className="real-chart-box">
                  <ResponsiveContainer width="100%" height={330}>
                    <BarChart data={filteredDepartmentData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="department" />
                      <YAxis tickFormatter={(value) => `₱${value / 1000}k`} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="totalSalary" name="Total Salary" radius={[12, 12, 0, 0]}>
                        {normalizeList(filteredDepartmentData, ["data", "employees", "salaries", "payrolls", "records"]).map((entry, index) => (
                          <Cell
                            key={entry.department}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="department-table-container">
                <table className="department-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Employees</th>
                      <th>Total Salary</th>
                      <th>Average Salary</th>
                      <th>% of Total</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {normalizeList(filteredDepartmentData, ["data", "employees", "salaries", "payrolls", "records"]).map((dept) => (
                      <tr key={dept.department}>
                        <td className="department-name">
                          <FontAwesomeIcon icon={faBuilding} />
                          {dept.department}
                        </td>
                        <td>{dept.employees}</td>
                        <td className="total-salary">{formatCurrency(dept.totalSalary)}</td>
                        <td className="avg-salary">{formatCurrency(dept.average)}</td>
                        <td>{dept.percentage}%</td>
                        <td>
                          <div className={`trend-indicator ${getGrowthColor(dept.trend || 0)}`}>
                            <FontAwesomeIcon icon={getGrowthIcon(dept.trend || 0)} />
                            {dept.trend || 0}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === "trend" && (
            <div className="report-content">
              <div className="report-panel">
                <h3>Payroll Growth Analysis</h3>

                <div className="real-chart-box large">
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" tickFormatter={(value) => `₱${value / 1000}k`} />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip
                        formatter={(value, name) =>
                          name === "payroll" ? formatCurrency(value) : value
                        }
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="payroll"
                        name="Payroll"
                        stroke="#ff5f93"
                        strokeWidth={4}
                        dot={{ r: 5 }}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="employees"
                        name="Employees"
                        stroke="#fb7185"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="trend-insights">
                  <div className="insight-card">
                    <h4>Key Insights</h4>
                    <p>Insights are based only on payroll records returned by the backend.</p>
                  </div>

                  <div className="insight-card">
                    <h4>Forecast</h4>
                    <p>Projected next quarter payroll: unavailable until forecasting data is provided.</p>
                    <p>Expected employee count: {payrollData?.summary?.totalEmployees || 0}</p>
                    <p>Growth drivers: live payroll records and employee salary data.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {reportType === "topEarners" && (
            <div className="report-content">
              <div className="top-earners-container">
                <h3>Top Earners by Salary</h3>

                <div className="earners-list">
                  {topEarnersData.map((earner, index) => (
                    <div key={earner.name} className="earner-card">
                      <div className="earner-rank">#{index + 1}</div>
                      <div className="earner-info">
                        <div className="earner-details">
                          <h4>{earner.name}</h4>
                          <p>{earner.position}</p>
                          <span className="earner-department">{earner.department}</span>
                        </div>
                      </div>
                      <div className="earner-salary">
                        <span className="salary-amount">{formatCurrency(earner.salary)}</span>
                        <span className="salary-period">per month</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="report-panel">
                  <h3>Top Earners Chart</h3>
                  <div className="real-chart-box">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topEarnersData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₱${value / 1000}k`} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="salary" name="Salary" radius={[12, 12, 0, 0]}>
                          {topEarnersData.map((entry, index) => (
                            <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="export-section">
            <h3>Export Options</h3>

            <div className="export-buttons">
              <button className="export-btn" onClick={exportCSV}>
                <FontAwesomeIcon icon={faFileExcel} />
                Export to Excel
              </button>

              <button className="export-btn" onClick={() => window.print()}>
                <FontAwesomeIcon icon={faFilePdf} />
                Generate PDF Report
              </button>

              <button className="export-btn" onClick={exportCSV}>
                <FontAwesomeIcon icon={faDownload} />
                Download CSV
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PayrollReports;
