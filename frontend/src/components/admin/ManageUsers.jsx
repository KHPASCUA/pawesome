import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "Sarah Johnson", email: "sarah@gmail.com", role: "Customer", status: "Active", date: "2026-01-15" },
    { id: 2, name: "Mike Chen", email: "mike@gmail.com", role: "Veterinary", status: "Active", date: "2026-01-10" },
    { id: 3, name: "Emily Davis", email: "emily@gmail.com", role: "Receptionist", status: "Active", date: "2026-01-05" },
    { id: 4, name: "James Wilson", email: "james@gmail.com", role: "Cashier", status: "Inactive", date: "2025-12-20" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "edit", "delete"
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "", status: "Active" });

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    if (user) {
      setFormData({ name: user.name, email: user.email, role: user.role, status: user.status });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = () => {
    if (modalType === "edit" && selectedUser) {
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...formData } : u)));
    } else if (modalType === "delete" && selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
    }
    closeModal();
  };

  return (
    <div className="manage-users">
      <div className="section-header">
        <h2>Manage Users</h2>
        {/* Route to Create User tab instead of modal */}
        <NavLink to="/admin/users/create" className="add-user-btn">
          + Add New User
        </NavLink>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Role</th>
            <th>Status</th><th>Join Date</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span className={`status ${user.status.toLowerCase()}`}>
                  {user.status}
                </span>
              </td>
              <td>{user.date}</td>
              <td className="actions">
                <button className="edit-btn" onClick={() => openModal("edit", user)}>✏️ Edit</button>
                <button className="delete-btn" onClick={() => openModal("delete", user)}>🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for edit/delete */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {modalType === "edit" && `Edit User: ${selectedUser?.name}`}
              {modalType === "delete" && `Delete User: ${selectedUser?.name}`}
            </h3>

            <div className="modal-body">
              {modalType === "edit" && (
                <form className="user-form">
                  <label>
                    Name:
                    <input type="text" name="name" value={formData.name} onChange={handleChange} />
                  </label>
                  <label>
                    Email:
                    <input type="email" name="email" value={formData.email} onChange={handleChange} />
                  </label>
                  <label>
                    Role:
                    <input type="text" name="role" value={formData.role} onChange={handleChange} />
                  </label>
                  <label>
                    Status:
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </label>
                </form>
              )}
              {modalType === "delete" && (
                <p>Are you sure you want to delete <strong>{selectedUser?.name}</strong>?</p>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={closeModal}>Cancel</button>
              <button className="confirm-btn" onClick={handleConfirm}>
                {modalType === "edit" && "Update"}
                {modalType === "delete" && "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;