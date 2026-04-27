import React, { useEffect, useState, useCallback } from "react";
import "./CustomerPets.css";

const CustomerPets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);

  const customerEmail = localStorage.getItem("email");

  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    gender: "",
    notes: "",
    customer_email: customerEmail || "",
  });

  const fetchPets = useCallback(async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/pets?email=${customerEmail}`
      );
      const data = await response.json();
      setPets(data.pets || []);
    } catch (error) {
      console.error("Failed to load pets:", error);
    }
  }, [customerEmail]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({
          name: "",
          species: "",
          breed: "",
          age: "",
          gender: "",
          notes: "",
          customer_email: customerEmail || "",
        });

        fetchPets();
        alert("Pet added successfully!");
      } else {
        alert(data.message || "Failed to add pet");
      }
    } catch (error) {
      alert("Failed to add pet");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this pet?")) return;

    try {
      await fetch(`http://127.0.0.1:8000/api/pets/${id}`, {
        method: "DELETE",
      });
      fetchPets();
    } catch (error) {
      alert("Failed to delete pet");
    }
  };

  return (
    <section className="customer-pets">
      <div className="pets-header">
        <h1>My Pets</h1>
        <p>Add and manage your registered pets.</p>
      </div>

      <div className="pets-layout">
        <div className="pets-card">
          <h2>Add Pet</h2>

          <form className="pets-form" onSubmit={handleSubmit}>
            <input
              name="name"
              placeholder="Pet Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <select
              name="species"
              value={formData.species}
              onChange={handleChange}
              required
            >
              <option value="">Select Species</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Bird">Bird</option>
              <option value="Other">Other</option>
            </select>

            <input
              name="breed"
              placeholder="Breed"
              value={formData.breed}
              onChange={handleChange}
            />

            <input
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
            />

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <textarea
              name="notes"
              placeholder="Medical notes or special needs"
              value={formData.notes}
              onChange={handleChange}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Add Pet"}
            </button>
          </form>
        </div>

        <div className="pets-card">
          <h2>Registered Pets</h2>

          {pets.length === 0 ? (
            <p>No pets added yet.</p>
          ) : (
            <div className="pets-list">
              {pets.map((pet) => (
                <div className="pet-item" key={pet.id}>
                  <div>
                    <h3>{pet.name}</h3>
                    <p>{pet.species} • {pet.breed || "No breed"}</p>
                    <p>Age: {pet.age || "N/A"} | Gender: {pet.gender || "N/A"}</p>
                    <small>{pet.notes || "No notes"}</small>
                  </div>

                  <button onClick={() => handleDelete(pet.id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CustomerPets;