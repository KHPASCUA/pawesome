import React from "react";
import { Navigate } from "react-router-dom";

const roleHomeMap = {
  admin: "/admin",
  payroll: "/payroll",
  payroll_manager: "/payroll",
  customer: "/customer",
  receptionist: "/receptionist",
  veterinary: "/veterinary",
  vet: "/veterinary",
  inventory: "/inventory",
  cashier: "/cashier",
  manager: "/manager",
};

const Dashboard = () => {
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  if (roleHomeMap[role]) {
    return <Navigate to={roleHomeMap[role]} replace />;
  }

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
