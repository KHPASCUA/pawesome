import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../../api/client";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
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
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

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
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          login: formData.username.trim(),
          password: formData.password,
        }),
      });

      localStorage.setItem("token", response.token);
      localStorage.setItem("role", response.user.role);
      localStorage.setItem("name", response.user.name);
      localStorage.setItem("username", response.user.username);
      localStorage.setItem("email", response.user.email);

      if (formData.rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      alert(`Welcome, ${response.user.name}!`);

      navigate(roleRouteMap[response.user.role] || "/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      const errorMsg = error.message || "Invalid username or password";

      setErrors({
        username: errorMsg,
        password: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-content">

          {/* HEADER IMPROVED */}
          <div className="login-header">
            <div className="logo">
              <h1>PAWESOME</h1>
              <span>RETREAT INC.</span>
            </div>

            <h2>Welcome to Pawesome Retreat</h2>
            <p>
              Sign in to manage appointments, pet care services, and your account in one place.
            </p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-section">

              {/* USERNAME */}
              <div className="login-field">
                <label>USERNAME *</label>
                <div className="input-wrap">
                  <FaUser className="input-left-icon" />
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
                </div>
                {errors.username && (
                  <span className="error-message">{errors.username}</span>
                )}
              </div>

              {/* PASSWORD */}
              <div className="login-field">
                <label>PASSWORD *</label>
                <div className="password-input-wrap">
                  <FaLock className="input-left-icon" />
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
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              {/* OPTIONS */}
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

                <Link to="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* BUTTON */}
            <div className="form-actions">
              <button
                type="submit"
                className="login-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>

          {/* REGISTER */}
          <div className="register-link">
            <span>New to Pawesome?</span>
            <Link to="/register" className="link">
              Create an account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;