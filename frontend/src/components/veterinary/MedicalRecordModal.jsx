import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSave,
  faPlus,
  faTrash,
  faPills,
  faSyringe,
  faSpinner,
  faPaw,
  faCalendarAlt,
  faStethoscope,
  faHeartbeat,
  faWeight,
  faThermometerHalf,
  faNotesMedical,
} from "@fortawesome/free-solid-svg-icons";
import { createMedicalRecord, updateMedicalRecord } from "../../api/medicalRecords";
import { apiRequest } from "../../api/client";
import "./MedicalRecordModal.css";

const MedicalRecordModal = ({ record, onClose, onSave }) => {
  const isEditing = !!record;

  // Form state
  const [formData, setFormData] = useState({
    pet_id: "",
    appointment_id: null,
    visit_date: new Date().toISOString().slice(0, 16),
    chief_complaint: "",
    symptoms: "",
    physical_examination: "",
    diagnosis: "",
    secondary_diagnosis: "",
    treatment_plan: "",
    procedure_notes: "",
    follow_up_instructions: "",
    weight_kg: "",
    temperature_celsius: "",
    heart_rate: "",
    respiratory_rate: "",
    body_condition_score: "",
    notes: "",
    status: "draft",
    prescriptions: [],
    vaccinations: [],
  });

  // UI state
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("consultation");

  // Load initial data
  useEffect(() => {
    fetchPets();
    fetchAppointments();
    if (record) {
      setFormData({
        pet_id: record.pet_id || "",
        appointment_id: record.appointment_id || null,
        visit_date: record.visit_date
          ? new Date(record.visit_date).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        chief_complaint: record.chief_complaint || "",
        symptoms: record.symptoms || "",
        physical_examination: record.physical_examination || "",
        diagnosis: record.diagnosis || "",
        secondary_diagnosis: record.secondary_diagnosis || "",
        treatment_plan: record.treatment_plan || "",
        procedure_notes: record.procedure_notes || "",
        follow_up_instructions: record.follow_up_instructions || "",
        weight_kg: record.weight_kg || "",
        temperature_celsius: record.temperature_celsius || "",
        heart_rate: record.heart_rate || "",
        respiratory_rate: record.respiratory_rate || "",
        body_condition_score: record.body_condition_score || "",
        notes: record.notes || "",
        status: record.status || "draft",
        prescriptions: record.prescriptions || [],
        vaccinations: record.vaccinations || [],
      });
    }
  }, [record]);

  const fetchPets = async () => {
    try {
      const data = await apiRequest("/veterinary/patients");
      setPets(Array.isArray(data) ? data : data.patients || []);
    } catch (err) {
      console.error("Failed to fetch pets:", err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const data = await apiRequest("/veterinary/appointments");
      const appointments = Array.isArray(data) ? data : data.appointments || [];
      // Filter to approved appointments
      setAppointments(appointments.filter((a) => a.status === "approved"));
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePetChange = (petId) => {
    setFormData((prev) => ({ ...prev, pet_id: parseInt(petId) }));
  };

  const handleAppointmentChange = (appointmentId) => {
    const appointment = appointments.find((a) => a.id === parseInt(appointmentId));
    setFormData((prev) => ({
      ...prev,
      appointment_id: appointmentId ? parseInt(appointmentId) : null,
    }));

    // Pre-fill some data from appointment if selected
    if (appointment) {
      setFormData((prev) => ({
        ...prev,
        pet_id: appointment.pet_id,
        chief_complaint: appointment.service?.name || prev.chief_complaint,
      }));
    }
  };

  // Prescription management
  const addPrescription = () => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: [
        ...prev.prescriptions,
        {
          id: null,
          medication_name: "",
          generic_name: "",
          medication_type: "",
          dosage: "",
          dosage_unit: "mg",
          frequency: "",
          duration: "",
          route: "Oral",
          instructions: "",
          quantity_prescribed: "",
          quantity_unit: "tablets",
          refills_allowed: 0,
          start_date: new Date().toISOString().split("T")[0],
          end_date: "",
          side_effects_notes: "",
        },
      ],
    }));
  };

  const updatePrescription = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.prescriptions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, prescriptions: updated };
    });
  };

  const removePrescription = (index) => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index),
    }));
  };

  // Vaccination management
  const addVaccination = () => {
    setFormData((prev) => ({
      ...prev,
      vaccinations: [
        ...prev.vaccinations,
        {
          id: null,
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
        },
      ],
    }));
  };

  const updateVaccination = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.vaccinations];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, vaccinations: updated };
    });
  };

  const removeVaccination = (index) => {
    setFormData((prev) => ({
      ...prev,
      vaccinations: prev.vaccinations.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.pet_id) {
      setError("Please select a pet");
      return false;
    }
    if (!formData.visit_date) {
      setError("Please enter a visit date");
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
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        temperature_celsius: formData.temperature_celsius
          ? parseFloat(formData.temperature_celsius)
          : null,
        heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
        respiratory_rate: formData.respiratory_rate
          ? parseInt(formData.respiratory_rate)
          : null,
      };

      if (isEditing) {
        await updateMedicalRecord(record.id, payload);
      } else {
        await createMedicalRecord(payload);
      }

      onSave();
    } catch (err) {
      console.error("Failed to save medical record:", err);
      setError(err.message || "Failed to save medical record");
    } finally {
      setSaving(false);
    }
  };

  const getSelectedPet = () => {
    return pets.find((p) => p.id === formData.pet_id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content medical-record-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <FontAwesomeIcon icon={faNotesMedical} />
            {isEditing ? "Edit Medical Record" : "New Medical Record"}
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

          {/* Patient & Appointment Selection */}
          <div className="section patient-section">
            <h4>
              <FontAwesomeIcon icon={faPaw} />
              Patient Information
            </h4>
            <div className="form-row">
              <div className="form-group">
                <label>Select Pet *</label>
                <select
                  value={formData.pet_id || ""}
                  onChange={(e) => handlePetChange(e.target.value)}
                  disabled={isEditing}
                >
                  <option value="">-- Select Pet --</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species}
                      {pet.breed ? ` - ${pet.breed}` : ""}) - Owner: {pet.customer?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Link to Appointment</label>
                <select
                  value={formData.appointment_id || ""}
                  onChange={(e) => handleAppointmentChange(e.target.value)}
                  disabled={isEditing}
                >
                  <option value="">-- Optional: Link Appointment --</option>
                  {appointments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      {new Date(apt.scheduled_at).toLocaleString()} - {apt.pet?.name} - {apt.service?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {getSelectedPet() && (
              <div className="selected-pet-info">
                <span>
                  <strong>Selected:</strong> {getSelectedPet().name}
                </span>
                <span>Species: {getSelectedPet().species}</span>
                <span>Breed: {getSelectedPet().breed || "N/A"}</span>
                <span>Owner: {getSelectedPet().customer?.name}</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button
              className={activeTab === "consultation" ? "active" : ""}
              onClick={() => setActiveTab("consultation")}
            >
              <FontAwesomeIcon icon={faStethoscope} />
              Consultation
            </button>
            <button
              className={activeTab === "vitals" ? "active" : ""}
              onClick={() => setActiveTab("vitals")}
            >
              <FontAwesomeIcon icon={faHeartbeat} />
              Vitals
            </button>
            <button
              className={activeTab === "prescriptions" ? "active" : ""}
              onClick={() => setActiveTab("prescriptions")}
            >
              <FontAwesomeIcon icon={faPills} />
              Prescriptions ({formData.prescriptions.length})
            </button>
            <button
              className={activeTab === "vaccinations" ? "active" : ""}
              onClick={() => setActiveTab("vaccinations")}
            >
              <FontAwesomeIcon icon={faSyringe} />
              Vaccinations ({formData.vaccinations.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Consultation Tab */}
            {activeTab === "consultation" && (
              <div className="tab-panel">
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      Visit Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.visit_date}
                      onChange={(e) => handleInputChange("visit_date", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Record Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                    >
                      <option value="draft">Draft</option>
                      <option value="finalized">Finalized</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Chief Complaint</label>
                  <textarea
                    value={formData.chief_complaint}
                    onChange={(e) => handleInputChange("chief_complaint", e.target.value)}
                    placeholder="Main reason for visit..."
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label>Symptoms</label>
                  <textarea
                    value={formData.symptoms}
                    onChange={(e) => handleInputChange("symptoms", e.target.value)}
                    placeholder="Observed symptoms..."
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label>Physical Examination Findings</label>
                  <textarea
                    value={formData.physical_examination}
                    onChange={(e) => handleInputChange("physical_examination", e.target.value)}
                    placeholder="Detailed physical examination notes..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Primary Diagnosis</label>
                  <textarea
                    value={formData.diagnosis}
                    onChange={(e) => handleInputChange("diagnosis", e.target.value)}
                    placeholder="Primary diagnosis..."
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label>Secondary Diagnosis / Differential</label>
                  <textarea
                    value={formData.secondary_diagnosis}
                    onChange={(e) => handleInputChange("secondary_diagnosis", e.target.value)}
                    placeholder="Secondary conditions or differential diagnoses..."
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label>Treatment Plan</label>
                  <textarea
                    value={formData.treatment_plan}
                    onChange={(e) => handleInputChange("treatment_plan", e.target.value)}
                    placeholder="Detailed treatment plan..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Procedures Performed</label>
                  <textarea
                    value={formData.procedure_notes}
                    onChange={(e) => handleInputChange("procedure_notes", e.target.value)}
                    placeholder="Any procedures performed during the visit..."
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label>Follow-up Instructions</label>
                  <textarea
                    value={formData.follow_up_instructions}
                    onChange={(e) => handleInputChange("follow_up_instructions", e.target.value)}
                    placeholder="Follow-up care instructions..."
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label>Additional Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any additional notes..."
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Vitals Tab */}
            {activeTab === "vitals" && (
              <div className="tab-panel">
                <div className="vitals-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <FontAwesomeIcon icon={faWeight} />
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.weight_kg}
                        onChange={(e) => handleInputChange("weight_kg", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        <FontAwesomeIcon icon={faThermometerHalf} />
                        Temperature (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.temperature_celsius}
                        onChange={(e) =>
                          handleInputChange("temperature_celsius", e.target.value)
                        }
                        placeholder="38.0"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Heart Rate (bpm)</label>
                      <input
                        type="number"
                        value={formData.heart_rate}
                        onChange={(e) => handleInputChange("heart_rate", e.target.value)}
                        placeholder="80"
                      />
                    </div>
                    <div className="form-group">
                      <label>Respiratory Rate (/min)</label>
                      <input
                        type="number"
                        value={formData.respiratory_rate}
                        onChange={(e) =>
                          handleInputChange("respiratory_rate", e.target.value)
                        }
                        placeholder="20"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Body Condition Score (1-9)</label>
                    <select
                      value={formData.body_condition_score}
                      onChange={(e) =>
                        handleInputChange("body_condition_score", e.target.value)
                      }
                    >
                      <option value="">-- Select BCS --</option>
                      <option value="1">1 - Very Thin</option>
                      <option value="2">2 - Thin</option>
                      <option value="3">3 - Lean</option>
                      <option value="4">4 - Ideal (Low)</option>
                      <option value="5">5 - Ideal</option>
                      <option value="6">6 - Ideal (High)</option>
                      <option value="7">7 - Overweight</option>
                      <option value="8">8 - Obese</option>
                      <option value="9">9 - Severely Obese</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Prescriptions Tab */}
            {activeTab === "prescriptions" && (
              <div className="tab-panel">
                <div className="section-header">
                  <h4>
                    <FontAwesomeIcon icon={faPills} />
                    Prescriptions
                  </h4>
                  <button className="btn-add" onClick={addPrescription}>
                    <FontAwesomeIcon icon={faPlus} />
                    Add Prescription
                  </button>
                </div>

                {formData.prescriptions.length === 0 ? (
                  <p className="empty-message">
                    No prescriptions added. Click "Add Prescription" to add one.
                  </p>
                ) : (
                  <div className="prescriptions-list">
                    {formData.prescriptions.map((prescription, index) => (
                      <div key={index} className="prescription-form-card">
                        <div className="prescription-header">
                          <span>Prescription #{index + 1}</span>
                          <button
                            className="btn-remove"
                            onClick={() => removePrescription(index)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Medication Name *</label>
                            <input
                              type="text"
                              value={prescription.medication_name}
                              onChange={(e) =>
                                updatePrescription(index, "medication_name", e.target.value)
                              }
                              placeholder="e.g., Amoxicillin"
                            />
                          </div>
                          <div className="form-group">
                            <label>Generic Name</label>
                            <input
                              type="text"
                              value={prescription.generic_name}
                              onChange={(e) =>
                                updatePrescription(index, "generic_name", e.target.value)
                              }
                              placeholder="Generic name if different"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Medication Type</label>
                            <select
                              value={prescription.medication_type}
                              onChange={(e) =>
                                updatePrescription(index, "medication_type", e.target.value)
                              }
                            >
                              <option value="">-- Select Type --</option>
                              <option value="Antibiotic">Antibiotic</option>
                              <option value="Anti-inflammatory">Anti-inflammatory</option>
                              <option value="Pain Reliever">Pain Reliever</option>
                              <option value="Antiparasitic">Antiparasitic</option>
                              <option value="Vitamin/Supplement">Vitamin/Supplement</option>
                              <option value="Topical">Topical</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Route</label>
                            <select
                              value={prescription.route}
                              onChange={(e) =>
                                updatePrescription(index, "route", e.target.value)
                              }
                            >
                              <option value="Oral">Oral</option>
                              <option value="Topical">Topical</option>
                              <option value="Subcutaneous">Subcutaneous</option>
                              <option value="Intramuscular">Intramuscular</option>
                              <option value="Intravenous">Intravenous</option>
                              <option value="Ophthalmic">Ophthalmic</option>
                              <option value="Otic">Otic</option>
                              <option value="Inhalation">Inhalation</option>
                              <option value="Rectal">Rectal</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Dosage *</label>
                            <div className="input-with-unit">
                              <input
                                type="text"
                                value={prescription.dosage}
                                onChange={(e) =>
                                  updatePrescription(index, "dosage", e.target.value)
                                }
                                placeholder="e.g., 10"
                              />
                              <select
                                value={prescription.dosage_unit}
                                onChange={(e) =>
                                  updatePrescription(index, "dosage_unit", e.target.value)
                                }
                              >
                                <option value="mg">mg</option>
                                <option value="mL">mL</option>
                                <option value="tablet">tablet</option>
                                <option value="capsule">capsule</option>
                                <option value="g">g</option>
                                <option value="IU">IU</option>
                              </select>
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Frequency *</label>
                            <input
                              type="text"
                              value={prescription.frequency}
                              onChange={(e) =>
                                updatePrescription(index, "frequency", e.target.value)
                              }
                              placeholder="e.g., Twice daily"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Duration *</label>
                            <input
                              type="text"
                              value={prescription.duration}
                              onChange={(e) =>
                                updatePrescription(index, "duration", e.target.value)
                              }
                              placeholder="e.g., 7 days"
                            />
                          </div>
                          <div className="form-group">
                            <label>Quantity *</label>
                            <div className="input-with-unit">
                              <input
                                type="number"
                                step="0.1"
                                value={prescription.quantity_prescribed}
                                onChange={(e) =>
                                  updatePrescription(
                                    index,
                                    "quantity_prescribed",
                                    e.target.value
                                  )
                                }
                              />
                              <select
                                value={prescription.quantity_unit}
                                onChange={(e) =>
                                  updatePrescription(index, "quantity_unit", e.target.value)
                                }
                              >
                                <option value="tablets">tablets</option>
                                <option value="capsules">capsules</option>
                                <option value="mL">mL</option>
                                <option value="bottle">bottle</option>
                                <option value="tube">tube</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Refills Allowed</label>
                            <input
                              type="number"
                              min="0"
                              value={prescription.refills_allowed}
                              onChange={(e) =>
                                updatePrescription(
                                  index,
                                  "refills_allowed",
                                  parseInt(e.target.value) || 0
                                )
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label>Start Date *</label>
                            <input
                              type="date"
                              value={prescription.start_date}
                              onChange={(e) =>
                                updatePrescription(index, "start_date", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Instructions</label>
                          <textarea
                            value={prescription.instructions}
                            onChange={(e) =>
                              updatePrescription(index, "instructions", e.target.value)
                            }
                            placeholder="Special instructions for the pet owner..."
                            rows={2}
                          />
                        </div>

                        <div className="form-group">
                          <label>Side Effects / Precautions</label>
                          <textarea
                            value={prescription.side_effects_notes}
                            onChange={(e) =>
                              updatePrescription(index, "side_effects_notes", e.target.value)
                            }
                            placeholder="Potential side effects or precautions..."
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Vaccinations Tab */}
            {activeTab === "vaccinations" && (
              <div className="tab-panel">
                <div className="section-header">
                  <h4>
                    <FontAwesomeIcon icon={faSyringe} />
                    Vaccinations
                  </h4>
                  <button className="btn-add" onClick={addVaccination}>
                    <FontAwesomeIcon icon={faPlus} />
                    Add Vaccination
                  </button>
                </div>

                {formData.vaccinations.length === 0 ? (
                  <p className="empty-message">
                    No vaccinations added. Click "Add Vaccination" to add one.
                  </p>
                ) : (
                  <div className="vaccinations-list">
                    {formData.vaccinations.map((vaccination, index) => (
                      <div key={index} className="vaccination-form-card">
                        <div className="vaccination-header">
                          <span>Vaccination #{index + 1}</span>
                          <button
                            className="btn-remove"
                            onClick={() => removeVaccination(index)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Vaccine Name *</label>
                            <input
                              type="text"
                              value={vaccination.vaccine_name}
                              onChange={(e) =>
                                updateVaccination(index, "vaccine_name", e.target.value)
                              }
                              placeholder="e.g., Rabies, DHPP"
                            />
                          </div>
                          <div className="form-group">
                            <label>Vaccine Type</label>
                            <select
                              value={vaccination.vaccine_type}
                              onChange={(e) =>
                                updateVaccination(index, "vaccine_type", e.target.value)
                              }
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
                              value={vaccination.manufacturer}
                              onChange={(e) =>
                                updateVaccination(index, "manufacturer", e.target.value)
                              }
                              placeholder="Vaccine manufacturer"
                            />
                          </div>
                          <div className="form-group">
                            <label>Lot Number</label>
                            <input
                              type="text"
                              value={vaccination.lot_number}
                              onChange={(e) =>
                                updateVaccination(index, "lot_number", e.target.value)
                              }
                              placeholder="Lot/batch number"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Date Administered *</label>
                            <input
                              type="date"
                              value={vaccination.date_administered}
                              onChange={(e) =>
                                updateVaccination(
                                  index,
                                  "date_administered",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label>Next Due Date</label>
                            <input
                              type="date"
                              value={vaccination.next_due_date}
                              onChange={(e) =>
                                updateVaccination(index, "next_due_date", e.target.value)
                              }
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
                                value={vaccination.dosage}
                                onChange={(e) =>
                                  updateVaccination(index, "dosage", e.target.value)
                                }
                                placeholder="Amount"
                              />
                              <select
                                value={vaccination.dosage_unit}
                                onChange={(e) =>
                                  updateVaccination(index, "dosage_unit", e.target.value)
                                }
                              >
                                <option value="mL">mL</option>
                                <option value="mg">mg</option>
                              </select>
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Route of Administration</label>
                            <select
                              value={vaccination.route_of_administration}
                              onChange={(e) =>
                                updateVaccination(
                                  index,
                                  "route_of_administration",
                                  e.target.value
                                )
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
                            value={vaccination.site_of_administration}
                            onChange={(e) =>
                              updateVaccination(
                                index,
                                "site_of_administration",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Right hind leg"
                          />
                        </div>

                        <div className="form-group">
                          <label>Notes</label>
                          <textarea
                            value={vaccination.notes}
                            onChange={(e) =>
                              updateVaccination(index, "notes", e.target.value)
                            }
                            placeholder="Any additional notes..."
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} />
                {isEditing ? "Update Record" : "Save Record"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordModal;
