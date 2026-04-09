import React from 'react';

const OrderSummary = ({ 
  cart, 
  subtotal, 
  tax, 
  discount, 
  total, 
  voucher, 
  onVoucherChange,
  onClearOrder,
  onCheckout 
}) => {
  return (
    <div className="order-summary">
      <div className="order-header">
        <h3>Order Summary</h3>
        <button className="clear-order-btn" onClick={onClearOrder}>
          🗑️ Clear
        </button>
      </div>

      <div className="order-items">
        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <p>No items in order</p>
            <small>Add products to start</small>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="summary-item">
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">×{item.quantity}</span>
              </div>
              <div className="item-price">
                {item.discount ? (
                  <>
                    <span className="original-price">₱{item.price}</span>
                    <span className="discounted-price">
                      ₱{(item.price * (1 - item.discount / 100)).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span>₱{item.price}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="order-totals">
        <div className="total-row">
          <span>Subtotal</span>
          <span>₱{subtotal.toFixed(2)}</span>
        </div>
        <div className="total-row">
          <span>Tax (12%)</span>
          <span>₱{tax.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="total-row discount">
            <span>Discount</span>
            <span>-₱{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="total-row final">
          <span>Total</span>
          <span className="total-amount">₱{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="voucher-section">
        <label>Voucher Code</label>
        <div className="voucher-input">
          <input
            type="text"
            value={voucher}
            onChange={(e) => onVoucherChange(e.target.value)}
            placeholder="Enter voucher code"
          />
          <button className="apply-voucher-btn">Apply</button>
        </div>
      </div>

      <button 
        className="checkout-btn" 
        onClick={onCheckout}
        disabled={cart.length === 0}
      >
        💳 Proceed to Payment
      </button>
    </div>
  );
};

export default OrderSummary;
