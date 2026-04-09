import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faChartPie,
  faChartLine,
  faDownload,
  faFileExcel,
  faFilePdf,
  faCalendarAlt,
  faFilter,
  faBuilding,
  faUsers,
  faDollarSign,
  faArrowUp,
  faArrowDown,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import "./PayrollReports.css";

const PayrollReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [reportType, setReportType] = useState("summary");

  const departments = ["Veterinary", "Customer Service", "Management", "Grooming", "Reception", "Inventory", "Cashier"];
  const periods = ["weekly", "monthly", "quarterly", "yearly"];

  const payrollData = {
    summary: {
      totalPayroll: 284500,
      totalEmployees: 45,
      averageSalary: 6322,
      totalBonuses: 12450,
      totalDeductions: 28450,
      previousPeriod: 275000,
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

  const filteredDepartmentData = selectedDepartment === "all" 
    ? payrollData.departmentBreakdown 
    : payrollData.departmentBreakdown.filter(dept => dept.department === selectedDepartment);

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

  return (
    <div className="payroll-reports">
      <div className="reports-header">
        <div className="header-left">
          <h1>Payroll Reports & Analytics</h1>
          <p>Comprehensive payroll insights and financial reports</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn">
            <FontAwesomeIcon icon={faFileExcel} />
            Export Excel
          </button>
          <button className="secondary-btn">
            <FontAwesomeIcon icon={faFilePdf} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Report Controls */}
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
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
            {periods.map(period => (
              <option key={period} value={period}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <label>Department</label>
          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Report */}
      {reportType === "summary" && (
        <div className="report-content">
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon">
                <FontAwesomeIcon icon={faDollarSign} />
              </div>
              <div className="card-content">
                <h3>${payrollData.summary.totalPayroll.toLocaleString()}</h3>
                <p>Total Payroll</p>
                <div className={`growth-indicator ${getGrowthColor(payrollData.summary.growth)}`}>
                  <FontAwesomeIcon icon={getGrowthIcon(payrollData.summary.growth)} />
                  {Math.abs(payrollData.summary.growth)}%
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
                  <FontAwesomeIcon icon={faArrowUp} />
                  +2
                </div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">
                <FontAwesomeIcon icon={faChartBar} />
              </div>
              <div className="card-content">
                <h3>${payrollData.summary.averageSalary.toLocaleString()}</h3>
                <p>Average Salary</p>
                <div className="growth-indicator positive">
                  <FontAwesomeIcon icon={faArrowUp} />
                  +3.2%
                </div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">
                <FontAwesomeIcon icon={faDollarSign} />
              </div>
              <div className="card-content">
                <h3>${payrollData.summary.totalBonuses.toLocaleString()}</h3>
                <p>Total Bonuses</p>
                <div className="growth-indicator positive">
                  <FontAwesomeIcon icon={faArrowUp} />
                  +8.5%
                </div>
              </div>
            </div>
          </div>

          <div className="report-grid">
            <div className="report-panel">
              <h3>Payroll Trend</h3>
              <div className="chart-placeholder">
                <FontAwesomeIcon icon={faChartLine} />
                <p>Monthly payroll trend visualization</p>
                <div className="trend-data">
                  {payrollData.monthlyTrend.map((data, index) => (
                    <div key={index} className="trend-item">
                      <span className="trend-month">{data.month}</span>
                      <span className="trend-value">${(data.payroll / 1000).toFixed(0)}k</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="report-panel">
              <h3>Department Distribution</h3>
              <div className="chart-placeholder">
                <FontAwesomeIcon icon={faChartPie} />
                <p>Department payroll distribution</p>
                <div className="distribution-data">
                  {filteredDepartmentData.map((dept, index) => (
                    <div key={index} className="distribution-item">
                      <span className="dept-name">{dept.department}</span>
                      <span className="dept-percentage">{dept.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department Report */}
      {reportType === "department" && (
        <div className="report-content">
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
                {filteredDepartmentData.map((dept, index) => (
                  <tr key={index}>
                    <td className="department-name">
                      <FontAwesomeIcon icon={faBuilding} />
                      {dept.department}
                    </td>
                    <td className="employee-count">{dept.employees}</td>
                    <td className="total-salary">${dept.totalSalary.toLocaleString()}</td>
                    <td className="avg-salary">${dept.average.toLocaleString()}</td>
                    <td className="percentage">{dept.percentage}%</td>
                    <td className="trend">
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

      {/* Trend Report */}
      {reportType === "trend" && (
        <div className="report-content">
          <div className="trend-analysis">
            <h3>Payroll Growth Analysis</h3>
            <div className="trend-chart">
              <div className="chart-placeholder large">
                <FontAwesomeIcon icon={faChartLine} />
                <p>6-month payroll trend analysis</p>
              </div>
            </div>
            
            <div className="trend-insights">
              <div className="insight-card">
                <h4>Key Insights</h4>
                <ul>
                  <li>Payroll increased by 12.5% over the last 6 months</li>
                  <li>Employee count grew by 11.9% (42 to 47 employees)</li>
                  <li>Average salary increased by 0.5% indicating controlled growth</li>
                  <li>Q2 shows highest growth due to seasonal hiring</li>
                </ul>
              </div>
              
              <div className="insight-card">
                <h4>Forecast</h4>
                <p>Based on current trends, projected payroll for next quarter: $305,000</p>
                <p>Expected employee count: 49</p>
                <p>Growth drivers: New hires, performance bonuses, annual increments</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Earners Report */}
      {reportType === "topEarners" && (
        <div className="report-content">
          <div className="top-earners-container">
            <h3>Top Earners by Salary</h3>
            <div className="earners-list">
              {payrollData.topEarners.map((earner, index) => (
                <div key={index} className="earner-card">
                  <div className="earner-rank">#{index + 1}</div>
                  <div className="earner-info">
                    <div className="earner-details">
                      <h4>{earner.name}</h4>
                      <p>{earner.position}</p>
                      <span className="earner-department">{earner.department}</span>
                    </div>
                  </div>
                  <div className="earner-salary">
                    <span className="salary-amount">${earner.salary.toLocaleString()}</span>
                    <span className="salary-period">per month</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="earners-analysis">
              <h4>Salary Distribution Analysis</h4>
              <div className="analysis-grid">
                <div className="analysis-item">
                  <label>Highest Salary Range</label>
                  <span>$10,000 - $12,500</span>
                </div>
                <div className="analysis-item">
                  <label>Median Salary</label>
                  <span>$6,322</span>
                </div>
                <div className="analysis-item">
                  <label>Top 10% Earners</label>
                  <span>$9,200+</span>
                </div>
                <div className="analysis-item">
                  <label>Bottom 10% Earners</label>
                  <span>$3,550-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="export-section">
        <h3>Export Options</h3>
        <div className="export-buttons">
          <button className="export-btn">
            <FontAwesomeIcon icon={faFileExcel} />
            Export to Excel
          </button>
          <button className="export-btn">
            <FontAwesomeIcon icon={faFilePdf} />
            Generate PDF Report
          </button>
          <button className="export-btn">
            <FontAwesomeIcon icon={faDownload} />
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollReports;
