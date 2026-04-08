import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../api/client";
import "./CreateUser.css";

const CreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Customer Information
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    contactNumber: "",
    emailAddress: "",
    residentialAddress: "",
    
    // Account Credentials
    username: "",
    password: "",
    confirmPassword: "",
    
    // Admin Fields
    role: "customer",
    
    // Emergency Contact
    emergencyContactPerson: "",
    emergencyContactNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Customer Information Validation
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.emailAddress)) {
      newErrors.emailAddress = "Please enter a valid email address";
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^\d{10,15}$/.test(formData.contactNumber.replace(/\s/g, ""))) {
      newErrors.contactNumber = "Please enter a valid contact number";
    }

    // Account Credentials Validation
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (formData.username.length < 3) newErrors.username = "Username must be at least 3 characters";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Role Validation (Admin specific)
    if (!formData.role) newErrors.role = "Role selection is required";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.emailAddress,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        is_active: true,
      };

      // Call backend API
      await apiRequest("/admin/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      alert(`User ${formData.firstName} ${formData.lastName} created successfully as ${formData.role}!`);
      navigate("/admin/users");
    } catch (error) {
      alert(`Error creating user: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="create-user-container">
      <div className="create-user-background">
        <div className="create-user-content">
          <div className="create-user-header">
            <div className="logo">
              <h1>PAWESOME</h1>
              <span>RETREAT INC.</span>
            </div>
            <h2>Create New User</h2>
            <p>Add a new user to the system with appropriate role and permissions</p>
          </div>

          <form className="create-user-form" onSubmit={handleSubmit}>
            {/* User Information Section */}
            <div className="form-section">
              <div className="section-header">
                <span className="section-icon">👤</span>
                <h3>User Information</h3>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? "error" : ""}
                    placeholder="Enter user's first name"
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="middleName">Middle Name</label>
                  <input
                    type="text"
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    placeholder="Enter middle name (optional)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? "error" : ""}
                    placeholder="Enter user's last name"
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactNumber">Contact Number *</label>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className={errors.contactNumber ? "error" : ""}
                    placeholder="Enter contact number"
                  />
                  {errors.contactNumber && <span className="error-message">{errors.contactNumber}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="emailAddress">Email Address *</label>
                  <input
                    type="email"
                    id="emailAddress"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    className={errors.emailAddress ? "error" : ""}
                    placeholder="Enter email address"
                  />
                  {errors.emailAddress && <span className="error-message">{errors.emailAddress}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="residentialAddress">Residential Address</label>
                  <textarea
                    id="residentialAddress"
                    name="residentialAddress"
                    value={formData.residentialAddress}
                    onChange={handleChange}
                    placeholder="Enter complete residential address"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Account & Role Section */}
            <div className="form-section">
              <div className="section-header">
                <span className="section-icon">🔐</span>
                <h3>Account & Role</h3>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">Username *</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={errors.username ? "error" : ""}
                    placeholder="Choose a username"
                  />
                  {errors.username && <span className="error-message">{errors.username}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={errors.role ? "error" : ""}
                  >
                    <option value="">Select Role</option>
                    <option value="customer">Customer</option>
                    <option value="veterinary">Veterinary</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                  {errors.role && <span className="error-message">{errors.role}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <div className="password-input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? "error" : ""}
                      placeholder="Create a password (min. 6 characters)"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                      disabled={isSubmitting}
                    >
                      {showPassword ? "👁️‍🗨️" : "👁️"}
                    </button>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <div className="password-input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors.confirmPassword ? "error" : ""}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={toggleConfirmPasswordVisibility}
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="create-user-btn" disabled={isSubmitting}>
                {isSubmitting ? "Creating User..." : "Create User"}
              </button>
              
              <div className="cancel-link">
                <button type="button" onClick={() => navigate("/admin/users")}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;