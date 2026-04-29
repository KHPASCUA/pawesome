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
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { formatCurrency } from "../../utils/currency";
import { attendanceApi } from "../../api/attendance";

// Utility: Safe Laravel API response parser
const parseLaravelResponse = (response) => {
  if (!response) return [];
  
  // Handle direct array response
  if (Array.isArray(response)) return response;
  
  // Handle Laravel standard format: { success: true, data: [...] }
  if (response.success && Array.isArray(response.data)) return response.data;
  
  // Handle alternative Laravel format: { data: [...] }
  if (Array.isArray(response.data)) return response.data;
  
  // Handle format: { attendance: [...] }
  if (Array.isArray(response.attendance)) return response.attendance;
  
  // Handle format: { records: [...] }
  if (Array.isArray(response.records)) return response.records;
  
  // Handle format: { results: [...] }
  if (Array.isArray(response.results)) return response.results;
  
  // Handle single object wrapped in data
  if (response.data && typeof response.data === 'object') return [response.data];
  
  // Handle direct object (single record)
  if (typeof response === 'object' && !Array.isArray(response) && response.id) return [response];
  
  console.warn('Unexpected API response format:', response);
  return [];
};

// Utility: Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
};

const ManagerAttendance = () => {
  // State management
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const [departments, setDepartments] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Demo data for fallback
  const getDemoAttendance = useCallback(() => {
    return [
      {
        id: 1,
        employeeId: "EMP001",
        name: "John Doe",
        email: "john@pawesome.com",
        department: "Reception",
        role: "Staff",
        date: selectedDate,
        checkIn: "08:00 AM",
        checkOut: "05:00 PM",
        totalHours: "9:00",
        status: "present",
        overtime: "00:00",
        late: false,
        earlyLeave: false,
        dailyEarnings: 150,
      },
      {
        id: 2,
        employeeId: "EMP002",
        name: "Jane Smith",
        email: "jane@pawesome.com",
        department: "Veterinary",
        role: "Vet",
        date: selectedDate,
        checkIn: "09:10 AM",
        checkOut: "06:00 PM",
        totalHours: "8:50",
        status: "present",
        overtime: "01:00",
        late: true,
        earlyLeave: false,
        dailyEarnings: 200,
      },
      {
        id: 3,
        employeeId: "EMP003",
        name: "Mike Johnson",
        email: "mike@pawesome.com",
        department: "Inventory",
        role: "Staff",
        date: selectedDate,
        checkIn: null,
        checkOut: null,
        totalHours: "00:00",
        status: "absent",
        overtime: "00:00",
        late: false,
        earlyLeave: false,
        dailyEarnings: 0,
      },
    ];
  }, [selectedDate]);

  // Load attendance data from API
  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { date: selectedDate };
        if (selectedDepartment !== "all") {
          params.department = selectedDepartment;
        }
        if (selectedStatus !== "all") {
          params.status = selectedStatus;
        }
        if (debouncedSearchTerm) {
          params.search = debouncedSearchTerm;
        }

        let dataList = [];
        
        try {
          const response = await attendanceApi.getAll(params);
          dataList = parseLaravelResponse(response);
        } catch (apiErr) {
          console.warn("API failed, using demo data:", apiErr);
          dataList = getDemoAttendance();
        }
        
        if (dataList.length > 0) {
          // Transform API data to match component structure
          const transformedData = dataList.map(record => ({
            id: record.id,
            employeeId: record.user?.id ? `EMP${String(record.user.id).padStart(3, '0')}` : 
                       record.employee_id ? `EMP${String(record.employee_id).padStart(3, '0')}` : 
                       record.employeeId || 'N/A',
            name: record.user?.name || record.employee_name || record.name || 'Unknown',
            email: record.user?.email || record.email || '',
            department: record.user?.department || record.department || 'Unassigned',
            role: record.user?.role || record.role || 'Staff',
            date: record.date || selectedDate,
            checkIn: record.check_in || record.checkIn,
            checkOut: record.check_out || record.checkOut,
            breakTime: record.break_time || record.breakTime,
            totalHours: record.total_hours ? String(record.total_hours).replace('.', ':') : 
                        record.totalHours || '00:00',
            status: record.status || 'absent',
            overtime: record.overtime_hours ? String(record.overtime_hours).replace('.', ':') : 
                      record.overtime || '00:00',
            late: record.is_late || record.late || false,
            earlyLeave: record.is_early_leave || record.earlyLeave || false,
            location: record.location || '',
            notes: record.notes || '',
            approvedBy: record.approver?.name || record.approved_by || 'System',
            salaryRate: record.salary_rate || record.salaryRate || 0,
            dailyEarnings: record.daily_earnings || record.dailyEarnings || 0,
          }));
          setAttendance(transformedData);
          
          // Extract unique departments
          const uniqueDepts = [...new Set(transformedData.map(r => r.department))].filter(Boolean);
          setDepartments(uniqueDepts);
        } else {
          // API returned empty, use demo data
          console.warn("API returned empty data, using demo attendance");
          const demoData = getDemoAttendance();
          setAttendance(demoData);
          const uniqueDepts = [...new Set(demoData.map(r => r.department))].filter(Boolean);
          setDepartments(uniqueDepts);
        }
      } catch (error) {
        console.error('Failed to load attendance:', error);
        setError(error.message || 'Failed to load attendance data');
        // Use demo data on error
        setAttendance(getDemoAttendance());
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [selectedDate, selectedDepartment, selectedStatus, debouncedSearchTerm, getDemoAttendance]);

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

  // Get unique statuses for filters
  const statuses = useMemo(() => {
    const statusList = [...new Set(attendance.map(record => record.status))];
    return statusList.sort();
  }, [attendance]);

  // Statistics with Payroll Integration
  const statistics = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter(record => record.status === 'present').length;
    const absent = attendance.filter(record => record.status === 'absent').length;
    const late = attendance.filter(record => record.late).length;
    const earlyLeave = attendance.filter(record => record.earlyLeave).length;
    
    // Daily rate for calculations
    const dailyRate = 500; // ₱500 per day
    
    // Calculate total earnings based on attendance
    const totalEarnings = attendance.reduce((sum, record) => {
      if (record.status === 'present') return sum + dailyRate;
      if (record.status === 'present' && record.late) return sum + (dailyRate * 0.8); // 20% deduction for late
      return sum;
    }, 0);
    
    const totalHours = attendance.reduce((sum, record) => {
      if (record.totalHours && record.totalHours !== "00:00") {
        const [hours, minutes] = record.totalHours.split(':').map(Number);
        return sum + hours + minutes / 60;
      }
      return sum;
    }, 0);
    
    // Payroll metrics
    const avgHours = total > 0 ? (totalHours / total).toFixed(2) : 0;
    const overtimeHours = attendance.reduce((sum, record) => {
      if (record.overtime && record.overtime !== "00:00") {
        const [hours, minutes] = record.overtime.split(':').map(Number);
        return sum + hours + minutes / 60;
      }
      return sum;
    }, 0);
    
    // Late deductions: ₱100 per late arrival
    const lateDeductions = late * 100;
    
    // Overtime bonus: ₱50 per OT hour
    const overtimeBonus = overtimeHours * 50;
    
    // Net payroll calculation
    const netPayroll = totalEarnings - lateDeductions + overtimeBonus;

    return { 
      total, present, absent, late, earlyLeave, totalHours, totalEarnings,
      avgHours, overtimeHours: overtimeHours.toFixed(2), lateDeductions, overtimeBonus: overtimeBonus.toFixed(2), netPayroll
    };
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
          {/* Notification Bell Dropdown */}
          <div className="notification-wrapper">
            <button
              className="notif-btn"
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            >
              <FontAwesomeIcon icon={faBell} />
            </button>

            {showNotificationDropdown && (
              <div className="notification-dropdown">
                <div className="notif-header">
                  <span>Notifications</span>
                  <button
                    className="notif-close"
                    onClick={() => setShowNotificationDropdown(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="notif-empty">
                  <FontAwesomeIcon icon={faBell} />
                  <span>No new notifications</span>
                </div>
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={handleAddNew}>
            <FontAwesomeIcon icon={faPlus} />
            Add Record
          </button>
          <button className="btn btn-secondary" onClick={handleRefresh} disabled={refreshing}>
            <FontAwesomeIcon icon={faSync} className={refreshing ? 'spinning' : ''} />
            Refresh
          </button>
          <div className="export-actions">
            <button className="export-btn" onClick={exportToExcel}>
              <FontAwesomeIcon icon={faFileExcel} />
              Export Excel
            </button>
            <button className="export-btn" onClick={exportToPDF}>
              <FontAwesomeIcon icon={faFilePdf} />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Payroll Integration Panel */}
      <div className="payroll-integration-panel">
        <div className="panel-header">
          <FontAwesomeIcon icon={faCashRegister} />
          <span>Payroll Integration</span>
        </div>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "8px 0" }}>
          Attendance automatically affects payroll calculations. Late arrivals & absences apply deductions.
        </p>
        <div className="payroll-stats">
          <div className="payroll-stat">
            <label>Avg Hours:</label>
            <span>{statistics.avgHours}h</span>
          </div>
          <div className="payroll-stat">
            <label>OT Hours:</label>
            <span>{Number(statistics.overtimeHours || 0).toFixed(2)}h</span>
          </div>
          <div className="payroll-stat deduction">
            <label>Late Deductions:</label>
            <span>-{formatCurrency(statistics.lateDeductions)}</span>
          </div>
          <div className="payroll-stat bonus">
            <label>OT Bonus:</label>
            <span>+{formatCurrency(statistics.overtimeBonus)}</span>
          </div>
          <div className="payroll-stat net">
            <label>Net Payroll:</label>
            <span>{formatCurrency(statistics.netPayroll)}</span>
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
        <div className="stat-card earnings">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faDollarSign} />
          </div>
          <div className="stat-info">
            <h3>{formatCurrency(statistics.totalEarnings)}</h3>
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

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Loading attendance data...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Attendance Table */}
      {!loading && (
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

          {/* Empty State */}
          {paginatedAttendance.length === 0 && (
            <div className="no-data">
              No attendance records found.
            </div>
          )}
        </div>
      )}

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
                      <span>{formatCurrency(selectedAttendance.salaryRate)}/hour</span>
                    </div>
                    <div className="detail-item">
                      <label>Daily Earnings:</label>
                      <span>{formatCurrency(selectedAttendance.dailyEarnings)}</span>
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
