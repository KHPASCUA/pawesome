import React, { useMemo, useState, useEffect } from "react";
import { posApi } from "../../api/pos";
import "./CashierPOS_Polished.css";

const categories = [
  { id: "all", label: "All Items", icon: "🐾" },
  { id: "food", label: "Food", icon: "🍖" },
  { id: "accessories", label: "Accessories", icon: "🦴" },
  { id: "grooming", label: "Grooming", icon: "✂️" },
  { id: "toys", label: "Toys", icon: "🎾" },
  { id: "health", label: "Health", icon: "💊" },
  { id: "service", label: "Services", icon: "🩺" },
];

const formatPrice = (value) => `₱${value.toFixed(2)}`;

const CashierPOS = ({ onCheckout }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("Walk-in");
  const [customer, setCustomer] = useState("");
  const [voucher, setVoucher] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Load products and services on mount
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");
      const [productsData, servicesData] = await Promise.all([
        posApi.getPOSProducts(),
        posApi.getPOSServices(),
      ]);
      setProducts(productsData || []);
      setServices(servicesData || []);
    } catch (err) {
      setError("Failed to load products and services");
      console.error("POS load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const allItems = useMemo(() => {
    const productItems = products.map(p => ({ ...p, itemType: "product" }));
    const serviceItems = services.map(s => ({ ...s, itemType: "service" }));
    return [...productItems, ...serviceItems];
  }, [products, services]);

  const filteredProducts = useMemo(() => {
    let items = allItems;
    if (activeCategory !== "all") {
      items = items.filter((item) => item.category === activeCategory || (activeCategory === "service" && item.itemType === "service"));
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(query));
    }
    return items;
  }, [allItems, activeCategory, searchQuery]);

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

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      setLoading(true);
      setError("");
      
      const items = cart.map(item => ({
        item_type: item.itemType || "product",
        item_id: item.itemType === "product" ? item.id : null,
        service_id: item.itemType === "service" ? item.id : null,
        item_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        discount_amount: item.discount || 0,
      }));
      
      const transactionData = {
        customer_name: customer || null,
        items: items,
        payment_method: paymentMethod,
        cash_received: paymentMethod === "cash" ? parseFloat(cashReceived) : totalAmount,
        discount_code: voucher || null,
        notes: orderType ? `Order Type: ${orderType}` : null,
      };
      
      const result = await posApi.processTransaction(transactionData);
      
      if (result.success) {
        setSuccess("Transaction completed successfully!");
        setReceipt(result.receipt);
        if (onCheckout) onCheckout(result.transaction);
        
        // Auto-clear after showing success
        setTimeout(() => {
          clearOrder();
          setSuccess(null);
          setReceipt(null);
        }, 5000);
      } else {
        setError(result.message || "Transaction failed");
      }
    } catch (err) {
      setError(err.message || "Failed to process transaction");
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
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
            <input 
              type="search" 
              placeholder="Search products & services..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {loading && <div className="loading-indicator">Loading...</div>}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>

        <div className="pos-product-grid">
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>No products found in this category</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <article 
                className={`product-card ${product.itemType === "service" ? "service-item" : ""}`} 
                key={`${product.itemType}-${product.id}`}
              >
                <div className="product-thumb">
                  {product.itemType === "service" && <span className="service-badge">SVC</span>}
                </div>
                <div className="product-card-body">
                  <strong>{product.name || "Unnamed Product"}</strong>
                  <span className="product-price">{formatPrice(product.price || 0)}</span>
                  {product.itemType === "product" && (
                    <small className="stock-info">
                      {product.stock !== undefined ? `Stock: ${product.stock}` : "In Stock"}
                    </small>
                  )}
                </div>
                <button 
                  type="button" 
                  className="product-add" 
                  onClick={() => addToCart(product)}
                  disabled={product.itemType === "product" && product.stock !== undefined && product.stock <= 0}
                >
                  {product.itemType === "product" && product.stock !== undefined && product.stock <= 0 
                    ? "Out of Stock" 
                    : "Add to Cart"}
                </button>
              </article>
            ))
          )}
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

          <div className="payment-method">
            <label>Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="cash">💵 Cash</option>
              <option value="credit_card">💳 Credit Card</option>
              <option value="debit_card">💳 Debit Card</option>
              <option value="gcash">📱 GCash</option>
              <option value="maya">📱 Maya</option>
            </select>
          </div>

          <button 
            type="button" 
            className="checkout-button" 
            onClick={handleCheckout} 
            disabled={cart.length === 0 || loading || (paymentMethod === "cash" && (!cashReceived || parseFloat(cashReceived) < totalAmount))}
          >
            {loading ? "Processing..." : "Process Transaction"}
          </button>

          {receipt && (
            <div className="receipt-preview">
              <h4>🧾 Receipt Preview</h4>
              <p><strong>Transaction #:</strong> {receipt.transaction_number}</p>
              <p><strong>Total:</strong> ₱{receipt.total.toFixed(2)}</p>
              <p><strong>Change:</strong> ₱{receipt.payment.change.toFixed(2)}</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default CashierPOS;