# Cashier Dashboard Testing Guide

## Overview
This guide explains how to test the Cashier Dashboard features with or without a backend server.

## Testing Modes

### 1. Mock Mode (No Backend Required)
Use this mode to test the UI and functionality without a running backend server.

**To enable mock mode:**
```javascript
// In browser console
localStorage.setItem('use_mock_data', 'true');
// Then refresh the page
```

**Or set environment variable:**
```bash
# In .env file
REACT_APP_USE_MOCK_DATA=true
```

**To disable mock mode:**
```javascript
// In browser console
localStorage.removeItem('use_mock_data');
// Then refresh the page
```

### 2. Live Backend Mode
Connect to a real backend server for full integration testing.

**Backend server should run on:**
```
http://127.0.0.1:8000/api
```

**To change API URL:**
```bash
# In .env file
REACT_APP_API_URL=http://your-backend-url/api
```

## Features to Test

### Dashboard Overview
- [ ] Today's sales display
- [ ] Today's transactions count
- [ ] Pending payments count
- [ ] Sales by type breakdown (cash/card/gcash)
- [ ] Low stock alerts panel
- [ ] Top-selling products panel
- [ ] Pending orders queue

### Quick Product Search (Ctrl+K)
- [ ] Open search modal with Ctrl+K
- [ ] Search products by name
- [ ] View product details (SKU, price, stock)
- [ ] Add to cart button
- [ ] Edit price button

### Quick Customer Lookup (F1)
- [ ] Open customer search with F1
- [ ] Search customers by name or phone
- [ ] View customer details (email, pets count)
- [ ] View loyalty points badge

### Barcode Scanner
- [ ] Enter barcode in scanner input
- [ ] Press Enter to scan
- [ ] Product appears in search results

### Multi-Payment Modal
- [ ] Open multi-payment modal
- [ ] Enter cash amount
- [ ] Enter card amount
- [ ] Submit split payment

### Discount Code Modal
- [ ] Open discount modal
- [ ] Enter discount code
- [ ] Apply discount to transaction

### Receipt Generation Modal
- [ ] Open receipt modal
- [ ] Enter transaction ID
- [ ] Generate receipt

### Break Time Tracking
- [ ] Start break
- [ ] View break duration
- [ ] End break

### Shift Handover
- [ ] Open handover modal
- [ ] Write handover notes
- [ ] Submit handover

### Purchase History Lookup
- [ ] Open purchase history modal
- [ ] Enter customer ID
- [ ] Fetch purchase history
- [ ] View past transactions

### Transaction Filtering
- [ ] Open filter modal
- [ ] Set date range
- [ ] Select payment type
- [ ] Apply filters

### Quick Notes
- [ ] Open notes modal
- [ ] Write notes
- [ ] Save notes to localStorage

### Hold/Resume Transaction
- [ ] Hold current transaction
- [ ] Resume held transaction

### Price Override
- [ ] Open price override modal
- [ ] View original price
- [ ] Enter new price
- [ ] Apply override

### Cash Drawer Tracking
- [ ] Toggle cash drawer open/close
- [ ] View drawer state

### Void Transaction
- [ ] Open void modal
- [ ] Enter transaction ID
- [ ] Enter void reason
- [ ] Submit void

### Customer Registration
- [ ] Open registration modal
- [ ] Enter customer name
- [ ] Enter phone number
- [ ] Enter email (optional)
- [ ] Register customer

### Tax & Tip Display
- [ ] View tax rate in Shift Summary
- [ ] Add tip amount
- [ ] View tip in Shift Summary

### Gift Card Balance
- [ ] Open gift card modal
- [ ] Enter gift card number
- [ ] Check balance
- [ ] View balance display

### Chatbot
- [ ] Open chatbot widget
- [ ] Test POS help quick action
- [ ] Test transaction lookup workflow
- [ ] Test refund help
- [ ] Test discount help
- [ ] Test multi-payment help
- [ ] Test receipt help
- [ ] Test inventory search workflow

## API Endpoints Documentation

See `frontend/src/api/cashierEndpoints.js` for complete API endpoint documentation including:
- Request methods
- Expected request bodies
- Expected response formats
- Mock data examples

## Backend Implementation Checklist

To implement the backend, ensure these endpoints are available:

### GET Endpoints
- `GET /api/cashier/dashboard` - Dashboard summary
- `GET /api/products/search?q=` - Product search
- `GET /api/products/barcode/:barcode` - Barcode lookup
- `GET /api/customers/search?q=` - Customer search
- `GET /api/customers/:id/purchases` - Purchase history
- `GET /api/cashier/receipt/:id` - Receipt generation
- `GET /api/cashier/transactions/search?q=` - Transaction search
- `GET /api/gift-cards/:number/balance` - Gift card balance

### POST Endpoints
- `POST /api/cashier/refund` - Process refund
- `POST /api/cashier/multi-payment` - Split payment
- `POST /api/cashier/apply-discount` - Apply discount
- `POST /api/cashier/handover` - Shift handover
- `POST /api/cashier/void` - Void transaction
- `POST /api/customers` - Register customer

## Troubleshooting

### Network Errors
If you see "Network error: Unable to connect to server":
1. Check if backend server is running
2. Verify API URL in .env file
3. Enable mock mode for UI testing

### Mock Data Not Working
If mock mode is not enabled:
1. Check localStorage for `use_mock_data`
2. Check .env for `REACT_APP_USE_MOCK_DATA`
3. Refresh the page after setting

### Features Not Responding
If a feature doesn't work:
1. Check browser console for errors
2. Verify API endpoint exists (in live mode)
3. Check if mock data exists for that endpoint (in mock mode)

## Testing Checklist

### Before Testing
- [ ] Backend server running (if using live mode)
- [ ] Mock mode enabled (if testing without backend)
- [ ] User logged in as cashier role
- [ ] Browser console open for debugging

### After Testing
- [ ] All features tested
- [ ] No console errors
- [ ] UI displays correctly
- [ ] Mock mode disabled (if needed)
