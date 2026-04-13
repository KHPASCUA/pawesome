import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faClock,
  faUserCheck,
  faUserTimes,
  faExclamationTriangle,
  faSpinner,
  faSearch,
  faFilter,
  faDownload,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faFileExcel,
  faFilePdf,
  faCheckCircle,
  faTimesCircle,
  faSort,
  faChevronDown,
  faChevronUp,
  faSave,
  faCancel,
  faBell,
  faChartBar,
  faList,
  faUser,
  faDollarSign,
  faHourglassHalf,
  faFingerprint,
  faHandPaper,
  faUsers,
  faCalendarDay,
  faCalendarWeek,
  faCalendar,
  faInfoCircle,
  faChevronLeft,
  faChevronRight,
  faSync,
  faCoffee,
  faHome,
  faBriefcase,
  faStethoscope,
  faCashRegister,
  faBox,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const ManagerAttendance = () => {
  // State management
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState("day"); // day, week, month
  const [refreshing, setRefreshing] = useState(false);

  // Mock attendance data ready for backend integration
  const mockAttendanceData = [
    {
      id: 1,
      employeeId: "EMP001",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@pawesome.com",
      department: "Veterinary",
      role: "Senior Veterinarian",
      date: "2024-04-13",
      checkIn: "08:30",
      checkOut: "17:45",
      breakTime: "01:00",
      totalHours: "08:15",
      status: "present",
      overtime: "00:15",
      late: false,
      earlyLeave: false,
      location: "Main Office",
      notes: "Regular workday",
      approvedBy: "Manager",
      salaryRate: 45.00,
      dailyEarnings: 368.75,
    },
    {
      id: 2,
      employeeId: "EMP002",
      name: "Michael Chen",
      email: "michael.chen@pawesome.com",
      department: "Customer Service",
      role: "Customer Service Manager",
      date: "2024-04-13",
      checkIn: "09:15",
      checkOut: "18:30",
      breakTime: "01:00",
      totalHours: "08:15",
      status: "present",
      overtime: "00:15",
      late: true,
      earlyLeave: false,
      location: "Main Office",
      notes: "Late arrival - traffic",
      approvedBy: "Manager",
      salaryRate: 25.00,
      dailyEarnings: 206.25,
    },
    {
      id: 3,
      employeeId: "EMP003",
      name: "Emily Rodriguez",
      email: "emily.rodriguez@pawesome.com",
      department: "Inventory",
      role: "Inventory Manager",
      date: "2024-04-13",
      checkIn: "07:45",
      checkOut: "16:30",
      breakTime: "00:45",
      totalHours: "08:00",
      status: "present",
      overtime: "00:00",
      late: false,
      earlyLeave: true,
      location: "Warehouse",
      notes: "Early leave - personal",
      approvedBy: "Manager",
      salaryRate: 28.00,
      dailyEarnings: 224.00,
    },
    {
      id: 4,
      employeeId: "EMP004",
      name: "James Wilson",
      email: "james.wilson@pawesome.com",
      department: "Cashier",
      role: "Senior Cashier",
      date: "2024-04-13",
      checkIn: null,
      checkOut: null,
      breakTime: null,
      totalHours: "00:00",
      status: "absent",
      overtime: "00:00",
      late: false,
      earlyLeave: false,
      location: null,
      notes: "Sick leave",
      approvedBy: "HR",
      salaryRate: 18.00,
      dailyEarnings: 0.00,
    },
    {
      id: 5,
      employeeId: "EMP005",
      name: "Dr. Robert Kim",
      email: "robert.kim@pawesome.com",
      department: "Veterinary",
      role: "Veterinary Technician",
      date: "2024-04-13",
      checkIn: "08:00",
      checkOut: "17:00",
      breakTime: "01:00",
      totalHours: "08:00",
      status: "present",
      overtime: "00:00",
      late: false,
      earlyLeave: false,
      location: "Main Office",
      notes: "Regular workday",
      approvedBy: "Manager",
      salaryRate: 32.00,
      dailyEarnings: 256.00,
    },
    {
      id: 6,
      employeeId: "EMP006",
      name: "Lisa Anderson",
      email: "lisa.anderson@pawesome.com",
      department: "Customer Service",
      role: "Customer Service Rep",
      date: "2024-04-13",
      checkIn: "08:45",
      checkOut: "17:15",
      breakTime: "01:00",
      totalHours: "07:30",
      status: "present",
      overtime: "00:00",
      late: true,
      earlyLeave: false,
      location: "Main Office",
      notes: "Late arrival",
      approvedBy: "Manager",
      salaryRate: 20.00,
      dailyEarnings: 150.00,
    },
    {
      id: 7,
      employeeId: "EMP007",
      name: "Carlos Martinez",
      email: "carlos.martinez@pawesome.com",
      department: "Inventory",
      role: "Inventory Staff",
      date: "2024-04-13",
      checkIn: "07:30",
      checkOut: "16:00",
      breakTime: "00:30",
      totalHours: "08:00",
      status: "present",
      overtime: "00:00",
      late: false,
      earlyLeave: true,
      location: "Warehouse",
      notes: "Early leave - approved",
      approvedBy: "Manager",
      salaryRate: 22.00,
      dailyEarnings: 176.00,
    },
    {
      id: 8,
      employeeId: "EMP008",
      name: "Jennifer Taylor",
      email: "jennifer.taylor@pawesome.com",
      department: "Cashier",
      role: "Cashier",
      date: "2024-04-13",
      checkIn: "09:00",
      checkOut: "18:00",
      breakTime: "01:00",
      totalHours: "08:00",
      status: "present",
      overtime: "00:00",
      late: true,
      earlyLeave: false,
      location: "Main Office",
      notes: "Late arrival",
      approvedBy: "Manager",
      salaryRate: 18.00,
      dailyEarnings: 144.00,
    },
  ];

  // API endpoints for backend integration
  const API_ENDPOINTS = {
    GET_ATTENDANCE: '/api/attendance',
    CREATE_ATTENDANCE: '/api/attendance',
    UPDATE_ATTENDANCE: '/api/attendance/:id',
    DELETE_ATTENDANCE: '/api/attendance/:id',
    GET_EMPLOYEES: '/api/employees',
    EXPORT_ATTENDANCE: '/api/attendance/export',
    BULK_UPDATE: '/api/attendance/bulk',
  };

  // Load attendance data
  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      try {
        // Simulate API call - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Actual API call would be:
        // const response = await fetch(`${API_ENDPOINTS.GET_ATTENDANCE}?date=${selectedDate}`);
        // const data = await response.json();
        // setAttendance(data);
        
        setAttendance(mockAttendanceData);
      } catch (error) {
        console.error('Failed to load attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [selectedDate]);

  // Filter and sort attendance
  const filteredAndSortedAttendance = useMemo(() => {
    let filtered = attendance;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply department filter
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(record => record.department === selectedDepartment);
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(record => record.status === selectedStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "checkIn" || sortBy === "checkOut") {
        aValue = aValue || "00:00";
        bValue = bValue || "00:00";
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [attendance, searchTerm, selectedDepartment, selectedStatus, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedAttendance.length / itemsPerPage);
  const paginatedAttendance = filteredAndSortedAttendance.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique departments and statuses for filters
  const departments = useMemo(() => {
    const depts = [...new Set(attendance.map(record => record.department))];
    return depts.sort();
  }, [attendance]);

  const statuses = useMemo(() => {
    const statusList = [...new Set(attendance.map(record => record.status))];
    return statusList.sort();
  }, [attendance]);

  // Statistics
  const statistics = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter(record => record.status === 'present').length;
    const absent = attendance.filter(record => record.status === 'absent').length;
    const late = attendance.filter(record => record.late).length;
    const earlyLeave = attendance.filter(record => record.earlyLeave).length;
    const totalHours = attendance.reduce((sum, record) => {
      if (record.totalHours && record.totalHours !== "00:00") {
        const [hours, minutes] = record.totalHours.split(':').map(Number);
        return sum + hours + minutes / 60;
      }
      return sum;
    }, 0);
    const totalEarnings = attendance.reduce((sum, record) => sum + record.dailyEarnings, 0);

    return { total, present, absent, late, earlyLeave, totalHours, totalEarnings };
  }, [attendance]);

  // Event handlers
  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }, [sortBy, sortOrder]);

  const handleViewDetails = useCallback((attendanceRecord) => {
    setSelectedAttendance(attendanceRecord);
    setShowDetailsModal(true);
  }, []);

  const handleEdit = useCallback((attendanceRecord) => {
    setSelectedAttendance(attendanceRecord);
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback((attendanceRecord) => {
    setSelectedAttendance(attendanceRecord);
    setShowDeleteModal(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In production: refetch data from API
    } catch (error) {
      console.error('Failed to refresh attendance:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const confirmDelete = useCallback(() => {
    if (selectedAttendance) {
      // API call: DELETE /api/attendance/:id
      setAttendance(prev => prev.filter(record => record.id !== selectedAttendance.id));
      setShowDeleteModal(false);
      setSelectedAttendance(null);
    }
  }, [selectedAttendance]);

  const exportToExcel = useCallback(async () => {
    try {
      // API call: POST /api/attendance/export with format: 'excel'
      console.log('Exporting to Excel...');
      // const response = await fetch(API_ENDPOINTS.EXPORT_ATTENDANCE, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ format: 'excel', date: selectedDate, filters: { selectedDepartment, selectedStatus } })
      // });
    } catch (error) {
      console.error('Failed to export to Excel:', error);
    }
  }, [selectedDate, selectedDepartment, selectedStatus]);

  const exportToPDF = useCallback(async () => {
    try {
      // API call: POST /api/attendance/export with format: 'pdf'
      console.log('Exporting to PDF...');
      // const response = await fetch(API_ENDPOINTS.EXPORT_ATTENDANCE, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ format: 'pdf', date: selectedDate, filters: { selectedDepartment, selectedStatus } })
      // });
    } catch (error) {
      console.error('Failed to export to PDF:', error);
    }
  }, [selectedDate, selectedDepartment, selectedStatus]);

  if (loading) {
    return (
      <div className="manager-attendance loading">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} className="spinning" />
          <span>Loading attendance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-attendance">
      {/* Header */}
      <div className="attendance-header">
        <div className="header-left">
          <h1>
            <FontAwesomeIcon icon={faCalendarAlt} />
            Attendance Management
          </h1>
          <p>Track and manage employee attendance records</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleAddNew}>
            <FontAwesomeIcon icon={faPlus} />
            Add Record
          </button>
          <button className="btn btn-secondary" onClick={handleRefresh} disabled={refreshing}>
            <FontAwesomeIcon icon={faSync} className={refreshing ? 'spinning' : ''} />
            Refresh
          </button>
          <div className="export-dropdown">
            <button className="btn btn-secondary">
              <FontAwesomeIcon icon={faDownload} />
              Export
              <FontAwesomeIcon icon={faChevronDown} />
            </button>
            <div className="export-menu">
              <button onClick={exportToExcel}>
                <FontAwesomeIcon icon={faFileExcel} />
                Export to Excel
              </button>
              <button onClick={exportToPDF}>
                <FontAwesomeIcon icon={faFilePdf} />
                Export to PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="stat-info">
            <h3>{statistics.total}</h3>
            <p>Total Employees</p>
          </div>
        </div>
        <div className="stat-card present">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUserCheck} />
          </div>
          <div className="stat-info">
            <h3>{statistics.present}</h3>
            <p>Present</p>
          </div>
        </div>
        <div className="stat-card absent">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUserTimes} />
          </div>
          <div className="stat-info">
            <h3>{statistics.absent}</h3>
            <p>Absent</p>
          </div>
        </div>
        <div className="stat-card late">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="stat-info">
            <h3>{statistics.late}</h3>
            <p>Late</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faDollarSign} />
          </div>
          <div className="stat-info">
            <h3>${statistics.totalEarnings.toFixed(2)}</h3>
            <p>Total Earnings</p>
          </div>
        </div>
      </div>

      {/* Date and View Controls */}
      <div className="date-controls">
        <div className="date-selector">
          <label htmlFor="date-select">Select Date:</label>
          <input
            type="date"
            id="date-select"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="view-mode-selector">
          <button
            className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            <FontAwesomeIcon icon={faCalendarDay} />
            Day
          </button>
          <button
            className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            <FontAwesomeIcon icon={faCalendarWeek} />
            Week
          </button>
          <button
            className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            <FontAwesomeIcon icon={faCalendar} />
            Month
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-bar">
          <div className="search-input">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search by name, email, employee ID, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>
          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FontAwesomeIcon icon={faFilter} />
            Filters
            {showFilters && <FontAwesomeIcon icon={faChevronUp} />}
            {!showFilters && <FontAwesomeIcon icon={faChevronDown} />}
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'present' ? 'Present' : status === 'absent' ? 'Absent' : status}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="department">Department</option>
                <option value="checkIn">Check In</option>
                <option value="checkOut">Check Out</option>
                <option value="totalHours">Total Hours</option>
                <option value="status">Status</option>
              </select>
            </div>
            <button
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              <FontAwesomeIcon icon={faSort} />
              {sortOrder === "asc" ? "A-Z" : "Z-A"}
            </button>
          </div>
        )}
      </div>

      {/* Attendance Table */}
      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("name")}>
                Employee
                {sortBy === "name" && (
                  <FontAwesomeIcon icon={sortOrder === "asc" ? faChevronUp : faChevronDown} />
                )}
              </th>
              <th onClick={() => handleSort("department")}>
                Department
                {sortBy === "department" && (
                  <FontAwesomeIcon icon={sortOrder === "asc" ? faChevronUp : faChevronDown} />
                )}
              </th>
              <th onClick={() => handleSort("checkIn")}>
                Check In
                {sortBy === "checkIn" && (
                  <FontAwesomeIcon icon={sortOrder === "asc" ? faChevronUp : faChevronDown} />
                )}
              </th>
              <th onClick={() => handleSort("checkOut")}>
                Check Out
                {sortBy === "checkOut" && (
                  <FontAwesomeIcon icon={sortOrder === "asc" ? faChevronUp : faChevronDown} />
                )}
              </th>
              <th onClick={() => handleSort("totalHours")}>
                Total Hours
                {sortBy === "totalHours" && (
                  <FontAwesomeIcon icon={sortOrder === "asc" ? faChevronUp : faChevronDown} />
                )}
              </th>
              <th onClick={() => handleSort("status")}>
                Status
                {sortBy === "status" && (
                  <FontAwesomeIcon icon={sortOrder === "asc" ? faChevronUp : faChevronDown} />
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAttendance.map((record) => (
              <tr key={record.id}>
                <td className="employee-info">
                  <div className="employee-details">
                    <div className="employee-name">{record.name}</div>
                    <div className="employee-id">{record.employeeId}</div>
                    <div className="employee-email">{record.email}</div>
                  </div>
                </td>
                <td>
                  <span className="department-badge">{record.department}</span>
                </td>
                <td className="time-cell">
                  <div className="time-info">
                    {record.checkIn ? (
                      <>
                        <FontAwesomeIcon icon={faClock} />
                        {record.checkIn}
                      </>
                    ) : (
                      <span className="no-time">--</span>
                    )}
                    {record.late && <span className="late-badge">Late</span>}
                  </div>
                </td>
                <td className="time-cell">
                  <div className="time-info">
                    {record.checkOut ? (
                      <>
                        <FontAwesomeIcon icon={faClock} />
                        {record.checkOut}
                      </>
                    ) : (
                      <span className="no-time">--</span>
                    )}
                    {record.earlyLeave && <span className="early-leave-badge">Early</span>}
                  </div>
                </td>
                <td className="hours-cell">
                  <div className="hours-info">
                    <span className="total-hours">{record.totalHours}</span>
                    {record.overtime && record.overtime !== "00:00" && (
                      <span className="overtime">+{record.overtime}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${record.status}`}>
                    {record.status === 'present' ? 'Present' : 'Absent'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      onClick={() => handleViewDetails(record)}
                      title="View Details"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(record)}
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(record)}
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedAttendance.length)} of {filteredAndSortedAttendance.length} records
          </div>
          <div className="pagination-controls">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={currentPage === i + 1 ? 'active' : ''}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAttendance && (
        <div className="modal-overlay">
          <div className="modal attendance-details-modal">
            <div className="modal-header">
              <h2>Attendance Details</h2>
              <button onClick={() => setShowDetailsModal(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="modal-content">
              <div className="attendance-details">
                <div className="detail-section">
                  <h3>Employee Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Name:</label>
                      <span>{selectedAttendance.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Employee ID:</label>
                      <span>{selectedAttendance.employeeId}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedAttendance.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Department:</label>
                      <span>{selectedAttendance.department}</span>
                    </div>
                    <div className="detail-item">
                      <label>Role:</label>
                      <span>{selectedAttendance.role}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Attendance Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Date:</label>
                      <span>{selectedAttendance.date}</span>
                    </div>
                    <div className="detail-item">
                      <label>Check In:</label>
                      <span>{selectedAttendance.checkIn || '--'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Check Out:</label>
                      <span>{selectedAttendance.checkOut || '--'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Break Time:</label>
                      <span>{selectedAttendance.breakTime || '--'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Total Hours:</label>
                      <span>{selectedAttendance.totalHours}</span>
                    </div>
                    <div className="detail-item">
                      <label>Overtime:</label>
                      <span>{selectedAttendance.overtime}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span className={`status-badge ${selectedAttendance.status}`}>
                        {selectedAttendance.status === 'present' ? 'Present' : 'Absent'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Location:</label>
                      <span>{selectedAttendance.location || '--'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Financial Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Salary Rate:</label>
                      <span>${selectedAttendance.salaryRate.toFixed(2)}/hour</span>
                    </div>
                    <div className="detail-item">
                      <label>Daily Earnings:</label>
                      <span>${selectedAttendance.dailyEarnings.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Additional Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Notes:</label>
                      <span>{selectedAttendance.notes || 'No notes'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Approved By:</label>
                      <span>{selectedAttendance.approvedBy || 'Not approved'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => {
                setShowDetailsModal(false);
                handleEdit(selectedAttendance);
              }}>
                <FontAwesomeIcon icon={faEdit} />
                Edit Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAttendance && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="modal-content">
              <div className="warning-message">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <p>Are you sure you want to delete the attendance record for {selectedAttendance.name}?</p>
                <p>This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                <FontAwesomeIcon icon={faTrash} />
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerAttendance;