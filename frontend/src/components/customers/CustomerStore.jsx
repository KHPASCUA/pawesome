import React, { useState, useEffect } from "react";
import "./CustomerStore_Polished.css";
import { inventoryApi } from "../../api/inventory";

// Rich demo data for presentation - will be replaced with API data when available
const storeData = {
  Food: [
    { id: 1, name: "Premium Dog Food 5kg", price: 1200, image: "🦴", rating: 4.5, reviews: 128, inStock: true, discount: 10 },
    { id: 2, name: "Cat Kibble 2kg", price: 950, image: "🐟", rating: 4.2, reviews: 89, inStock: true, discount: 0 },
    { id: 3, name: "Puppy Starter Kit", price: 850, image: "🍼", rating: 4.8, reviews: 203, inStock: true, discount: 15 },
    { id: 4, name: "Senior Cat Food", price: 1100, image: "🐱", rating: 4.6, reviews: 156, inStock: false, discount: 0 },
    { id: 5, name: "Organic Pet Food", price: 1500, image: "🌿", rating: 4.9, reviews: 67, inStock: true, discount: 20 },
    { id: 26, name: "Grain-Free Dog Food", price: 1350, image: "🥩", rating: 4.7, reviews: 234, inStock: true, discount: 5 },
    { id: 27, name: "Kitten Milk Formula", price: 450, image: "🥛", rating: 4.4, reviews: 112, inStock: true, discount: 0 }
  ],
  Accessories: [
    { id: 6, name: "Leash & Collar Set", price: 450, image: "🦮", rating: 4.3, reviews: 234, inStock: true, discount: 5 },
    { id: 7, name: "Pet Bed Large", price: 800, image: "🛏️", rating: 4.7, reviews: 189, inStock: true, discount: 10 },
    { id: 8, name: "Water Fountain", price: 1200, image: "💧", rating: 4.4, reviews: 145, inStock: true, discount: 0 },
    { id: 9, name: "Pet Carrier", price: 950, image: "🧳", rating: 4.6, reviews: 98, inStock: false, discount: 0 },
    { id: 10, name: "GPS Tracker", price: 650, image: "📍", rating: 4.1, reviews: 76, inStock: true, discount: 15 },
    { id: 28, name: "Automatic Feeder", price: 1800, image: "🥣", rating: 4.5, reviews: 267, inStock: true, discount: 8 },
    { id: 29, name: "Pet Camera", price: 2200, image: "📹", rating: 4.3, reviews: 145, inStock: true, discount: 12 }
  ],
  Grooming: [
    { id: 11, name: "Pet Shampoo 500ml", price: 300, image: "🧴", rating: 4.5, reviews: 312, inStock: true, discount: 0 },
    { id: 12, name: "Slicker Brush", price: 200, image: "🪮", rating: 4.2, reviews: 267, inStock: true, discount: 10 },
    { id: 13, name: "Nail Clippers", price: 150, image: "✂️", rating: 4.0, reviews: 198, inStock: true, discount: 0 },
    { id: 14, name: "Complete Grooming Kit", price: 450, image: "🎁", rating: 4.8, reviews: 423, inStock: true, discount: 20 },
    { id: 15, name: "Pet Wipes 100pc", price: 120, image: "🧻", rating: 4.3, reviews: 156, inStock: true, discount: 5 },
    { id: 30, name: "Electric Trimmer", price: 850, image: "🔌", rating: 4.6, reviews: 189, inStock: true, discount: 10 },
    { id: 31, name: "De-shedding Tool", price: 380, image: "🪒", rating: 4.4, reviews: 234, inStock: true, discount: 0 }
  ],
  Toys: [
    { id: 16, name: "Interactive Ball", price: 250, image: "⚽", rating: 4.6, reviews: 289, inStock: true, discount: 10 },
    { id: 17, name: "Chew Toy Set", price: 180, image: "🦴", rating: 4.4, reviews: 167, inStock: true, discount: 0 },
    { id: 18, name: "Cat Tower Deluxe", price: 2500, image: "🏰", rating: 4.7, reviews: 345, inStock: false, discount: 0 },
    { id: 19, name: "Puzzle Feeder", price: 350, image: "🧩", rating: 4.5, reviews: 234, inStock: true, discount: 15 },
    { id: 20, name: "Squeaky Toys Set", price: 120, image: "🧸", rating: 4.1, reviews: 145, inStock: true, discount: 0 },
    { id: 32, name: "Laser Pointer", price: 150, image: "🔦", rating: 4.8, reviews: 456, inStock: true, discount: 5 },
    { id: 33, name: "Rope Tug Toy", price: 180, image: "🪢", rating: 4.3, reviews: 178, inStock: true, discount: 0 }
  ],
  Health: [
    { id: 21, name: "Multivitamins 60ct", price: 450, image: "💊", rating: 4.6, reviews: 278, inStock: true, discount: 10 },
    { id: 22, name: "Flea Treatment", price: 280, image: "🛡️", rating: 4.3, reviews: 412, inStock: true, discount: 0 },
    { id: 23, name: "Dental Care Kit", price: 320, image: "🦷", rating: 4.4, reviews: 189, inStock: true, discount: 15 },
    { id: 24, name: "Eye Drops", price: 180, image: "👁️", rating: 4.2, reviews: 98, inStock: true, discount: 0 },
    { id: 25, name: "Joint Supplements", price: 520, image: "🦴", rating: 4.7, reviews: 234, inStock: true, discount: 20 },
    { id: 34, name: "First Aid Kit", price: 650, image: "🏥", rating: 4.5, reviews: 156, inStock: true, discount: 8 },
    { id: 35, name: "Probiotics", price: 380, image: "🧬", rating: 4.4, reviews: 289, inStock: true, discount: 0 }
  ],
  Services: [
    { id: 101, name: "Full Grooming Service", price: 650, image: "✂️", rating: 4.8, reviews: 523, inStock: true, discount: 0 },
    { id: 102, name: "Vet Consultation", price: 500, image: "🩺", rating: 4.7, reviews: 312, inStock: true, discount: 0 },
    { id: 103, name: "Pet Boarding (Daily)", price: 450, image: "🏨", rating: 4.5, reviews: 245, inStock: true, discount: 10 },
    { id: 104, name: "Vaccination", price: 350, image: "💉", rating: 4.6, reviews: 189, inStock: true, discount: 0 },
    { id: 105, name: "Dog Training Session", price: 800, image: "🎓", rating: 4.9, reviews: 156, inStock: true, discount: 15 }
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
  
  // API-connected products state
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usingDemoData, setUsingDemoData] = useState(false);

  // Fetch products from Inventory API (same source as Inventory Dashboard)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await inventoryApi.getItems();
        const products = response.items || response.data || [];
        
        if (products.length > 0) {
          // Transform API products to store format with categories
          const categorized = categorizeProducts(products);
          setApiProducts(categorized);
          setUsingDemoData(false);
        } else {
          // Fall back to demo data
          setApiProducts(storeData);
          setUsingDemoData(true);
        }
      } catch (err) {
        console.error("Failed to fetch products from API:", err);
        setApiProducts(storeData);
        setUsingDemoData(true);
      } finally {
        setLoading(false);
      }
    };
    
    // Auto-refresh every 30 seconds for live inventory updates
    fetchProducts();
    
    const interval = setInterval(() => {
      fetchProducts();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Categorize API products (same categories as POS)
  const categorizeProducts = (products) => {
    const categories = {
      Food: [],
      Accessories: [],
      Grooming: [],
      Toys: [],
      Health: [],
      Services: []
    };
    
    products.forEach(product => {
      const item = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: getProductEmoji(product.name, product.category),
        rating: 4.5,
        reviews: Math.floor(Math.random() * 200) + 50,
        inStock: product.inStock || product.stock > 0,
        stock: product.stock || 0,
        discount: 0,
        sku: product.sku,
        description: product.description
      };
      
      // Map to category
      const cat = product.category?.toLowerCase() || '';
      if (cat.includes('food') || cat.includes('treat')) categories.Food.push(item);
      else if (cat.includes('accessory') || cat.includes('collar') || cat.includes('bed')) categories.Accessories.push(item);
      else if (cat.includes('groom') || cat.includes('shampoo') || cat.includes('brush')) categories.Grooming.push(item);
      else if (cat.includes('toy') || cat.includes('ball') || cat.includes('chew')) categories.Toys.push(item);
      else if (cat.includes('health') || cat.includes('vitamin') || cat.includes('medical')) categories.Health.push(item);
      else if (cat.includes('service') || cat.includes('grooming service') || cat.includes('consultation') || cat.includes('boarding')) categories.Services.push(item);
      else categories.Food.push(item); // Default
    });
    
    return categories;
  };

  // Get emoji based on product name/category
  const getProductEmoji = (name, category) => {
    const nameLower = name.toLowerCase();
    const catLower = (category || '').toLowerCase();
    
    if (nameLower.includes('dog') || nameLower.includes('puppy')) return '🦴';
    if (nameLower.includes('cat') || nameLower.includes('kitten')) return '🐟';
    if (nameLower.includes('food')) return '🍖';
    if (nameLower.includes('shampoo') || nameLower.includes('groom')) return '🧴';
    if (nameLower.includes('toy') || nameLower.includes('ball')) return '🎾';
    if (nameLower.includes('bed')) return '🛏️';
    if (nameLower.includes('collar') || nameLower.includes('leash')) return '🦮';
    if (nameLower.includes('vitamin') || nameLower.includes('health')) return '💊';
    if (catLower.includes('food')) return '🦴';
    if (catLower.includes('accessory')) return '📦';
    if (catLower.includes('grooming')) return '✂️';
    if (catLower.includes('toy')) return '🧸';
    if (catLower.includes('health')) return '🏥';
    return '📦';
  };

  // Use API products if available, otherwise demo data
  const currentStoreData = apiProducts && Object.keys(apiProducts).length > 0 ? apiProducts : storeData;

  const filteredProducts = category === "Wishlist" ? [] : currentStoreData[category]
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
                    <span>¥{order.total}</span>
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
              </div>
            </div>
          )}

        </aside>
    </div>
  </div>
  );
}; 
