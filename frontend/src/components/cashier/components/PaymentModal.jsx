import React, { useState } from 'react';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  totalAmount, 
  onPaymentComplete,
  orderDetails 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (paymentMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < totalAmount)) {
      alert('Please enter a valid cash amount');
      return;
    }

    if (paymentMethod === 'card' && !cardNumber.trim()) {
      alert('Please enter card number');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const paymentData = {
        method: paymentMethod,
        amount: totalAmount,
        cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : null,
        change: paymentMethod === 'cash' ? parseFloat(cashReceived) - totalAmount : 0,
        cardLast4: paymentMethod === 'card' ? cardNumber.slice(-4) : null,
        timestamp: new Date().toISOString()
      };

      onPaymentComplete(paymentData);
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  const changeAmount = paymentMethod === 'cash' && cashReceived 
    ? parseFloat(cashReceived) - totalAmount 
    : 0;

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h3>Complete Payment</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="payment-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₱{orderDetails.subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax:</span>
            <span>₱{orderDetails.tax.toFixed(2)}</span>
          </div>
          {orderDetails.discount > 0 && (
            <div className="summary-row discount">
              <span>Discount:</span>
              <span>-₱{orderDetails.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total:</span>
            <span>₱{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="payment-methods">
          <h4>Payment Method</h4>
          <div className="payment-options">
            <button 
              className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('cash')}
            >
              💵 Cash
            </button>
            <button 
              className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              💳 Card
            </button>
            <button 
              className={`payment-option ${paymentMethod === 'mobile' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('mobile')}
            >
              📱 Mobile
            </button>
          </div>
        </div>

        <div className="payment-details">
          {paymentMethod === 'cash' && (
            <div className="cash-payment">
              <label>Cash Received:</label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
              {changeAmount > 0 && (
                <div className="change-amount">
                  <span>Change:</span>
                  <span className="change-value">₱{changeAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="card-payment">
              <label>Card Number:</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
              <div className="card-inputs">
                <input type="text" placeholder="MM/YY" maxLength="5" />
                <input type="text" placeholder="CVV" maxLength="3" />
              </div>
            </div>
          )}

          {paymentMethod === 'mobile' && (
            <div className="mobile-payment">
              <label>Mobile Number:</label>
              <input
                type="tel"
                placeholder="09XX XXX XXXX"
                maxLength="11"
              />
              <div className="mobile-options">
                <button className="mobile-provider">GCash</button>
                <button className="mobile-provider">PayMaya</button>
              </div>
            </div>
          )}
        </div>

        <div className="payment-actions">
          <button 
            className="cancel-btn" 
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button 
            className="process-payment-btn" 
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay ₱${totalAmount.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
