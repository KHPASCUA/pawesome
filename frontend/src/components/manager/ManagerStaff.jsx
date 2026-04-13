import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserPlus,
  faUserEdit,
  faUserTimes,
  faSearch,
  faFilter,
  faSort,
  faDownload,
  faFileExcel,
  faFilePdf,
  faEye,
  faTrash,
  faEdit,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faCalendarAlt,
  faClock,
  faBriefcase,
  faGraduationCap,
  faAward,
  faStar,
  faHeart,
  faStethoscope,
  faCut,
  faBox,
  faCashRegister,
  faPhoneAlt,
  faUserCheck,
  faUserShield,
  faChartBar,
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
  faBell,
  faCamera,
  faImage,
  faUpload,
  faSave,
  faCancel,
  faPlus,
  faMinus,
  faChevronDown,
  faChevronUp,
  faAngleDown,
  faAngleUp,
  faEllipsisV,
  faCog,
  faKey,
  faLock,
  faUnlock,
  faBan,
  faCheck,
  faTimes,
  faList,
  faUser,
  faDollarSign,
  faHospital,
  faIdCard,
  faNotesMedical,
  faUserMd,
  faUserNurse,
  faVenusMars,
  faBirthdayCake,
  faLanguage,
  faFlag,
  faGlobe,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const ManagerStaff = () => {
  // State management
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Mock data for demonstration
  const mockStaff = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@pawesome.com",
      phone: "+1-555-0123",
      department: "Veterinary",
      role: "Senior Veterinarian",
      status: "active",
      joinDate: "2020-03-15",
      avatar: null,
      specialization: "Small Animals",
      experience: "8 years",
      education: "DVM - Cornell University",
      certifications: ["Licensed Veterinarian", "Surgery Specialist"],
      languages: ["English", "Spanish"],
      schedule: "Mon-Fri 9AM-6PM",
      salary: "$85,000",
      performance: 4.8,
      lastLogin: "2024-04-13 08:30 AM",
      emergencyContact: "John Johnson - +1-555-0124",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@pawesome.com",
      phone: "+1-555-0125",
      department: "Customer Service",
      role: "Customer Service Manager",
      status: "active",
      joinDate: "2019-07-22",
      avatar: null,
      specialization: "Customer Relations",
      experience: "5 years",
      education: "BA Business Admin",
      certifications: ["Customer Service Excellence"],
      languages: ["English", "Mandarin"],
      schedule: "Mon-Sat 8AM-8PM",
      salary: "$45,000",
      performance: 4.6,
      lastLogin: "2024-04-13 07:45 AM",
      emergencyContact: "Lisa Chen - +1-555-0126",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@pawesome.com",
      phone: "+1-555-0127",
      department: "Inventory",
      role: "Inventory Manager",
      status: "active",
      joinDate: "2021-01-10",
      avatar: null,
      specialization: "Supply Chain",
      experience: "3 years",
      education: "BS Supply Chain Management",
      certifications: ["Inventory Management"],
      languages: ["English", "Spanish"],
      schedule: "Mon-Fri 7AM-5PM",
      salary: "$52,000",
      performance: 4.5,
      lastLogin: "2024-04-13 06:30 AM",
      emergencyContact: "Carlos Rodriguez - +1-555-0128",
    },
    {
      id: 4,
      name: "James Wilson",
      email: "james.wilson@pawesome.com",
      phone: "+1-555-0129",
      department: "Cashier",
      role: "Senior Cashier",
      status: "on_leave",
      joinDate: "2022-05-18",
      avatar: null,
      specialization: "Payment Processing",
      experience: "2 years",
      education: "High School Diploma",
      certifications: ["Cash Handling Certified"],
      languages: ["English"],
      schedule: "Part-time - Weekends",
      salary: "$28,000",
      performance: 4.3,
      lastLogin: "2024-04-10 02:15 PM",
      emergencyContact: "Mary Wilson - +1-555-0130",
    },
    {
      id: 5,
      name: "Dr. Robert Kim",
      email: "robert.kim@pawesome.com",
      phone: "+1-555-0131",
      department: "Veterinary",
      role: "Veterinary Technician",
      status: "active",
      joinDate: "2020-11-30",
      avatar: null,
      specialization: "Surgical Assistance",
      experience: "4 years",
      education: "Associates - Vet Tech",
      certifications: ["Certified Vet Tech", "Anesthesia"],
      languages: ["English", "Korean"],
      schedule: "Mon-Fri 8AM-6PM",
      salary: "$42,000",
      performance: 4.7,
      lastLogin: "2024-04-13 08:00 AM",
      emergencyContact: "Susan Kim - +1-555-0132",
    },
  ];

  // Load staff data
  useEffect(() => {
    const loadStaff = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStaff(mockStaff);
      } catch (error) {
        console.error('Failed to load staff:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStaff();
  }, []);

  // Filter and sort staff
  const filteredAndSortedStaff = useMemo(() => {
    let filtered = staff;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(person =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.phone.includes(searchTerm) ||
        person.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply department filter
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(person => person.department === selectedDepartment);
    }

    // Apply role filter
    if (selectedRole !== "all") {
      filtered = filtered.filter(person => person.role === selectedRole);
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(person => person.status === selectedStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "joinDate" || sortBy === "lastLogin") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [staff, searchTerm, selectedDepartment, selectedRole, selectedStatus, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedStaff.length / itemsPerPage);
  const paginatedStaff = filteredAndSortedStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique departments, roles, and statuses for filters
  const departments = useMemo(() => {
    const depts = [...new Set(staff.map(person => person.department))];
    return depts.sort();
  }, [staff]);

  const roles = useMemo(() => {
    const roleList = [...new Set(staff.map(person => person.role))];
    return roleList.sort();
  }, [staff]);

  const statuses = useMemo(() => {
    const statusList = [...new Set(staff.map(person => person.status))];
    return statusList.sort();
  }, [staff]);

  // Event handlers
  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }, [sortBy, sortOrder]);

  const handleViewDetails = useCallback((staffMember) => {
    setSelectedStaff(staffMember);
    setShowDetailsModal(true);
  }, []);

  const handleEdit = useCallback((staffMember) => {
    setSelectedStaff(staffMember);
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback((staffMember) => {
    setSelectedStaff(staffMember);
    setShowDeleteModal(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (selectedStaff) {
      setStaff(prev => prev.filter(person => person.id !== selectedStaff.id));
      setShowDeleteModal(false);
      setSelectedStaff(null);
    }
  }, [selectedStaff]);

  const exportToExcel = useCallback(() => {
    // Implementation for Excel export
    console.log('Exporting to Excel...');
  }, []);

  const exportToPDF = useCallback(() => {
    // Implementation for PDF export
    console.log('Exporting to PDF...');
  }, []);

  // Statistics
  const statistics = useMemo(() => {
    const total = staff.length;
    const active = staff.filter(person => person.status === 'active').length;
    const onLeave = staff.filter(person => person.status === 'on_leave').length;
    const avgPerformance = staff.reduce((sum, person) => sum + person.performance, 0) / total || 0;

    return { total, active, onLeave, avgPerformance };
  }, [staff]);

  if (loading) {
    return (
      <div className="manager-staff loading">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} className="spinning" />
          <span>Loading staff data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-staff">
      {/* Header */}
      <div className="staff-header">
        <div className="header-left">
          <h1>
            <FontAwesomeIcon icon={faUsers} />
            Staff Management
          </h1>
          <p>Manage your team members and their information</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleAddNew}>
            <FontAwesomeIcon icon={faUserPlus} />
            Add Staff
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
            <p>Total Staff</p>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUserCheck} />
          </div>
          <div className="stat-info">
            <h3>{statistics.active}</h3>
            <p>Active</p>
          </div>
        </div>
        <div className="stat-card leave">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCalendarAlt} />
          </div>
          <div className="stat-info">
            <h3>{statistics.onLeave}</h3>
            <p>On Leave</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faStar} />
          </div>
          <div className="stat-info">
            <h3>{statistics.avgPerformance.toFixed(1)}</h3>
            <p>Avg Performance</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-bar">
          <div className="search-input">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search staff by name, email, phone, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}>
                <FontAwesomeIcon icon={faTimes} />
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
              <label>Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
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
                    {status === 'active' ? 'Active' : status === 'on_leave' ? 'On Leave' : status}
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
                <option value="role">Role</option>
                <option value="status">Status</option>
                <option value="joinDate">Join Date</option>
                <option value="performance">Performance</option>
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

      {/* Staff Table */}
      <div className="staff-table-container">
        <table className="staff-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("name")}>
                Staff Member
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
              <th onClick={() => handleSort("role")}>
                Role
                {sortBy === "role" && (
                  <FontAwesomeIcon icon={sortOrder === "asc" ? faChevronUp : faChevronDown} />
                )}
              </th>
              <th>Contact</th>
              <th onClick={() => handleSort("status")}>
                Status
                {sortBy === "status" && (
                  <FontAwesomeIcon icon={sortOrder === "asc" ? faChevronUp : faChevronDown} />
                )}
              </th>
              <th onClick={() => handleSort("performance")}>
                Performance
                {sortBy === "performance" && (
                  <FontAwesomeIcon icon={sortOrder === "asc" ? faChevronUp : faChevronDown} />
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStaff.map((staffMember) => (
              <tr key={staffMember.id}>
                <td className="staff-info">
                  <div className="staff-avatar">
                    {staffMember.avatar ? (
                      <img src={staffMember.avatar} alt={staffMember.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                    )}
                  </div>
                  <div className="staff-details">
                    <div className="staff-name">{staffMember.name}</div>
                    <div className="staff-email">{staffMember.email}</div>
                  </div>
                </td>
                <td>
                  <span className="department-badge">{staffMember.department}</span>
                </td>
                <td>{staffMember.role}</td>
                <td className="contact-info">
                  <div className="contact-item">
                    <FontAwesomeIcon icon={faPhone} />
                    {staffMember.phone}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${staffMember.status}`}>
                    {staffMember.status === 'active' ? 'Active' : 'On Leave'}
                  </span>
                </td>
                <td>
                  <div className="performance-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          className={i < Math.floor(staffMember.performance) ? 'filled' : 'empty'}
                        />
                      ))}
                    </div>
                    <span>{staffMember.performance}</span>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      onClick={() => handleViewDetails(staffMember)}
                      title="View Details"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(staffMember)}
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(staffMember)}
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
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedStaff.length)} of {filteredAndSortedStaff.length} staff
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
      {showDetailsModal && selectedStaff && (
        <div className="modal-overlay">
          <div className="modal staff-details-modal">
            <div className="modal-header">
              <h2>Staff Details</h2>
              <button onClick={() => setShowDetailsModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-content">
              <div className="staff-profile">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {selectedStaff.avatar ? (
                      <img src={selectedStaff.avatar} alt={selectedStaff.name} />
                    ) : (
                      <div className="avatar-placeholder large">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                    )}
                  </div>
                  <div className="profile-info">
                    <h3>{selectedStaff.name}</h3>
                    <p className="role">{selectedStaff.role}</p>
                    <span className={`status-badge ${selectedStaff.status}`}>
                      {selectedStaff.status === 'active' ? 'Active' : 'On Leave'}
                    </span>
                  </div>
                </div>
                
                <div className="profile-sections">
                  <div className="section">
                    <h4>Contact Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span>{selectedStaff.email}</span>
                      </div>
                      <div className="info-item">
                        <FontAwesomeIcon icon={faPhone} />
                        <span>{selectedStaff.phone}</span>
                      </div>
                      <div className="info-item">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span>123 Main St, City, State</span>
                      </div>
                    </div>
                  </div>

                  <div className="section">
                    <h4>Professional Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <FontAwesomeIcon icon={faBriefcase} />
                        <span>{selectedStaff.department}</span>
                      </div>
                      <div className="info-item">
                        <FontAwesomeIcon icon={faGraduationCap} />
                        <span>{selectedStaff.education}</span>
                      </div>
                      <div className="info-item">
                        <FontAwesomeIcon icon={faClock} />
                        <span>{selectedStaff.experience}</span>
                      </div>
                      <div className="info-item">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>Joined: {selectedStaff.joinDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="section">
                    <h4>Performance & Schedule</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <FontAwesomeIcon icon={faStar} />
                        <span>Performance: {selectedStaff.performance}/5.0</span>
                      </div>
                      <div className="info-item">
                        <FontAwesomeIcon icon={faClock} />
                        <span>{selectedStaff.schedule}</span>
                      </div>
                      <div className="info-item">
                        <FontAwesomeIcon icon={faDollarSign} />
                        <span>Salary: {selectedStaff.salary}</span>
                      </div>
                    </div>
                  </div>

                  <div className="section">
                    <h4>Emergency Contact</h4>
                    <div className="info-item">
                      <FontAwesomeIcon icon={faPhoneAlt} />
                      <span>{selectedStaff.emergencyContact}</span>
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
                handleEdit(selectedStaff);
              }}>
                <FontAwesomeIcon icon={faEdit} />
                Edit Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStaff && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-content">
              <div className="warning-message">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <p>Are you sure you want to delete {selectedStaff.name} from the staff directory?</p>
                <p>This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                <FontAwesomeIcon icon={faTrash} />
                Delete Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerStaff;