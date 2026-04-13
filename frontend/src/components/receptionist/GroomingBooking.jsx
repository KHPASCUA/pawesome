import React, { useState } from "react";

const GroomingBooking = () => {
  const [formData, setFormData] = useState({
    petName: "",
    ownerName: "",
    service: "bath",
    date: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Grooming booking:", formData);
    alert("Grooming booking submitted!");
  };

  return (
    <div>
      <h2>Grooming Booking</h2>
      <form onSubmit={handleSubmit}>
        <input name="petName" placeholder="Pet Name" onChange={handleChange} required />
        <input name="ownerName" placeholder="Owner Name" onChange={handleChange} required />
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

export default GroomingBooking;