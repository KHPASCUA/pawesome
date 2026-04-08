import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RoleBasedLanding = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role"); // "admin", "receptionist", "customer"

  useEffect(() => {
    if (!role) {
      navigate("/login");
    } else {
      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "receptionist":
          navigate("/receptionist");
          break;
        case "customer":
          navigate("/customer");
          break;
        default:
          navigate("/dashboard"); // fallback
      }
    }
  }, [role, navigate]);

  return (
    <div>
      <p>Redirecting to your {role} dashboard...</p>
    </div>
  );
};

export default RoleBasedLanding;