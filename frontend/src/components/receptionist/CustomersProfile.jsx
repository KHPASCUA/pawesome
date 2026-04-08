import React from "react";

const CustomersProfile = () => {
  const customers = [
    { id: 1, name: "Alice", pet: "Buddy", email: "alice@example.com" },
    { id: 2, name: "John", pet: "Milo", email: "john@example.com" }
  ];

  return (
    <div>
      <h2>Customers Profile</h2>
      <ul>
        {customers.map((c) => (
          <li key={c.id}>
            {c.name} ({c.pet}) - {c.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomersProfile;