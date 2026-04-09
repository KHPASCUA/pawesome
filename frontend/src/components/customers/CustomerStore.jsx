import React, { useState, useEffect } from "react";
import "./CustomerStore.css";

const storeData = {
  Food: [
    { id: 1, name: "Premium Dog Food", price: 1200, image: "", rating: 4.5, reviews: 128, inStock: true, discount: 10 },
    { id: 2, name: "Cat Kibble", price: 950, image: "", rating: 4.2, reviews: 89, inStock: true, discount: 0 },
    { id: 3, name: "Puppy Starter Kit", price: 850, image: "", rating: 4.8, reviews: 203, inStock: true, discount: 15 },
    { id: 4, name: "Senior Cat Food", price: 1100, image: "", rating: 4.6, reviews: 156, inStock: false, discount: 0 },
    { id: 5, name: "Organic Pet Food", price: 1500, image: "", rating: 4.9, reviews: 67, inStock: true, discount: 20 }
  ],
  Accessories: [
    { id: 6, name: "Leash & Collar Set", price: 450, image: "", rating: 4.3, reviews: 234, inStock: true, discount: 5 },
    { id: 7, name: "Pet Bed", price: 800, image: "", rating: 4.7, reviews: 189, inStock: true, discount: 10 },
    { id: 8, name: "Water Fountain", price: 1200, image: "", rating: 4.4, reviews: 145, inStock: true, discount: 0 },
    { id: 9, name: "Pet Carrier", price: 950, image: "", rating: 4.6, reviews: 98, inStock: false, discount: 0 },
    { id: 10, name: "GPS Tracker", price: 650, image: "", rating: 4.1, reviews: 76, inStock: true, discount: 15 }
  ],
  Grooming: [
    { id: 11, name: "Shampoo", price: 300, image: "", rating: 4.5, reviews: 312, inStock: true, discount: 0 },
    { id: 12, name: "Brush", price: 200, image: "", rating: 4.2, reviews: 267, inStock: true, discount: 10 },
    { id: 13, name: "Nail Clippers", price: 150, image: "", rating: 4.0, reviews: 198, inStock: true, discount: 0 },
    { id: 14, name: "Grooming Kit", price: 450, image: "", rating: 4.8, reviews: 423, inStock: true, discount: 20 },
    { id: 15, name: "Pet Wipes", price: 120, image: "", rating: 4.3, reviews: 156, inStock: true, discount: 5 }
  ],
  Toys: [
    { id: 16, name: "Interactive Ball", price: 250, image: "", rating: 4.6, reviews: 289, inStock: true, discount: 10 },
    { id: 17, name: "Chew Toy Set", price: 180, image: "", rating: 4.4, reviews: 167, inStock: true, discount: 0 },
    { id: 18, name: "Cat Tower", price: 1200, image: "", rating: 4.7, reviews: 345, inStock: false, discount: 0 },
    { id: 19, name: "Puzzle Feeder", price: 350, image: "", rating: 4.5, reviews: 234, inStock: true, discount: 15 },
    { id: 20, name: "Squeaky Toys", price: 120, image: "", rating: 4.1, reviews: 145, inStock: true, discount: 0 }
  ],
  Health: [
    { id: 21, name: "Vitamins", price: 450, image: "", rating: 4.6, reviews: 278, inStock: true, discount: 10 },
    { id: 22, name: "Flea Treatment", price: 280, image: "", rating: 4.3, reviews: 412, inStock: true, discount: 0 },
    { id: 23, name: "Dental Care", price: 320, image: "", rating: 4.4, reviews: 189, inStock: true, discount: 15 },
    { id: 24, name: "Eye Drops", price: 180, image: "", rating: 4.2, reviews: 98, inStock: true, discount: 0 },
    { id: 25, name: "Joint Supplements", price: 520, image: "", rating: 4.7, reviews: 234, inStock: true, discount: 20 }
  ]
};

export default function CustomerStore() {
  const [category, setCategory] = useState("Food");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  const [sortBy, setSortBy] = useState("name");
  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [paymentImage, setPaymentImage] = useState(null);
  const [orderType, setOrderType] = useState("Pick-up");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);

  const filteredProducts = category === "Wishlist" ? [] : storeData[category]
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      product.price >= priceRange.min &&
      product.price <= priceRange.max
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  const addToCart = (item) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      setCart(cart.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const updateQty = (id, change) => {
    setCart(
      cart
        .map((c) =>
          c.id === id ? { ...c, qty: Math.max(0, c.qty + change) } : c
        )
        .filter((c) => c.qty > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const toggleWishlist = (item) => {
    const exists = wishlist.find(w => w.id === item.id);
    if (exists) {
      setWishlist(wishlist.filter(w => w.id !== item.id));
    } else {
      setWishlist([...wishlist, item]);
    }
  };

  const getSubtotal = () => cart.reduce((total, item) => {
    const itemPrice = item.discount > 0 ? 
      item.price * (1 - item.discount / 100) : item.price;
    return total + itemPrice * item.qty;
  }, 0);

  const getTotal = () => {
    const subtotal = getSubtotal();
    const discountAmount = subtotal * (discountApplied / 100);
    return Math.max(0, subtotal - discountAmount);
  };

  const applyDiscount = () => {
    if (discountCode.toLowerCase() === "pawesome10") {
      setDiscountApplied(10);
    } else if (discountCode.toLowerCase() === "pet20") {
      setDiscountApplied(20);
    } else {
      setDiscountApplied(0);
    }
  };

  const proceedCheckout = () => {
    if (cart.length > 0) setCheckoutStep("payment");
  };

  const confirmPayment = () => {
    if (paymentImage) {
      const newOrder = {
        id: Date.now(),
        items: cart,
        total: getTotal(),
        orderType,
        date: new Date().toLocaleDateString(),
        status: "Processing"
      };
      setOrderHistory([...orderHistory, newOrder]);
      setCheckoutStep("receipt");
    }
  };

  const openQuickView = (product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push("⭐");
      } else if (i - 0.5 <= rating) {
        stars.push("✨");
      } else {
        stars.push("☆");
      }
    }
    return stars.join("");
  };

  return (
    <div className="customer-store">
      {/* Header */}
      <header className="store-header">
        <div className="header-content">
          <h1>🛍️ Pawesome Store</h1>
          <div className="header-actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            <button className="wishlist-btn" onClick={() => setCategory("Wishlist")}>
              ❤️ Wishlist ({wishlist.length})
            </button>
          </div>
        </div>
      </header>

      <div className="store-content">
        {/* Sidebar */}
        <aside className="store-sidebar">
          <div className="category-section">
            <h3>Categories</h3>
            {Object.keys(storeData).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`category-btn ${category === cat ? "active" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="filter-section">
            <h3>Filters</h3>
            <div className="price-filter">
              <label>Price Range</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value) || 0})}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value) || 2000})}
                />
              </div>
            </div>
            <div className="sort-filter">
              <label>Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          <div className="order-history">
            <h3>Recent Orders</h3>
            {orderHistory.length === 0 ? (
              <p>No orders yet</p>
            ) : (
              <div className="history-list">
                {orderHistory.slice(-3).map(order => (
                  <div key={order.id} className="history-item">
                    <span>Order #{order.id}</span>
                    <span>₱{order.total}</span>
                    <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="store-main">
          {category === "Wishlist" ? (
            <div className="wishlist-content">
              <h2>My Wishlist</h2>
              {wishlist.length === 0 ? (
                <div className="empty-wishlist">
                  <p>Your wishlist is empty</p>
                  <button onClick={() => setCategory("Food")}>Start Shopping</button>
                </div>
              ) : (
                <div className="wishlist-grid">
                  {wishlist.map(item => (
                    <div key={item.id} className="wishlist-item">
                      <div className="item-image">{item.image}</div>
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        <p>₱{item.price}</p>
                        <div className="item-rating">
                          {renderStars(item.rating)} ({item.reviews})
                        </div>
                      </div>
                      <div className="item-actions">
                        <button onClick={() => addToCart(item)} className="add-to-cart">
                          Add to Cart
                        </button>
                        <button onClick={() => toggleWishlist(item)} className="remove">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="category-header">
                <h2>{category}</h2>
                <span className="product-count">{filteredProducts.length} products</span>
              </div>
              <div className="products-grid">
                {filteredProducts.map((item) => (
                  <div key={item.id} className="product-card">
                    <div className="product-image">
                      <span className="product-emoji">{item.image}</span>
                      {item.discount > 0 && (
                        <span className="discount-badge">-{item.discount}%</span>
                      )}
                      {!item.inStock && (
                        <span className="out-of-stock">Out of Stock</span>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{item.name}</h3>
                      <div className="product-rating">
                        {renderStars(item.rating)}
                        <span className="review-count">({item.reviews})</span>
                      </div>
                      <div className="product-price">
                        {item.discount > 0 ? (
                          <>
                            <span className="original-price">₱{item.price}</span>
                            <span className="discounted-price">
                              ₱{Math.round(item.price * (1 - item.discount / 100))}
                            </span>
                          </>
                        ) : (
                          <span className="current-price">₱{item.price}</span>
                        )}
                      </div>
                    </div>
                    <div className="product-actions">
                      <button 
                        className={`wishlist-toggle ${wishlist.find(w => w.id === item.id) ? 'active' : ''}`}
                        onClick={() => toggleWishlist(item)}
                      >
                        {wishlist.find(w => w.id === item.id) ? '❤️' : '🤍'}
                      </button>
                      <button 
                        className="quick-view-btn"
                        onClick={() => openQuickView(item)}
                      >
                        👁️ Quick View
                      </button>
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => addToCart(item)}
                        disabled={!item.inStock}
                      >
                        {item.inStock ? '🛒 Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>

        {/* Cart Section */}
        <aside className="cart-section">
          {checkoutStep === "cart" && (
            <div className="cart-content">
              <h2>Shopping Cart</h2>
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map((item) => (
                      <div key={item.id} className="cart-item">
                        <div className="cart-item-info">
                          <span className="cart-item-emoji">{item.image}</span>
                          <div>
                            <h4>{item.name}</h4>
                            <p>₱{item.discount > 0 ? 
                              Math.round(item.price * (1 - item.discount / 100)) : item.price}</p>
                          </div>
                        </div>
                        <div className="cart-item-controls">
                          <div className="qty-controls">
                            <button onClick={() => updateQty(item.id, -1)}>-</button>
                            <span>{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)}>+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="remove-btn">
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="discount-section">
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                    />
                    <button onClick={applyDiscount}>Apply</button>
                    {discountApplied > 0 && (
                      <p className="discount-applied">Discount applied: {discountApplied}%</p>
                    )}
                  </div>
                  <div className="cart-summary">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>₱{getSubtotal()}</span>
                    </div>
                    {discountApplied > 0 && (
                      <div className="summary-row discount">
                        <span>Discount:</span>
                        <span>-₱{Math.round(getSubtotal() * discountApplied / 100)}</span>
                      </div>
                    )}
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>₱{getTotal()}</span>
                    </div>
                  </div>
                  <button className="checkout-btn" onClick={proceedCheckout}>
                    Proceed to Checkout
                  </button>
                </>
              )}
            </div>
          )}

          {checkoutStep === "payment" && (
            <div className="payment-content">
              <h2>Checkout</h2>
              <div className="payment-form">
                <h3>Order Summary</h3>
                <div className="order-summary">
                  {cart.map((item) => (
                    <div key={item.id} className="summary-item">
                      <span>{item.name} x {item.qty}</span>
                      <span>₱{item.discount > 0 ? 
                        Math.round(item.price * (1 - item.discount / 100) * item.qty) : 
                        item.price * item.qty}</span>
                    </div>
                  ))}
                  <div className="summary-total">
                    <span>Total:</span>
                    <span>₱{getTotal()}</span>
                  </div>
                </div>
                
                <h3>Order Type</h3>
                <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                  <option>Pick-up</option>
                  <option>Delivery</option>
                </select>
                
                <h3>Payment Method</h3>
                <div className="payment-options">
                  <label>
                    <input type="radio" name="payment" defaultChecked />
                    Online Payment
                  </label>
                  <label>
                    <input type="radio" name="payment" />
                    Cash on Delivery
                  </label>
                </div>
                
                <h3>Upload Payment Proof</h3>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPaymentImage(e.target.files[0])}
                />
                {paymentImage && (
                  <p className="payment-uploaded">✅ Payment proof uploaded</p>
                )}
                
                <div className="payment-actions">
                  <button className="back-btn" onClick={() => setCheckoutStep("cart")}>
                    Back to Cart
                  </button>
                  <button className="confirm-btn" onClick={confirmPayment}>
                    Confirm Payment
                  </button>
                </div>
              </div>
            </div>
          )}

          {checkoutStep === "receipt" && (
            <div className="receipt-content">
              <h2>🎉 Order Confirmed!</h2>
              <div className="receipt">
                <h3>Pawesome Store Receipt</h3>
                <div className="receipt-details">
                  <p>Order #{Date.now()}</p>
                  <p>Date: {new Date().toLocaleDateString()}</p>
                  <p>Order Type: {orderType}</p>
                </div>
                <div className="receipt-items">
                  {cart.map((item) => (
                    <div key={item.id} className="receipt-item">
                      <span>{item.name} x {item.qty}</span>
                      <span>₱{item.discount > 0 ? 
                        Math.round(item.price * (1 - item.discount / 100) * item.qty) : 
                        item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
                <div className="receipt-total">
                  <span>Total Paid: ₱{getTotal()}</span>
                </div>
                <div className="receipt-footer">
                  <p>Payment Method: Online</p>
                  <p>Status: Processing</p>
                  <p>Estimated Delivery: 2-3 business days</p>
                </div>
              </div>
              <button className="done-btn" onClick={() => {
                setCheckoutStep("cart");
                setCart([]);
                setPaymentImage(null);
                setDiscountCode("");
                setDiscountApplied(0);
              }}>
                Continue Shopping
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Quick View Modal */}
      {showQuickView && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowQuickView(false)}>
          <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedProduct.name}</h3>
              <button className="close-btn" onClick={() => setShowQuickView(false)}>✖️</button>
            </div>
            <div className="modal-content">
              <div className="product-image-large">
                <span className="product-emoji-large">{selectedProduct.image}</span>
              </div>
              <div className="product-details">
                <div className="product-rating-large">
                  {renderStars(selectedProduct.rating)}
                  <span>({selectedProduct.reviews} reviews)</span>
                </div>
                <div className="product-price-large">
                  {selectedProduct.discount > 0 ? (
                    <>
                      <span className="original-price">₱{selectedProduct.price}</span>
                      <span className="discounted-price">
                        ₱{Math.round(selectedProduct.price * (1 - selectedProduct.discount / 100))}
                      </span>
                    </>
                  ) : (
                    <span className="current-price">₱{selectedProduct.price}</span>
                  )}
                </div>
                <div className="product-description">
                  <p>High-quality product designed for your beloved pet. Made with premium materials and pet-safe ingredients.</p>
                </div>
                <div className="product-features">
                  <h4>Features:</h4>
                  <ul>
                    <li>Premium quality materials</li>
                    <li>Pet-safe and non-toxic</li>
                    <li>Durable and long-lasting</li>
                    <li>Easy to clean and maintain</li>
                  </ul>
                </div>
                <div className="stock-status">
                  <span className={`status ${selectedProduct.inStock ? 'in-stock' : 'out-stock'}`}>
                    {selectedProduct.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className={`wishlist-toggle ${wishlist.find(w => w.id === selectedProduct.id) ? 'active' : ''}`}
                onClick={() => toggleWishlist(selectedProduct)}
              >
                {wishlist.find(w => w.id === selectedProduct.id) ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
              </button>
              <button 
                className="add-to-cart-btn-large"
                onClick={() => {
                  addToCart(selectedProduct);
                  setShowQuickView(false);
                }}
                disabled={!selectedProduct.inStock}
              >
                {selectedProduct.inStock ? '🛒 Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}