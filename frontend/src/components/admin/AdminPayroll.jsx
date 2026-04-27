import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faUsers,
  faCalendarAlt,
  faSearch,
  faFilter,
  faPlus,
  faEdit,
  faDownload,
  faEye,
  faCheckCircle,
  faExclamationTriangle,
  faClock,
  faUserTie,
  faCalculator,
} from "@fortawesome/free-solid-svg-icons";
import "./AdminPayroll.css";
import { formatCurrency } from "../../utils/currency";
import { payrollApi } from "../../api/payroll";

const safeNumber = (value) => Number(value || 0);

const AdminPayroll = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    totalSalary: 0,
    totalBonus: 0,
    totalDeductions: 0,
    totalNetPay: 0,
    paidCount: 0,
    pendingCount: 0,
    processingCount: 0,
  });

  useEffect(() => {
    const loadPayroll = async () => {
      setLoading(true);

      try {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (filterStatus !== "all") params.status = filterStatus;
        if (filterDepartment !== "all") params.department = filterDepartment;

        const response = await payrollApi.getAll(params);

        if (response.success) {
          const transformedData = (response.data || []).map((payroll) => ({
            id: payroll.payroll_id,
            employee: payroll.user?.name || "Unknown",
            employeeId: `EMP${String(payroll.user?.id || 0).padStart(3, "0")}`,
            department: payroll.department || "Unassigned",
            position: payroll.position || "Staff",
            salary: safeNumber(payroll.base_salary),
            bonus: safeNumber(payroll.bonus),
            deductions:
              safeNumber(payroll.sss_contribution) +
              safeNumber(payroll.philhealth_contribution) +
              safeNumber(payroll.pagibig_contribution) +
              safeNumber(payroll.tax_deduction) +
              safeNumber(payroll.deductions),
            netPay: safeNumber(payroll.net_pay),
            payPeriod: payroll.pay_period_label || "N/A",
            status: payroll.status || "pending",
            paymentDate: payroll.payment_date || "N/A",
          }));

          setPayrollData(transformedData);

          setSummary({
            totalEmployees: transformedData.length,
            totalSalary: transformedData.reduce((sum, emp) => sum + safeNumber(emp.salary), 0),
            totalBonus: transformedData.reduce((sum, emp) => sum + safeNumber(emp.bonus), 0),
            totalDeductions: transformedData.reduce((sum, emp) => sum + safeNumber(emp.deductions), 0),
            totalNetPay: transformedData.reduce((sum, emp) => sum + safeNumber(emp.netPay), 0),
            paidCount: transformedData.filter((emp) => emp.status === "paid").length,
            pendingCount: transformedData.filter((emp) => emp.status === "pending").length,
            processingCount: transformedData.filter((emp) => emp.status === "processing").length,
          });
        }
      } catch (err) {
        console.error("Payroll load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPayroll();
  }, [searchTerm, filterStatus, filterDepartment]);

  const payrollSummary = summary;

  const filteredPayroll = payrollData.filter((payroll) => {
    const matchesSearch =
      payroll.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payroll.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payroll.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || payroll.status === filterStatus;
    const matchesDepartment =
      filterDepartment === "all" || payroll.department === filterDepartment;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "failed":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return faCheckCircle;
      case "pending":
        return faClock;
      case "processing":
        return faCalculator;
      case "failed":
        return faExclamationTriangle;
      default:
        return faClock;
    }
  };

  return (
    <div className="admin-payroll">
      <div className="payroll-header">
        <div className="header-left">
          <h1>Payroll Management</h1>
          <p>Manage employee salaries, bonuses, deductions, and payment processing.</p>
        </div>

        <div className="header-actions">
          <button className="primary-btn">
            <FontAwesomeIcon icon={faPlus} />
            Generate Payroll
          </button>
          <button className="secondary-btn">
            <FontAwesomeIcon icon={faDownload} />
            Export Report
          </button>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="card-content">
            <h3>{payrollSummary.totalEmployees || 0}</h3>
            <p>Total Employees</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faMoneyBillWave} />
          </div>
          <div className="card-content">
            <h3>{formatCurrency(payrollSummary.totalNetPay || 0)}</h3>
            <p>Total Net Pay</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="card-content">
            <h3>{payrollSummary.paidCount || 0}</h3>
            <p>Paid Employees</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="card-content">
            <h3>
              {(payrollSummary.pendingCount || 0) +
                (payrollSummary.processingCount || 0)}
            </h3>
            <p>Pending Processing</p>
          </div>
        </div>
      </div>

      <div className="payroll-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search by employee, ID, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdown">
            <FontAwesomeIcon icon={faFilter} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="filter-dropdown">
            <FontAwesomeIcon icon={faUsers} />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="Veterinary">Veterinary</option>
              <option value="Customer Service">Customer Service</option>
              <option value="Management">Management</option>
              <option value="Grooming">Grooming</option>
              <option value="Reception">Reception</option>
            </select>
          </div>
        </div>
      </div>

      <div className="payroll-table-container">
        {loading ? (
          <div className="payroll-loading">Loading payroll records...</div>
        ) : (
          <table className="payroll-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Bonus</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th>Pay Period</th>
                <th>Status</th>
                <th>Payment Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayroll.length > 0 ? (
                filteredPayroll.map((payroll) => (
                  <tr key={payroll.id}>
                    <td>
                      <div className="employee-details">
                        <div className="employee-avatar">
                          <FontAwesomeIcon icon={faUserTie} />
                        </div>
                        <div>
                          <span className="employee-name">{payroll.employee}</span>
                          <span className="employee-id">{payroll.employeeId}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="department-badge">{payroll.department}</span>
                    </td>

                    <td>{formatCurrency(payroll.salary || 0)}</td>
                    <td>
                      <span className="amount positive">
                        +{formatCurrency(payroll.bonus || 0)}
                      </span>
                    </td>
                    <td>
                      <span className="amount negative">
                        -{formatCurrency(payroll.deductions || 0)}
                      </span>
                    </td>
                    <td>
                      <span className="net-pay-amount">
                        {formatCurrency(payroll.netPay || 0)}
                      </span>
                    </td>

                    <td>
                      <span className="period-badge">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        {payroll.payPeriod}
                      </span>
                    </td>

                    <td>
                      <span className={`status-badge ${getStatusColor(payroll.status)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(payroll.status)} />
                        {payroll.status}
                      </span>
                    </td>

                    <td>
                      <span className="date">{payroll.paymentDate}</span>
                    </td>

                    <td>
                      <div className="actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => setSelectedPayroll(payroll)}
                          title="View Details"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button className="action-btn edit-btn" title="Edit">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className="action-btn download-btn" title="Download Payslip">
                          <FontAwesomeIcon icon={faDownload} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="empty-table">
                    No payroll records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedPayroll && (
        <div className="payroll-modal-overlay" onClick={() => setSelectedPayroll(null)}>
          <div className="payroll-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payroll Details</h2>
              <button className="close-btn" onClick={() => setSelectedPayroll(null)}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="employee-overview">
                <div className="overview-item">
                  <label>Employee ID</label>
                  <span>{selectedPayroll.employeeId}</span>
                </div>
                <div className="overview-item">
                  <label>Employee Name</label>
                  <span>{selectedPayroll.employee}</span>
                </div>
                <div className="overview-item">
                  <label>Department</label>
                  <span>{selectedPayroll.department}</span>
                </div>
                <div className="overview-item">
                  <label>Position</label>
                  <span>{selectedPayroll.position}</span>
                </div>
                <div className="overview-item">
                  <label>Pay Period</label>
                  <span>{selectedPayroll.payPeriod}</span>
                </div>
                <div className="overview-item">
                  <label>Status</label>
                  <span className={`status-badge ${getStatusColor(selectedPayroll.status)}`}>
                    <FontAwesomeIcon icon={getStatusIcon(selectedPayroll.status)} />
                    {selectedPayroll.status}
                  </span>
                </div>
              </div>

              <div className="payroll-breakdown">
                <h3>Payroll Breakdown</h3>
                <div className="breakdown-item">
                  <label>Base Salary</label>
                  <span>{formatCurrency(selectedPayroll.salary || 0)}</span>
                </div>
                <div className="breakdown-item">
                  <label>Bonus</label>
                  <span className="amount positive">
                    +{formatCurrency(selectedPayroll.bonus || 0)}
                  </span>
                </div>
                <div className="breakdown-item">
                  <label>Deductions</label>
                  <span className="amount negative">
                    -{formatCurrency(selectedPayroll.deductions || 0)}
                  </span>
                </div>
                <div className="breakdown-item total">
                  <label>Net Pay</label>
                  <span className="net-pay-amount">
                    {formatCurrency(selectedPayroll.netPay || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayroll;