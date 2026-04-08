import React, { useState } from "react";

const Inventory = () => {
  const [items, setItems] = useState([
    { id: 1, name: "Dog Food", quantity: 20, category: "Pet Supplies" },
    { id: 2, name: "Shampoo", quantity: 15, category: "Grooming" },
    { id: 3, name: "Deluxe Room", quantity: 5, category: "Hotel" }
  ]);

  const [formData, setFormData] = useState({ name: "", quantity: "", category: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      id: items.length + 1,
      name: formData.name,
      quantity: parseInt(formData.quantity),
      category: formData.category
    };
    setItems([...items, newItem]);
    setFormData({ name: "", quantity: "", category: "" });
  };

  return (
    <div>
      <h2>Inventory Management</h2>

      {/* Add Item Form */}
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Item Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        />
        <input
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Item</button>
      </form>

      {/* Inventory List */}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} ({item.category}) — Quantity: {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Inventory;