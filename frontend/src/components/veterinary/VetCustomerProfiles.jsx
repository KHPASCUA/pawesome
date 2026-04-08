import React from "react";

const VetCustomerProfiles = ({ customers }) => {
  return (
    <div>
      <h2>Customer Profiles</h2>
      {customers.map((cust) => (
        <div key={cust.id} style={{ marginBottom: "15px" }}>
          <h3>{cust.name}</h3>
          <p>Pet: {cust.pet}</p>
          <p>Contact: {cust.contact}</p>
        </div>
      ))}
    </div>
  );
};

export default VetCustomerProfiles;