/**
 * Cashier Dashboard API Endpoints Documentation
 * 
 * This file documents all API endpoints used by the Cashier Dashboard
 * and their expected request/response formats for backend implementation.
 */

export const CASHIER_ENDPOINTS = {
  // Dashboard Data
  GET_DASHBOARD: {
    method: 'GET',
    path: '/cashier/dashboard',
    description: 'Fetch cashier dashboard summary data',
    expectedResponse: {
      today_sales: 0,
      today_transactions: 0,
      pending_payments: 0,
      sales_by_type: [
        { type: 'cash', total: 0, count: 0 },
        { type: 'card', total: 0, count: 0 },
        { type: 'gcash', total: 0, count: 0 }
      ],
      low_stock_items: [],
      top_selling_products: [],
      pending_orders: []
    }
  },

  // Product Search
  SEARCH_PRODUCTS: {
    method: 'GET',
    path: '/products/search',
    description: 'Search products by name or SKU',
    queryParams: ['q'],
    expectedResponse: [
      { id: 1, name: 'Product Name', sku: 'SKU001', price: 100, stock: 10 }
    ]
  },

  // Barcode Scan
  SCAN_BARCODE: {
    method: 'GET',
    path: '/products/barcode/:barcode',
    description: 'Look up product by barcode',
    expectedResponse: {
      product: { id: 1, name: 'Product Name', sku: 'SKU001', price: 100, stock: 10 }
    }
  },

  // Customer Search
  SEARCH_CUSTOMERS: {
    method: 'GET',
    path: '/customers/search',
    description: 'Search customers by name or phone',
    queryParams: ['q'],
    expectedResponse: [
      { id: 1, name: 'Customer Name', phone: '09123456789', email: 'customer@email.com', pets_count: 2, loyalty_points: 100 }
    ]
  },

  // Customer Purchase History
  GET_PURCHASE_HISTORY: {
    method: 'GET',
    path: '/customers/:id/purchases',
    description: 'Get customer purchase history',
    expectedResponse: {
      transactions: [
        { id: 'TRX001', date: '2024-01-01', amount: 500 }
      ]
    }
  },

  // Refund
  PROCESS_REFUND: {
    method: 'POST',
    path: '/cashier/refund',
    description: 'Process a refund',
    requestBody: {
      transaction_id: 'TRX001',
      amount: 100,
      reason: 'Customer request',
      cashier_name: 'Cashier Name'
    },
    expectedResponse: {
      success: true,
      refund_id: 'REF001'
    }
  },

  // Multi-Payment
  PROCESS_MULTI_PAYMENT: {
    method: 'POST',
    path: '/cashier/multi-payment',
    description: 'Process split payment transaction',
    requestBody: {
      cash_amount: 100,
      card_amount: 200,
      total_amount: 300,
      transaction_id: 'TRX001'
    },
    expectedResponse: {
      success: true,
      transaction_id: 'TRX001'
    }
  },

  // Apply Discount
  APPLY_DISCOUNT: {
    method: 'POST',
    path: '/cashier/apply-discount',
    description: 'Apply discount code to transaction',
    requestBody: {
      code: 'DISCOUNT10',
      transaction_id: 'TRX001'
    },
    expectedResponse: {
      success: true,
      discount_amount: 30,
      new_total: 270
    }
  },

  // Generate Receipt
  GENERATE_RECEIPT: {
    method: 'GET',
    path: '/cashier/receipt/:id',
    description: 'Generate receipt for transaction',
    expectedResponse: {
      transaction_id: 'TRX001',
      items: [],
      total: 300,
      date: '2024-01-01'
    }
  },

  // Shift Handover
  SHIFT_HANDOVER: {
    method: 'POST',
    path: '/cashier/handover',
    description: 'Submit shift handover notes',
    requestBody: {
      note: 'Handover notes',
      cashier_name: 'Cashier Name'
    },
    expectedResponse: {
      success: true
    }
  },

  // Void Transaction
  VOID_TRANSACTION: {
    method: 'POST',
    path: '/cashier/void',
    description: 'Void a completed transaction',
    requestBody: {
      transaction_id: 'TRX001',
      reason: 'Void reason',
      cashier_name: 'Cashier Name'
    },
    expectedResponse: {
      success: true
    }
  },

  // Register Customer
  REGISTER_CUSTOMER: {
    method: 'POST',
    path: '/customers',
    description: 'Register a new customer',
    requestBody: {
      name: 'Customer Name',
      phone: '09123456789',
      email: 'customer@email.com'
    },
    expectedResponse: {
      id: 1,
      name: 'Customer Name'
    }
  },

  // Gift Card Balance
  CHECK_GIFT_CARD: {
    method: 'GET',
    path: '/gift-cards/:number/balance',
    description: 'Check gift card balance',
    expectedResponse: {
      balance: 500
    }
  },

  // Transaction Search (Chatbot)
  SEARCH_TRANSACTIONS: {
    method: 'GET',
    path: '/cashier/transactions/search',
    description: 'Search transactions by ID, customer, or amount',
    queryParams: ['q'],
    expectedResponse: [
      { id: 'TRX001', customer: 'Customer Name', payment_type: 'cash', amount: 500, date: '2024-01-01' }
    ]
  }
};

/**
 * Mock data for testing without backend
 * Set USE_MOCK_DATA = true in .env or localStorage to enable
 */
export const MOCK_DATA = {
  dashboard: {
    today_sales: 15000,
    today_transactions: 45,
    pending_payments: 3,
    sales_by_type: [
      { type: 'cash', total: 8000, count: 30 },
      { type: 'card', total: 5000, count: 12 },
      { type: 'gcash', total: 2000, count: 3 }
    ],
    low_stock_items: [
      { id: 1, name: 'Dog Food Premium', sku: 'DOG001', stock: 5, threshold: 10 },
      { id: 2, name: 'Cat Treats', sku: 'CAT002', stock: 3, threshold: 10 }
    ],
    top_selling_products: [
      { id: 1, name: 'Dog Food Premium', units_sold: 25, revenue: 5000 },
      { id: 2, name: 'Cat Food Standard', units_sold: 20, revenue: 4000 }
    ],
    pending_orders: [
      { id: 'ORD001', customer: 'John Doe', total: 500, waiting_time: '5 min' },
      { id: 'ORD002', customer: 'Jane Smith', total: 750, waiting_time: '10 min' }
    ]
  },
  products: [
    { id: 1, name: 'Dog Food Premium', sku: 'DOG001', price: 200, stock: 50 },
    { id: 2, name: 'Cat Food Standard', sku: 'CAT001', price: 150, stock: 30 },
    { id: 3, name: 'Pet Shampoo', sku: 'PET001', price: 100, stock: 20 }
  ],
  customers: [
    { id: 1, name: 'John Doe', phone: '09123456789', email: 'john@email.com', pets_count: 2, loyalty_points: 500 },
    { id: 2, name: 'Jane Smith', phone: '09876543210', email: 'jane@email.com', pets_count: 1, loyalty_points: 300 }
  ],
  transactions: [
    { id: 'TRX001', customer: 'John Doe', payment_type: 'cash', amount: 500, date: '2024-01-15' },
    { id: 'TRX002', customer: 'Jane Smith', payment_type: 'card', amount: 750, date: '2024-01-16' }
  ]
};
