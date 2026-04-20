import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../api/client";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Call backend logout endpoint to invalidate token
    apiRequest("/auth/logout", { method: "POST" })
      .catch(() => {})
      .finally(() => {
        // Clear authentication data
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("username");
        localStorage.removeItem("email");

        // Redirect to landing page
        navigate("/");
      });
  }, [navigate]);

  return (
    <div>
      <p>Logging out... Redirecting to landing page.</p>
    </div>
  );
};

export default Logout;