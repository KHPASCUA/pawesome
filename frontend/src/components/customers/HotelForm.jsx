import React, { useState } from "react";

const HotelForm = () => {
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    petName: "",
    roomType: "standard"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Hotel booking submitted:", formData);
    alert("Hotel booking submitted!");
  };

  return (
    <div>
      <h2>Hotel Reservation Form</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="petName" placeholder="Pet Name" onChange={handleChange} required />
        <input type="date" name="checkIn" onChange={handleChange} required />
        <input type="date" name="checkOut" onChange={handleChange} required />
        <select name="roomType" onChange={handleChange}>
          <option value="standard">Standard</option>
          <option value="deluxe">Deluxe</option>
        </select>
        <button type="submit">Book Hotel</button>
      </form>
    </div>
  );
};

export default HotelForm;