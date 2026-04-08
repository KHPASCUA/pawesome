import React from 'react';

const ProductCard = ({ product, onAdd, onQuickAdd, quantity = 0 }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="product-placeholder">
            {product.category === 'food' && '🍖'}
            {product.category === 'accessories' && '🦴'}
            {product.category === 'grooming' && '✂️'}
            {product.category === 'toys' && '🎾'}
            {product.category === 'health' && '💊'}
          </div>
        )}
        {product.discount && (
          <span className="discount-badge">-{product.discount}%</span>
        )}
        {!product.inStock && (
          <span className="out-of-stock">Out of Stock</span>
        )}
        {product.rating && (
          <div className="product-rating">
            ⭐ {product.rating} ({product.reviews || 0})
          </div>
        )}
      </div>
      <div className="product-info">
        <h4 className="product-name">{product.name}</h4>
        <div className="product-price">
          {product.discount ? (
            <>
              <span className="original-price">₱{product.price}</span>
              <span className="discounted-price">
                ₱{(product.price * (1 - product.discount / 100)).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="current-price">₱{product.price}</span>
          )}
        </div>
        <div className="product-actions">
          {quantity > 0 && (
            <div className="quantity-controls">
              <button 
                className="quantity-btn minus" 
                onClick={() => onQuickAdd(product, -1)}
              >
                -
              </button>
              <span className="quantity-display">{quantity}</span>
              <button 
                className="quantity-btn plus" 
                onClick={() => onQuickAdd(product, 1)}
              >
                +
              </button>
            </div>
          )}
          <button 
            className={`add-to-cart-btn ${quantity > 0 ? 'in-cart' : ''}`}
            onClick={() => onAdd(product)}
            disabled={!product.inStock}
          >
            {quantity > 0 ? 'Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
