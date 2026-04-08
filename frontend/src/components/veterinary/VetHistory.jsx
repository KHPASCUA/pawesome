import React from "react";

const VetHistory = ({ history }) => {
  return (
    <div>
      <h2>Veterinary History</h2>
      <ul>
        {history.map((record, idx) => (
          <li key={idx}>
            {record.date} — {record.pet} : {record.notes}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VetHistory;