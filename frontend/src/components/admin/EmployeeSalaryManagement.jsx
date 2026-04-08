import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faUsers,
  faSearch,
  faFilter,
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faUserTie,
  faBuilding,
  faPercentage,
  faCalculator,
} from "@fortawesome/free-solid-svg-icons";
import "./EmployeeSalaryManagement.css";

const EmployeeSalaryManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [employees, setEmployees] = useState([
    {
      id: 1,
      employeeId: "EMP-001",
      name: "John Smith",
      department: "Veterinary",
      position: "Senior Veterinarian",
      baseSalary: 8500,
      housingAllowance: 1200,
      transportAllowance: 300,
      medicalAllowance: 500,
      performanceBonus: 1000,
      totalSalary: 11500,
      status: "active",
      joinDate: "2022-01-15",
    },
    {
      id: 2,
      employeeId: "EMP-002",
      name: "Sarah Johnson",
      department: "Customer Service",
      position: "Customer Representative",
      baseSalary: 3200,
      housingAllowance: 400,
      transportAllowance: 200,
      medicalAllowance: 150,
      performanceBonus: 300,
      totalSalary: 4250,
      status: "active",
      joinDate: "2023-03-20",
    },
    {
      id: 3,
      employeeId: "EMP-003",
      name: "Mike Davis",
      department: "Management",
      position: "Operations Manager",
      baseSalary: 6500,
      housingAllowance: 800,
      transportAllowance: 400,
      medicalAllowance: 300,
      performanceBonus: 800,
      totalSalary: 8800,
      status: "active",
      joinDate: "2021-06-10",
    },
    {
      id: 4,
      employeeId: "EMP-004",
      name: "Emma Wilson",
      department: "Grooming",
      position: "Grooming Specialist",
      baseSalary: 2800,
      housingAllowance: 300,
      transportAllowance: 150,
      medicalAllowance: 100,
      performanceBonus: 200,
      totalSalary: 3550,
      status: "active",
      joinDate: "2023-08-05",
    },
  ]);

  const [newEmployee, setNewEmployee] = useState({
    employeeId: "",
    name: "",
    department: "",
    position: "",
    baseSalary: 0,
    housingAllowance: 0,
    transportAllowance: 0,
    medicalAllowance: 0,
    performanceBonus: 0,
  });

  const departments = ["Veterinary", "Customer Service", "Management", "Grooming", "Reception", "Inventory", "Cashier"];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === "all" || employee.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const calculateTotalSalary = (employee) => {
    return (
      employee.baseSalary +
      employee.housingAllowance +
      employee.transportAllowance +
      employee.medicalAllowance +
      employee.performanceBonus
    );
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee({ ...employee });
  };

  const handleSaveEmployee = () => {
    if (editingEmployee) {
      const updatedEmployees = employees.map(emp =>
        emp.id === editingEmployee.id
          ? { ...editingEmployee, totalSalary: calculateTotalSalary(editingEmployee) }
          : emp
      );
      setEmployees(updatedEmployees);
      setEditingEmployee(null);
    }
  };

  const handleAddEmployee = () => {
    const totalSalary = calculateTotalSalary(newEmployee);
    const employee = {
      ...newEmployee,
      id: employees.length + 1,
      totalSalary,
      status: "active",
      joinDate: new Date().toISOString().split('T')[0],
    };
    setEmployees([...employees, employee]);
    setNewEmployee({
      employeeId: "",
      name: "",
      department: "",
      position: "",
      baseSalary: 0,
      housingAllowance: 0,
      transportAllowance: 0,
      medicalAllowance: 0,
      performanceBonus: 0,
    });
    setShowAddForm(false);
  };

  const handleDeleteEmployee = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  return (
    <div className="salary-management">
      <div className="salary-header">
        <div className="header-left">
          <h1>Employee Salary Management</h1>
          <p>Manage employee salaries, allowances, and compensation packages</p>
        </div>
        <div className="header-actions">
          <button className="primary-btn" onClick={() => setShowAddForm(true)}>
            <FontAwesomeIcon icon={faPlus} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="card-content">
            <h3>{employees.length}</h3>
            <p>Total Employees</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faDollarSign} />
          </div>
          <div className="card-content">
            <h3>${employees.reduce((sum, emp) => sum + emp.totalSalary, 0).toLocaleString()}</h3>
            <p>Total Payroll</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faCalculator} />
          </div>
          <div className="card-content">
            <h3>${Math.round(employees.reduce((sum, emp) => sum + emp.totalSalary, 0) / employees.length).toLocaleString()}</h3>
            <p>Average Salary</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="salary-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search by employee, ID, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <FontAwesomeIcon icon={faFilter} />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <div className="salary-form-overlay" onClick={() => setShowAddForm(false)}>
          <div className="salary-form" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h2>Add New Employee</h2>
              <button className="close-btn" onClick={() => setShowAddForm(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="form-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    value={newEmployee.employeeId}
                    onChange={(e) => setNewEmployee({...newEmployee, employeeId: e.target.value})}
                    placeholder="EMP-XXX"
                  />
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                    placeholder="Job Title"
                  />
                </div>
                <div className="form-group">
                  <label>Base Salary ($)</label>
                  <input
                    type="number"
                    value={newEmployee.baseSalary}
                    onChange={(e) => setNewEmployee({...newEmployee, baseSalary: Number(e.target.value)})}
                    placeholder="5000"
                  />
                </div>
                <div className="form-group">
                  <label>Housing Allowance ($)</label>
                  <input
                    type="number"
                    value={newEmployee.housingAllowance}
                    onChange={(e) => setNewEmployee({...newEmployee, housingAllowance: Number(e.target.value)})}
                    placeholder="500"
                  />
                </div>
                <div className="form-group">
                  <label>Transport Allowance ($)</label>
                  <input
                    type="number"
                    value={newEmployee.transportAllowance}
                    onChange={(e) => setNewEmployee({...newEmployee, transportAllowance: Number(e.target.value)})}
                    placeholder="200"
                  />
                </div>
                <div className="form-group">
                  <label>Medical Allowance ($)</label>
                  <input
                    type="number"
                    value={newEmployee.medicalAllowance}
                    onChange={(e) => setNewEmployee({...newEmployee, medicalAllowance: Number(e.target.value)})}
                    placeholder="300"
                  />
                </div>
                <div className="form-group">
                  <label>Performance Bonus ($)</label>
                  <input
                    type="number"
                    value={newEmployee.performanceBonus}
                    onChange={(e) => setNewEmployee({...newEmployee, performanceBonus: Number(e.target.value)})}
                    placeholder="500"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="secondary-btn" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button className="primary-btn" onClick={handleAddEmployee}>
                  <FontAwesomeIcon icon={faSave} />
                  Add Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Table */}
      <div className="salary-table-container">
        <table className="salary-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Base Salary</th>
              <th>Allowances</th>
              <th>Bonus</th>
              <th>Total Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id}>
                <td className="employee-info">
                  <div className="employee-details">
                    <div className="employee-avatar">
                      <FontAwesomeIcon icon={faUserTie} />
                    </div>
                    <div>
                      <span className="employee-name">{employee.name}</span>
                      <span className="employee-id">{employee.employeeId}</span>
                      <span className="employee-position">{employee.position}</span>
                    </div>
                  </div>
                </td>
                <td className="department">
                  <span className="department-badge">
                    <FontAwesomeIcon icon={faBuilding} />
                    {employee.department}
                  </span>
                </td>
                <td className="base-salary">
                  <span className="amount">${employee.baseSalary.toLocaleString()}</span>
                </td>
                <td className="allowances">
                  <div className="allowance-breakdown">
                    <span>H: ${employee.housingAllowance}</span>
                    <span>T: ${employee.transportAllowance}</span>
                    <span>M: ${employee.medicalAllowance}</span>
                  </div>
                  <span className="total-allowances">
                    ${(employee.housingAllowance + employee.transportAllowance + employee.medicalAllowance).toLocaleString()}
                  </span>
                </td>
                <td className="bonus">
                  <span className="amount bonus-amount">${employee.performanceBonus.toLocaleString()}</span>
                </td>
                <td className="total-salary">
                  <span className="amount total-amount">${employee.totalSalary.toLocaleString()}</span>
                </td>
                <td className="status">
                  <span className="status-badge active">
                    {employee.status}
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEditEmployee(employee)}
                    title="Edit"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteEmployee(employee.id)}
                    title="Delete"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="salary-form-overlay" onClick={() => setEditingEmployee(null)}>
          <div className="salary-form" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h2>Edit Employee Salary</h2>
              <button className="close-btn" onClick={() => setEditingEmployee(null)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="form-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    value={editingEmployee.employeeId}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editingEmployee.name}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={editingEmployee.department}
                    onChange={(e) => setEditingEmployee({...editingEmployee, department: e.target.value})}
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    value={editingEmployee.position}
                    onChange={(e) => setEditingEmployee({...editingEmployee, position: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Base Salary ($)</label>
                  <input
                    type="number"
                    value={editingEmployee.baseSalary}
                    onChange={(e) => setEditingEmployee({...editingEmployee, baseSalary: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Housing Allowance ($)</label>
                  <input
                    type="number"
                    value={editingEmployee.housingAllowance}
                    onChange={(e) => setEditingEmployee({...editingEmployee, housingAllowance: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Transport Allowance ($)</label>
                  <input
                    type="number"
                    value={editingEmployee.transportAllowance}
                    onChange={(e) => setEditingEmployee({...editingEmployee, transportAllowance: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Medical Allowance ($)</label>
                  <input
                    type="number"
                    value={editingEmployee.medicalAllowance}
                    onChange={(e) => setEditingEmployee({...editingEmployee, medicalAllowance: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Performance Bonus ($)</label>
                  <input
                    type="number"
                    value={editingEmployee.performanceBonus}
                    onChange={(e) => setEditingEmployee({...editingEmployee, performanceBonus: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="salary-preview">
                <h3>Salary Preview</h3>
                <div className="preview-item">
                  <span>Base Salary:</span>
                  <span>${editingEmployee.baseSalary.toLocaleString()}</span>
                </div>
                <div className="preview-item">
                  <span>Total Allowances:</span>
                  <span>${(editingEmployee.housingAllowance + editingEmployee.transportAllowance + editingEmployee.medicalAllowance).toLocaleString()}</span>
                </div>
                <div className="preview-item">
                  <span>Performance Bonus:</span>
                  <span>${editingEmployee.performanceBonus.toLocaleString()}</span>
                </div>
                <div className="preview-item total">
                  <span>Total Salary:</span>
                  <span>${calculateTotalSalary(editingEmployee).toLocaleString()}</span>
                </div>
              </div>
              <div className="form-actions">
                <button className="secondary-btn" onClick={() => setEditingEmployee(null)}>
                  Cancel
                </button>
                <button className="primary-btn" onClick={handleSaveEmployee}>
                  <FontAwesomeIcon icon={faSave} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSalaryManagement;
