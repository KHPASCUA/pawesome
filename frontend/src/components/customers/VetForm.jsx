import React, { useState } from "react";

const VetForm = () => {
  const [formData, setFormData] = useState({
    petName: "",
    service: "checkup",
    date: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Vet appointment submitted:", formData);
    alert("Vet appointment submitted!");
  };

  return (
    <div>
      <h2>Vet Appointment Form</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="petName" placeholder="Pet Name" onChange={handleChange} required />
        <select name="service" onChange={handleChange}>
          <option value="checkup">Checkup</option>
          <option value="vaccination">Vaccination</option>
          <option value="surgery">Surgery</option>
        </select>
        <input type="date" name="date" onChange={handleChange} required />
        <button type="submit">Book Vet</button>
      </form>
    </div>
  );
};

export default VetForm;