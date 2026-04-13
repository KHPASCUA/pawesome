import React from "react";
import Navbar from "./Navbar";   // your existing shared Navbar
import Footer from "./Footer";   // your existing shared Footer

// Sidebar will be passed in as a prop so we can reuse Layout for Admin, Receptionist, Customer
const Layout = ({ Sidebar, children }) => {
  return (
    <div className="layout">
      <Navbar />
      <div className="main">
        <Sidebar />
        <div className="content">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;Layout