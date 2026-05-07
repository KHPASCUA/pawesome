import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleCheck,
  faFileMedical,
  faNotesMedical,
  faPaw,
  faPlay,
  faSave,
  faSpinner,
  faStethoscope,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { apiRequest } from "../../api/client";
import "./VetConsultation.css";

const emptyForm = {
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
};

const VetConsultation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const appointmentStatus = appointment?.status || "";
  const isStarted = ["in_progress", "treated"].includes(appointmentStatus);
  const isFinalized = record?.status === "finalized" || record?.status === "locked";

  const serviceLabel = useMemo(() => {
    const service = appointment?.service;
    return service?.name || appointment?.service_name || "Veterinary consultation";
  }, [appointment]);

  const fillFormFromRecord = useCallback((medicalRecord) => {
    if (!medicalRecord) {
      setForm(emptyForm);
      return;
    }

    setForm({
      chief_complaint: medicalRecord.chief_complaint || "",
      symptoms: medicalRecord.symptoms || "",
      physical_examination: medicalRecord.physical_examination || "",
      diagnosis: medicalRecord.diagnosis || "",
      secondary_diagnosis: medicalRecord.secondary_diagnosis || "",
      treatment_plan: medicalRecord.treatment_plan || "",
      procedure_notes: medicalRecord.procedure_notes || "",
      follow_up_instructions: medicalRecord.follow_up_instructions || "",
      weight_kg: medicalRecord.weight_kg || "",
      temperature_celsius: medicalRecord.temperature_celsius || "",
      heart_rate: medicalRecord.heart_rate || "",
      respiratory_rate: medicalRecord.respiratory_rate || "",
      body_condition_score: medicalRecord.body_condition_score || "",
      notes: medicalRecord.notes || "",
    });
  }, []);

  const loadConsultation = useCallback(async () => {
    try {
      setLoading(true);
      const appointmentResponse = await apiRequest(`/veterinary/appointments/${id}`);
      const nextAppointment = appointmentResponse?.appointment || appointmentResponse;
      setAppointment(nextAppointment);

      if (nextAppointment?.pet_id) {
        const recordsResponse = await apiRequest(`/veterinary/pets/${nextAppointment.pet_id}/medical-records`);
        const records = Array.isArray(recordsResponse?.records) ? recordsResponse.records : [];
        const existing = records.find((item) => Number(item.appointment_id) === Number(id));
        setRecord(existing || null);
        fillFormFromRecord(existing || null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load consultation.");
    } finally {
      setLoading(false);
    }
  }, [fillFormFromRecord, id]);

  useEffect(() => {
    loadConsultation();
  }, [loadConsultation]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const buildPayload = (status = "draft") => ({
    ...form,
    pet_id: appointment?.pet_id,
    appointment_id: appointment?.id,
    visit_date: new Date().toISOString(),
    status,
  });

  const startAppointment = async () => {
    try {
      setSaving(true);
      const response = await apiRequest(`/veterinary/appointments/${id}/start`, {
        method: "POST",
        body: JSON.stringify({ notes: "Consultation started by veterinarian" }),
      });

      toast.success("Consultation started.");
      setAppointment(response?.appointment || appointment);
      if (response?.medical_record) {
        setRecord(response.medical_record);
        fillFormFromRecord(response.medical_record);
      } else {
        await loadConsultation();
      }
    } catch (err) {
      toast.error(err.message || "Failed to start consultation.");
    } finally {
      setSaving(false);
    }
  };

  const saveRecord = async (status = "draft") => {
    if (!isStarted) {
      toast.error("Start the appointment before writing consultation notes.");
      return null;
    }

    try {
      setSaving(true);
      const payload = buildPayload(status);
      const response = record?.id
        ? await apiRequest(`/veterinary/medical-records/${record.id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await apiRequest("/veterinary/medical-records", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      const nextRecord = response?.record || response;
      setRecord(nextRecord);
      fillFormFromRecord(nextRecord);
      toast.success(status === "finalized" ? "Consultation finalized." : "Consultation draft saved.");
      return nextRecord;
    } catch (err) {
      toast.error(err.message || "Failed to save consultation.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const finalizeAndComplete = async () => {
    const finalized = await saveRecord("finalized");
    if (!finalized) return;

    try {
      setSaving(true);
      await apiRequest(`/veterinary/appointments/${id}/complete`, {
        method: "POST",
        body: JSON.stringify({ notes: "Consultation finalized and appointment completed" }),
      });
      toast.success("Appointment completed. Receipt is ready.");
      navigate(`/veterinary/receipt?id=${id}`);
    } catch (err) {
      toast.error(err.message || "Failed to complete appointment.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="vet-consultation">
        <div className="consult-loading">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Loading consultation...</span>
        </div>
      </section>
    );
  }

  if (!appointment) {
    return (
      <section className="vet-consultation">
        <div className="consult-empty">Appointment not found.</div>
      </section>
    );
  }

  return (
    <section className="vet-consultation">
      <div className="consult-header">
        <button type="button" className="consult-back" onClick={() => navigate("/veterinary/appointments")}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </button>
        <div>
          <span className="consult-eyebrow">
            <FontAwesomeIcon icon={faFileMedical} />
            Consultation
          </span>
          <h2>{appointment.pet?.name || "Patient"}</h2>
          <p>{serviceLabel}</p>
        </div>
      </div>

      <div className="consult-summary">
        <article>
          <FontAwesomeIcon icon={faPaw} />
          <span>Pet</span>
          <strong>{appointment.pet?.name || "Unknown"}</strong>
          <small>{appointment.pet?.species || "Pet"} {appointment.pet?.breed ? `- ${appointment.pet.breed}` : ""}</small>
        </article>
        <article>
          <FontAwesomeIcon icon={faUser} />
          <span>Owner</span>
          <strong>{appointment.customer?.name || "Unknown owner"}</strong>
          <small>{appointment.customer?.phone || appointment.customer?.email || "No contact"}</small>
        </article>
        <article>
          <FontAwesomeIcon icon={faStethoscope} />
          <span>Service Acquired</span>
          <strong>{serviceLabel}</strong>
          <small>{appointment.service?.category || "Veterinary service"}</small>
        </article>
        <article>
          <FontAwesomeIcon icon={faNotesMedical} />
          <span>Status</span>
          <strong>{appointmentStatus.replace(/_/g, " ")}</strong>
          <small>{record ? `Record: ${record.status}` : "No record yet"}</small>
        </article>
      </div>

      {!isStarted && (
        <div className="consult-start-panel">
          <p>Start the appointment to open a medical record for this pet.</p>
          <button type="button" onClick={startAppointment} disabled={saving}>
            <FontAwesomeIcon icon={faPlay} />
            Start Consultation
          </button>
        </div>
      )}

      <div className="consult-form">
        <label>
          Chief Complaint
          <textarea value={form.chief_complaint} onChange={(e) => updateField("chief_complaint", e.target.value)} />
        </label>
        <label>
          Symptoms
          <textarea value={form.symptoms} onChange={(e) => updateField("symptoms", e.target.value)} />
        </label>
        <label>
          Physical Examination
          <textarea value={form.physical_examination} onChange={(e) => updateField("physical_examination", e.target.value)} />
        </label>
        <label>
          Diagnosis
          <textarea value={form.diagnosis} onChange={(e) => updateField("diagnosis", e.target.value)} />
        </label>
        <label>
          Treatment Plan
          <textarea value={form.treatment_plan} onChange={(e) => updateField("treatment_plan", e.target.value)} />
        </label>
        <label>
          Procedure Notes
          <textarea value={form.procedure_notes} onChange={(e) => updateField("procedure_notes", e.target.value)} />
        </label>
        <label>
          Follow-up Instructions
          <textarea value={form.follow_up_instructions} onChange={(e) => updateField("follow_up_instructions", e.target.value)} />
        </label>
        <label>
          General Notes
          <textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} />
        </label>

        <div className="consult-vitals">
          <label>
            Weight kg
            <input value={form.weight_kg} onChange={(e) => updateField("weight_kg", e.target.value)} />
          </label>
          <label>
            Temp C
            <input value={form.temperature_celsius} onChange={(e) => updateField("temperature_celsius", e.target.value)} />
          </label>
          <label>
            Heart Rate
            <input value={form.heart_rate} onChange={(e) => updateField("heart_rate", e.target.value)} />
          </label>
          <label>
            Resp. Rate
            <input value={form.respiratory_rate} onChange={(e) => updateField("respiratory_rate", e.target.value)} />
          </label>
          <label>
            Body Score
            <input value={form.body_condition_score} onChange={(e) => updateField("body_condition_score", e.target.value)} />
          </label>
        </div>
      </div>

      <div className="consult-actions">
        <button type="button" className="secondary" onClick={() => saveRecord("draft")} disabled={!isStarted || saving || isFinalized}>
          <FontAwesomeIcon icon={faSave} />
          Save Draft
        </button>
        <button type="button" className="primary" onClick={finalizeAndComplete} disabled={!isStarted || saving}>
          <FontAwesomeIcon icon={faCircleCheck} />
          Finalize & Complete
        </button>
      </div>
    </section>
  );
};

export default VetConsultation;
