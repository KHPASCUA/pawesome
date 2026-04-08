import React from "react";
import RoleBasedNavbar from "./RoleBasedNavbar";
import Footer from "./Footer";
import AdminSidebar from "../admin/AdminSidebar";
import ReceptionistSidebar from "../receptionist/ReceptionistSidebar";
import CustomerSidebar from "../customers/CustomerSidebar";

const RoleBasedLayout = ({ role, children }) => {
  let Sidebar;

  switch (role) {
    case "admin":
      Sidebar = AdminSidebar;
      break;
    case "receptionist":
      Sidebar = ReceptionistSidebar;
      break;
    case "customer":
      Sidebar = CustomerSidebar;
      break;
    default:
      Sidebar = () => <div>No sidebar available</div>;
  }

  return (
    <div className="layout">
      <RoleBasedNavbar role={role} />
      <div className="main">
        <Sidebar />
        <div className="content">{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default RoleBasedLayout;