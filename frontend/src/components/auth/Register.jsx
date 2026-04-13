import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../../api/client";
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
    city: "",
    state: "",
    zipCode: "",
    country: "Philippines", // Fixed to Philippines
    
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
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format contact numbers
    if (name === 'contactNumber' || name === 'emergencyContactNumber') {
      const formattedValue = formatContactNumber(value);
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
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
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    }

    if (step === 2) {
      // Account Credentials Validation
      if (!formData.username.trim()) newErrors.username = "Username is required";
      if (formData.username.length < 3) newErrors.username = "Username must be at least 3 characters";
      if (!formData.password) newErrors.password = "Password is required";
      if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (step === 3) {
      // Emergency Contact Validation
      if (!formData.emergencyContactPerson.trim()) {
        newErrors.emergencyContactPerson = "Emergency contact person is required";
      }
      if (!formData.emergencyContactNumber.trim()) {
        newErrors.emergencyContactNumber = "Emergency contact number is required";
      } else if (!/^\d{10,15}$/.test(formData.emergencyContactNumber.replace(/\s/g, ""))) {
        newErrors.emergencyContactNumber = "Please enter a valid emergency contact number";
      }
    }

    return newErrors;
  };

  const validateForm = () => {
    const step1Errors = validateStep(1);
    const step2Errors = validateStep(2);
    const step3Errors = validateStep(3);
    
    return { ...step1Errors, ...step2Errors, ...step3Errors };
  };

  const handleNextStep = () => {
    const newErrors = validateStep(currentStep);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear errors for current step before moving to next
    setErrors({});
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setErrors({});
    setCurrentStep(currentStep - 1);
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
      // Prepare registration data for backend
      const registrationData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        email: formData.emailAddress,
        username: formData.username,
        password: formData.password,
        phone: formData.contactNumber,
        address: formData.residentialAddress,
        role: formData.role,
        is_active: true,
        // Additional customer information
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        emergency_contact_person: formData.emergencyContactPerson,
        emergency_contact_number: formData.emergencyContactNumber,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        country: formData.country,
      };

      // Call the real registration API
      const response = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(registrationData),
      });

      if (response.user) {
        // Store authentication data
        localStorage.setItem("token", response.user.api_token);
        localStorage.setItem("role", response.user.role);
        localStorage.setItem("name", response.user.name);
        localStorage.setItem("username", response.user.username);
        localStorage.setItem("email", response.user.email);
        
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

        setRegistrationSuccess(true);
        
        // Redirect to customer dashboard after showing success message
        setTimeout(() => {
          navigate("/customer");
        }, 3000);
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Registration failed: " + (err.message || "Please try again later."));
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

  const formatContactNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Limit to 15 digits
    return digits.slice(0, 15);
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
            
            {/* Progress Steps */}
            <div className="progress-steps">
              <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-title">Personal Info</div>
              </div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-title">Account Setup</div>
              </div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-title">Emergency Contact</div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {registrationSuccess && (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>Registration Successful!</h3>
              <p>Welcome to Pawesome Retreat Inc. Redirecting to your dashboard...</p>
            </div>
          )}

          {!registrationSuccess && (
            <form className="register-form" onSubmit={handleSubmit}>
            {/* Step 1: Customer Information */}
            {currentStep === 1 && (
              <div className="form-section">
                <div className="section-header">
                  <span className="section-icon">👤</span>
                  <h3>Personal Information</h3>
                  <p>Please provide your personal details</p>
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

                <div className="form-row address-fields" style={{ marginTop: '1.5rem' }}>
                  <div className="form-group address-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={errors.city ? "error" : ""}
                      placeholder="Enter your city"
                    />
                    {errors.city && <span className="error-message">{errors.city}</span>}
                  </div>

                  <div className="form-group address-group">
                    <label htmlFor="state">State/Province</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={errors.state ? "error" : ""}
                      placeholder="Enter your state or province"
                    />
                    {errors.state && <span className="error-message">{errors.state}</span>}
                  </div>

                  <div className="form-group address-group">
                    <label htmlFor="zipCode">ZIP Code *</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className={errors.zipCode ? "error" : ""}
                      placeholder="Enter your ZIP code"
                    />
                    {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                  </div>

                  <div className="form-group address-group">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      disabled
                      className="disabled-field"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Account Credentials */}
            {currentStep === 2 && (
              <div className="form-section">
                <div className="section-header">
                  <span className="section-icon">🔐</span>
                  <h3>Account Setup</h3>
                  <p>Create your login credentials</p>
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
                      placeholder="Choose a username (min. 3 characters)"
                    />
                    {errors.username && <span className="error-message">{errors.username}</span>}
                  </div>

                  <div className="form-group password-group">
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

                  <div className="form-group password-group">
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
            )}

            {/* Step 3: Emergency Contact */}
            {currentStep === 3 && (
              <div className="form-section">
                <div className="section-header">
                  <span className="section-icon">📞</span>
                  <h3>Emergency Contact</h3>
                  <p>Provide emergency contact information</p>
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
            )}

            {/* Navigation Buttons */}
            <div className="form-actions">
              {currentStep > 1 && (
                <button type="button" className="prev-btn" onClick={handlePrevStep} disabled={isSubmitting}>
                  Previous
                </button>
              )}
              
              {currentStep < 3 && (
                <button type="button" className="next-btn" onClick={handleNextStep} disabled={isSubmitting}>
                  Next
                </button>
              )}
              
              {currentStep === 3 && (
                <button type="submit" className="register-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>
              )}
              
              <div className="login-link">
                <span>Already have an account?</span>
                <Link to="/login" className="link">Sign In</Link>
              </div>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;