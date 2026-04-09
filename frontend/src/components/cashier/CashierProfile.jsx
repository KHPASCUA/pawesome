import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faCalendarAlt,
  faCamera,
  faSave,
  faTimes,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import "./CashierProfile.css";

const CashierProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@pawstore.com",
    phone: "+1 (555) 0101",
    address: "123 Cashier Lane",
    city: "Pet City",
    state: "PC",
    zipCode: "12345",
    country: "United States",
    bio: "Professional cashier with 5+ years of experience in pet retail.",
    memberSince: "January 2024",
    profileImage: null,
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password visibility state
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profileImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile changes
  const handleSaveProfile = () => {
    // Validation
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    // Success message
    setMessage("Profile updated successfully!");
    setMessageType("success");
    setTimeout(() => setMessage(""), 3000);
    setIsEditing(false);
  };

  // Handle password change
  const handleChangePassword = () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage("Please fill in all password fields.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New passwords do not match.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    // Success message
    setMessage("Password changed successfully!");
    setMessageType("success");
    setTimeout(() => setMessage(""), 3000);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setMessage("");
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setMessage("");
  };

  return (
    <div className="customer-profile">
      {/* Profile Header */}
      <div className="profile-header">
        <h2>
          <FontAwesomeIcon icon={faUser} /> My Profile
        </h2>
        <p>Manage your personal information and preferences</p>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className={`${messageType}-message`}>
          {message}
        </div>
      )}

      {/* Profile Form */}
      <div className="profile-card">
        <div className="profile-section">
          <h3>Personal Information</h3>
          
          {/* Profile Image */}
          <div className="profile-avatar-section">
            <div className="avatar-container">
              {profileData.profileImage ? (
                <img 
                  src={profileData.profileImage} 
                  alt="Profile" 
                  className="avatar-img"
                />
              ) : (
                <div className="avatar-img">
                  <FontAwesomeIcon icon={faUser} size="3x" />
                </div>
              )}
            </div>
            {isEditing && (
              <div>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="avatar-upload" className="avatar-upload-btn">
                  <FontAwesomeIcon icon={faCamera} /> Change Photo
                </label>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={profileData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your first name"
              />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={profileData.lastName}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Tell us about yourself and your pets..."
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="profile-section">
          <h3>Address Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="address"
                value={profileData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your street address"
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={profileData.city}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your city"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={profileData.state}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your state"
              />
            </div>
            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                name="zipCode"
                value={profileData.zipCode}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your ZIP code"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              name="country"
              value={profileData.country}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Enter your country"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="btn-group">
          {!isEditing ? (
            <>
              <button className="btn-primary" onClick={toggleEditMode}>
                <FontAwesomeIcon icon={faUser} /> Edit Profile
              </button>
            </>
          ) : (
            <>
              <button className="btn-primary" onClick={handleSaveProfile}>
                <FontAwesomeIcon icon={faSave} /> Save Changes
              </button>
              <button className="btn-secondary" onClick={handleCancel}>
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Password Change Section */}
      <div className="profile-card password-section">
        <div className="profile-section">
          <h3>
            <FontAwesomeIcon icon={faLock} /> Change Password
          </h3>
          
          <div className="form-group">
            <label>Current Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.currentPassword ? "text" : "password"}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility('currentPassword')}
              >
                <FontAwesomeIcon icon={showPasswords.currentPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.newPassword ? "text" : "password"}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility('newPassword')}
              >
                <FontAwesomeIcon icon={showPasswords.newPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility('confirmPassword')}
              >
                <FontAwesomeIcon icon={showPasswords.confirmPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div className="password-requirements">
            Password must be at least 8 characters long and contain both letters and numbers.
          </div>

          <div className="btn-group">
            <button className="btn-primary" onClick={handleChangePassword}>
              <FontAwesomeIcon icon={faLock} /> Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="profile-card">
        <div className="profile-section">
          <h3>Account Information</h3>
          <div className="form-group">
            <label>Member Since</label>
            <input
              type="text"
              value={profileData.memberSince}
              disabled
              style={{ backgroundColor: '#f8f9fa' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierProfile;
