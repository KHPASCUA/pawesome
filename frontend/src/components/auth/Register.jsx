import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../../api/client";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    contactNumber: "",
    emailAddress: "",
    username: "",
    password: "",
    confirmPassword: "",
    emergencyContactPerson: "",
    emergencyContactNumber: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.emailAddress) {
        return alert("Please complete personal information");
      }
      if (!formData.emailAddress.includes("@")) {
        return alert("Invalid email address");
      }
    }

    if (currentStep === 2) {
      if (!formData.username || !formData.password || !formData.confirmPassword) {
        return alert("Please complete account details");
      }
      if (formData.password.length < 6) {
        return alert("Password must be at least 6 characters");
      }
      if (formData.password !== formData.confirmPassword) {
        return alert("Passwords do not match");
      }
    }

    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => setCurrentStep(currentStep - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName) {
      return alert("Please enter your full name");
    }
    if (!formData.emailAddress.includes("@")) {
      return alert("Invalid email address");
    }
    if (formData.password.length < 6) {
      return alert("Password must be at least 6 characters");
    }
    if (formData.password !== formData.confirmPassword) {
      return alert("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.emailAddress,
          username: formData.username,
          password: formData.password,
          role: "customer",
        }),
      });

      localStorage.setItem("token", res.token);
      alert("Registration successful!");
      navigate("/customer");
    } catch (err) {
      alert(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-background">
        <div className="register-content">

          {/* HEADER */}
          <div className="register-header">
            <div className="logo">
              <h1>PAWESOME</h1>
              <span>RETREAT INC.</span>
            </div>

            <h2>Create Your Pawesome Account</h2>
            <p>Manage your pet care services in one place.</p>

            <div className="progress-steps">
              <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
                <div className="step-number">1</div>
                <span>Personal</span>
              </div>

              <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
                <div className="step-number">2</div>
                <span>Account</span>
              </div>

              <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
                <div className="step-number">3</div>
                <span>Emergency</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="register-form">

            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="form-section">
                <h3>Personal Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input name="firstName" required onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Last Name *</label>
                    <input name="lastName" required onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" name="dateOfBirth" onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Contact Number</label>
                    <input
                      name="contactNumber"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, contactNumber: value });
                      }}
                      placeholder="e.g. 09171234567"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input name="emailAddress" type="email" required onChange={handleChange} />
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div className="form-section">
                <h3>Account Setup</h3>

                <div className="form-group">
                  <label>Username *</label>
                  <input name="username" required onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <div className="password-input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm Password *</label>
                  <div className="password-input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <div className="form-section">
                <h3>Emergency Contact</h3>

                <div className="form-group">
                  <label>Contact Person</label>
                  <input name="emergencyContactPerson" onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Contact Number</label>
                  <input name="emergencyContactNumber" onChange={handleChange} />
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className="form-actions">
              {currentStep > 1 && (
                <button type="button" className="prev-btn" onClick={handlePrevStep}>
                  Back
                </button>
              )}

              {currentStep < 3 && (
                <button type="button" className="next-btn" onClick={handleNextStep} disabled={loading}>
                  Next
                </button>
              )}

              {currentStep === 3 && (
                <button type="submit" className="register-btn" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </button>
              )}

              <div className="login-link">
                Already have an account?
                <Link to="/login" className="link"> Sign in</Link>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;