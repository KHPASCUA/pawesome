import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSave,
  faSyringe,
  faSpinner,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import "./VaccinationModal.css";

const VaccinationModal = ({ petId, onClose, onSave }) => {
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(petId || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    vaccine_name: "",
    vaccine_type: "Core",
    manufacturer: "",
    lot_number: "",
    date_administered: new Date().toISOString().split("T")[0],
    next_due_date: "",
    dosage: "",
    dosage_unit: "mL",
    route_of_administration: "Subcutaneous",
    site_of_administration: "",
    notes: "",
  });

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const data = await apiRequest("/veterinary/patients");
      setPets(Array.isArray(data) ? data : data.patients || []);
    } catch (err) {
      console.error("Failed to fetch pets:", err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!selectedPetId) {
      setError("Please select a pet");
      return false;
    }
    if (!formData.vaccine_name.trim()) {
      setError("Vaccine name is required");
      return false;
    }
    if (!formData.date_administered) {
      setError("Date administered is required");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...formData,
        dosage: formData.dosage ? parseFloat(formData.dosage) : null,
      };

      await apiRequest(`/veterinary/pets/${selectedPetId}/vaccinations`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onSave();
    } catch (err) {
      console.error("Failed to save vaccination:", err);
      setError(err.message || "Failed to save vaccination record");
    } finally {
      setSaving(false);
    }
  };

  const getSelectedPet = () => {
    return pets.find((p) => p.id === parseInt(selectedPetId));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content vaccination-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <FontAwesomeIcon icon={faSyringe} />
            Add Vaccination Record
          </h3>
          <button className="btn-close" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              <FontAwesomeIcon icon={faTimes} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Select Pet *</label>
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              disabled={!!petId}
            >
              <option value="">-- Select Pet --</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.species}) - Owner: {pet.customer?.name}
                </option>
              ))}
            </select>
          </div>

          {getSelectedPet() && (
            <div className="selected-pet-info">
              <span>
                <strong>Selected:</strong> {getSelectedPet().name}
              </span>
              <span>Owner: {getSelectedPet().customer?.name}</span>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Vaccine Name *</label>
              <input
                type="text"
                value={formData.vaccine_name}
                onChange={(e) => handleInputChange("vaccine_name", e.target.value)}
                placeholder="e.g., Rabies, DHPP, Bordetella"
                list="vaccine-suggestions"
              />
              <datalist id="vaccine-suggestions">
                <option value="Rabies" />
                <option value="DHPP (Distemper)" />
                <option value="Bordetella" />
                <option value="Leptospirosis" />
                <option value="Lyme Disease" />
                <option value="Canine Influenza" />
                <option value="FVRCP" />
                <option value="Feline Leukemia" />
                <option value="Feline Rabies" />
              </datalist>
            </div>
            <div className="form-group">
              <label>Vaccine Type</label>
              <select
                value={formData.vaccine_type}
                onChange={(e) => handleInputChange("vaccine_type", e.target.value)}
              >
                <option value="Core">Core</option>
                <option value="Non-core">Non-core</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Manufacturer</label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                placeholder="Vaccine manufacturer"
              />
            </div>
            <div className="form-group">
              <label>Lot Number</label>
              <input
                type="text"
                value={formData.lot_number}
                onChange={(e) => handleInputChange("lot_number", e.target.value)}
                placeholder="Lot/batch number"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faCalendarAlt} />
                Date Administered *
              </label>
              <input
                type="date"
                value={formData.date_administered}
                onChange={(e) => handleInputChange("date_administered", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faCalendarAlt} />
                Next Due Date
              </label>
              <input
                type="date"
                value={formData.next_due_date}
                onChange={(e) => handleInputChange("next_due_date", e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Dosage</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  step="0.1"
                  value={formData.dosage}
                  onChange={(e) => handleInputChange("dosage", e.target.value)}
                  placeholder="Amount"
                />
                <select
                  value={formData.dosage_unit}
                  onChange={(e) => handleInputChange("dosage_unit", e.target.value)}
                >
                  <option value="mL">mL</option>
                  <option value="mg">mg</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Route of Administration</label>
              <select
                value={formData.route_of_administration}
                onChange={(e) =>
                  handleInputChange("route_of_administration", e.target.value)
                }
              >
                <option value="Subcutaneous">Subcutaneous</option>
                <option value="Intramuscular">Intramuscular</option>
                <option value="Intranasal">Intranasal</option>
                <option value="Oral">Oral</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Site of Administration</label>
            <input
              type="text"
              value={formData.site_of_administration}
              onChange={(e) =>
                handleInputChange("site_of_administration", e.target.value)
              }
              placeholder="e.g., Right hind leg, left shoulder"
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional notes about this vaccination..."
              rows={3}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} />
                Save Vaccination
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VaccinationModal;
