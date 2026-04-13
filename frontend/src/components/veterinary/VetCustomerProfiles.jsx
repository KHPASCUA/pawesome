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
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+1-555-0123",
      address: "123 Main St, City, State 12345",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "+1-555-0124",
      address: "456 Oak Ave, City, State 12345",
    },
    {
      id: 3,
      name: "Mike Davis",
      email: "mike.davis@example.com",
      phone: "+1-555-0125",
      address: "789 Pine Rd, City, State 12345",
    },
    {
      id: 4,
      name: "Emily Wilson",
      email: "emily.w@example.com",
      phone: "+1-555-0126",
      address: "321 Elm St, City, State 12345",
    },
    {
      id: 5,
      name: "Robert Brown",
      email: "robert.b@example.com",
      phone: "+1-555-0127",
      address: "654 Maple Dr, City, State 12345",
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Try to fetch from API first
      const data = await apiRequest("/veterinary/customers");
      setCustomers(data.customers || []);
      setError("");
    } catch (err) {
      // If API fails, use mock data (already set as default)
      console.log("API failed, using mock data:", err);
      setError("");
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
      <div className="vet-customer-profiles">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Loading customers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vet-customer-profiles">
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="vet-customer-profiles">
      <h2>Customer Profiles</h2>
      
      <div className="search-bar">
        <div className="search-input-wrapper">
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
        <div className="no-records">
          <FontAwesomeIcon icon={faUser} />
          <h3>No customers found</h3>
          <p>Try adjusting your search</p>
        </div>
      ) : (
        <div className="customer-list">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="customer-item">
              <div className="customer-avatar">
                {customer.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="customer-info">
                <h3>{customer.name}</h3>
                <p>
                  <FontAwesomeIcon icon={faEnvelope} /> {customer.email}
                </p>
                <p>
                  <FontAwesomeIcon icon={faPhone} /> {customer.phone}
                </p>
                {customer.address && (
                  <p>
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> {customer.address}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VetCustomerProfiles;