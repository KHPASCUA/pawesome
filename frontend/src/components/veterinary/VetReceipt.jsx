import React from "react";

const VetReceipt = ({ receipt }) => {
  return (
    <div>
      <h2>Veterinary Receipt</h2>
      <p>Customer: {receipt.customer}</p>
      <p>Pet: {receipt.pet}</p>
      <p>Service: {receipt.service}</p>
      <p>Date: {receipt.date}</p>
      <p>Total: ₱{receipt.amount}</p>
    </div>
  );
};

export default VetReceipt;