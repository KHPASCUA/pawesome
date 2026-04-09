import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const Register = () => {
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
    
    // Emergency Contact
    emergencyContactPerson: "",
    emergencyContactNumber: "",
    
    // System fields
    role: "customer"
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

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
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^\d{10,15}$/.test(formData.contactNumber.replace(/\s/g, ""))) {
      newErrors.contactNumber = "Please enter a valid contact number";
    }
    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.emailAddress)) {
      newErrors.emailAddress = "Please enter a valid email address";
    }
    if (!formData.residentialAddress.trim()) newErrors.residentialAddress = "Residential address is required";

    // Account Credentials Validation
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (formData.username.length < 3) newErrors.username = "Username must be at least 3 characters";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Emergency Contact Validation
    if (!formData.emergencyContactPerson.trim()) {
      newErrors.emergencyContactPerson = "Emergency contact person is required";
    }
    if (!formData.emergencyContactNumber.trim()) {
      newErrors.emergencyContactNumber = "Emergency contact number is required";
    } else if (!/^\d{10,15}$/.test(formData.emergencyContactNumber.replace(/\s/g, ""))) {
      newErrors.emergencyContactNumber = "Please enter a valid emergency contact number";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      // Save account in localStorage
      const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.replace(/\s+/g, ' ').trim();
      
      localStorage.setItem("token", "static-token");
      localStorage.setItem("name", fullName);
      localStorage.setItem("email", formData.emailAddress);
      localStorage.setItem("role", formData.role);
      
      // Store additional user data
      localStorage.setItem("userData", JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        contactNumber: formData.contactNumber,
        address: formData.residentialAddress,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        emergencyContact: formData.emergencyContactPerson,
        emergencyNumber: formData.emergencyContactNumber
      }));

      alert("Registration successful! Welcome to Pawesome Retreat Inc.");
      
      // Redirect to customer dashboard
      navigate("/customer");
    }, 1500);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="register-container">
      <div className="register-background">
        <div className="register-content">
          <div className="register-header">
            <div className="logo">
              <h1>PAWESOME</h1>
              <span>RETREAT INC.</span>
            </div>
            <h2>Create Your Account</h2>
            <p>Join our community and give your pet the care they deserve</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            {/* Customer Information Section */}
            <div className="form-section">
              <div className="section-header">
                <span className="section-icon">👤</span>
                <h3>Customer Registration Information</h3>
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
                    placeholder="Enter your first name"
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
                    placeholder="Enter your middle name (optional)"
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
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth *</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={errors.dateOfBirth ? "error" : ""}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Gender *</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={errors.gender ? "error" : ""}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <span className="error-message">{errors.gender}</span>}
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
                    placeholder="Enter your contact number"
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
                    placeholder="Enter your email address"
                  />
                  {errors.emailAddress && <span className="error-message">{errors.emailAddress}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="residentialAddress">Residential Address *</label>
                  <textarea
                    id="residentialAddress"
                    name="residentialAddress"
                    value={formData.residentialAddress}
                    onChange={handleChange}
                    className={errors.residentialAddress ? "error" : ""}
                    placeholder="Enter your complete residential address"
                    rows="3"
                  />
                  {errors.residentialAddress && <span className="error-message">{errors.residentialAddress}</span>}
                </div>
              </div>
            </div>

            {/* Account Credentials Section */}
            <div className="form-section">
              <div className="section-header">
                <span className="section-icon">🔐</span>
                <h3>Account Credentials</h3>
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
                      placeholder="Confirm your password"
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

            {/* Emergency Contact Section */}
            <div className="form-section">
              <div className="section-header">
                <span className="section-icon">📞</span>
                <h3>Emergency Contact</h3>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="emergencyContactPerson">Emergency Contact Person *</label>
                  <input
                    type="text"
                    id="emergencyContactPerson"
                    name="emergencyContactPerson"
                    value={formData.emergencyContactPerson}
                    onChange={handleChange}
                    className={errors.emergencyContactPerson ? "error" : ""}
                    placeholder="Enter emergency contact person's name"
                  />
                  {errors.emergencyContactPerson && <span className="error-message">{errors.emergencyContactPerson}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyContactNumber">Emergency Contact Number *</label>
                  <input
                    type="tel"
                    id="emergencyContactNumber"
                    name="emergencyContactNumber"
                    value={formData.emergencyContactNumber}
                    onChange={handleChange}
                    className={errors.emergencyContactNumber ? "error" : ""}
                    placeholder="Enter emergency contact number"
                  />
                  {errors.emergencyContactNumber && <span className="error-message">{errors.emergencyContactNumber}</span>}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="register-btn" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
              
              <div className="login-link">
                <span>Already have an account?</span>
                <Link to="/login" className="link">Sign In</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;