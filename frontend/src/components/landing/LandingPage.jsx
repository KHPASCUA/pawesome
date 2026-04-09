import React from "react";
import "./Landing.css";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="header-content">
          <div className="logo">
            <h1>PAWESOME</h1>
            <span>RETREAT INC.</span>
          </div>
          <nav className="nav-links">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Give Your Pet the Ultimate Care Experience</h1>
            <p>Professional veterinary services, luxury pet boarding, and personalized care all in one place. Your furry friend deserves the best.</p>
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-secondary">Register</Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="pet-illustration">
              <div className="pet-circle">
                <div className="pet-icon">🐕</div>
              </div>
              <div className="floating-elements">
                <div className="element heart">❤️</div>
                <div className="element paw">🐾</div>
                <div className="element bone">🦴</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏥</div>
            <h3>Veterinary Care</h3>
            <p>24/7 professional medical care for your pets</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏨</div>
            <h3>Luxury Boarding</h3>
            <p>Comfortable and safe boarding facilities</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎾</div>
            <h3>Play & Exercise</h3>
            <p>Fun activities and exercise programs</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Pawesome Retreat Inc.</h3>
            <p>Your trusted partner in pet care</p>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>📞 (555) 123-4567</p>
            <p>✉️ info@pawesomeretreat.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Pawesome Retreat Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;