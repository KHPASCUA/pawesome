import React, { useEffect } from "react";
import "./PremiumToast.css";

const PremiumToast = ({ show, type = "success", title, message, onClose }) => {
  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  const iconMap = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div className={`premium-toast ${type}`}>
      <div className="toast-icon">{iconMap[type] || "✅"}</div>

      <div className="toast-content">
        <h4>{title}</h4>
        <p>{message}</p>
      </div>

      <button className="toast-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default PremiumToast;
