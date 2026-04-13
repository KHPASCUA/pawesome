import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from './components/ProductCard';
import CartItem from './components/CartItem';
import OrderSummary from './components/OrderSummary';
import CustomerInfo from './components/CustomerInfo';
import PaymentModal from './components/PaymentModal';
import CategoryFilter from './components/CategoryFilter';
import './CashierPOS.css';

const CashierPOSRedesigned = () => {
  const [activeCategory, setActiveCategory] = useState('Food');
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState('walk-in');
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [voucher, setVoucher] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);

  // Use exact same store data structure as CustomerStore
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

  // Convert to flat array for easier processing
  const products = Object.entries(storeData).flatMap(([category, items]) => 
    items.map(item => ({ ...item, category: category.toLowerCase() }))
  );

  const categories = useMemo(() => {
    const cats = [
      { id: "all", label: "All Products", icon: "🐾" },
      { id: "food", label: "Food", icon: "🍖" },
      { id: "accessories", label: "Accessories", icon: "🦴" },
      { id: "grooming", label: "Grooming", icon: "✂️" },
      { id: "toys", label: "Toys", icon: "🎾" },
      { id: "health", label: "Health", icon: "💊" },
    ];

    return cats.map(cat => ({
      ...cat,
      count: cat.id === 'all' ? products.length : products.filter(p => p.category === cat.id).length
    }));
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => product.category === activeCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [activeCategory, searchQuery]);

  // Calculate order totals
  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const tax = subtotal * 0.12;
  const discountAmount = voucher.toLowerCase() === 'pawesome10' ? subtotal * 0.10 : 
                      voucher.toLowerCase() === 'save20' ? subtotal * 0.20 : 0;
  const total = Math.max(subtotal + tax - discountAmount, 0);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const clearOrder = () => {
    setCart([]);
    setCustomerName('');
    setTableNumber('');
    setVoucher('');
    setOrderType('walk-in');
    setSearchQuery('');
    setActiveCategory('Food');
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (paymentData) => {
    const order = {
      id: Date.now(),
      items: cart,
      subtotal,
      tax,
      discount: discountAmount,
      total,
      orderType,
      customerName: customerName || 'Walk-in Customer',
      tableNumber,
      payment: paymentData,
      timestamp: new Date().toISOString(),
    };

    setRecentOrders(prev => [order, ...prev.slice(0, 9)]);
    clearOrder();
    setShowPaymentModal(false);
    
    // Show success message
    alert(`Payment successful! Order #${order.id} completed.`);
  };

  const getCartItemQuantity = (productId) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="pos-redesigned">
      {/* Header */}
      <header className="pos-header">
        <div className="header-left">
          <h1 className="pos-title">🐾 Pawesome Pet Store POS</h1>
          <div className="current-datetime">
            {new Date().toLocaleString()}
          </div>
        </div>
        <div className="header-right">
          <button className="header-btn">
            📊 Reports
          </button>
          <button className="header-btn">
            ⚙️ Settings
          </button>
        </div>
      </header>

      <div className="pos-main-content">
        {/* Left Sidebar - Categories and Filters */}
        <aside className="pos-sidebar">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </aside>

        {/* Center - Products Grid */}
        <main className="pos-products-area">
          <div className="products-header">
            <h2>
              {activeCategory === 'all' ? 'All Products' : 
               categories.find(c => c.id === activeCategory)?.label || 'Products'}
            </h2>
            <span className="product-count">
              {filteredProducts.length} items
            </span>
          </div>
          
          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={addToCart}
                onQuickAdd={updateQuantity}
                quantity={getCartItemQuantity(product.id)}
              />
            ))}
          </div>
        </main>

        {/* Right Sidebar - Order Details */}
        <aside className="pos-order-sidebar">
          <CustomerInfo
            orderType={orderType}
            onOrderTypeChange={setOrderType}
            customerName={customerName}
            onCustomerChange={setCustomerName}
            tableNumber={tableNumber}
            onTableChange={setTableNumber}
          />

          <OrderSummary
            cart={cart}
            subtotal={subtotal}
            tax={tax}
            discount={discountAmount}
            total={total}
            voucher={voucher}
            onVoucherChange={setVoucher}
            onClearOrder={clearOrder}
            onCheckout={handleCheckout}
          />
        </aside>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={total}
        onPaymentComplete={handlePaymentComplete}
        orderDetails={{ subtotal, tax, discount: discountAmount, total }}
      />
    </div>
  );
};

export default CashierPOSRedesigned;
