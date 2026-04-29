import React from "react";
import "./Landing.css";
import { Link } from "react-router-dom";
import pawesomeLogo from "../../assets/pawesome.jpg";
import LandingChatbot from "../LandingChatbot";

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
            <span className="hero-badge">Premium Pet Care & Veterinary Services</span>

            <h1>Give Your Pet the Ultimate Care Experience</h1>

            <p>
              Professional veterinary services, luxury pet boarding, grooming,
              day care, and personalized pet care all in one trusted place.
            </p>

            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-secondary">Register</Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card">
              <img src={pawesomeLogo} alt="Pawesome Retreat" />
              <h3>Pawesome Retreat Inc.</h3>
              <p>Pet Hotel • Grooming • Supplies • Vet Clinic</p>

              <div className="hero-stats">
                <div>
                  <strong>9+</strong>
                  <span>Services</span>
                </div>
                <div>
                  <strong>24/7</strong>
                  <span>Care</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="features">
        <div className="section-header">
          <span>Our Services</span>
          <h2>Everything your pet needs in one place</h2>
        </div>

        <div className="features-grid">
          {[
            ["01", "Laboratories", "CBC / Blood Chemistry testing for accurate diagnosis"],
            ["02", "Vaccination", "Complete vaccination programs for disease prevention"],
            ["03", "Consultation", "In-person and online veterinary consultations"],
            ["04", "Pet Boarding", "Safe and comfortable boarding facilities"],
            ["05", "Pet Day Care", "Professional daytime care and supervision"],
            ["06", "Pet Party Events", "Special events and socialization activities"],
            ["07", "Grooming", "Professional grooming and spa services"],
            ["08", "Supplies & Accessories", "Premium pet supplies and accessories"],
            ["09", "Home Veterinary Service", "Professional veterinary care at your doorstep"],
          ].map((service) => (
            <div className="feature-card" key={service[0]}>
              <div className="feature-number">{service[0]}</div>
              <h3>{service[1]}</h3>
              <p>{service[2]}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="about">
        <div className="about-content">
          <span>About Us</span>
          <h2>About Pawesome Retreat</h2>
          <p>
            We are a premier pet care facility offering comprehensive services
            including Pet Hotel, Grooming, Supplies, and Vet Clinic. Our team of
            experienced professionals provides laboratory services, vaccination,
            consultations, pet boarding, day care, party events, grooming,
            supplies, accessories, and home veterinary service.
          </p>
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

      <LandingChatbot />
    </div>
  );
};

export default LandingPage;