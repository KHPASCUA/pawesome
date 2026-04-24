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
          <p>Our Services</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-number">01</div>
            <h3>Laboratories</h3>
            <p>CBC / Blood Chemistry testing for accurate diagnosis</p>
          </div>
          <div className="feature-card">
            <div className="feature-number">02</div>
            <h3>Vaccination</h3>
            <p>Complete vaccination programs for disease prevention</p>
          </div>
          <div className="feature-card">
            <div className="feature-number">03</div>
            <h3>Consultation</h3>
            <p>In-person and online veterinary consultations</p>
          </div>
          <div className="feature-card">
            <div className="feature-number">04</div>
            <h3>Pet Boarding</h3>
            <p>Safe and comfortable boarding facilities</p>
          </div>
          <div className="feature-card">
            <div className="feature-number">05</div>
            <h3>Pet Day Care</h3>
            <p>Professional daytime care and supervision</p>
          </div>
          <div className="feature-card">
            <div className="feature-number">06</div>
            <h3>Pet Party Events</h3>
            <p>Special events and socialization activities</p>
          </div>
          <div className="feature-card">
            <div className="feature-number">07</div>
            <h3>Grooming</h3>
            <p>Professional grooming and spa services</p>
          </div>
          <div className="feature-card">
            <div className="feature-number">08</div>
            <h3>Supplies & Accessories</h3>
            <p>Premium pet supplies and accessories</p>
          </div>
          <div className="feature-card">
            <div className="feature-number">09</div>
            <h3>Home Veterinary Service</h3>
            <p>Professional veterinary care at your doorstep</p>
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <div className="about-content">
          <h2>About Pawesome Retreat</h2>
          <p>We are a premier pet care facility offering comprehensive services including Pet Hotel, Grooming, Supplies and Vet Clinic. Our team of experienced professionals provides laboratory services (CBC/Blood Chem), vaccination, in-person and online consultations, pet boarding, day care, party events, grooming, supplies and accessories, and home veterinary service. We are committed to ensuring your pets receive the highest quality care in a safe, comfortable environment.</p>
        </div>
      </section>

      <footer id="contact" className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Pawesome Retreat Inc.</h3>
            <p>Pet Hotel, Grooming, Supplies and Vet Clinic</p>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: pawesomeretreat24@gmail.com</p>
            <p>Address: Aldana Street San Isidro Village, Las Piñas, Philippines, 1740</p>
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