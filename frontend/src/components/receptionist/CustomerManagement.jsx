import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faSearch,
  faFilter,
  faPlus,
  faEdit,
  faTrash,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faPaw,
  faCalendarAlt,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import "./CustomerManagement.css";

const CustomerManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const customers = [
    {
      id: "CUST-001",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1-234-567-8901",
      address: "123 Main St, City, State 12345",
      status: "active",
      joinDate: "2022-01-15",
      lastVisit: "2026-03-28",
      pets: [
        { name: "Buddy", type: "Dog", breed: "Golden Retriever", age: 3 },
        { name: "Max", type: "Dog", breed: "German Shepherd", age: 5 },
      ],
      totalBookings: 15,
      totalSpent: 2850,
    },
    {
      id: "CUST-002",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1-234-567-8902",
      address: "456 Oak Ave, City, State 12345",
      status: "active",
      joinDate: "2023-03-20",
      lastVisit: "2026-04-01",
      pets: [
        { name: "Luna", type: "Cat", breed: "Persian", age: 2 },
        { name: "Whiskers", type: "Cat", breed: "Siamese", age: 4 },
      ],
      totalBookings: 8,
      totalSpent: 1200,
    },
    {
      id: "CUST-003",
      name: "Mike Davis",
      email: "mike.davis@email.com",
      phone: "+1-234-567-8903",
      address: "789 Pine Rd, City, State 12345",
      status: "active",
      joinDate: "2021-06-10",
      lastVisit: "2026-03-15",
      pets: [
        { name: "Charlie", type: "Rabbit", breed: "Holland Lop", age: 1 },
      ],
      totalBookings: 22,
      totalSpent: 3200,
    },
    {
      id: "CUST-004",
      name: "Emily Wilson",
      email: "emily.w@email.com",
      phone: "+1-234-567-8904",
      address: "321 Elm St, City, State 12345",
      status: "inactive",
      joinDate: "2024-08-05",
      lastVisit: "2025-12-20",
      pets: [
        { name: "Bella", type: "Dog", breed: "Labrador", age: 2 },
        { name: "Daisy", type: "Cat", breed: "Maine Coon", age: 3 },
      ],
      totalBookings: 3,
      totalSpent: 450,
    },
  ];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesStatus = filterStatus === "all" || customer.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "secondary";
      case "suspended":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return faCheckCircle;
      case "inactive":
        return faTimesCircle;
      case "suspended":
        return faTimesCircle;
      default:
        return faCheckCircle;
    }
  };

  return (
    <div className="customer-management">
      <div className="customers-header">
        <div className="header-left">
          <h1>Customer Management</h1>
          <p>Manage customer information and pet records</p>
        </div>
        <div className="header-actions">
          <button className="primary-btn">
            <FontAwesomeIcon icon={faPlus} />
            Add Customer
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
            <h3>{customers.length}</h3>
            <p>Total Customers</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="card-content">
            <h3>{customers.filter(c => c.status === 'active').length}</h3>
            <p>Active Customers</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faPaw} />
          </div>
          <div className="card-content">
            <h3>{customers.reduce((sum, c) => sum + c.pets.length, 0)}</h3>
            <p>Total Pets</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <FontAwesomeIcon icon={faCalendarAlt} />
          </div>
          <div className="card-content">
            <h3>{customers.reduce((sum, c) => sum + c.totalBookings, 0)}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="customers-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Address</th>
              <th>Pets</th>
              <th>Status</th>
              <th>Total Bookings</th>
              <th>Total Spent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="customer-row">
                <td className="customer-id">
                  <span className="id-badge">{customer.id}</span>
                </td>
                <td className="customer-name">
                  <div className="name-info">
                    <span className="name">{customer.name}</span>
                    <span className="join-date">Since {customer.joinDate}</span>
                  </div>
                </td>
                <td className="contact">
                  <div className="contact-info">
                    <div className="email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {customer.email}
                    </div>
                    <div className="phone">
                      <FontAwesomeIcon icon={faPhone} />
                      {customer.phone}
                    </div>
                  </div>
                </td>
                <td className="address">
                  <div className="address-info">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    {customer.address}
                  </div>
                </td>
                <td className="pets">
                  <div className="pets-info">
                    <span className="pet-count">{customer.pets.length} pets</span>
                    <div className="pet-list">
                      {customer.pets.map((pet, index) => (
                        <span key={index} className="pet-tag">
                          <FontAwesomeIcon icon={faPaw} />
                          {pet.name} ({pet.type})
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="status">
                  <span className={`status-badge ${getStatusColor(customer.status)}`}>
                    <FontAwesomeIcon icon={getStatusIcon(customer.status)} />
                    {customer.status}
                  </span>
                </td>
                <td className="bookings">
                  <span className="booking-count">{customer.totalBookings}</span>
                </td>
                <td className="spent">
                  <span className="amount">${customer.totalSpent.toLocaleString()}</span>
                </td>
                <td className="actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => setSelectedCustomer(customer)}
                    title="View Details"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button className="action-btn edit-btn" title="Edit">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button className="action-btn delete-btn" title="Delete">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="customer-modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="customer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedCustomer(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="customer-overview">
                <div className="overview-section">
                  <h3>Personal Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Customer ID:</label>
                      <span>{selectedCustomer.id}</span>
                    </div>
                    <div className="info-item">
                      <label>Name:</label>
                      <span>{selectedCustomer.name}</span>
                    </div>
                    <div className="info-item">
                      <label>Email:</label>
                      <span>{selectedCustomer.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Phone:</label>
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    <div className="info-item full-width">
                      <label>Address:</label>
                      <span>{selectedCustomer.address}</span>
                    </div>
                    <div className="info-item">
                      <label>Status:</label>
                      <span className={`status-badge ${getStatusColor(selectedCustomer.status)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(selectedCustomer.status)} />
                        {selectedCustomer.status}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Join Date:</label>
                      <span>{selectedCustomer.joinDate}</span>
                    </div>
                    <div className="info-item">
                      <label>Last Visit:</label>
                      <span>{selectedCustomer.lastVisit}</span>
                    </div>
                  </div>
                </div>
                
                <div className="overview-section">
                  <h3>Pet Information</h3>
                  <div className="pets-detail">
                    {selectedCustomer.pets.map((pet, index) => (
                      <div key={index} className="pet-item">
                        <div className="pet-avatar">
                          <FontAwesomeIcon icon={faPaw} />
                        </div>
                        <div className="pet-details">
                          <h4>{pet.name}</h4>
                          <p>{pet.type} - {pet.breed}</p>
                          <span>Age: {pet.age} years</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="overview-section">
                  <h3>Booking History</h3>
                  <div className="booking-stats">
                    <div className="stat-item">
                      <label>Total Bookings:</label>
                      <span>{selectedCustomer.totalBookings}</span>
                    </div>
                    <div className="stat-item">
                      <label>Total Spent:</label>
                      <span className="amount">${selectedCustomer.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                      <label>Average per Booking:</label>
                      <span>${Math.round(selectedCustomer.totalSpent / selectedCustomer.totalBookings)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="secondary-btn" onClick={() => setSelectedCustomer(null)}>
                  Close
                </button>
                <button className="primary-btn">
                  <FontAwesomeIcon icon={faEdit} />
                  Edit Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
