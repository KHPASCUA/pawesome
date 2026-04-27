import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faDownload,
  faFileExcel,
  faFilePdf,
  faBuilding,
  faUsers,
  faDollarSign,
  faArrowUp,
  faArrowDown,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import "./PayrollReports.css";
import { formatCurrency } from "../../utils/currency";

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

  const payrollData = {
    summary: {
      totalPayroll: 284500,
      totalEmployees: 45,
      averageSalary: 6322,
      totalBonuses: 12450,
      growth: 3.5,
    },
    departmentBreakdown: [
      { department: "Veterinary", employees: 8, totalSalary: 68000, average: 8500, percentage: 23.9 },
      { department: "Management", employees: 5, totalSalary: 44000, average: 8800, percentage: 15.5 },
      { department: "Customer Service", employees: 12, totalSalary: 51000, average: 4250, percentage: 17.9 },
      { department: "Grooming", employees: 6, totalSalary: 21300, average: 3550, percentage: 7.5 },
      { department: "Reception", employees: 4, totalSalary: 14400, average: 3600, percentage: 5.1 },
      { department: "Inventory", employees: 5, totalSalary: 35000, average: 7000, percentage: 12.3 },
      { department: "Cashier", employees: 5, totalSalary: 50800, average: 10160, percentage: 17.8 },
    ],
    monthlyTrend: [
      { month: "Jan", payroll: 265000, employees: 42 },
      { month: "Feb", payroll: 272000, employees: 43 },
      { month: "Mar", payroll: 284500, employees: 45 },
      { month: "Apr", payroll: 289000, employees: 45 },
      { month: "May", payroll: 292000, employees: 46 },
      { month: "Jun", payroll: 298000, employees: 47 },
    ],
    topEarners: [
      { name: "John Smith", department: "Cashier", position: "Senior Cashier", salary: 12500 },
      { name: "Sarah Johnson", department: "Veterinary", position: "Head Veterinarian", salary: 11500 },
      { name: "Mike Davis", department: "Management", position: "Operations Manager", salary: 10500 },
      { name: "Emma Wilson", department: "Veterinary", position: "Senior Veterinarian", salary: 9800 },
      { name: "Robert Brown", department: "Cashier", position: "Cashier Supervisor", salary: 9200 },
    ],
  };

  const filteredDepartmentData = useMemo(() => {
    return selectedDepartment === "all"
      ? payrollData.departmentBreakdown
      : payrollData.departmentBreakdown.filter(
          (dept) => dept.department === selectedDepartment
        );
  }, [selectedDepartment, payrollData.departmentBreakdown]);

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
    const headers = ["Department", "Employees", "Total Salary", "Average Salary", "Percentage"];
    const rows = filteredDepartmentData.map((dept) => [
      dept.department,
      dept.employees,
      dept.totalSalary,
      dept.average,
      `${dept.percentage}%`,
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
                <h3>{formatCurrency(payrollData.summary.totalPayroll)}</h3>
                <p>Total Payroll</p>
                <div className={`growth-indicator ${getGrowthColor(payrollData.summary.growth)}`}>
                  <FontAwesomeIcon icon={getGrowthIcon(payrollData.summary.growth)} />
                  {payrollData.summary.growth}%
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="card-content">
                <h3>{payrollData.summary.totalEmployees}</h3>
                <p>Total Employees</p>
                <div className="growth-indicator positive">
                  <FontAwesomeIcon icon={faArrowUp} /> +2
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">
                <FontAwesomeIcon icon={faChartBar} />
              </div>
              <div className="card-content">
                <h3>{formatCurrency(payrollData.summary.averageSalary)}</h3>
                <p>Average Salary</p>
                <div className="growth-indicator positive">
                  <FontAwesomeIcon icon={faArrowUp} /> +3.2%
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">
                <FontAwesomeIcon icon={faDollarSign} />
              </div>
              <div className="card-content">
                <h3>{formatCurrency(payrollData.summary.totalBonuses)}</h3>
                <p>Total Bonuses</p>
                <div className="growth-indicator positive">
                  <FontAwesomeIcon icon={faArrowUp} /> +8.5%
                </div>
              </div>
            </div>
          </div>

          <div className="report-grid">
            <div className="report-panel">
              <h3>Payroll Trend</h3>
              <div className="real-chart-box">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={payrollData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₱${value / 1000}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="payroll"
                      name="Payroll"
                      stroke="#ff5f93"
                      strokeWidth={4}
                      dot={{ r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="report-panel">
              <h3>Department Distribution</h3>
              <div className="real-chart-box">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={filteredDepartmentData}
                      dataKey="percentage"
                      nameKey="department"
                      outerRadius={105}
                      innerRadius={55}
                      paddingAngle={4}
                    >
                      {filteredDepartmentData.map((entry, index) => (
                        <Cell
                          key={entry.department}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
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
                    {filteredDepartmentData.map((entry, index) => (
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
                {filteredDepartmentData.map((dept) => (
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
                      <div className="trend-indicator positive">
                        <FontAwesomeIcon icon={faArrowUp} />
                        +2.3%
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
          <div className="trend-analysis">
            <h3>Payroll Growth Analysis</h3>

            <div className="real-chart-box large">
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={payrollData.monthlyTrend}>
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
                <ul>
                  <li>Payroll increased by 12.5% over the last 6 months.</li>
                  <li>Employee count grew from 42 to 47 employees.</li>
                  <li>Average salary stayed controlled despite expansion.</li>
                  <li>Q2 shows higher growth because of seasonal hiring.</li>
                </ul>
              </div>

              <div className="insight-card">
                <h4>Forecast</h4>
                <p>Projected next quarter payroll: {formatCurrency(305000)}</p>
                <p>Expected employee count: 49</p>
                <p>Growth drivers: new hires, bonuses, and annual increments.</p>
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
              {payrollData.topEarners.map((earner, index) => (
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
                  <BarChart data={payrollData.topEarners}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `₱${value / 1000}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="salary" name="Salary" radius={[12, 12, 0, 0]}>
                      {payrollData.topEarners.map((entry, index) => (
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
    </div>
  );
};

export default PayrollReports;
