import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const CheckInForm = () => {
  return (
    <div className="checkin-form">
      <div className="form-header">
        <h1>Check-In Form</h1>
        <p>Process pet check-ins for hotel and services</p>
      </div>
      <div className="form-content">
        <div className="placeholder">
          <FontAwesomeIcon icon={faCheckCircle} />
          <h3>Check-In Form Component</h3>
          <p>This component is under development.</p>
        </div>
      </div>
    </div>
  );
};

export default CheckInForm;