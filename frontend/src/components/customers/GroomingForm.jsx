import React, { useState } from "react";

const GroomingForm = () => {
  const [formData, setFormData] = useState({
    petName: "",
    service: "bath",
    date: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Grooming appointment submitted:", formData);
    alert("Grooming appointment submitted!");
  };

  return (
    <div>
      <h2>Grooming Appointment Form</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="petName" placeholder="Pet Name" onChange={handleChange} required />
        <select name="service" onChange={handleChange}>
          <option value="bath">Bath</option>
          <option value="haircut">Haircut</option>
          <option value="nailTrim">Nail Trim</option>
        </select>
        <input type="date" name="date" onChange={handleChange} required />
        <button type="submit">Book Grooming</button>
      </form>
    </div>
  );
};

export default GroomingForm;