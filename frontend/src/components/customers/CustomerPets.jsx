import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaw,
  faCalendarAlt,
  faHotel,
  faStethoscope,
  faSpinner,
  faExclamationTriangle,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faHistory,
  faSyringe,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import "./CustomerPets.css";

const CustomerPets = () => {
  const name = localStorage.getItem("name") || "Customer";
  const [search, setSearch] = useState("");
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [boardings, setBoardings] = useState([]);

  const [editingPet, setEditingPet] = useState(null);
  const [historyPet, setHistoryPet] = useState(null);
  const [newPetModal, setNewPetModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  // Fetch pets from API on mount
  useEffect(() => {
    fetchPets();
    fetchAppointments();
    fetchBoardings();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/customer/pets");
      const petsData = Array.isArray(data) ? data : (data.pets || []);
      // Transform API data to component format
      const transformedPets = petsData.map(pet => ({
        id: pet.id,
        name: pet.name,
        type: pet.species || 'Unknown',
        breed: pet.breed || 'Unknown',
        age: pet.age ? `${pet.age} years` : 'Unknown',
        birthDate: pet.birth_date || '',
        weight: pet.weight || 'Unknown',
        lastCheckup: pet.last_checkup || '',
        health: pet.health_status || 'Healthy',
        photo: null,
        history: [],
        vaccinations: pet.vaccinations || [],
        nextAppointment: pet.next_appointment || '',
        medications: pet.medications || [],
        diet: pet.diet || '',
        notes: pet.notes || ''
      }));
      setPets(transformedPets);
      setError("");
    } catch (err) {
      console.error("Failed to fetch pets:", err);
      setError("Failed to load pets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const data = await apiRequest("/customer/appointments");
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    }
  };

  const fetchBoardings = async () => {
    try {
      const data = await apiRequest("/customer/boardings");
      setBoardings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch boardings:", err);
    }
  };

  // Get pet history from appointments and boardings
  const getPetHistory = (petId) => {
    const petAppointments = appointments.filter(apt => apt.pet_id === petId);
    const petBoardings = boardings.filter(board => board.pet_id === petId);
    
    const history = [
      ...petAppointments.map(apt => ({
        type: 'appointment',
        date: apt.scheduled_at,
        title: apt.service?.name || 'Appointment',
        status: apt.status,
        notes: apt.notes || ''
      })),
      ...petBoardings.map(board => ({
        type: 'boarding',
        date: board.check_in,
        title: 'Hotel Stay',
        status: board.status,
        notes: `Check-out: ${board.check_out || 'Pending'}`
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return history;
  };

  const handlePhotoUpload = (e, petId) => {
    const file = e.target.files[0];
    if (file) {
      const updatedPets = pets.map((p) =>
        p.id === petId ? { ...p, photo: file } : p
      );
      setPets(updatedPets);
    }
  };

  const handleEditSave = (updatedPet) => {
    setPets(pets.map((p) => (p.id === updatedPet.id ? updatedPet : p)));
    setEditingPet(null);
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    const petData = {
      name: form.name.value,
      species: form.type.value,
      breed: form.breed.value,
      age: parseInt(form.age.value) || 0,
    };

    try {
      setLoading(true);
      const response = await apiRequest("/customer/pets", {
        method: "POST",
        body: JSON.stringify(petData),
      });
      
      // Add new pet to list
      const newPet = {
        id: response.id,
        name: response.name,
        type: response.species || 'Unknown',
        breed: response.breed || 'Unknown',
        age: response.age ? `${response.age} years` : 'Unknown',
        birthDate: response.birth_date || '',
        weight: response.weight || 'Unknown',
        lastCheckup: '',
        health: 'Healthy',
        photo: null,
        history: [],
        vaccinations: [],
        nextAppointment: '',
        medications: [],
        diet: '',
        notes: ''
      };
      
      setPets([...pets, newPet]);
      setNewPetModal(false);
      setError("");
    } catch (err) {
      console.error("Failed to add pet:", err);
      setError(err.message || "Failed to add pet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPets = pets.filter((pet) =>
    pet.name.toLowerCase().includes(search.toLowerCase())
  );

  const getHealthStatusColor = (health) => {
    switch (health) {
      case "Healthy": return "healthy";
      case "Needs Attention": return "attention";
      case "Critical": return "critical";
      default: return "healthy";
    }
  };

  const getPetIcon = (type) => {
    switch (type.toLowerCase()) {
      case "dog": return "🐕";
      case "cat": return "🐈";
      case "bird": return "🦜";
      case "rabbit": return "🐰";
      default: return "🐾";
    }
  };

  return (
    <div className="customer-pets">
      {/* Header Section */}
      <div className="pets-header">
        <div className="header-content">
          <h1><FontAwesomeIcon icon={faPaw} /> My Pets</h1>
          <p>Manage your beloved companions and their health records</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-number">{pets.length}</span>
            <span className="stat-label">Total Pets</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{pets.filter(p => p.health === "Healthy").length}</span>
            <span className="stat-label">Healthy</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
        </div>
      )}

      {/* Search and Actions */}
      <div className="pets-actions">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search pets by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
            disabled={loading}
          />
          <FontAwesomeIcon icon={faPaw} className="search-icon" />
        </div>
        <button className="add-pet-btn" onClick={() => setNewPetModal(true)} disabled={loading}>
          <FontAwesomeIcon icon={faPlus} />
          Add New Pet
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Loading pets...</span>
        </div>
      )}

      {/* Pet Cards Grid */}
      <div className="pets-grid">
        {filteredPets.map((pet) => (
          <div key={pet.id} className="pet-card">
            <div className="pet-header">
              <div className="pet-avatar">
                {pet.photo ? (
                  <img
                    src={URL.createObjectURL(pet.photo)}
                    alt={`${pet.name}`}
                    className="pet-photo"
                  />
                ) : (
                  <div className="pet-photo-placeholder">
                    {getPetIcon(pet.type)}
                  </div>
                )}
                <div className={`health-indicator ${getHealthStatusColor(pet.health)}`}></div>
              </div>
              <div className="pet-info">
                <h3>{pet.name}</h3>
                <p className="pet-breed">{pet.breed}</p>
                <span className={`health-status ${getHealthStatusColor(pet.health)}`}>
                  {pet.health}
                </span>
              </div>
            </div>

            <div className="pet-details">
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{pet.type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{pet.age}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Weight:</span>
                <span className="detail-value">{pet.weight}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Next Visit:</span>
                <span className="detail-value">{pet.nextAppointment || "Not scheduled"}</span>
              </div>
            </div>

            <div className="pet-actions">
              <button className="action-btn primary" onClick={() => setSelectedPet(pet)}>
                <FontAwesomeIcon icon={faEye} /> View
              </button>
              <button className="action-btn secondary" onClick={() => setEditingPet(pet)}>
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
              <button className="action-btn info" onClick={() => setHistoryPet(pet)}>
                <FontAwesomeIcon icon={faHistory} /> History
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pet Details Modal */}
      {selectedPet && (
        <div className="modal-overlay">
          <div className="modal pet-details-modal">
            <div className="modal-header">
              <div className="modal-title">
                <div className="pet-avatar-large">
                  {selectedPet.photo ? (
                    <img
                      src={URL.createObjectURL(selectedPet.photo)}
                      alt={`${selectedPet.name}`}
                    />
                  ) : (
                    <FontAwesomeIcon icon={faPaw} size="2x" />
                  )}
                </div>
                <div>
                  <h3>{selectedPet.name}</h3>
                  <p className="pet-breed">{selectedPet.breed}</p>
                  <span className={`health-status ${getHealthStatusColor(selectedPet.health)}`}>
                    {selectedPet.health}
                  </span>
                </div>
              </div>
              <button className="close-modal-btn" onClick={() => setSelectedPet(null)}>×</button>
            </div>

            <div className="modal-content">
              <div className="pet-info-grid">
                <div className="info-section">
                  <h4>Basic Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Type</span>
                      <span className="value">{selectedPet.type}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Age</span>
                      <span className="value">{selectedPet.age}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Weight</span>
                      <span className="value">{selectedPet.weight}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Birth Date</span>
                      <span className="value">{selectedPet.birthDate}</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h4>Health Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Last Checkup</span>
                      <span className="value">{selectedPet.lastCheckup}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Next Appointment</span>
                      <span className="value">{selectedPet.nextAppointment || "Not scheduled"}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Vaccinations</span>
                      <span className="value">{selectedPet.vaccinations.join(", ") || "Up to date"}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Medications</span>
                      <span className="value">{selectedPet.medications.join(", ") || "None"}</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h4>Care Information</h4>
                  <div className="care-info">
                    <div className="care-item">
                      <span className="label">Diet</span>
                      <span className="value">{selectedPet.diet || "Standard diet"}</span>
                    </div>
                    <div className="care-item">
                      <span className="label">Special Notes</span>
                      <span className="value">{selectedPet.notes || "No special notes"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="action-btn primary" onClick={() => setHistoryPet(selectedPet)}>
                  <FontAwesomeIcon icon={faHistory} /> View History
                </button>
                <button className="action-btn secondary" onClick={() => { setSelectedPet(null); setEditingPet(selectedPet); }}>
                  <FontAwesomeIcon icon={faEdit} /> Edit Pet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Pet Modal */}
      {newPetModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Pet</h3>
              <button className="close-modal-btn" onClick={() => setNewPetModal(false)}>×</button>
            </div>
            <form className="pet-form" onSubmit={handleAddPet}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Pet Name *</label>
                  <input type="text" id="name" name="name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="type">Type *</label>
                  <select id="type" name="type" required>
                    <option value="">Select type...</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="breed">Breed *</label>
                  <input type="text" id="breed" name="breed" required />
                </div>
                <div className="form-group">
                  <label htmlFor="age">Age *</label>
                  <input type="text" id="age" name="age" required />
                </div>
                <div className="form-group">
                  <label htmlFor="birthDate">Birth Date *</label>
                  <input type="date" id="birthDate" name="birthDate" required />
                </div>
                <div className="form-group">
                  <label htmlFor="weight">Weight *</label>
                  <input type="text" id="weight" name="weight" required />
                </div>
                <div className="form-group">
                  <label htmlFor="lastCheckup">Last Checkup *</label>
                  <input type="date" id="lastCheckup" name="lastCheckup" required />
                </div>
                <div className="form-group">
                  <label htmlFor="health">Health Status *</label>
                  <select id="health" name="health" required>
                    <option value="Healthy">Healthy</option>
                    <option value="Needs Attention">Needs Attention</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setNewPetModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">Save Pet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingPet && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit {editingPet.name}</h3>
              <button className="close-modal-btn" onClick={() => setEditingPet(null)}>×</button>
            </div>
            <form className="pet-form" onSubmit={(e) => { e.preventDefault(); handleEditSave(editingPet); }}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="edit-age">Age</label>
                  <input type="text" id="edit-age" value={editingPet.age} onChange={(e) => setEditingPet({ ...editingPet, age: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-weight">Weight</label>
                  <input type="text" id="edit-weight" value={editingPet.weight} onChange={(e) => setEditingPet({ ...editingPet, weight: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-birthDate">Birth Date</label>
                  <input type="date" id="edit-birthDate" value={editingPet.birthDate} onChange={(e) => setEditingPet({ ...editingPet, birthDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-health">Health Status</label>
                  <select id="edit-health" value={editingPet.health} onChange={(e) => setEditingPet({ ...editingPet, health: e.target.value })}>
                    <option value="Healthy">Healthy</option>
                    <option value="Needs Attention">Needs Attention</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setEditingPet(null)}>Cancel</button>
                <button type="submit" className="submit-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medical History Modal */}
      {historyPet && (
        <div className="modal-overlay">
          <div className="modal history-modal">
            <div className="modal-header">
              <h3><FontAwesomeIcon icon={faHistory} /> {historyPet.name} - Complete History</h3>
              <button className="close-modal-btn" onClick={() => setHistoryPet(null)}>×</button>
            </div>
            <div className="modal-content">
              {(() => {
                const history = getPetHistory(historyPet.id);
                return history.length > 0 ? (
                  <div className="history-timeline">
                    {history.map((entry, idx) => (
                      <div key={idx} className={`timeline-item ${entry.type}`}>
                        <div className="timeline-icon">
                          {entry.type === 'appointment' && <FontAwesomeIcon icon={faCalendarAlt} />}
                          {entry.type === 'boarding' && <FontAwesomeIcon icon={faHotel} />}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="timeline-date">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                            <span className={`timeline-badge ${entry.status}`}>
                              {entry.status}
                            </span>
                          </div>
                          <h4 className="timeline-title">{entry.title}</h4>
                          {entry.notes && <p className="timeline-notes">{entry.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-history">
                    <FontAwesomeIcon icon={faHistory} size="2x" />
                    <p>No history available for {historyPet.name}</p>
                    <small>Appointments and hotel stays will appear here</small>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPets;