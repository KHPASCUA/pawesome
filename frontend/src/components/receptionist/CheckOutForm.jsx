import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

const CheckOutForm = () => {
  return (
    <div className="checkout-form">
      <div className="form-header">
        <h1>Check-Out Form</h1>
        <p>Process pet check-outs from hotel and services</p>
      </div>
      <div className="form-content">
        <div className="placeholder">
          <FontAwesomeIcon icon={faTimesCircle} />
          <h3>Check-Out Form Component</h3>
          <p>This component is under development.</p>
        </div>
      </div>
    </div>
  );
};

export default CheckOutForm;