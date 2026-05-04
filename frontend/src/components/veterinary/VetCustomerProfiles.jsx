import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUser,
  faEnvelope,
  faPhone,
  faSpinner,
  faExclamationTriangle,
  faMapMarkerAlt,
  faPaw,
  faRotateRight,
  faXmark,
  faUsers,
  faIdCard,
  faClipboardList,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { apiRequest } from "../../api/client";
import "./VetCustomerProfiles.css";

const VetCustomerProfiles = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const safeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.patients)) return value.patients;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.records)) return value.records;
    if (Array.isArray(value?.pets)) return value.pets;
    return [];
  };

  const getOwnerName = (pet) =>
    pet?.customer?.name ||
    pet?.owner?.name ||
    pet?.customer_name ||
    pet?.owner_name ||
    "Unknown Owner";

  const getOwnerEmail = (pet) =>
    pet?.customer?.email ||
    pet?.owner?.email ||
    pet?.customer_email ||
    pet?.email ||
    "";

  const getOwnerPhone = (pet) =>
    pet?.customer?.phone ||
    pet?.owner?.phone ||
    pet?.customer_phone ||
    pet?.phone ||
    "";

  const getOwnerAddress = (pet) =>
    pet?.customer?.address ||
    pet?.owner?.address ||
    pet?.customer_address ||
    pet?.address ||
    "";

  const getPetName = (pet) =>
    pet?.name ||
    pet?.pet_name ||
    "Unknown Pet";

  const getPetSpecies = (pet) =>
    pet?.species ||
    pet?.pet_species ||
    "Unknown";

  const getPetBreed = (pet) =>
    pet?.breed ||
    pet?.pet_breed ||
    "Unknown";

  const getPetAge = (pet) =>
    pet?.age ||
    pet?.pet_age ||
    "";

  const transformPatient = (pet) => ({
    id: pet?.id || `${getOwnerName(pet)}-${getPetName(pet)}`,
    owner_id: pet?.customer?.id || pet?.owner?.id || pet?.customer_id || "",
    name: getOwnerName(pet),
    email: getOwnerEmail(pet),
    phone: getOwnerPhone(pet),
    address: getOwnerAddress(pet),
    pet_name: getPetName(pet),
    pet_species: getPetSpecies(pet),
    pet_breed: getPetBreed(pet),
    pet_age: getPetAge(pet),
    pet_status: pet?.status || pet?.health_status || "Active",
    raw: pet,
  });

  const fetchCustomers = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const data = await apiRequest("/veterinary/patients");
      const patients = safeArray(data);
      const mappedCustomers = patients.map(transformPatient);

      setCustomers(mappedCustomers);
      setError("");
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setError("Failed to load customer profiles. Please try again.");
      setCustomers([]);

      if (!silent) {
        toast.error("Failed to load customer profiles.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers({ silent: false });
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return customers;

    return customers.filter((customer) => {
      const searchableText = [
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        customer.pet_name,
        customer.pet_species,
        customer.pet_breed,
        customer.pet_status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [customers, searchTerm]);

  const stats = useMemo(() => {
    const uniqueOwners = new Set(
      customers.map((customer) => customer.owner_id || customer.name)
    ).size;

    const speciesCount = new Set(
      customers.map((customer) => customer.pet_species).filter(Boolean)
    ).size;

    return {
      totalPatients: customers.length,
      uniqueOwners,
      speciesCount,
    };
  }, [customers]);

  const handleRefresh = () => {
    fetchCustomers({ silent: true });
    toast.success("Customer profiles refreshed.");
  };

  if (loading) {
    return (
      <section className="app-content vet-customer-profiles">
        <div className="premium-card vet-loading-state">
          <FontAwesomeIcon icon={faSpinner} className="spin-animation" />
          <span>Loading customer profiles...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="app-content vet-customer-profiles">
      <div className="premium-card vet-profiles-hero">
        <div className="vet-profiles-hero-copy">
          <span className="vet-profiles-eyebrow">
            <FontAwesomeIcon icon={faIdCard} />
            Veterinary Records
          </span>

          <h2 className="premium-title">
            <FontAwesomeIcon icon={faUser} />
            Customer Profiles
          </h2>

          <p className="premium-muted">
            View customer details, pet records, contact information, and patient ownership data.
          </p>
        </div>

        <button
          className={`vet-refresh-btn ${refreshing ? "refreshing" : ""}`}
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <FontAwesomeIcon icon={faRotateRight} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="premium-card vet-error-banner">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      )}

      <div className="vet-profile-stats">
        <article className="premium-card vet-profile-stat-card">
          <span>
            <FontAwesomeIcon icon={faPaw} />
          </span>
          <div>
            <h3>{stats.totalPatients}</h3>
            <p>Total Patients</p>
          </div>
        </article>

        <article className="premium-card vet-profile-stat-card">
          <span>
            <FontAwesomeIcon icon={faUsers} />
          </span>
          <div>
            <h3>{stats.uniqueOwners}</h3>
            <p>Pet Owners</p>
          </div>
        </article>

        <article className="premium-card vet-profile-stat-card">
          <span>
            <FontAwesomeIcon icon={faClipboardList} />
          </span>
          <div>
            <h3>{stats.speciesCount}</h3>
            <p>Species Types</p>
          </div>
        </article>
      </div>

      <div className="premium-card vet-profiles-search">
        <div className="vet-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search by owner, email, phone, address, pet, species, or breed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button
              className="vet-clear-search-btn"
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <div className="vet-search-meta">
          Showing <strong>{filteredCustomers.length}</strong> of{" "}
          <strong>{customers.length}</strong> profiles
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="premium-card vet-empty-state">
          <FontAwesomeIcon icon={faUser} />
          <h3>No customer profiles found</h3>
          <p>
            {searchTerm
              ? "Try another owner name, pet name, email, phone, species, or breed."
              : "Patient records will appear here once available."}
          </p>
        </div>
      ) : (
        <div className="vet-customer-list">
          {filteredCustomers.map((customer) => (
            <article key={customer.id} className="premium-card vet-customer-card">
              <div className="vet-customer-avatar">
                {customer.name?.charAt(0)?.toUpperCase() || "?"}
              </div>

              <div className="vet-customer-info">
                <div className="vet-customer-mainline">
                  <div>
                    <h3>{customer.name}</h3>
                    <p className="pet-line">
                      <FontAwesomeIcon icon={faPaw} />
                      {customer.pet_name || "Unknown Pet"} •{" "}
                      {customer.pet_species || "Unknown"} •{" "}
                      {customer.pet_breed || "Unknown"}
                      {customer.pet_age ? ` • ${customer.pet_age}` : ""}
                    </p>
                  </div>

                  <span className="vet-patient-badge">
                    {customer.pet_status || "Active"}
                  </span>
                </div>

                <div className="vet-contact-grid">
                  <p>
                    <FontAwesomeIcon icon={faEnvelope} />
                    {customer.email || "No email"}
                  </p>

                  <p>
                    <FontAwesomeIcon icon={faPhone} />
                    {customer.phone || "No phone"}
                  </p>

                  <p>
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    {customer.address || "No address"}
                  </p>
                </div>
              </div>

              <button
                className="vet-view-profile-btn"
                type="button"
                onClick={() => setSelectedProfile(customer)}
              >
                <FontAwesomeIcon icon={faEye} />
                View
              </button>
            </article>
          ))}
        </div>
      )}

      {selectedProfile && (
        <div
          className="vet-profile-modal-overlay"
          onClick={() => setSelectedProfile(null)}
        >
          <div
            className="vet-profile-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="vet-profile-modal-header">
              <div>
                <span className="vet-profiles-eyebrow">
                  <FontAwesomeIcon icon={faIdCard} />
                  Profile Details
                </span>
                <h3>{selectedProfile.name}</h3>
                <p>{selectedProfile.pet_name}</p>
              </div>

              <button
                className="vet-modal-close"
                type="button"
                onClick={() => setSelectedProfile(null)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="vet-profile-modal-body">
              <div className="modal-profile-avatar">
                {selectedProfile.name?.charAt(0)?.toUpperCase() || "?"}
              </div>

              <div className="modal-profile-grid">
                <div>
                  <small>Owner</small>
                  <strong>{selectedProfile.name}</strong>
                </div>

                <div>
                  <small>Email</small>
                  <strong>{selectedProfile.email || "No email"}</strong>
                </div>

                <div>
                  <small>Phone</small>
                  <strong>{selectedProfile.phone || "No phone"}</strong>
                </div>

                <div>
                  <small>Address</small>
                  <strong>{selectedProfile.address || "No address"}</strong>
                </div>

                <div>
                  <small>Pet Name</small>
                  <strong>{selectedProfile.pet_name || "Unknown Pet"}</strong>
                </div>

                <div>
                  <small>Pet Info</small>
                  <strong>
                    {selectedProfile.pet_species || "Unknown"} •{" "}
                    {selectedProfile.pet_breed || "Unknown"}
                    {selectedProfile.pet_age ? ` • ${selectedProfile.pet_age}` : ""}
                  </strong>
                </div>
              </div>
            </div>

            <div className="vet-profile-modal-actions">
              <button
                className="vet-refresh-btn"
                type="button"
                onClick={() => setSelectedProfile(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VetCustomerProfiles;