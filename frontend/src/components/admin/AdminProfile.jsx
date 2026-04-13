import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  faExclamationTriangle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import "./AdminProfile.css";

const AdminProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
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

  // Auto-login for admin if no token exists
  const autoLoginAdmin = async () => {
    try {
      console.log("Attempting auto-login for admin...");
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "admin@example.com",
          password: "password"
        })
      });
      
      if (response.user && response.user.api_token) {
        console.log("Auto-login successful, storing token");
        localStorage.setItem("token", response.user.api_token);
        localStorage.setItem("role", response.user.role);
        localStorage.setItem("name", response.user.name);
        localStorage.setItem("username", response.user.username);
        localStorage.setItem("email", response.user.email);
        return response.user.api_token;
      }
    } catch (err) {
      console.error("Auto-login failed:", err);
      return null;
    }
  };

  // Fetch current user profile from API
  const fetchUserProfile = async () => {
    console.log("=== Starting profile fetch ===");
    
    try {
      setLoading(true);
      setError("");
      
      // Check if token exists
      let token = localStorage.getItem("token");
      console.log("Token exists:", !!token);
      console.log("Token value:", token);
      
      // If no token, try auto-login for admin
      if (!token) {
        console.log("No token found, attempting auto-login");
        token = await autoLoginAdmin();
        
        if (!token) {
          setError("Authentication failed. Please use Test Login button.");
          return;
        }
      }
      
      // Get current user info from auth endpoint
      console.log("Fetching user profile...");
      const userData = await apiRequest("/auth/me");
      console.log("User data received:", userData);
      
      // Validate that we got user data
      if (!userData || !userData.id) {
        console.error("No user data received from API");
        setError("Failed to load user profile. Please try logging in again.");
        return;
      }
      
      // Set profile data if user exists
      if (userData && userData.id) {
        console.log("Setting profile data for user:", userData.email, userData.username, userData.id);
        setProfileData({
          id: userData.id,
          name: userData.name || "",
          first_name: userData.first_name || "",
          middle_name: userData.middle_name || "",
          last_name: userData.last_name || "",
          email: userData.email || "",
          username: userData.username || "",
          phone: userData.phone || "",
          address: userData.address || "",
          city: userData.city || "",
          state: userData.state || "",
          zip_code: userData.zip_code || "",
          country: userData.country || "",
          bio: userData.bio || "",
          role: userData.role || "",
          is_active: userData.is_active !== undefined ? userData.is_active : true,
          created_at: userData.created_at || "",
          updated_at: userData.updated_at || "",
          profileImage: userData.profile_image || null,
        });
      } else {
        console.error("No valid user data available");
        setError("No user profile data available. Please use Test Login button.");
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      
      // Handle different types of errors
      if (err.message && err.message.includes('401')) {
        setError("Authentication expired. Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }
      
      if (err.message && err.message.includes('500')) {
        setError("Server error occurred. Please try the Test Login button.");
        return;
      }
      
      if (err.message && err.message.includes('404')) {
        setError("User not found. Please use Test Login button.");
        return;
      }
      
      setError(`${err.message || "Failed to fetch profile data"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Listen for storage events to sync profile across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'userUpdated' || e.key === 'profileRefresh') {
        console.log('Profile update detected, refreshing...');
        fetchUserProfile();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchUserProfile]);

  // Show success message
  const showSuccess = (msg) => {
    setMessage(msg);
    setMessageType("success");
    setTimeout(() => setMessage(""), 3000);
  };

  // Show error message
  const showError = (msg) => {
    setMessage(msg);
    setMessageType("error");
    setTimeout(() => setMessage(""), 5000);
  };

  // Simple login test
  const testLogin = async () => {
    console.log("=== Starting login test ===");
    
    try {
      console.log("Attempting login to:", "http://127.0.0.1:8001/api/auth/login");
      console.log("Credentials:", { email: "admin@example.com", password: "password" });
      
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "admin@example.com",
          password: "password"
        })
      });
      
      console.log("Login response:", response);
      
      if (response.user && response.user.api_token) {
        console.log("Token received, storing in localStorage");
        localStorage.setItem("token", response.user.api_token);
        localStorage.setItem("role", response.user.role);
        localStorage.setItem("name", response.user.name);
        localStorage.setItem("username", response.user.username);
        localStorage.setItem("email", response.user.email);
        
        console.log("Token stored, fetching profile...");
        console.log("Token stored, fetching profile...");
        // Clear any existing profile data and fetch fresh data
        setProfileData({
          id: null,
          name: "",
          first_name: "",
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
        setTimeout(() => fetchUserProfile(), 500);
      } else {
        console.log("No token in response");
        showError("Login failed: No token received");
      }
    } catch (err) {
      console.error("Login test error:", err);
      showError("Login test failed: " + err.message);
    }
  };

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
  const handleSaveProfile = async () => {
    // Validation
    if (!profileData.first_name || !profileData.last_name || !profileData.email) {
      showError("Please fill in all required fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      showError("Please enter a valid email address.");
      return;
    }

    try {
      setError("");
      
      // Prepare update data
      const updateData = {
        name: profileData.name,
        first_name: profileData.first_name,
        middle_name: profileData.middle_name,
        last_name: profileData.last_name,
        email: profileData.email,
        username: profileData.username,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zip_code: profileData.zip_code,
        country: profileData.country,
        bio: profileData.bio,
      };
      
      // Update profile via API
      await apiRequest("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
      
      showSuccess("Profile updated successfully!");
      setIsEditing(false);
      
      // Refresh profile data
      await fetchUserProfile();
    } catch (err) {
      showError(err.message || "Failed to update profile");
      console.error("Profile update error:", err);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showError("Please fill in all password fields.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("New password and confirm password do not match.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      showError("New password must be different from current password.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showError("Password must be at least 8 characters long.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          new_password_confirmation: passwordData.confirmPassword,
        })
      });

      if (response.message) {
        showSuccess("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setError(""), 3000);
        
        // Auto logout after successful password change
        setTimeout(() => {
          localStorage.clear();
          window.location.href = "/login";
        }, 2000);
      }
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      showError(err.message || "Failed to change password");
      console.error("Password change error:", err);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setMessage("");
    // Reset to original data
    fetchUserProfile();
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

  return (
    <div className="admin-profile">
      {/* Profile Header */}
      <div className="profile-header">
        <h2>
          <FontAwesomeIcon icon={faUser} /> {profileData.name || "Admin Profile"}
        </h2>
        <p>Manage your personal information and preferences</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin /> Loading profile...
        </div>
      )}

      {/* Success/Error Messages */}
      {message && (
        <div className={`${messageType}-message`}>
          <FontAwesomeIcon icon={messageType === "success" ? faCheckCircle : faExclamationTriangle} /> {message}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
          <div className="error-actions">
            <button onClick={fetchUserProfile} className="retry-btn">
              Retry
            </button>
            <button onClick={testLogin} className="login-btn">
              Test Login (Admin)
            </button>
          </div>
        </div>
      )}

      {/* Profile Form */}
      {!loading && !error && (
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
                placeholder="Tell us about yourself and your experience..."
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
                  value={profileData.role ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1) : ""}
                  disabled
                  style={{ backgroundColor: '#f8f9fa' }}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <input
                  type="text"
                  value={profileData.is_active ? "Active" : "Inactive"}
                  disabled
                  style={{ backgroundColor: '#f8f9fa' }}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Member Since</label>
              <input
                type="text"
                value={profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : ""}
                disabled
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div className="form-group">
              <label>Last Updated</label>
              <input
                type="text"
                value={profileData.updated_at ? new Date(profileData.updated_at).toLocaleDateString() : ""}
                disabled
                style={{ backgroundColor: '#f8f9fa' }}
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
      )}

      {/* Password Change Section */}
      {!loading && !error && (
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
      )}
    </div>
  );
};

export default AdminProfile;
