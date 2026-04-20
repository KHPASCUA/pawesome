import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../../api/client";
import "./Login.css";

const roleRouteMap = {
  admin: "/admin",
  payroll: "/payroll",
  customer: "/customer",
  receptionist: "/receptionist",
  veterinary: "/veterinary",
  vet: "/veterinary",
  inventory: "/inventory",
  cashier: "/cashier",
  manager: "/manager",
};

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === "checkbox" ? checked : value 
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call backend API for authentication
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          login: formData.username.trim(),
          password: formData.password,
        }),
      });

      // Save authentication data
      localStorage.setItem("token", response.token);
      localStorage.setItem("role", response.user.role);
      localStorage.setItem("name", response.user.name);
      localStorage.setItem("username", response.user.username);
      localStorage.setItem("email", response.user.email);
      
      if (formData.rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      // Show success message
      alert(`Welcome back, ${response.user.name}!`);
      
      // Redirect to role-based dashboard
      navigate(roleRouteMap[response.user.role] || "/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error.message || "Invalid username or password";
      setErrors({ 
        username: errorMsg,
        password: errorMsg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-content">
          <div className="login-header">
            <div className="logo">
              <h1>PAWESOME</h1>
              <span>RETREAT INC.</span>
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to access your account and manage your pet care services</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-section">
              <div className="section-header">
                <span className="section-icon">🔐</span>
                <h3>Sign In</h3>
              </div>
              
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={errors.username ? "error" : ""}
                  placeholder="Enter your username"
                  disabled={isSubmitting}
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
                    placeholder="Enter your password"
                    disabled={isSubmitting}
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

              <div className="form-options">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="rememberMe">Remember me</label>
                </div>
                <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="login-btn" disabled={isSubmitting}>
                {isSubmitting ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>
          
          <div className="register-link">
            <span>Don't have an account?</span>
            <Link to="/register" className="link">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
