import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./CashierPOS.css";
import { apiRequest } from "../../api/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaw,
  faSearch,
  faRotateRight,
  faTrash,
  faBoxOpen,
  faShoppingCart,
  faCreditCard,
  faMoneyBillWave,
  faMobileScreen,
  faGlobe,
  faTag,
  faReceipt,
  faTriangleExclamation,
  faPlus,
  faMinus,
  faXmark,
  faPrint,
  faClock,
  faBox,
  faCheckCircle,
  faPause,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";

const PRODUCT_ENDPOINT = "/cashier/pos/products";
const CHECKOUT_ENDPOINT = "/cashier/pos/transaction";
const VOUCHER_ENDPOINT = "/cashier/validate-voucher";

const formatCurrency = (amount) => {
  const value = Number(amount) || 0;

  return value.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
};

const normalizeCategory = (value) => {
  return String(value || "others").trim().toLowerCase();
};

const normalizeProduct = (product, index) => {
  return {
    id:
      product.id ||
      product.product_id ||
      product.item_id ||
      product.inventory_id ||
      index + 1,

    name:
      product.name ||
      product.product_name ||
      product.item_name ||
      product.title ||
      "Unnamed Product",

    price:
      Number(
        product.price ||
          product.selling_price ||
          product.unit_price ||
          product.amount ||
          0
      ) || 0,

    stock:
      Number(
        product.stock ||
          product.quantity ||
          product.available_stock ||
          product.current_stock ||
          0
      ) || 0,

    category: normalizeCategory(
      product.category || product.product_category || product.type || "others"
    ),

    image:
      product.image ||
      product.image_url ||
      product.photo ||
      product.thumbnail ||
      "",

    barcode: product.barcode || product.sku || product.item_code || "",

    discount: Number(product.discount || product.discount_percent || 0) || 0,

    raw: product,
  };
};

const getDiscountedPrice = (product) => {
  const price = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;

  if (discount <= 0) return price;

  return price * (1 - discount / 100);
};

const getStockStatus = (stock) => {
  const qty = Number(stock) || 0;

  if (qty <= 0) {
    return {
      label: "Out of Stock",
      className: "out",
    };
  }

  if (qty <= 5) {
    return {
      label: `Low Stock: ${qty}`,
      className: "low",
    };
  }

  return {
    label: `${qty} in stock`,
    className: "available",
  };
};

const getPaymentIcon = (method = "") => {
  const lowerMethod = String(method).toLowerCase();

  if (lowerMethod.includes("card")) return faCreditCard;
  if (lowerMethod.includes("gcash")) return faMobileScreen;
  if (lowerMethod.includes("maya")) return faMobileScreen;
  if (lowerMethod.includes("online")) return faGlobe;

  return faMoneyBillWave;
};

const getCategoryIcon = (category = "") => {
  const value = String(category).toLowerCase();

  if (value.includes("food")) return faPaw;
  if (value.includes("accessories")) return faShoppingCart;
  if (value.includes("grooming")) return faBox;
  if (value.includes("toys")) return faBoxOpen;
  if (value.includes("health")) return faTag;

  return faBoxOpen;
};

const CashierPOS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const [orderType, setOrderType] = useState("walk-in");
  const [customerName, setCustomerName] = useState("");
  const [voucher, setVoucher] = useState("");
  const [validatedVoucher, setValidatedVoucher] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [showPaymentBox, setShowPaymentBox] = useState(false);

  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [completedReceipt, setCompletedReceipt] = useState(null);
  const [recentCompletedSale, setRecentCompletedSale] = useState(null);
  const [heldOrders, setHeldOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cashierHeldOrders")) || [];
    } catch {
      return [];
    }
  });
  const [showHeldOrders, setShowHeldOrders] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      /*
        LIVE PRODUCT ENDPOINT

        Current endpoint:
        /products

        If your backend uses another route, change PRODUCT_ENDPOINT above.
        Common alternatives:
        /cashier/products
        /inventory
        /cashier/inventory
      */

      const response = await apiRequest(PRODUCT_ENDPOINT);

      const rawProducts = Array.isArray(response)
        ? response
        : response?.products ||
          response?.items ||
          response?.inventory ||
          response?.data ||
          [];

      const normalized = rawProducts.map((item, index) =>
        normalizeProduct(item, index)
      );

      setProducts(normalized);
    } catch (err) {
      setError(err.message || "Failed to load products");
      console.error("Cashier POS product fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    localStorage.setItem("cashierHeldOrders", JSON.stringify(heldOrders));
  }, [heldOrders]);

  const categories = useMemo(() => {
    const grouped = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    const categoryList = Object.entries(grouped).map(([id, count]) => ({
      id,
      label: id.replace(/\b\w/g, (char) => char.toUpperCase()),
      count,
    }));

    return [
      {
        id: "all",
        label: "All Products",
        count: products.length,
      },
      ...categoryList,
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "all" || product.category === activeCategory;

      const matchesSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword) ||
        String(product.barcode || "").toLowerCase().includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const lowStockCount = useMemo(() => {
    return products.filter((product) => product.stock > 0 && product.stock <= 5)
      .length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter((product) => product.stock <= 0).length;
  }, [products]);

  const addToCart = (product) => {
    if (product.stock <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);

      if (existing) {
        if (existing.quantity >= product.stock) return prevCart;

        return prevCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...prevCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    const nextQuantity = Number(quantity) || 0;

    if (nextQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id !== productId) return item;

        return {
          ...item,
          quantity: Math.min(nextQuantity, item.stock || nextQuantity),
        };
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearOrder = () => {
    setCart([]);
    setCustomerName("");
    setVoucher("");
    setValidatedVoucher(null);
    setVoucherMessage("");
    setPaymentMethod("Cash");
    setAmountReceived("");
    setShowPaymentBox(false);
    setCheckoutMessage("");
    setOrderType("walk-in");
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      return sum + getDiscountedPrice(item) * item.quantity;
    }, 0);
  }, [cart]);

  const tax = useMemo(() => subtotal * 0.12, [subtotal]);

  const discountAmount = useMemo(() => {
    if (!validatedVoucher) return 0;

    const discountType = String(validatedVoucher.type || "").toLowerCase();
    const discountValue = Number(validatedVoucher.value) || 0;

    if (discountType === "percentage") {
      return subtotal * (discountValue / 100);
    }

    if (discountType === "fixed") {
      return Math.min(discountValue, subtotal);
    }

    return 0;
  }, [validatedVoucher, subtotal]);

  const total = useMemo(() => {
    return Math.max(subtotal + tax - discountAmount, 0);
  }, [subtotal, tax, discountAmount]);

  const changeAmount = useMemo(() => {
    const received = Number(amountReceived) || 0;
    return Math.max(received - total, 0);
  }, [amountReceived, total]);

  const canCheckout =
    cart.length > 0 &&
    !checkoutLoading &&
    (paymentMethod !== "Cash" || Number(amountReceived) >= total);

  const handleCheckout = async () => {
    if (!canCheckout) return;

    try {
      setCheckoutLoading(true);
      setCheckoutMessage("");

      const payload = {
        order_type: orderType,
        customer_name: customerName || "Walk-in Customer",
        payment_method: paymentMethod,
        amount_received: Number(amountReceived) || total,
        subtotal,
        tax,
        discount: discountAmount,
        total,
        voucher: validatedVoucher?.code || null,
        voucher_discount_type: validatedVoucher?.type || null,
        voucher_discount_value: validatedVoucher?.value || 0,
        items: cart.map((item) => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: Number(item.price) || 0,
          discount: Number(item.discount) || 0,
          final_price: getDiscountedPrice(item),
          line_total: getDiscountedPrice(item) * item.quantity,
        })),
      };

      /*
        LIVE CHECKOUT ENDPOINT

        Current endpoint:
        /cashier/pos/transaction

        If your backend uses another route, change CHECKOUT_ENDPOINT above.
        Common alternatives:
        /cashier/sales
        /sales
        /orders
      */

      const response = await apiRequest(CHECKOUT_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const transactionId =
        response?.transaction_id ||
        response?.id ||
        response?.sale_id ||
        `TRX-${Date.now()}`;

      const receiptData = {
        transaction_id: String(transactionId).startsWith("TRX-")
          ? String(transactionId)
          : `TRX-${String(transactionId).padStart(3, "0")}`,
        customer_name: payload.customer_name,
        payment_method: payload.payment_method,
        amount_received: payload.amount_received,
        subtotal: payload.subtotal,
        tax: payload.tax,
        discount: payload.discount,
        total: payload.total,
        change: Math.max(payload.amount_received - payload.total, 0),
        items: payload.items,
        date: new Date().toLocaleString("en-PH", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setCompletedReceipt(receiptData);
      setRecentCompletedSale(receiptData);
      setCheckoutMessage("Payment successful. Transaction has been saved.");
      clearOrder();
      fetchProducts();
    } catch (err) {
      setCheckoutMessage(err.message || "Checkout failed. Please try again.");
      console.error("Cashier POS checkout error:", err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!completedReceipt) return;

    const receiptWindow = window.open("", "_blank", "width=420,height=700");

    if (!receiptWindow) {
      alert("Please allow pop-ups to print the receipt.");
      return;
    }

    const itemsHtml = completedReceipt.items
      .map(
        (item) => `
        <tr>
          <td>
            <strong>${item.name}</strong><br />
            <small>${item.quantity} x ${formatCurrency(item.final_price)}</small>
          </td>
          <td style="text-align:right;">
            ${formatCurrency(item.line_total)}
          </td>
        </tr>
      `
      )
      .join("");

    receiptWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt ${completedReceipt.transaction_id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 18px;
            color: #111827;
          }

          .receipt {
            max-width: 360px;
            margin: auto;
          }

          .center {
            text-align: center;
          }

          h2 {
            margin: 0;
            font-size: 20px;
          }

          p {
            margin: 4px 0;
            font-size: 12px;
          }

          .line {
            border-top: 1px dashed #999;
            margin: 12px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          td {
            padding: 6px 0;
            vertical-align: top;
            font-size: 13px;
          }

          .summary td {
            padding: 4px 0;
          }

          .total td {
            font-size: 16px;
            font-weight: bold;
            border-top: 1px dashed #999;
            padding-top: 10px;
          }

          .footer {
            margin-top: 16px;
            text-align: center;
            font-size: 12px;
          }

          @media print {
            button {
              display: none;
            }

            body {
              padding: 0;
            }
          }
        </style>
      </head>

      <body>
        <div class="receipt">
          <div class="center">
            <h2>Pawesome Pet Store</h2>
            <p>Official Cashier Receipt</p>
            <p>${completedReceipt.date}</p>
          </div>

          <div class="line"></div>

          <p><strong>Transaction:</strong> ${completedReceipt.transaction_id}</p>
          <p><strong>Customer:</strong> ${completedReceipt.customer_name}</p>
          <p><strong>Payment:</strong> ${completedReceipt.payment_method}</p>

          <div class="line"></div>

          <table>
            ${itemsHtml}
          </table>

          <div class="line"></div>

          <table class="summary">
            <tr>
              <td>Subtotal</td>
              <td style="text-align:right;">${formatCurrency(completedReceipt.subtotal)}</td>
            </tr>
            <tr>
              <td>VAT / Tax</td>
              <td style="text-align:right;">${formatCurrency(completedReceipt.tax)}</td>
            </tr>
            <tr>
              <td>Discount</td>
              <td style="text-align:right;">-${formatCurrency(completedReceipt.discount)}</td>
            </tr>
            <tr class="total">
              <td>Total</td>
              <td style="text-align:right;">${formatCurrency(completedReceipt.total)}</td>
            </tr>
            <tr>
              <td>Amount Received</td>
              <td style="text-align:right;">${formatCurrency(completedReceipt.amount_received)}</td>
            </tr>
            <tr>
              <td>Change</td>
              <td style="text-align:right;">${formatCurrency(completedReceipt.change)}</td>
            </tr>
          </table>

          <div class="line"></div>

          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>Please keep this receipt for reference.</p>
          </div>

          <br />

          <button onclick="window.print()">Print Receipt</button>
        </div>
      </body>
    </html>
  `);

  receiptWindow.document.close();
  receiptWindow.focus();
  };

  const handleSearchSubmit = useCallback(() => {
    const keyword = searchQuery.trim().toLowerCase();

    if (!keyword) return;

    const barcodeMatch = products.find((product) => {
      return String(product.barcode || "").toLowerCase() === keyword;
    });

    if (barcodeMatch) {
      addToCart(barcodeMatch);
      setSearchQuery("");
      setCheckoutMessage(`${barcodeMatch.name} added to cart.`);
      return;
    }

    if (filteredProducts.length === 1) {
      addToCart(filteredProducts[0]);
      setSearchQuery("");
      setCheckoutMessage(`${filteredProducts[0].name} added to cart.`);
    }
  }, [searchQuery, products, filteredProducts]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";

      if (event.key === "F2") {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (event.key === "F4") {
        event.preventDefault();

        if (cart.length > 0) {
          setShowPaymentBox(true);
        }

        return;
      }

      if (event.key === "Escape") {
        if (searchQuery) {
          setSearchQuery("");
          return;
        }

        if (showPaymentBox) {
          setShowPaymentBox(false);
          return;
        }
      }

      if (event.key === "Enter" && isTyping && target === searchInputRef.current) {
        event.preventDefault();
        handleSearchSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cart.length, filteredProducts, products, searchQuery, showPaymentBox, handleSearchSubmit]);

  const handleValidateVoucher = async () => {
    const code = voucher.trim();

    if (!code) {
      setValidatedVoucher(null);
      setVoucherMessage("Please enter a voucher code.");
      return;
    }

    try {
      setVoucherLoading(true);
      setVoucherMessage("");

      /*
        LIVE VOUCHER ENDPOINT

        Expected backend response example:
        {
          valid: true,
          code: "PAWESOME10",
          type: "percentage",
          value: 10,
          message: "Voucher applied successfully."
        }

        Or:
        {
          valid: false,
          message: "Invalid or expired voucher."
        }
      */

      const response = await apiRequest(VOUCHER_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({
          code,
          subtotal,
          items: cart.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (!response?.valid) {
        setValidatedVoucher(null);
        setVoucherMessage(response?.message || "Invalid or expired voucher.");
        return;
      }

      setValidatedVoucher({
        code: response.code || code,
        type: response.type || "percentage",
        value: Number(response.value) || 0,
      });

      setVoucherMessage(response.message || "Voucher applied successfully.");
    } catch (err) {
      setValidatedVoucher(null);
      setVoucherMessage(err.message || "Unable to validate voucher.");
      console.error("Voucher validation error:", err);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleHoldOrder = () => {
    if (cart.length === 0) return;

    const heldOrder = {
      id: `HOLD-${Date.now()}`,
      customerName: customerName || "Walk-in Customer",
      orderType,
      voucher,
      cart,
      subtotal,
      tax,
      discount: discountAmount,
      total,
      createdAt: new Date().toISOString(),
    };

    setHeldOrders((prev) => [heldOrder, ...prev]);
    setCheckoutMessage("Order has been held successfully.");
    clearOrder();
  };

  const handleRestoreHeldOrder = (heldOrder) => {
    setCart(heldOrder.cart || []);
    setCustomerName(heldOrder.customerName === "Walk-in Customer" ? "" : heldOrder.customerName);
    setOrderType(heldOrder.orderType || "walk-in");
    setVoucher(heldOrder.voucher || "");
    setShowHeldOrders(false);
    setHeldOrders((prev) => prev.filter((order) => order.id !== heldOrder.id));
    setCheckoutMessage("Held order restored.");
  };

  const handleDeleteHeldOrder = (heldOrderId) => {
    setHeldOrders((prev) => prev.filter((order) => order.id !== heldOrderId));
  };

  return (
    <div className="pos-page">
      <section className="pos-hero">
        <div>
          <span className="pos-kicker">Cashier POS</span>
          <h1>Point of Sale</h1>
          <p>
            Search products, add items to cart, and process live cashier
            transactions.
          </p>

          <div className="pos-alert-row">
            <span className="pos-alert-chip low">
              Low Stock: {lowStockCount}
            </span>

            <span className="pos-alert-chip out">
              Out of Stock: {outOfStockCount}
            </span>
          </div>
        </div>

        <div className="pos-hero-actions">
          <button type="button" onClick={fetchProducts} className="pos-soft-btn">
            <FontAwesomeIcon icon={faRotateRight} />
            Refresh Products
          </button>

          <button
            type="button"
            onClick={() => setShowHeldOrders(true)}
            className="pos-soft-btn"
          >
            <FontAwesomeIcon icon={faFolderOpen} />
            Held Orders ({heldOrders.length})
          </button>

          <button
            type="button"
            onClick={handleHoldOrder}
            className="pos-hold-btn"
            disabled={cart.length === 0}
          >
            <FontAwesomeIcon icon={faPause} />
            Hold Order
          </button>

          <button
            type="button"
            onClick={clearOrder}
            className="pos-danger-btn"
            disabled={cart.length === 0}
          >
            <FontAwesomeIcon icon={faTrash} />
            Clear Order
          </button>
        </div>
      </section>

      <section className="pos-layout">
        <aside className="pos-categories">
          <div className="pos-panel-heading">
            <span>Browse</span>
            <h2>Categories</h2>
          </div>

          <div className="pos-search-box">
            <span>
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search product or scan barcode... Press Enter to add"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSearchSubmit();
                }
              }}
            />
          </div>

          <div className="pos-shortcuts">
            <span>F2 Search</span>
            <span>Enter Add</span>
            <span>F4 Payment</span>
            <span>Esc Cancel</span>
          </div>

          <div className="pos-category-list">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`pos-category-item ${
                  activeCategory === category.id ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="category-icon">
                  <FontAwesomeIcon icon={getCategoryIcon(category.id)} />
                </span>
                <span>{category.label}</span>
                <strong>{category.count}</strong>
              </button>
            ))}
          </div>
        </aside>

        <main className="pos-products-panel">
          <div className="pos-header-row">
            <div>
              <span className="pos-section-label">Product Catalog</span>
              <h2>
                {activeCategory === "all"
                  ? "All Products"
                  : categories.find((item) => item.id === activeCategory)
                      ?.label || "Products"}
              </h2>
            </div>

            <span className="product-count-pill">
              {filteredProducts.length} item(s)
            </span>
          </div>

          {loading ? (
            <div className="pos-state-card">
              <div className="pos-spinner" />
              <h3>Loading products...</h3>
              <p>Please wait while products are being fetched.</p>
            </div>
          ) : error ? (
            <div className="pos-state-card">
              <div className="state-icon">
                <FontAwesomeIcon icon={faTriangleExclamation} />
              </div>
              <h3>Unable to load products</h3>
              <p>{error}</p>
              <button type="button" onClick={fetchProducts}>
                Retry
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="pos-state-card">
              <div className="state-icon">
                <FontAwesomeIcon icon={faBoxOpen} />
              </div>
              <h3>No products found</h3>
              <p>Try another category or search keyword.</p>
            </div>
          ) : (
            <div className="pos-product-grid">
              {filteredProducts.map((product) => {
                const cartItem = cart.find((item) => item.id === product.id);
                const cartQty = cartItem?.quantity || 0;
                const discountedPrice = getDiscountedPrice(product);
                const hasDiscount = Number(product.discount) > 0;

                return (
                  <article key={product.id} className="product-card">
                    <div className="product-thumb">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <span>
                          <FontAwesomeIcon icon={faBoxOpen} />
                        </span>
                      )}

                      {hasDiscount && (
                        <strong className="discount-chip">
                          -{product.discount}%
                        </strong>
                      )}
                    </div>

                    <div className="product-card-body">
                      <div>
                        <h3>{product.name}</h3>
                        <p>{product.category}</p>
                      </div>

                      <div className="product-price">
                        {hasDiscount && (
                          <small>{formatCurrency(product.price)}</small>
                        )}
                        <strong>{formatCurrency(discountedPrice)}</strong>
                      </div>
                    </div>

                    <div className="stock-row">
                      {(() => {
                        const stockStatus = getStockStatus(product.stock);

                        return (
                          <span className={`stock-badge ${stockStatus.className}`}>
                            {stockStatus.label}
                          </span>
                        );
                      })()}

                      {cartQty > 0 && (
                        <span className="cart-qty-badge">Cart: {cartQty}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="product-add"
                      disabled={product.stock <= 0}
                      onClick={() => addToCart(product)}
                    >
                      {product.stock <= 0 ? "Unavailable" : "Add to Cart"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        <aside className="pos-order-panel">
          <div className="order-details-card">
            <div className="order-details-header">
              <span className="pos-section-label">Current Order</span>
              <h3>Order Details</h3>
            </div>

            <div className="order-type-switch">
              <button
                type="button"
                className={orderType === "walk-in" ? "selected" : ""}
                onClick={() => setOrderType("walk-in")}
              >
                Walk-in
              </button>

              <button
                type="button"
                className={orderType === "pickup" ? "selected" : ""}
                onClick={() => setOrderType("pickup")}
              >
                Pickup
              </button>
            </div>

            <label className="customer-field">
              <span>Customer Name</span>
              <input
                type="text"
                placeholder="Walk-in Customer"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
              />
            </label>

            <div className="order-cart-list">
              {cart.length === 0 ? (
                <div className="empty-order">
                  <div className="empty-icon">
                    <FontAwesomeIcon icon={faShoppingCart} />
                  </div>
                  <h4>No items added</h4>
                  <p>Select products to start a new order.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="order-item-info">
                      <h4>{item.name}</h4>
                      <p>{formatCurrency(getDiscountedPrice(item))}</p>
                    </div>

                    <div className="qty-control">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>

                      <input
                        type="number"
                        min="1"
                        max={item.stock || item.quantity}
                        value={item.quantity}
                        onChange={(event) =>
                          updateQuantity(item.id, event.target.value)
                        }
                      />

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="voucher-field">
              <span>Voucher Code</span>

              <div className="voucher-input-row">
                <input
                  type="text"
                  placeholder="Enter voucher code"
                  value={voucher}
                  onChange={(event) => {
                    setVoucher(event.target.value);
                    setValidatedVoucher(null);
                    setVoucherMessage("");
                  }}
                />

                <button
                  type="button"
                  onClick={handleValidateVoucher}
                  disabled={voucherLoading || cart.length === 0}
                >
                  {voucherLoading ? "Checking..." : "Validate"}
                </button>
              </div>

              {voucherMessage && (
                <small
                  className={`voucher-message ${
                    validatedVoucher ? "success" : "error"
                  }`}
                >
                  {voucherMessage}
                </small>
              )}

              {validatedVoucher && (
                <small className="voucher-applied">
                  Applied: {validatedVoucher.code} (
                  {validatedVoucher.type === "percentage"
                    ? `${validatedVoucher.value}% off`
                    : `${formatCurrency(validatedVoucher.value)} off`}
                  )
                </small>
              )}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>

              <div className="summary-row">
                <span>VAT / Tax 12%</span>
                <strong>{formatCurrency(tax)}</strong>
              </div>

              <div className="summary-row">
                <span>Discount</span>
                <strong>-{formatCurrency(discountAmount)}</strong>
              </div>

              <div className="summary-row total-row">
                <span>Total</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>

            {showPaymentBox && (
              <div className="payment-box">
                <label>
                  <span>Payment Method</span>
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="GCash">GCash</option>
                    <option value="Maya">Maya</option>
                    <option value="Online">Online</option>
                  </select>
                </label>

                <label>
                  <span>Amount Received</span>
                  <input
                    type="number"
                    min="0"
                    placeholder={String(total.toFixed(2))}
                    value={amountReceived}
                    onChange={(event) => setAmountReceived(event.target.value)}
                  />
                </label>

                <div className="change-row">
                  <span>Change</span>
                  <strong>{formatCurrency(changeAmount)}</strong>
                </div>
              </div>
            )}

            {checkoutMessage && (
              <div
                className={`checkout-message ${
                  checkoutMessage.toLowerCase().includes("successful")
                    ? "success"
                    : "error"
                }`}
              >
                {checkoutMessage}
              </div>
            )}

            {recentCompletedSale && (
              <div className="recent-sale-card">
                <div className="recent-sale-header">
                  <div>
                    <span className="pos-section-label">Latest Sale</span>
                    <h4>{recentCompletedSale.transaction_id}</h4>
                  </div>

                  <strong>{formatCurrency(recentCompletedSale.total)}</strong>
                </div>

                <div className="recent-sale-meta">
                  <span>{recentCompletedSale.customer_name}</span>
                  <span>{recentCompletedSale.payment_method}</span>
                  <span>{recentCompletedSale.date}</span>
                </div>

                <div className="recent-sale-actions">
                  <button
                    type="button"
                    onClick={() => setCompletedReceipt(recentCompletedSale)}
                  >
                    View Receipt
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecentCompletedSale(null)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {!showPaymentBox ? (
              <button
                type="button"
                className="checkout-button"
                disabled={cart.length === 0}
                onClick={() => setShowPaymentBox(true)}
              >
                Proceed to Payment
              </button>
            ) : (
              <button
                type="button"
                className="checkout-button"
                disabled={!canCheckout}
                onClick={handleCheckout}
              >
                {checkoutLoading ? "Processing..." : "Complete Payment"}
              </button>
            )}
          </div>
        </aside>
      </section>

      {completedReceipt && (
        <div className="receipt-modal-overlay">
          <div className="receipt-modal">
            <div className="receipt-modal-header">
              <div>
                <span className="pos-section-label">Payment Complete</span>
                <h2>Receipt Preview</h2>
                <p>{completedReceipt.transaction_id}</p>
              </div>

              <button
                type="button"
                className="receipt-close-btn"
                onClick={() => setCompletedReceipt(null)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="receipt-paper">
              <div className="receipt-store">
                <h3>Pawesome Pet Store</h3>
                <p>Official Cashier Receipt</p>
                <small>{completedReceipt.date}</small>
              </div>

              <div className="receipt-divider" />

              <div className="receipt-info">
                <p>
                  <span>Transaction</span>
                  <strong>{completedReceipt.transaction_id}</strong>
                </p>
                <p>
                  <span>Customer</span>
                  <strong>{completedReceipt.customer_name}</strong>
                </p>
                <p>
                  <span>Payment</span>
                  <strong>{completedReceipt.payment_method}</strong>
                </p>
              </div>

              <div className="receipt-divider" />

              <div className="receipt-items">
                {completedReceipt.items.map((item) => (
                  <div key={item.product_id} className="receipt-item-row">
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {item.quantity} × {formatCurrency(item.final_price)}
                      </span>
                    </div>

                    <strong>{formatCurrency(item.line_total)}</strong>
                  </div>
                ))}
              </div>

              <div className="receipt-divider" />

              <div className="receipt-summary">
                <p>
                  <span>Subtotal</span>
                  <strong>{formatCurrency(completedReceipt.subtotal)}</strong>
                </p>

                <p>
                  <span>VAT / Tax</span>
                  <strong>{formatCurrency(completedReceipt.tax)}</strong>
                </p>

                <p>
                  <span>Discount</span>
                  <strong>-{formatCurrency(completedReceipt.discount)}</strong>
                </p>

                <p className="receipt-total">
                  <span>Total</span>
                  <strong>{formatCurrency(completedReceipt.total)}</strong>
                </p>

                <p>
                  <span>Amount Received</span>
                  <strong>{formatCurrency(completedReceipt.amount_received)}</strong>
                </p>

                <p>
                  <span>Change</span>
                  <strong>{formatCurrency(completedReceipt.change)}</strong>
                </p>
              </div>
            </div>

            <div className="receipt-actions">
              <button
                type="button"
                className="receipt-secondary-btn"
                onClick={() => setCompletedReceipt(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="receipt-print-btn"
                onClick={handlePrintReceipt}
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {showHeldOrders && (
        <div className="held-orders-overlay">
          <div className="held-orders-modal">
            <div className="held-orders-header">
              <div>
                <span className="pos-section-label">Parked Carts</span>
                <h2>Held Orders</h2>
                <p>Restore or remove temporarily saved cashier orders.</p>
              </div>

              <button
                type="button"
                className="held-close-btn"
                onClick={() => setShowHeldOrders(false)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {heldOrders.length === 0 ? (
              <div className="held-empty">
                <div>
                  <FontAwesomeIcon icon={faShoppingCart} />
                </div>
                <h3>No held orders</h3>
                <p>Held orders will appear here after you park a cart.</p>
              </div>
            ) : (
              <div className="held-orders-list">
                {heldOrders.map((order) => (
                  <div key={order.id} className="held-order-card">
                    <div className="held-order-top">
                      <div>
                        <strong>{order.customerName}</strong>
                        <span>{order.id}</span>
                      </div>

                      <b>{formatCurrency(order.total)}</b>
                    </div>

                    <div className="held-order-meta">
                      <span>{order.cart?.length || 0} item type(s)</span>
                      <span>{order.orderType}</span>
                      <span>
                        {new Date(order.createdAt).toLocaleTimeString("en-PH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="held-order-items">
                      {(order.cart || []).slice(0, 3).map((item) => (
                        <span key={item.id}>
                          {item.quantity}× {item.name}
                        </span>
                      ))}

                      {(order.cart || []).length > 3 && (
                        <span>+{order.cart.length - 3} more</span>
                      )}
                    </div>

                    <div className="held-order-actions">
                      <button
                        type="button"
                        className="held-restore-btn"
                        onClick={() => handleRestoreHeldOrder(order)}
                      >
                        Restore
                      </button>

                      <button
                        type="button"
                        className="held-delete-btn"
                        onClick={() => handleDeleteHeldOrder(order.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierPOS;