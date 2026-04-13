import React from "react";

const Dashboard = () => {
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      {name && role ? (
        <p>
          Welcome, <strong>{name}</strong> ({role})
        </p>
      ) : (
        <p>No user logged in.</p>
      )}
    </div>
  );
};

export default Dashboard;