import React from "react";
import "./CustomerUserInfo.css";

const CustomerUserInfo = () => {
  const user = {
    name: "Sarah Johnson",
    email: "sarah@gmail.com",
    phone: "+1 555-0101",
    address: "123 Pet Lover Street, Animal City, AC 12345",
    memberSince: "January 2026",
  };

  return (
    <div className="userinfo-section">
      <h2>My Profile</h2>
      <div className="userinfo-card">
        <div className="userinfo-left">
          <p><strong>Full Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
        </div>
        <div className="userinfo-right">
          <p><strong>Address:</strong> {user.address}</p>
          <p><strong>Member Since:</strong> {user.memberSince}</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerUserInfo;