import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPhone,
  faEnvelope,
  faEdit,
  faTrash,
  faPlus,
  faTimes,
  faSearch,
  faFilter,
  faPaw,
  faHome,
  faBirthdayCake,
  faMapMarkerAlt,
  faCalendarCheck,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import "./ReceptionistCustomersProfile.css";
import { receptionistProfileApi } from "../../api/receptionistProfileApi";

const CustomersProfile = () => {
  const [customers, setCustomers] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [customerFormData, setCustomerFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: ""
  });
  const [petFormData, setPetFormData] = useState({
    name: "",
    type: "Dog",
    breed: "",
    age: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [customerRes, petRes] = await Promise.all([
        receptionistProfileApi.getCustomers(),
        receptionistProfileApi.getPets(),
      ]);

      // SAFE EXTRACTION
      const extractArray = (res, key) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.[key])) return res[key];
        if (Array.isArray(res?.[key]?.data)) return res[key].data;
        return [];
      };

      const customerData = extractArray(customerRes, "customers");
      const petData = extractArray(petRes, "pets");

      setCustomers(customerData);
      setPets(petData);
    } catch (err) {
      setError(err.message || "Failed to load customer records.");
    } finally {
      setLoading(false);
    }
  };

  // Filter customers based on search and filter
  const filteredCustomers = customers.filter(customer => {
    const name = customer.name || "";
    const email = customer.email || "";
    const phone = customer.phone || "";

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm);

    if (filterType === "all") return matchesSearch;
    if (filterType === "recent")
      return matchesSearch &&
        new Date(customer.joinDate) >
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (filterType === "active")
      return matchesSearch && (customer.totalBookings || 0) > 10;

    return matchesSearch;
  }).sort((a, b) => {
    // Extract last names for alphabetical sorting
    const getLastName = (name) => {
      const parts = name.trim().split(' ');
      return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : name.toLowerCase();
    };

    const lastNameA = getLastName(a.name || "");
    const lastNameB = getLastName(b.name || "");

    return lastNameA.localeCompare(lastNameB);
  });

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();

    if (!customerFormData.firstName || !customerFormData.lastName || !customerFormData.phone) {
      alert("Please fill in First Name, Last Name, and Phone.");
      return;
    }

    const fullName = customerFormData.middleName
      ? `${customerFormData.firstName} ${customerFormData.middleName} ${customerFormData.lastName}` 
      : `${customerFormData.firstName} ${customerFormData.lastName}`;

    const fullAddress = customerFormData.address
      ? `${customerFormData.address}, ${customerFormData.city || ""}, ${customerFormData.state || ""} ${customerFormData.zipCode || ""}` 
          .replace(/,\s*,/g, ",")
          .trim()
      : "";

    try {
      await receptionistProfileApi.createCustomer({
        name: fullName,
        phone: customerFormData.phone,
        email: customerFormData.email,
        address: fullAddress,
        notes: customerFormData.notes,
      });

      alert("Customer registered successfully!");
      handleCloseCustomerModal();
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to register customer.");
    }
  };

  const handlePetSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomer?.id) {
      alert("Please select a customer first.");
      return;
    }

    if (!petFormData.name || !petFormData.type || !petFormData.breed) {
      alert("Please fill in pet name, type, and breed.");
      return;
    }

    try {
      await receptionistProfileApi.createPet({
        customer_id: selectedCustomer.id,
        name: petFormData.name,
        type: petFormData.type,
        species: petFormData.type,
        breed: petFormData.breed,
        age: petFormData.age,
      });

      alert("Pet added successfully!");
      handleClosePetModal();
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to add pet.");
    }
  };

  const handleCustomerInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePetInputChange = (e) => {
    const { name, value } = e.target;
    setPetFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address || ""
    });
  };

  const handleDeleteCustomer = (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(null);
      }
    }
  };

  const handleEditPet = (pet) => {
    setSelectedPet(pet);
    setPetFormData({
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age
    });
  };

  const handleDeletePet = (petId) => {
    if (window.confirm("Are you sure you want to delete this pet?")) {
      setPets(prev => prev.filter(p => p.id !== petId));
      if (selectedPet?.id === petId) {
        setSelectedPet(null);
      }
    }
  };

  const handleCloseCustomerModal = () => {
    setShowCustomerModal(false);
    setSelectedCustomer(null);
    setCustomerFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: ""
    });
  };

  const handleClosePetModal = () => {
    setShowPetModal(false);
    setSelectedPet(null);
    setPetFormData({
      name: "",
      type: "Dog",
      breed: "",
      age: ""
    });
  };

  const handleCreateBooking = (customer) => {
    window.location.href = `/receptionist/bookings?customer=${customer.id}`;
  };

  return (
    <div className="customers-profile">
      {error && <div className="alert alert-error">{error}</div>}

      {loading && <div className="loading-state">Loading customers...</div>}

      {/* Header Section */}
      <div className="profile-header">
        <div className="header-content">
          <div className="header-title">
            <h1>
              <FontAwesomeIcon icon={faUser} /> Customer Management
            </h1>
            <p>Manage your customers and their pets efficiently</p>
          </div>
          <button 
            className="add-customer-btn"
            onClick={() => setShowCustomerModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Add New Customer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div className="stat-content">
            <h3>{customers.length}</h3>
            <p>Total Customers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faPaw} />
          </div>
          <div className="stat-content">
            <h3>{pets.length}</h3>
            <p>Total Pets</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCalendarCheck} />
          </div>
          <div className="stat-content">
            <h3>{customers.reduce((sum, c) => sum + (c.totalBookings || 0), 0)}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className="stat-content">
            <h3>{customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + (c.totalBookings || 0), 0) / customers.length) : 0}</h3>
            <p>Avg Bookings/Customer</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <FontAwesomeIcon icon={faFilter} />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Customers (A-Z)</option>
            <option value="recent">Recent (30 days)</option>
            <option value="active">Active (10+ bookings)</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact Information</th>
              <th>Address</th>
              <th>Member Since</th>
              <th>Total Bookings</th>
              <th>Pets</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id}>
                <td>
                  <div className="customer-cell">
                    <div className="customer-avatar">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div className="customer-basic-info">
                      <h4>{customer.name}</h4>
                      <p className="customer-id">{customer.id}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <div className="contact-item">
                      <FontAwesomeIcon icon={faPhone} />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="contact-item">
                      <FontAwesomeIcon icon={faEnvelope} />
                      <span>{customer.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="address-info">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>{customer.address}</span>
                  </div>
                </td>
                <td>
                  <div className="date-info">
                    <FontAwesomeIcon icon={faHome} />
                    <span>{customer.joinDate}</span>
                  </div>
                </td>
                <td>
                  <div className="bookings-info">
                    <FontAwesomeIcon icon={faCalendarCheck} />
                    <span className="booking-count">{customer.totalBookings}</span>
                  </div>
                </td>
                <td>
                  <div className="pets-info">
                    <div className="pets-summary">
                      <FontAwesomeIcon icon={faPaw} />
                      <span>{pets.filter(pet => pet.customerId === customer.id).length} pets</span>
                    </div>
                    <div className="pets-list-inline">
                      {pets.filter(pet => pet.customerId === customer.id).slice(0, 2).map(pet => (
                        <span key={pet.id} className="pet-tag">
                          {pet.name}
                        </span>
                      ))}
                      {pets.filter(pet => pet.customerId === customer.id).length > 2 && (
                        <span className="pet-more">+{pets.filter(pet => pet.customerId === customer.id).length - 2} more</span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="table-actions">
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => handleEditCustomer(customer)}
                      title="Edit Customer"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteCustomer(customer.id)}
                      title="Delete Customer"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <button 
                      className="action-btn pets-btn"
                      onClick={() => setSelectedCustomer(customer)}
                      title="Manage Pets"
                    >
                      <FontAwesomeIcon icon={faPaw} />
                    </button>
                    <button 
                      className="action-btn"
                      onClick={() => handleCreateBooking(customer)}
                      title="Create Booking"
                    >
                      📅 Book
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Customer Details */}
      {selectedCustomer && (
        <div className="selected-customer-details">
          <div className="details-header">
            <h3>
              <FontAwesomeIcon icon={faUser} /> {selectedCustomer.name} - Pet Management
            </h3>
            <button 
              className="close-details-btn"
              onClick={() => setSelectedCustomer(null)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          
          <div className="pets-management">
            <div className="pets-header">
              <h4>
                <FontAwesomeIcon icon={faPaw} /> Registered Pets ({pets.filter(pet => pet.customerId === selectedCustomer.id).length})
              </h4>
              <button 
                className="add-pet-btn"
                onClick={() => setShowPetModal(true)}
              >
                <FontAwesomeIcon icon={faPlus} /> Add New Pet
              </button>
            </div>
            
            <div className="pets-grid">
              {pets.filter(pet => pet.customerId === selectedCustomer.id).map(pet => (
                <div key={pet.id} className="pet-card">
                  <div className="pet-avatar">
                    <img src={pet.image} alt={pet.name} />
                  </div>
                  <div className="pet-info">
                    <h5>{pet.name}</h5>
                    <p>{pet.type} - {pet.breed}</p>
                    <span className="pet-age">
                      <FontAwesomeIcon icon={faBirthdayCake} /> {pet.age}
                    </span>
                  </div>
                  <div className="pet-actions">
                    <button 
                      className="action-btn edit-pet-btn"
                      onClick={() => handleEditPet(pet)}
                      title="Edit Pet"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="action-btn delete-pet-btn"
                      onClick={() => handleDeletePet(pet.id)}
                      title="Delete Pet"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
              {pets.filter(pet => pet.customerId === selectedCustomer.id).length === 0 && (
                <div className="no-pets-card">
                  <FontAwesomeIcon icon={faPaw} />
                  <h5>No pets registered</h5>
                  <p>This customer hasn't registered any pets yet</p>
                  <button 
                    className="add-first-pet-btn"
                    onClick={() => setShowPetModal(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} /> Add First Pet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredCustomers.length === 0 && (
        <div className="no-results">
          <FontAwesomeIcon icon={faSearch} />
          <h3>No customers found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Add Customer Modal */}
      {showCustomerModal && (
        <div className="registration-modal-overlay" onClick={handleCloseCustomerModal}>
          <div className="registration-modal" onClick={(e) => e.stopPropagation()}>
            <div className="registration-header">
              <div className="registration-title">
                <div className="registration-icon">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div>
                  <h2>Customer Registration</h2>
                  <p>Fill in the customer information below</p>
                </div>
              </div>
              <button className="close-registration-btn" onClick={handleCloseCustomerModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleCustomerSubmit} className="registration-form">
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-row three-columns">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={customerFormData.firstName || ''}
                      onChange={handleCustomerInputChange}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="middleName">Middle Name</label>
                    <input
                      type="text"
                      id="middleName"
                      name="middleName"
                      value={customerFormData.middleName || ''}
                      onChange={handleCustomerInputChange}
                      placeholder="Enter middle name (optional)"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={customerFormData.lastName || ''}
                      onChange={handleCustomerInputChange}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Contact Information</h3>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customerFormData.phone}
                    onChange={handleCustomerInputChange}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={customerFormData.email}
                    onChange={handleCustomerInputChange}
                    placeholder="customer@example.com"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Address Information</h3>
                <div className="form-group">
                  <label htmlFor="address">Street Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={customerFormData.address}
                    onChange={handleCustomerInputChange}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City/Municipality</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={customerFormData.city || ''}
                      onChange={handleCustomerInputChange}
                      placeholder="e.g., Manila, Quezon City, Cebu City"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">Province</label>
                    <select
                      id="state"
                      name="state"
                      value={customerFormData.state || ''}
                      onChange={handleCustomerInputChange}
                    >
                      <option value="">Select Province</option>
                      <optgroup label="Luzon">
                        <option value="Abra">Abra</option>
                        <option value="Apayao">Apayao</option>
                        <option value="Bataan">Bataan</option>
                        <option value="Batanes">Batanes</option>
                        <option value="Benguet">Benguet</option>
                        <option value="Bulacan">Bulacan</option>
                        <option value="Cagayan">Cagayan</option>
                        <option value="Cavite">Cavite</option>
                        <option value="Cagayan">Cagayan</option>
                        <option value="Isabela">Isabela</option>
                        <option value="Ilocos Norte">Ilocos Norte</option>
                        <option value="Ilocos Sur">Ilocos Sur</option>
                        <option value="La Union">La Union</option>
                        <option value="Laguna">Laguna</option>
                        <option value="Mountain Province">Mountain Province</option>
                        <option value="Nueva Ecija">Nueva Ecija</option>
                        <option value="Nueva Vizcaya">Nueva Vizcaya</option>
                        <option value="Pampanga">Pampanga</option>
                        <option value="Pangasinan">Pangasinan</option>
                        <option value="Quezon">Quezon</option>
                        <option value="Quirino">Quirino</option>
                        <option value="Rizal">Rizal</option>
                        <option value="Sarangani">Sarangani</option>
                        <option value="Tarlac">Tarlac</option>
                        <option value="Zambales">Zambales</option>
                        <option value="Metro Manila">Metro Manila</option>
                      </optgroup>
                      <optgroup label="Visayas">
                        <option value="Aklan">Aklan</option>
                        <option value="Antique">Antique</option>
                        <option value="Biliran">Biliran</option>
                        <option value="Bohol">Bohol</option>
                        <option value="Capiz">Capiz</option>
                        <option value="Cebu">Cebu</option>
                        <option value="Eastern Samar">Eastern Samar</option>
                        <option value="Guimaras">Guimaras</option>
                        <option value="Iloilo">Iloilo</option>
                        <option value="Leyte">Leyte</option>
                        <option value="Negros Occidental">Negros Occidental</option>
                        <option value="Negros Oriental">Negros Oriental</option>
                        <option value="Northern Samar">Northern Samar</option>
                        <option value="Siquijor">Siquijor</option>
                        <option value="Southern Leyte">Southern Leyte</option>
                        <option value="Western Samar">Western Samar</option>
                      </optgroup>
                      <optgroup label="Mindanao">
                        <option value="Agusan del Norte">Agusan del Norte</option>
                        <option value="Agusan del Sur">Agusan del Sur</option>
                        <option value="Bukidnon">Bukidnon</option>
                        <option value="Camiguin">Camiguin</option>
                        <option value="Compostela Valley">Compostela Valley</option>
                        <option value="Cotabato">Cotabato</option>
                        <option value="Davao del Norte">Davao del Norte</option>
                        <option value="Davao del Sur">Davao del Sur</option>
                        <option value="Davao Occidental">Davao Occidental</option>
                        <option value="Davao Oriental">Davao Oriental</option>
                        <option value="Dinagat Islands">Dinagat Islands</option>
                        <option value="Guimaras">Guimaras</option>
                        <option value="Isabela City">Isabela City</option>
                        <option value="Lanao del Norte">Lanao del Norte</option>
                        <option value="Lanao del Sur">Lanao del Sur</option>
                        <option value="Maguindanao">Maguindanao</option>
                        <option value="Misamis Occidental">Misamis Occidental</option>
                        <option value="Misamis Oriental">Misamis Oriental</option>
                        <option value="Sarangani">Sarangani</option>
                        <option value="Sultan Kudarat">Sultan Kudarat</option>
                        <option value="Sulu">Sulu</option>
                        <option value="Surigao del Norte">Surigao del Norte</option>
                        <option value="Surigao del Sur">Surigao del Sur</option>
                        <option value="Tawi-Tawi">Tawi-Tawi</option>
                        <option value="Zamboanga del Norte">Zamboanga del Norte</option>
                        <option value="Zamboanga del Sur">Zamboanga del Sur</option>
                        <option value="Zamboanga Sibugay">Zamboanga Sibugay</option>
                      </optgroup>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="zipCode">Postal Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={customerFormData.zipCode || ''}
                      onChange={handleCustomerInputChange}
                      placeholder="e.g., 1000, 4000"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Additional Information</h3>
                <div className="form-group">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={customerFormData.notes || ''}
                    onChange={handleCustomerInputChange}
                    placeholder="Any additional notes about the customer..."
                    rows={3}
                  />
                </div>
              </div>
            </form>
            
            <div className="registration-actions">
              <button type="button" className="btn-secondary" onClick={handleCloseCustomerModal}>
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
              <button type="button" className="btn-primary" onClick={handleCustomerSubmit}>
                <FontAwesomeIcon icon={faPlus} /> Register Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Pet Modal */}
      {showPetModal && selectedCustomer && (
        <div className="pet-modal-overlay" onClick={handleClosePetModal}>
          <div className="pet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FontAwesomeIcon icon={faPlus} /> Add New Pet
              </h3>
              <button className="close-btn" onClick={handleClosePetModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handlePetSubmit}>
                <div className="form-group">
                  <label>Pet Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={petFormData.name}
                    onChange={handlePetInputChange}
                    placeholder="Pet name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    name="type"
                    value={petFormData.type}
                    onChange={handlePetInputChange}
                    required
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit">Rabbit</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Breed *</label>
                  <input
                    type="text"
                    name="breed"
                    value={petFormData.breed}
                    onChange={handlePetInputChange}
                    placeholder="Breed"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="text"
                    name="age"
                    value={petFormData.age}
                    onChange={handlePetInputChange}
                    placeholder="Age (e.g., 2 years)"
                  />
                </div>
              </form>
            </div>
            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={handleClosePetModal}>
                Cancel
              </button>
              <button type="button" className="primary-btn" onClick={handlePetSubmit}>
                Save Pet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersProfile;