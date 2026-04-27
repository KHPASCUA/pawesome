import React, { useState, useEffect } from "react";
import "./CustomerUserInfo.css";

const CustomerUserInfo = () => {
  const [user, setUser] = useState({
    name: "Customer",
    email: "No email",
    phone: "",
    address: "",
    memberSince: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser({
          name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "Customer",
          email: userData.email || "No email",
          phone: userData.phone || "",
          address: userData.address ? `${userData.address}, ${userData.city || ""}, ${userData.state || ""} ${userData.zip_code || ""}` : "",
          memberSince: userData.created_at ? new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "",
        });
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  return (
    <section className="userinfo-section">
      <div className="userinfo-header">
        <div>
          <span className="userinfo-eyebrow">Customer Account</span>
          <h2>My Profile</h2>
          <p>View your personal information and membership details.</p>
        </div>
      </div>

      <div className="userinfo-card">
        <div className="userinfo-avatar">
          {user.name.charAt(0)}
        </div>

        <div className="userinfo-details">
          <p><strong>Full Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Address:</strong> {user.address}</p>
          <p><strong>Member Since:</strong> {user.memberSince}</p>
        </div>
      </div>
    </section>
  );
};

export default CustomerUserInfo;