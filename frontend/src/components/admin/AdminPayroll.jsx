import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faUsers,
  faCalendarAlt,
  faSearch,
  faFilter,
  faPlus,
  faEdit,
  faTrash,
  faDownload,
  faEye,
  faCheckCircle,
  faExclamationTriangle,
  faClock,
  faDollarSign,
  faFileInvoiceDollar,
  faUserTie,
  faCalculator,
} from "@fortawesome/free-solid-svg-icons";
import "./AdminPayroll.css";

const AdminPayroll = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  const payrollData = [
    {
      id: "PAY-001",
      employee: "John Smith",
      department: "Veterinary",
      position: "Senior Veterinarian",
      salary: 8500,
      bonus: 1200,
      deductions: 850,
      netPay: 8850,
      payPeriod: "March 2026",
      status: "paid",
      paymentDate: "2026-03-31",
      employeeId: "EMP-001",
    },
    {
      id: "PAY-002",
      employee: "Sarah Johnson",
      department: "Customer Service",
      position: "Customer Representative",
      salary: 3200,
      bonus: 300,
      deductions: 320,
      netPay: 3180,
      payPeriod: "March 2026",
      status: "paid",
      paymentDate: "2026-03-31",
      employeeId: "EMP-002",
    },
    {
      id: "PAY-003",
      employee: "Mike Davis",
      department: "Management",
      position: "Operations Manager",
      salary: 6500,
      bonus: 800,
      deductions: 650,
      netPay: 6650,
      payPeriod: "March 2026",
      status: "pending",
      paymentDate: "2026-04-05",
      employeeId: "EMP-003",
    },
    {
      id: "PAY-004",
      employee: "Emma Wilson",
      department: "Grooming",
      position: "Grooming Specialist",
      salary: 2800,
      bonus: 200,
      deductions: 280,
      netPay: 2720,
      payPeriod: "March 2026",
      status: "pending",
      paymentDate: "2026-04-05",
      employeeId: "EMP-004",
    },
    {
      id: "PAY-005",
      employee: "Robert Brown",
      department: "Reception",
      position: "Receptionist",
      salary: 2500,
      bonus: 150,
      deductions: 250,
      netPay: 2400,
      payPeriod: "March 2026",
      status: "processing",
      paymentDate: "2026-04-03",
      employeeId: "EMP-005",
    },
  ];

  const payrollSummary = {
    totalEmployees: payrollData.length,
    totalSalary: payrollData.reduce((sum, emp) => sum + emp.salary, 0),
    totalBonus: payrollData.reduce((sum, emp) => sum + emp.bonus, 0),
    totalDeductions: payrollData.reduce((sum, emp) => sum + emp.deductions, 0),
    totalNetPay: payrollData.reduce((sum, emp) => sum + emp.netPay, 0),
    paidCount: payrollData.filter(emp => emp.status === 'paid').length,
    pendingCount: payrollData.filter(emp => emp.status === 'pending').length,
    processingCount: payrollData.filter(emp => emp.status === 'processing').length,
  };

  const filteredPayroll = payrollData.filter(payroll => {
    const matchesSearch = 
      payroll.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payroll.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payroll.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || payroll.status === filterStatus;
    const matchesDepartment = filterDepartment === "all" || payroll.department === filterDepartment;
    
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
          <p>Manage employee salaries, bonuses, and payment processing</p>
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

      {/* Payroll Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="card-content">
            <h3>{payrollSummary.totalEmployees}</h3>
            <p>Total Employees</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faMoneyBillWave} />
          </div>
          <div className="card-content">
            <h3>${payrollSummary.totalNetPay.toLocaleString()}</h3>
            <p>Total Net Pay</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="card-content">
            <h3>{payrollSummary.paidCount}</h3>
            <p>Paid Employees</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="card-content">
            <h3>{payrollSummary.pendingCount + payrollSummary.processingCount}</h3>
            <p>Pending Processing</p>
          </div>
        </div>
      </div>

      {/* Filters */}
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
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
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

      {/* Payroll Table */}
      <div className="payroll-table-container">
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
            {filteredPayroll.map((payroll) => (
              <tr key={payroll.id} className="payroll-row">
                <td className="employee-info">
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
                <td className="department">
                  <span className="department-badge">{payroll.department}</span>
                </td>
                <td className="salary">
                  <span className="amount">${payroll.salary.toLocaleString()}</span>
                </td>
                <td className="bonus">
                  <span className="amount positive">+${payroll.bonus.toLocaleString()}</span>
                </td>
                <td className="deductions">
                  <span className="amount negative">-${payroll.deductions.toLocaleString()}</span>
                </td>
                <td className="net-pay">
                  <span className="amount net-pay-amount">${payroll.netPay.toLocaleString()}</span>
                </td>
                <td className="pay-period">
                  <span className="period-badge">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    {payroll.payPeriod}
                  </span>
                </td>
                <td className="status">
                  <span className={`status-badge ${getStatusColor(payroll.status)}`}>
                    <FontAwesomeIcon icon={getStatusIcon(payroll.status)} />
                    {payroll.status}
                  </span>
                </td>
                <td className="payment-date">
                  <span className="date">{payroll.paymentDate}</span>
                </td>
                <td className="actions">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payroll Details Modal */}
      {selectedPayroll && (
        <div className="payroll-modal-overlay" onClick={() => setSelectedPayroll(null)}>
          <div className="payroll-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payroll Details</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedPayroll(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="employee-overview">
                <div className="overview-item">
                  <label>Employee ID:</label>
                  <span>{selectedPayroll.employeeId}</span>
                </div>
                <div className="overview-item">
                  <label>Employee Name:</label>
                  <span>{selectedPayroll.employee}</span>
                </div>
                <div className="overview-item">
                  <label>Department:</label>
                  <span>{selectedPayroll.department}</span>
                </div>
                <div className="overview-item">
                  <label>Position:</label>
                  <span>{selectedPayroll.position}</span>
                </div>
                <div className="overview-item">
                  <label>Pay Period:</label>
                  <span>{selectedPayroll.payPeriod}</span>
                </div>
                <div className="overview-item">
                  <label>Status:</label>
                  <span className={`status-badge ${getStatusColor(selectedPayroll.status)}`}>
                    <FontAwesomeIcon icon={getStatusIcon(selectedPayroll.status)} />
                    {selectedPayroll.status}
                  </span>
                </div>
              </div>
              
              <div className="payroll-breakdown">
                <h3>Payroll Breakdown</h3>
                <div className="breakdown-item">
                  <label>Base Salary:</label>
                  <span className="amount">${selectedPayroll.salary.toLocaleString()}</span>
                </div>
                <div className="breakdown-item">
                  <label>Bonus:</label>
                  <span className="amount positive">+${selectedPayroll.bonus.toLocaleString()}</span>
                </div>
                <div className="breakdown-item">
                  <label>Deductions:</label>
                  <span className="amount negative">-${selectedPayroll.deductions.toLocaleString()}</span>
                </div>
                <div className="breakdown-item total">
                  <label>Net Pay:</label>
                  <span className="amount net-pay-amount">${selectedPayroll.netPay.toLocaleString()}</span>
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
