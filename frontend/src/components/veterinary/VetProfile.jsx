import React, { useState, useEffect } from "react";
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
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import "./VetProfile.css";

const VetProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile data state - initialize with empty values
  const [profileData, setProfileData] = useState({
    id: null,
    name: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    username: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    bio: "",
    role: "",
    is_active: true,
    created_at: "",
    updated_at: "",
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

  // Store original values for validation
  const [originalEmail, setOriginalEmail] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");

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

  // Fetch user profile data
  const fetchUserProfile = () => {
    setLoading(true);
    setError("");
    console.log("=== Starting VeterinaryProfile fetch ===");
    
    // Check if token exists
    let token = localStorage.getItem("token");
    console.log("Token exists:", !!token);
    
    if (!token) {
      console.log("No token found, cannot fetch profile");
      setError("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }
    
    console.log("Fetching user profile...");
    apiRequest("/auth/me")
      .then(response => {
        console.log("User data received:", response);
        
        if (response) {
          console.log("Setting profile data with:", response);
          console.log("User role:", response.role);
          console.log("Role type:", typeof response.role);
          console.log("Role value:", JSON.stringify(response.role));
          
          // Only proceed if user is veterinary or admin
          if (response.role !== 'veterinary' && response.role !== 'admin') {
            console.error("Access denied: User is not veterinary");
            console.error("Expected: 'veterinary' or 'admin', got:", response.role);
            if (response.role === 'admin') {
              setError("Admin users should use AdminProfile, not VeterinaryProfile");
            } else {
              setError("Access denied: User role does not match veterinary profile");
            }
            setLoading(false);
            return;
          }
          
          setProfileData({
            id: response.id,
            name: response.name || "",
            first_name: response.first_name || "",
            middle_name: response.middle_name || "",
            last_name: response.last_name || "",
            email: response.email || "",
            username: response.username || "",
            phone: response.phone || "",
            address: response.address || "",
            city: response.city || "",
            state: response.state || "",
            zip_code: response.zip_code || "",
            country: response.country || "",
            bio: response.bio || "",
            role: response.role || "",
            is_active: response.is_active !== undefined ? response.is_active : true,
            created_at: response.created_at || "",
            updated_at: response.updated_at || "",
            profileImage: response.profile_image || null,
          });
          
          // Store original values for validation
          setOriginalEmail(response.email || "");
          setOriginalUsername(response.username || "");
          console.log("Profile data set successfully");
        }
      })
      .catch(err => {
        setError(err.message || "Failed to load profile data");
        console.error("Profile fetch error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Save profile changes
  const handleSaveProfile = () => {
    // Validation
    if (!profileData.first_name || !profileData.last_name || !profileData.email) {
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

    setSaving(true);
    setError("");
    console.log("=== Starting VeterinaryProfile save ===");
    
    // Prepare update data
    const updateData = {
      first_name: profileData.first_name,
      middle_name: profileData.middle_name,
      last_name: profileData.last_name,
      phone: profileData.phone,
      address: profileData.address,
      city: profileData.city,
      state: profileData.state,
      zip_code: profileData.zip_code,
      country: profileData.country,
      bio: profileData.bio,
    };
    
    // Only include email if it has changed
    if (profileData.email !== originalEmail) {
      updateData.email = profileData.email;
    }
    
    // Only include username if it has changed
    if (profileData.username !== originalUsername) {
      updateData.username = profileData.username;
    }
    
    console.log("Update data being sent:", updateData);
    
    // Update profile via API
    apiRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(updateData),
    })
      .then(response => {
        console.log("API response:", response);
        setMessage("Profile updated successfully!");
        setMessageType("success");
        setIsEditing(false);
        
        // Refresh profile data
        fetchUserProfile();
        setTimeout(() => setMessage(""), 3000);
      })
      .catch(err => {
        console.error("=== Profile update error ===");
        console.error("Error object:", err);
        console.error("Error message:", err.message);
        console.error("Error status:", err.status);
        console.error("Error response:", err.response);
        
        setMessage(err.message || "Failed to update profile");
        setMessageType("error");
        setTimeout(() => setMessage(""), 3000);
      })
      .finally(() => {
        setSaving(false);
        console.log("=== Save process completed ===");
      });
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

    setChangingPassword(true);
    setError("");
    
    // Change password via API
    apiRequest("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        new_password_confirmation: passwordData.confirmPassword,
      })
    })
      .then(() => {
        setMessage("Password changed successfully!");
        setMessageType("success");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setMessage(""), 3000);
      })
      .catch(err => {
        setMessage(err.message || "Failed to change password");
        setMessageType("error");
        console.error("Password change error:", err);
        setTimeout(() => setMessage(""), 3000);
      })
      .finally(() => {
        setChangingPassword(false);
      });
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

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Fetch profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <div className="vet-profile">
      {/* Profile Header */}
      <div className="profile-header">
        <h2>
          <FontAwesomeIcon icon={faUser} /> Veterinary Profile
        </h2>
        <p>Manage your personal information and preferences</p>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className={`${messageType}-message`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Loading your profile...</p>
        </div>
      ) : (
        <>
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
              </div>

              {/* Form Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="form-group">
                  <label>Middle Name</label>
                  <input
                    type="text"
                    name="middle_name"
                    value={profileData.middle_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your middle name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  name="username"
                  value={profileData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your username"
                />
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
                  placeholder="Tell us about yourself and your veterinary experience..."
                />
              </div>
            </div>

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
                    name="zip_code"
                    value={profileData.zip_code}
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

            {/* Account Info */}
            <div className="profile-section">
              <h3>Account Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    value="Veterinarian"
                    disabled
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <input
                    type="text"
                    value="Active"
                    disabled
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Member Since</label>
                  <input
                    type="text"
                    value={profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : "Unknown"}
                    disabled
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
                <div className="form-group">
                  <label>Last Updated</label>
                  <input
                    type="text"
                    value={profileData.updated_at ? new Date(profileData.updated_at).toLocaleDateString() : "Today"}
                    disabled
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="btn-group">
              {!isEditing ? (
                <button className="btn-primary" onClick={toggleEditMode}>
                  <FontAwesomeIcon icon={faUser} /> Edit Profile
                </button>
              ) : (
                <div>
                  <button className="btn-primary" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin /> Saving...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} /> Save Changes
                      </>
                    )}
                  </button>
                  <button className="btn-secondary" onClick={handleCancel}>
                    <FontAwesomeIcon icon={faTimes} /> Cancel
                  </button>
                </div>
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
                <button className="btn-primary" onClick={handleChangePassword} disabled={changingPassword}>
                  {changingPassword ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin /> Changing Password...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faLock} /> Change Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VetProfile;
