import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUser,
  faEnvelope,
  faPhone,
  faSpinner,
  faExclamationTriangle,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import "./VetCustomerProfiles.css";

const VetCustomerProfiles = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/veterinary/patients");
      const patients = Array.isArray(data) ? data : data.patients || data.data || [];
      const customers = patients.map((pet) => ({
        id: pet.id,
        name: pet.customer?.name || "Unknown Owner",
        email: pet.customer?.email || "",
        phone: pet.customer?.phone || "",
        address: pet.customer?.address || "",
        pet_name: pet.name,
        pet_species: pet.species,
        pet_breed: pet.breed,
      }));
      setCustomers(customers);
      setError("");
    } catch (err) {
      setError("Failed to load customers. Please try again.");
      console.error("Failed to fetch customers:", err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <section className="app-content vet-customer-profiles">
        <div className="premium-card vet-loading-state">
          <FontAwesomeIcon icon={faSpinner} className="spin-animation" />
          <span>Loading customers...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="app-content vet-customer-profiles">
        <div className="premium-card vet-error-state">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="app-content vet-customer-profiles">
      <div className="premium-card vet-profiles-header">
        <div>
          <h2 className="premium-title">
            <FontAwesomeIcon icon={faUser} /> Customer Profiles
          </h2>
          <p className="premium-muted">View and search customer information</p>
        </div>
      </div>

      <div className="premium-card vet-profiles-search">
        <div className="vet-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="premium-card vet-empty-state">
          <FontAwesomeIcon icon={faUser} />
          <h3>No customers found</h3>
          <p>Try adjusting your search</p>
        </div>
      ) : (
        <div className="vet-customer-list">
          {filteredCustomers.map((customer) => (
            <article key={customer.id} className="premium-card vet-customer-card">
              <div className="vet-customer-avatar">
                {customer.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="customer-info">
                <h3>{customer.name}</h3>

                <p className="pet-line">
                  <FontAwesomeIcon icon={faUser} />
                  Pet: {customer.pet_name || "Unknown Pet"} • {customer.pet_species || "Unknown"} • {customer.pet_breed || "Unknown"}
                </p>

                <p>
                  <FontAwesomeIcon icon={faEnvelope} /> {customer.email || "No email"}
                </p>

                <p>
                  <FontAwesomeIcon icon={faPhone} /> {customer.phone || "No phone"}
                </p>

                {customer.address && (
                  <p>
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> {customer.address}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default VetCustomerProfiles;