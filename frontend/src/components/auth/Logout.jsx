import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name"); // optional: clear stored name if you use it

    // Redirect to landing page instead of login
    navigate("/");  // <-- changed from "/login" to "/"
  }, [navigate]);

  return (
    <div>
      <p>Logging out... Redirecting to landing page.</p>
    </div>
  );
};

export default Logout;