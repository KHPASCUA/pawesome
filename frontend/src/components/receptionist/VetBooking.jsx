import React, { useState } from "react";

const VetBooking = () => {
  const [formData, setFormData] = useState({
    petName: "",
    ownerName: "",
    service: "checkup",
    date: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Vet booking:", formData);
    alert("Vet booking submitted!");
  };

  return (
    <div>
      <h2>Vet Booking</h2>
      <form onSubmit={handleSubmit}>
        <input name="petName" placeholder="Pet Name" onChange={handleChange} required />
        <input name="ownerName" placeholder="Owner Name" onChange={handleChange} required />
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

export default VetBooking;