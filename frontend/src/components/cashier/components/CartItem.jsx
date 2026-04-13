import React from 'react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const itemTotal = item.discount 
    ? (item.price * (1 - item.discount / 100)) * item.quantity
    : item.price * item.quantity;

  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <div className="item-details">
          <h5 className="item-name">{item.name}</h5>
          <div className="item-price">
            {item.discount ? (
              <>
                <span className="original-price">₱{item.price}</span>
                <span className="discounted-price">
                  ₱{(item.price * (1 - item.discount / 100)).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="current-price">₱{item.price}</span>
            )}
          </div>
        </div>
      </div>
      <div className="cart-item-controls">
        <div className="quantity-controls">
          <button 
            className="quantity-btn minus" 
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span className="quantity-display">{item.quantity}</span>
          <button 
            className="quantity-btn plus" 
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          >
            +
          </button>
        </div>
        <div className="item-total">
          ₱{itemTotal.toFixed(2)}
        </div>
        <button 
          className="remove-item-btn" 
          onClick={() => onRemove(item.id)}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default CartItem;
