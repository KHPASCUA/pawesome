import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPrint,
  faDownload,
  faTimes,
  faCalendarAlt,
  faPaw,
  faUser,
  faStethoscope,
  faDollarSign,
  faFileInvoice,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../../api/client";
import "./VetReceipt.css";

const VetReceipt = () => {
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receiptId, setReceiptId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setReceiptId(id);
      fetchReceipt(id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchReceipt = async (id) => {
    try {
      setLoading(true);
      const data = await apiRequest(`/veterinary/receipt/${id}`);
      setReceiptData(data.receipt);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch receipt");
      console.error("Receipt fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      if (!receiptData) return;
      
      const response = await apiRequest(`/veterinary/receipt/${receiptId}/pdf`, {
        method: "GET"
      });
      
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt_${receiptId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download PDF");
      console.error("PDF download error:", err);
    }
  };

  const handleClose = () => {
    setReceiptData(null);
    setReceiptId(null);
    window.history.back();
  };

  if (loading) {
    return (
      <div className="vet-receipt">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Loading receipt...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vet-receipt">
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!receiptData) {
    return (
      <div className="vet-receipt">
        <div className="no-receipt">
          <FontAwesomeIcon icon={faFileInvoice} />
          <h3>No receipt selected</h3>
          <p>Please select a receipt from the reports page to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vet-receipt">
      <div className="receipt-container">
        <div className="receipt-header">
          <h1>Payment Receipt</h1>
          <p>Pawesome Pet Care Center</p>
          <p>Receipt #{receiptData.id}</p>
        </div>

        <div className="receipt-body">
          <div className="receipt-section">
            <h3>Service Information</h3>
            <div className="receipt-info">
              <div className="info-label">Date:</div>
              <div className="info-value">{new Date(receiptData.date).toLocaleDateString()}</div>
            </div>
            <div className="receipt-info">
              <div className="info-label">Time:</div>
              <div className="info-value">{receiptData.time}</div>
            </div>
            <div className="receipt-info">
              <div className="info-label">Type:</div>
              <div className="info-value">{receiptData.service_type?.toUpperCase()}</div>
            </div>
            <div className="receipt-info">
              <div className="info-label">Veterinarian:</div>
              <div className="info-value">Dr. {receiptData.vet_name}</div>
            </div>
          </div>

          <div className="receipt-section">
            <h3>Patient Information</h3>
            <div className="receipt-info">
              <div className="info-label">Pet Name:</div>
              <div className="info-value">
                <FontAwesomeIcon icon={faPaw} />
                {receiptData.pet_name}
              </div>
            </div>
            <div className="receipt-info">
              <div className="info-label">Owner:</div>
              <div className="info-value">
                <FontAwesomeIcon icon={faUser} />
                {receiptData.owner_name}
              </div>
            </div>
            <div className="receipt-info">
              <div className="info-label">Breed:</div>
              <div className="info-value">{receiptData.pet_breed || "N/A"}</div>
            </div>
            <div className="receipt-info">
              <div className="info-label">Age:</div>
              <div className="info-value">{receiptData.pet_age || "N/A"}</div>
            </div>
          </div>

          <div className="receipt-section">
            <h3>Service Details</h3>
            <div className="service-item">
              <div className="service-header">
                <div className="service-name">{receiptData.service_name}</div>
                <div className="service-price">
                  <FontAwesomeIcon icon={faDollarSign} />
                  {receiptData.service_cost?.toFixed(2)}
                </div>
              </div>
              <div className="service-details">
                {receiptData.description}
              </div>
            </div>
            
            {receiptData.additional_services && receiptData.additional_services.length > 0 && (
              <div className="service-item">
                <div className="service-header">
                  <div className="service-name">Additional Services</div>
                  <div className="service-price">
                    <FontAwesomeIcon icon={faDollarSign} />
                    {receiptData.additional_services.reduce((sum, service) => sum + (service.cost || 0), 0).toFixed(2)}
                  </div>
                </div>
                <div className="service-details">
                  {receiptData.additional_services.map((service, index) => (
                    <div key={index} className="additional-service">
                      {service.name} - ${(service.cost || 0).toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="receipt-footer">
            <div className="total-section">
              <div className="total-label">Subtotal:</div>
              <div className="total-amount">${receiptData.subtotal?.toFixed(2)}</div>
            </div>
            
            {receiptData.tax && (
              <div className="total-section">
                <div className="total-label">Tax:</div>
                <div className="total-amount">${receiptData.tax?.toFixed(2)}</div>
              </div>
            )}
            
            <div className="total-section">
              <div className="total-label">Total:</div>
              <div className="total-amount">${receiptData.total?.toFixed(2)}</div>
            </div>
            
            <div className="payment-info">
              <p><strong>Payment Method:</strong> {receiptData.payment_method}</p>
              <p><strong>Status:</strong> 
                <span className={`status-badge status-${receiptData.payment_status}`}>
                  {receiptData.payment_status?.toUpperCase()}
                </span>
              </p>
              {receiptData.paid_date && (
                <p><strong>Paid on:</strong> {new Date(receiptData.paid_date).toLocaleDateString()}</p>
              )}
            </div>
          </div>

          <div className="receipt-actions">
            <button className="btn-print" onClick={handlePrint}>
              <FontAwesomeIcon icon={faPrint} />
              Print Receipt
            </button>
            <button className="btn-download" onClick={handleDownloadPDF}>
              <FontAwesomeIcon icon={faDownload} />
              Download PDF
            </button>
            <button className="btn-close" onClick={handleClose}>
              <FontAwesomeIcon icon={faTimes} />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetReceipt;