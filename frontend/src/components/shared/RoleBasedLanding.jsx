import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const roleRouteMap = {
  admin: "/admin",
  payroll: "/payroll",
  customer: "/customer",
  receptionist: "/receptionist",
  veterinary: "/veterinary",
  vet: "/veterinary",
  inventory: "/inventory",
  cashier: "/cashier",
  manager: "/manager",
};

const RoleBasedLanding = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role"); // "admin", "receptionist", "customer"

  useEffect(() => {
    if (!role) {
      navigate("/login");
    } else {
      navigate(roleRouteMap[role] || "/dashboard");
    }
  }, [role, navigate]);

  return (
    <div>
      <p>Redirecting to your {role} dashboard...</p>
    </div>
  );
};

export default RoleBasedLanding;
