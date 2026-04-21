import React from "react";
import "./Landing.css";
import { Link } from "react-router-dom";
import pawesomeLogo from "../../assets/pawesome.jpg";

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="header-content">
          <div className="logo">
            <img src={pawesomeLogo} alt="Pawesome Retreat" className="logo-image" />
            <div className="logo-text">
              <h1>PAWESOME</h1>
              <span>RETREAT INC.</span>
            </div>
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
                  </div>
      </section>

      <section id="services" className="features">
        <div className="section-header">
          <h2>Our Services</h2>
          <p>Comprehensive care solutions for your beloved pets</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-number">01</div>
            <h3>Veterinary Care</h3>
            <p>24/7 professional medical care for your pets</p>
          </div>
          <div className="feature-card">
            <div className="feature-number">02</div>
            <h3>Luxury Boarding</h3>
            <p>Comfortable and safe boarding facilities</p>
          </div>
          <div className="feature-card">
            <div className="feature-number">03</div>
            <h3>Play & Exercise</h3>
            <p>Fun activities and exercise programs</p>
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <div className="about-content">
          <h2>About Pawesome Retreat</h2>
          <p>We are a premier pet care facility dedicated to providing exceptional veterinary services, luxury boarding, and personalized care for your beloved companions. Our team of experienced professionals is committed to ensuring your pets receive the highest quality care in a safe, comfortable environment.</p>
        </div>
      </section>

      <footer id="contact" className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Pawesome Retreat Inc.</h3>
            <p>Your trusted partner in pet care</p>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Phone: (555) 123-4567</p>
            <p>Email: info@pawesomeretreat.com</p>
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