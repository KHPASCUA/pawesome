import React, { useState } from "react";
import "./CustomerPets.css";

const CustomerPets = () => {
  const name = localStorage.getItem("name") || "Customer";
  const [search, setSearch] = useState("");
  const [pets, setPets] = useState([
    {
      id: 1,
      name: "Max",
      type: "Dog",
      breed: "Golden Retriever",
      age: "3 years",
      birthDate: "2023-02-20",
      weight: "75 lbs",
      lastCheckup: "2026-02-15",
      health: "Healthy",
      photo: null,
      history: ["2026-02-15: Annual checkup - Healthy"],
      vaccinations: ["Rabies", "DHPP", "Bordetella"],
      nextAppointment: "2026-03-15",
      medications: ["Heartgard Plus"],
      diet: "Premium dry food, 2 cups daily",
      notes: "Loves playing fetch, friendly with other dogs"
    },
    {
      id: 2,
      name: "Bella",
      type: "Dog",
      breed: "Beagle",
      age: "2 years",
      birthDate: "2024-01-20",
      weight: "25 lbs",
      lastCheckup: "2026-01-20",
      health: "Healthy",
      photo: null,
      history: ["2026-01-20: Vaccination - Healthy"],
      vaccinations: ["Rabies", "DHPP", "Leptospirosis"],
      nextAppointment: "2026-02-28",
      medications: ["Flea & Tick Prevention"],
      diet: "Weight management formula, 1.5 cups daily",
      notes: "Very active, loves long walks"
    },
  ]);

  const [editingPet, setEditingPet] = useState(null);
  const [historyPet, setHistoryPet] = useState(null);
  const [newPetModal, setNewPetModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

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

  const handleAddPet = (e) => {
    e.preventDefault();
    const form = e.target;
    const newPet = {
      id: pets.length + 1,
      name: form.name.value,
      type: form.type.value,
      breed: form.breed.value,
      age: form.age.value,
      birthDate: form.birthDate.value,
      weight: form.weight.value,
      lastCheckup: form.lastCheckup.value,
      health: form.health.value,
      photo: null,
      history: [],
      vaccinations: [],
      nextAppointment: "",
      medications: [],
      diet: "",
      notes: ""
    };
    setPets([...pets, newPet]);
    setNewPetModal(false);
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
          <h1>🐾 My Pets</h1>
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

      {/* Search and Actions */}
      <div className="pets-actions">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search pets by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
          />
          <span className="search-icon">🔍</span>
        </div>
        <button className="add-pet-btn" onClick={() => setNewPetModal(true)}>
          <span className="btn-icon">+</span>
          Add New Pet
        </button>
      </div>

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
                    <span className="pet-icon">{getPetIcon(pet.type)}</span>
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
                View Details
              </button>
              <button className="action-btn secondary" onClick={() => setEditingPet(pet)}>
                Edit
              </button>
              <label className="action-btn upload">
                Photo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handlePhotoUpload(e, pet.id)}
                />
              </label>
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
                    <span className="pet-icon-large">{getPetIcon(selectedPet.type)}</span>
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
                  Medical History
                </button>
                <button className="action-btn secondary" onClick={() => setEditingPet(selectedPet)}>
                  Edit Pet
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
          <div className="modal">
            <div className="modal-header">
              <h3>{historyPet.name} - Medical History</h3>
              <button className="close-modal-btn" onClick={() => setHistoryPet(null)}>×</button>
            </div>
            <div className="medical-history">
              {historyPet.history.length > 0 ? (
                <ul className="history-list">
                  {historyPet.history.map((entry, idx) => (
                    <li key={idx} className="history-item">
                      <span className="history-date">{entry.split(':')[0]}</span>
                      <span className="history-text">{entry.split(':')[1]}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-history">No medical history available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPets;