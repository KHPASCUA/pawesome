import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../api/client";
import "./Logout.css";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest("/auth/logout", { method: "POST" })
      .catch(() => {})
      .finally(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("username");
        localStorage.removeItem("email");

        navigate("/");
      });
  }, [navigate]);

  return (
    <div className="logout-screen">
      <div className="logout-card">
        <h1>PAWESOME</h1>
        <h2>Signing you out...</h2>
        <p>Please wait while we safely end your session.</p>
      </div>
    </div>
  );
};

export default Logout;