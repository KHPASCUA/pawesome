import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaCat,
  FaDog,
  FaDove,
  FaExclamationTriangle,
  FaPaw,
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaTrash,
  FaUserAlt,
  FaVenusMars,
} from "react-icons/fa";
import "./CustomerPets.css";
import { apiRequest } from "../../api/client";

const initialForm = (customerEmail) => ({
  name: "",
  species: "",
  breed: "",
  age: "",
  gender: "",
  notes: "",
  customer_email: customerEmail || "",
});

const CustomerPets = () => {
  const customerEmail = localStorage.getItem("email") || "";
  const customerName = localStorage.getItem("name") || "Customer";

  const [pets, setPets] = useState([]);
  const [formData, setFormData] = useState(initialForm(customerEmail));
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [message, setMessage] = useState({ type: "", text: "" });

  const safeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.pets)) return value.pets;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.data?.data)) return value.data.data;
    if (Array.isArray(value?.records)) return value.records;
    if (Array.isArray(value?.result)) return value.result;
    if (Array.isArray(value?.results)) return value.results;
    return [];
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });

    window.clearTimeout(window.customerPetsMessageTimer);
    window.customerPetsMessageTimer = window.setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 3500);
  };

  const getPetName = (pet) => pet?.name || pet?.pet_name || "Unnamed Pet";
  const getPetSpecies = (pet) => pet?.species || pet?.type || "Pet";
  const getPetBreed = (pet) => pet?.breed || "No breed";
  const getPetAge = (pet) => pet?.age || "N/A";
  const getPetGender = (pet) => pet?.gender || "N/A";

  const getSpeciesIcon = (species) => {
    const value = String(species || "").toLowerCase();

    if (value.includes("dog")) return <FaDog />;
    if (value.includes("cat")) return <FaCat />;
    if (value.includes("rabbit")) return <FaPaw />;
    if (value.includes("bird")) return <FaDove />;

    return <FaPaw />;
  };

  const fetchPets = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) {
          setPageLoading(true);
        } else {
          setRefreshing(true);
        }

        let data = null;

        try {
          data = await apiRequest("/customer/pets");
        } catch (customerPetsError) {
          console.warn("Customer pets endpoint failed. Trying /pets:", customerPetsError);
          data = await apiRequest("/pets");
        }

        setPets(safeArray(data));
      } catch (error) {
        console.error("Failed to load pets:", error);
        setPets([]);
        showMessage("error", "Failed to load pets. Please refresh the page.");
      } finally {
        setPageLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const stats = useMemo(() => {
    const speciesCount = new Set(
      pets.map((pet) => getPetSpecies(pet)).filter(Boolean)
    ).size;

    const dogs = pets.filter((pet) =>
      String(getPetSpecies(pet)).toLowerCase().includes("dog")
    ).length;

    const cats = pets.filter((pet) =>
      String(getPetSpecies(pet)).toLowerCase().includes("cat")
    ).length;

    return {
      total: pets.length,
      speciesCount,
      dogs,
      cats,
    };
  }, [pets]);

  const speciesOptions = useMemo(() => {
    const values = pets
      .map((pet) => getPetSpecies(pet))
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index);

    return values;
  }, [pets]);

  const filteredPets = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return pets.filter((pet) => {
      const species = getPetSpecies(pet);

      const matchesSpecies =
        speciesFilter === "all" ||
        String(species).toLowerCase() === String(speciesFilter).toLowerCase();

      const searchableText = [
        getPetName(pet),
        getPetSpecies(pet),
        getPetBreed(pet),
        getPetAge(pet),
        getPetGender(pet),
        pet?.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !keyword || searchableText.includes(keyword);

      return matchesSpecies && matchesSearch;
    });
  }, [pets, searchTerm, speciesFilter]);

  const validateForm = () => {
    if (!formData.name.trim()) return "Pet name is required.";
    if (!formData.species) return "Please select pet species.";

    if (formData.age && Number(formData.age) < 0) {
      return "Age cannot be negative.";
    }

    return "";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (message.text) setMessage({ type: "", text: "" });
  };

  const resetForm = () => {
    setFormData(initialForm(customerEmail));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      showMessage("error", validationError);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name?.trim(),
        species: formData.species,
        breed: formData.breed?.trim() || null,
        age: formData.age ? Number(formData.age) : null,
        gender: formData.gender || null,
        notes: formData.notes?.trim() || null,
      };

      const data = await apiRequest("/customer/pets", "POST", payload);

      resetForm();
      await fetchPets({ silent: true });
      showMessage("success", data?.message || "Pet added successfully.");
    } catch (error) {
      console.error("ADD PET ERROR:", error);
      console.error("Response:", error.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to add pet. Please try again.";

      alert(message);
      showMessage("error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this pet? This may affect future booking selection.")) {
      return;
    }

    try {
      setDeletingId(id);

      try {
        await apiRequest(`/customer/pets/${id}`, {
          method: "DELETE",
        });
      } catch (customerDeleteError) {
        console.warn("Customer delete endpoint failed. Trying /pets:", customerDeleteError);
        await apiRequest(`/pets/${id}`, {
          method: "DELETE",
        });
      }

      await fetchPets({ silent: true });
      showMessage("success", "Pet deleted successfully.");
    } catch (error) {
      console.error("Failed to delete pet:", error);
      showMessage("error", "Failed to delete pet. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefresh = () => {
    fetchPets({ silent: true });
  };

  if (pageLoading) {
    return (
      <section className="customer-pets">
        <div className="pets-loading-state">
          <FaSyncAlt className="spin" />
          <h3>Loading your pets...</h3>
          <p>Please wait while we prepare your pet records.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="customer-pets">
      {message.text && (
        <div className={`pets-toast ${message.type}`}>
          {message.type === "success" ? <FaPaw /> : <FaExclamationTriangle />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="pets-hero">
        <div>
          <span className="pets-eyebrow">
            <FaPaw />
            Customer Pet Records
          </span>

          <h1>My Pets</h1>
          <p>
            Add and manage your registered pets. These records are used when
            booking hotel, grooming, and veterinary services.
          </p>
        </div>

        <button
          className={`pets-refresh-btn ${refreshing ? "refreshing" : ""}`}
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <FaSyncAlt />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="pets-stats-grid">
        <article className="pets-stat-card">
          <span>
            <FaPaw />
          </span>
          <div>
            <strong>{stats.total}</strong>
            <p>Total Pets</p>
          </div>
        </article>

        <article className="pets-stat-card">
          <span>
            <FaClipboardSpecies />
          </span>
          <div>
            <strong>{stats.speciesCount}</strong>
            <p>Species Types</p>
          </div>
        </article>

        <article className="pets-stat-card">
          <span>
            <FaDog />
          </span>
          <div>
            <strong>{stats.dogs}</strong>
            <p>Dogs</p>
          </div>
        </article>

        <article className="pets-stat-card">
          <span>
            <FaCat />
          </span>
          <div>
            <strong>{stats.cats}</strong>
            <p>Cats</p>
          </div>
        </article>
      </div>

      <div className="pets-layout">
        <div className="pets-card pets-form-card">
          <div className="pets-card-header">
            <div>
              <h2>Add New Pet</h2>
              <p>Register a pet so it can be selected in bookings.</p>
            </div>
            <span>
              <FaPlus />
            </span>
          </div>

          <form className="pets-form" onSubmit={handleSubmit}>
            <label>
              Pet Name <small>*</small>
              <input
                name="name"
                placeholder="Example: Max"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Species <small>*</small>
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
            </label>

            <label>
              Breed
              <input
                name="breed"
                placeholder="Example: Shih Tzu"
                value={formData.breed}
                onChange={handleChange}
              />
            </label>

            <div className="pets-form-row">
              <label>
                Age
                <input
                  name="age"
                  type="number"
                  min="0"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                />
              </label>

              <label>
                Gender
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </label>
            </div>

            <label>
              Medical Notes / Special Needs
              <textarea
                name="notes"
                placeholder="Example: Allergies, medications, behavior notes..."
                value={formData.notes}
                onChange={handleChange}
              />
            </label>

            <div className="pets-form-actions">
              <button type="button" className="pets-reset-btn" onClick={resetForm}>
                Clear
              </button>

              <button type="submit" className="pets-submit-btn" disabled={loading}>
                {loading ? "Saving..." : "Add Pet"}
              </button>
            </div>
          </form>
        </div>

        <div className="pets-card pets-list-card">
          <div className="pets-card-header">
            <div>
              <h2>Registered Pets</h2>
              <p>Search and manage your saved pet profiles.</p>
            </div>
          </div>

          <div className="pets-toolbar">
            <div className="pets-search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search pet, species, breed, notes..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm("")}>
                  <FaTimes />
                </button>
              )}
            </div>

            <select
              className="pets-filter-select"
              value={speciesFilter}
              onChange={(event) => setSpeciesFilter(event.target.value)}
            >
              <option value="all">All Species</option>
              {speciesOptions.map((species) => (
                <option key={species} value={species}>
                  {species}
                </option>
              ))}
            </select>
          </div>

          {filteredPets.length === 0 ? (
            <div className="pets-empty-state">
              <FaPaw />
              <h3>No pets found</h3>
              <p>
                {searchTerm || speciesFilter !== "all"
                  ? "Try adjusting your search or filter."
                  : "Add your first pet using the form."}
              </p>
            </div>
          ) : (
            <div className="pets-list">
              {filteredPets.map((pet) => (
                <article className="pet-item" key={pet.id}>
                  <div className="pet-avatar">
                    {getSpeciesIcon(getPetSpecies(pet))}
                  </div>

                  <div className="pet-info">
                    <div className="pet-title-row">
                      <div>
                        <h3>{getPetName(pet)}</h3>
                        <p>
                          {getPetSpecies(pet)} • {getPetBreed(pet)}
                        </p>
                      </div>

                      <span className="pet-species-badge">
                        {getPetSpecies(pet)}
                      </span>
                    </div>

                    <div className="pet-detail-grid">
                      <span>
                        <FaUserAlt />
                        Age: {getPetAge(pet)}
                      </span>

                      <span>
                        <FaVenusMars />
                        Gender: {getPetGender(pet)}
                      </span>
                    </div>

                    <small>{pet.notes || "No medical notes or special needs recorded."}</small>
                  </div>

                  <button
                    className="pet-delete-btn"
                    type="button"
                    onClick={() => handleDelete(pet.id)}
                    disabled={deletingId === pet.id}
                  >
                    <FaTrash />
                    {deletingId === pet.id ? "Deleting..." : "Delete"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const FaClipboardSpecies = () => <FaPaw />;

export default CustomerPets;