import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faSearch,
  faFilter,
  faEdit,
  faTrash,
  faToggleOn,
  faToggleOff,
  faPlus,
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import "./ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "edit", "delete"
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    username: "",
    role: "customer", 
    is_active: true 
  });
  const [processing, setProcessing] = useState(false);

  // Fetch users from database
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/admin/users");
      setUsers(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Show success message
  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  // Show error message
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 5000);
  };

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    if (user) {
      setFormData({ 
        name: user.name || "", 
        email: user.email || "", 
        username: user.username || "",
        role: user.role || "customer", 
        is_active: user.is_active !== undefined ? user.is_active : true 
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({ 
      name: "", 
      email: "", 
      username: "",
      role: "customer", 
      is_active: true 
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  // Update user in database
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      setProcessing(true);
      setError("");
      
      const updateData = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        role: formData.role,
        is_active: formData.is_active,
      };
      
      await apiRequest(`/admin/users/${selectedUser.id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
      
      // Update local state
      setUsers(users.map((u) => 
        u.id === selectedUser.id ? { ...u, ...updateData } : u
      ));
      
      showSuccess("User updated successfully");
      closeModal();
    } catch (err) {
      showError(err.message || "Failed to update user");
      console.error("Update user error:", err);
    } finally {
      setProcessing(false);
    }
  };

  // Delete user from database
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setProcessing(true);
      setError("");
      
      await apiRequest(`/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });
      
      // Update local state
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      
      showSuccess("User deleted successfully");
      closeModal();
    } catch (err) {
      showError(err.message || "Failed to delete user");
      console.error("Delete user error:", err);
    } finally {
      setProcessing(false);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (user) => {
    try {
      setError("");
      
      await apiRequest(`/admin/users/${user.id}/toggle`, {
        method: "PATCH",
      });
      
      // Update local state
      setUsers(users.map((u) => 
        u.id === user.id ? { ...u, is_active: !u.is_active } : u
      ));
      
      showSuccess(`User ${user.is_active ? "deactivated" : "activated"} successfully`);
    } catch (err) {
      showError(err.message || "Failed to toggle user status");
      console.error("Toggle status error:", err);
    }
  };

  const handleConfirm = () => {
    if (modalType === "edit") {
      handleUpdateUser();
    } else if (modalType === "delete") {
      handleDeleteUser();
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && user.is_active) || 
      (filterStatus === "inactive" && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="manage-users">
      <div className="section-header">
        <div className="header-left">
          <h2>Manage Users</h2>
          <p>Manage system users, roles, and permissions</p>
        </div>
        <div className="header-actions">
          <NavLink to="/admin/users/create" className="add-user-btn">
            Add New User
          </NavLink>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="users-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="receptionist">Receptionist</option>
              <option value="veterinary">Veterinary</option>
              <option value="cashier">Cashier</option>
              <option value="inventory">Inventory</option>
              <option value="payroll">Payroll</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        {loading ? (
          <div className="loading-container">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <h3>No users found</h3>
            <p>Try adjusting your filters or add a new user.</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="user-row">
                  <td className="user-id">#{user.id}</td>
                  <td className="user-name">
                    <div className="user-info">
                      <strong>{user.name}</strong>
                    </div>
                  </td>
                  <td className="user-username">{user.username || "N/A"}</td>
                  <td className="user-email">{user.email}</td>
                  <td className="user-role">
                    <span className="role-badge">
                      {user.role}
                    </span>
                  </td>
                  <td className="user-status">
                    <button
                      className={`status-toggle ${user.is_active ? "active" : "inactive"}`}
                      onClick={() => handleToggleStatus(user)}
                      title={user.is_active ? "Deactivate" : "Activate"}
                    >
                      <span>{user.is_active ? "Active" : "Inactive"}</span>
                    </button>
                  </td>
                  <td className="user-date">{formatDate(user.created_at)}</td>
                  <td className="user-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => openModal("edit", user)}
                      title="Edit User"
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => openModal("delete", user)}
                      title="Delete User"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for edit/delete */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === "edit" && (
                  <>Edit User: {selectedUser?.name}</>
                )}
                {modalType === "delete" && (
                  <>Delete User: {selectedUser?.name}</>
                )}
              </h3>
              <button className="close-btn" onClick={closeModal}>
                X
              </button>
            </div>

            <div className="modal-body">
              {modalType === "edit" && (
                <form className="user-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name:</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Username:</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Role:</label>
                    <select name="role" value={formData.role} onChange={handleChange}>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="veterinary">Veterinary</option>
                      <option value="cashier">Cashier</option>
                      <option value="inventory">Inventory</option>
                      <option value="payroll">Payroll</option>
                      <option value="customer">Customer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                      />
                      <span className="checkmark"></span>
                      Active User
                    </label>
                  </div>
                </form>
              )}
              {modalType === "delete" && (
                <div className="delete-confirmation">
                  <p>Are you sure you want to delete <strong>{selectedUser?.name}</strong>?</p>
                  <p className="warning-text">This action cannot be undone.</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={closeModal}
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                className={`confirm-btn ${modalType === "delete" ? "danger" : "primary"}`} 
                onClick={handleConfirm}
                disabled={processing}
              >
                {processing ? (
                  <>Processing...</>
                ) : (
                  <>
                    {modalType === "edit" && (
                      <>Update User</>
                    )}
                    {modalType === "delete" && (
                      <>Delete User</>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;