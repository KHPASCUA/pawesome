import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCamera,
  faSave,
  faTimes,
  faLock,
  faEye,
  faEyeSlash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { apiRequest } from "../../api/client";
import usePolling from "../../hooks/usePolling";
import "./VetProfile.css";

const VetProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
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
    console.log("=== Starting VeterinaryProfile fetch ===");
    
    // Check if token exists
    let token = localStorage.getItem("token");
    console.log("Token exists:", !!token);
    
    if (!token) {
      console.log("No token found, cannot fetch profile");
      toast.error("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }
    
    console.log("Fetching user profile...");
    apiRequest("/auth/me")
      .then(response => {
        console.log("User data received:", response);

        if (!response || typeof response !== "object") {
          throw new Error("Invalid profile response");
        }

        console.log("Setting profile data with:", response);
        console.log("User role:", response.role);
        console.log("Role type:", typeof response.role);
        console.log("Role value:", JSON.stringify(response.role));

        // Only proceed if user is veterinary or admin
        if (!["veterinary", "admin"].includes(response.role)) {
          console.error("Access denied: User is not veterinary");
          console.error("Expected: 'veterinary' or 'admin', got:", response.role);
          if (response.role === 'admin') {
            toast.error("Admin users should use AdminProfile, not VeterinaryProfile");
          } else {
            toast.error("Access denied: User role does not match veterinary profile");
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
      })
    .catch(err => {
        toast.error(err.message || "Failed to load profile data");
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
      toast.error("Please fill in all required fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSaving(true);
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
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        
        // Refresh profile data
        fetchUserProfile();
      })
      .catch(err => {
        console.error("=== Profile update error ===");
        console.error("Error object:", err);
        console.error("Error message:", err.message);
        console.error("Error status:", err.status);
        console.error("Error response:", err.response);
        
        toast.error(err.message || "Failed to update profile");
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
      toast.error("Please fill in all password fields.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setChangingPassword(true);
    
    // Change password via API
    apiRequest("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      })
    })
      .then(() => {
        toast.success("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      })
      .catch(err => {
        toast.error(err.message || "Failed to change password");
        console.error("Password change error:", err);
      })
      .finally(() => {
        setChangingPassword(false);
      });
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
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

  // Real-time updates: poll every 10 seconds
  usePolling(fetchUserProfile, 10000);

  return (
    <section className="app-content vet-profile">
      {/* Profile Header */}
      <div className="premium-card vet-profile-header">
        <h2 className="premium-title">
          <FontAwesomeIcon icon={faUser} /> Veterinary Profile
        </h2>
        <p className="premium-muted">Manage your personal information and preferences</p>
      </div>


      {loading ? (
        <div className="premium-card vet-loading-state">
          <FontAwesomeIcon icon={faSpinner} className="spin-animation" />
          <span>Loading your profile...</span>
        </div>
      ) : (
        <>
          {/* Profile Form */}
          <div className="premium-card vet-profile-card">
            <div className="vet-profile-section">
              <h3>Personal Information</h3>
              
              {/* Profile Image */}
              <div className="vet-avatar-section">
                <div className="vet-avatar-container">
                  {profileData.profileImage ? (
                    <img 
                      src={profileData.profileImage} 
                      alt="Profile" 
                      className="vet-avatar-img"
                    />
                  ) : (
                    <div className="vet-avatar-img">
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
                      <label htmlFor="avatar-upload" className="btn-secondary">
                        <FontAwesomeIcon icon={faCamera} /> Change Photo
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="vet-form-row">
                <div className="vet-form-group">
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
                <div className="vet-form-group">
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
                <div className="vet-form-group">
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

              <div className="vet-form-group">
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

              <div className="vet-form-group">
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

              <div className="vet-form-group">
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

              <div className="vet-form-group">
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

            <div className="vet-profile-section">
              <h3>Address Information</h3>
              <div className="vet-form-row">
                <div className="vet-form-group">
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
                <div className="vet-form-group">
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

              <div className="vet-form-row">
                <div className="vet-form-group">
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
                <div className="vet-form-group">
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

              <div className="vet-form-group">
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
            <div className="vet-profile-section">
              <h3>Account Information</h3>
              <div className="vet-form-row">
                <div className="vet-form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    value="Veterinarian"
                    disabled
                  />
                </div>
                <div className="vet-form-group">
                  <label>Status</label>
                  <input
                    type="text"
                    value="Active"
                    disabled
                  />
                </div>
              </div>
              <div className="vet-form-row">
                <div className="vet-form-group">
                  <label>Member Since</label>
                  <input
                    type="text"
                    value={profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : "N/A"}
                    disabled
                  />
                </div>
                <div className="vet-form-group">
                  <label>Last Updated</label>
                  <input
                    type="text"
                    value={profileData.updated_at ? new Date(profileData.updated_at).toLocaleDateString() : "N/A"}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="vet-profile-actions">
              {!isEditing ? (
                <button className="btn-primary" onClick={toggleEditMode} type="button">
                  <FontAwesomeIcon icon={faUser} /> Edit Profile
                </button>
              ) : (
                <div className="vet-profile-actions-edit">
                  <button className="btn-primary" onClick={handleSaveProfile} disabled={saving} type="button">
                    {saving ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="spin-animation" /> Saving...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} /> Save Changes
                      </>
                    )}
                  </button>
                  <button className="btn-secondary" onClick={handleCancel} type="button">
                    <FontAwesomeIcon icon={faTimes} /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Password Change Section */}
          <div className="premium-card vet-password-section">
            <div className="vet-profile-section">
              <h3>
                <FontAwesomeIcon icon={faLock} /> Change Password
              </h3>
              <div className="vet-form-group">
                <label>Current Password</label>
                <div className="vet-password-wrapper">
                  <input
                    type={showPasswords.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="vet-password-toggle"
                    onClick={() => togglePasswordVisibility('currentPassword')}
                  >
                    <FontAwesomeIcon icon={showPasswords.currentPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div className="vet-form-group">
                <label>New Password</label>
                <div className="vet-password-wrapper">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="vet-password-toggle"
                    onClick={() => togglePasswordVisibility('newPassword')}
                  >
                    <FontAwesomeIcon icon={showPasswords.newPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div className="vet-form-group">
                <label>Confirm New Password</label>
                <div className="vet-password-wrapper">
                  <input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="vet-password-toggle"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                  >
                    <FontAwesomeIcon icon={showPasswords.confirmPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div className="vet-password-requirements">
                Password must be at least 8 characters long and contain both letters and numbers.
              </div>

              <div className="vet-profile-actions">
                <button className="btn-primary" onClick={handleChangePassword} disabled={changingPassword} type="button">
                  {changingPassword ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="spin-animation" /> Changing Password...
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
    </section>
  );
};

export default VetProfile;
