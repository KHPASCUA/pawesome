import React, { useMemo, useState } from "react";
import "./CashierPOS.css";
import "./CashierPOS_Enhanced.css";

const categories = [
  { id: "all", label: "All Products", icon: "🐾" },
  { id: "food", label: "Food", icon: "🍖" },
  { id: "accessories", label: "Accessories", icon: "🦴" },
  { id: "grooming", label: "Grooming", icon: "✂️" },
  { id: "toys", label: "Toys", icon: "🎾" },
  { id: "health", label: "Health", icon: "💊" },
];

const products = [
  // Food Category
  { id: 1, name: "Premium Dog Food", price: 1200, category: "food", inStock: true, discount: 10, rating: 4.5, reviews: 128 },
  { id: 2, name: "Cat Kibble", price: 950, category: "food", inStock: true, discount: 0, rating: 4.2, reviews: 89 },
  { id: 3, name: "Puppy Starter Kit", price: 850, category: "food", inStock: true, discount: 15, rating: 4.8, reviews: 203 },
  { id: 4, name: "Senior Cat Food", price: 1100, category: "food", inStock: false, discount: 0, rating: 4.6, reviews: 156 },
  { id: 5, name: "Organic Pet Food", price: 1500, category: "food", inStock: true, discount: 20, rating: 4.9, reviews: 67 },
  
  // Accessories Category
  { id: 6, name: "Leash & Collar Set", price: 450, category: "accessories", inStock: true, discount: 5, rating: 4.3, reviews: 234 },
  { id: 7, name: "Pet Bed", price: 800, category: "accessories", inStock: true, discount: 10, rating: 4.7, reviews: 189 },
  { id: 8, name: "Water Fountain", price: 1200, category: "accessories", inStock: true, discount: 0, rating: 4.4, reviews: 145 },
  { id: 9, name: "Pet Carrier", price: 950, category: "accessories", inStock: false, discount: 0, rating: 4.6, reviews: 98 },
  { id: 10, name: "GPS Tracker", price: 650, category: "accessories", inStock: true, discount: 15, rating: 4.1, reviews: 76 },
  
  // Grooming Category
  { id: 11, name: "Shampoo", price: 300, category: "grooming", inStock: true, discount: 0, rating: 4.5, reviews: 312 },
  { id: 12, name: "Brush", price: 200, category: "grooming", inStock: true, discount: 10, rating: 4.2, reviews: 267 },
  { id: 13, name: "Nail Clippers", price: 150, category: "grooming", inStock: true, discount: 0, rating: 4.0, reviews: 198 },
  { id: 14, name: "Grooming Kit", price: 450, category: "grooming", inStock: true, discount: 20, rating: 4.8, reviews: 423 },
  { id: 15, name: "Pet Wipes", price: 120, category: "grooming", inStock: true, discount: 5, rating: 4.3, reviews: 156 },
  
  // Toys Category
  { id: 16, name: "Interactive Ball", price: 250, category: "toys", inStock: true, discount: 10, rating: 4.6, reviews: 289 },
  { id: 17, name: "Chew Toy Set", price: 180, category: "toys", inStock: true, discount: 0, rating: 4.4, reviews: 167 },
  { id: 18, name: "Cat Tower", price: 1200, category: "toys", inStock: false, discount: 0, rating: 4.7, reviews: 345 },
  { id: 19, name: "Puzzle Feeder", price: 350, category: "toys", inStock: true, discount: 15, rating: 4.5, reviews: 234 },
  { id: 20, name: "Squeaky Toys", price: 120, category: "toys", inStock: true, discount: 0, rating: 4.1, reviews: 145 },
  
  // Health Category
  { id: 21, name: "Vitamins", price: 450, category: "health", inStock: true, discount: 10, rating: 4.6, reviews: 278 },
  { id: 22, name: "Flea Treatment", price: 280, category: "health", inStock: true, discount: 0, rating: 4.3, reviews: 412 },
  { id: 23, name: "Dental Care", price: 320, category: "health", inStock: true, discount: 15, rating: 4.4, reviews: 189 },
  { id: 24, name: "Eye Drops", price: 180, category: "health", inStock: true, discount: 0, rating: 4.2, reviews: 98 },
  { id: 25, name: "Joint Supplements", price: 520, category: "health", inStock: true, discount: 20, rating: 4.7, reviews: 234 },
];

const formatPrice = (value) => `₱${value.toFixed(2)}`;

const CashierPOS = ({ onCheckout }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("Walk-in");
  const [customer, setCustomer] = useState("");
  const [voucher, setVoucher] = useState("");
  const [cashReceived, setCashReceived] = useState("");

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.12;
  const discount = voucher.trim() ? 25 : 0;
  const totalAmount = Math.max(subtotal + tax - discount, 0);
  const changeAmount = cashReceived && parseFloat(cashReceived) >= totalAmount 
    ? parseFloat(cashReceived) - totalAmount 
    : 0;

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearOrder = () => {
    setCart([]);
    setCustomer("");
    setVoucher("");
    setCashReceived("");
    setOrderType("Walk-in");
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const transaction = {
      id: Date.now(),
      items: cart,
      subtotal,
      tax,
      discount,
      total: totalAmount,
      orderType,
      customer: customer || "Walk-in",
      createdAt: new Date().toISOString(),
    };

    if (onCheckout) onCheckout(transaction);
    clearOrder();
  };

  return (
    <div className="pos-page">
      <aside className="pos-categories">
        <div className="pos-category-list">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`pos-category-item ${activeCategory === category.id ? "active" : ""}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="pos-products-panel">
        <div className="pos-header-row">
          <div>
            <p className="pos-section-label">POS</p>
            <h2>Pet Store Products</h2>
          </div>
          <div className="pos-search-bar">
            <input type="search" placeholder="Search products..." />
          </div>
        </div>

        <div className="pos-product-grid">
          {filteredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-thumb" />
              <div className="product-card-body">
                <strong>{product.name}</strong>
                <span>{formatPrice(product.price)}</span>
              </div>
              <button type="button" className="product-add" onClick={() => addToCart(product)}>
                Add
              </button>
            </article>
          ))}
        </div>
      </main>

      <aside className="pos-order-panel">
        <div className="order-details-card">
          <div className="order-details-header">
            <h3>Order Details</h3>
          </div>

          <div className="order-type-switch">
            {["Walk-in", "Delivery"].map((type) => (
              <button
                key={type}
                type="button"
                className={`type-button ${orderType === type ? "selected" : ""}`}
                onClick={() => setOrderType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="order-cart-list">
            {cart.length === 0 ? (
              <div className="empty-order">
                <div className="empty-icon">🛒</div>
                <strong>No Order</strong>
                <p>Tap the product to add into order</p>
              </div>
            ) : (
              cart.map((item) => (
                <div className="order-item" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.quantity} x {formatPrice(item.price)}</p>
                  </div>
                  <button type="button" className="remove-item" onClick={() => removeItem(item.id)}>×</button>
                </div>
              ))
            )}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <strong>{formatPrice(tax)}</strong>
            </div>
            <div className="summary-row">
              <span>Voucher</span>
              <strong>{voucher ? `- ${formatPrice(discount)}` : formatPrice(0)}</strong>
            </div>
            <div className="summary-row total-row">
              <span>Total</span>
              <strong>{formatPrice(totalAmount)}</strong>
            </div>
          </div>

          <div className="payment-section">
            <div className="cash-payment">
              <label className="cash-field">
                <span>💵 Cash Received</span>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </label>
              
              {cashReceived && parseFloat(cashReceived) > 0 && (
                <div className="change-display">
                  <div className="summary-row">
                    <span>Total Amount</span>
                    <strong>{formatPrice(totalAmount)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Cash Received</span>
                    <strong>{formatPrice(parseFloat(cashReceived) || 0)}</strong>
                  </div>
                  <div className="summary-row change-row">
                    <span>Change</span>
                    <strong className="change-amount">
                      {changeAmount > 0 ? formatPrice(changeAmount) : 'Insufficient Amount'}
                    </strong>
                  </div>
                </div>
              )}
            </div>
            
            <div className="quick-cash-buttons">
              <span>Quick Amount:</span>
              <button type="button" onClick={() => setCashReceived('1000')}>₱1000</button>
              <button type="button" onClick={() => setCashReceived('500')}>₱500</button>
              <button type="button" onClick={() => setCashReceived('200')}>₱200</button>
              <button type="button" onClick={() => setCashReceived('100')}>₱100</button>
            </div>
          </div>

          <label className="customer-field">
            <span>Customer Name</span>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Walk-in or name"
            />
          </label>

          <button 
            type="button" 
            className="checkout-button" 
            onClick={handleCheckout} 
            disabled={cart.length === 0 || !cashReceived || parseFloat(cashReceived) < totalAmount}
          >
            Process Transaction
          </button>
        </div>
      </aside>
    </div>
  );
};

export default CashierPOS;