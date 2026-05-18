# Cashier POS Stock Stability Audit Report

## Summary
The Cashier POS stock flicker was caused by mixed frontend stock sources. `CashierPOS_New.jsx` loaded products directly, but it also subscribed to the shared `inventorySync` service. That service auto-refreshes on an interval and clears its product cache on failed or empty responses, so the POS could receive an empty list while its direct fetch still knew products were in stock. This made stock badges temporarily render as unavailable or empty during refresh.

The POS now uses one frontend source for cashier stock display: the cashier sellable inventory API. It keeps the previous product list while refreshing and only shows `Out of Stock` after a successful normalized backend response reports available stock as `0`.

## Files Changed
- `frontend/src/components/cashier/CashierPOS_New.jsx`
- `backend/app/Http/Controllers/Cashier/POSController.php`
- `backend/app/Services/InventoryService.php`

## Frontend Stock Logic Removed
- Removed the `inventorySync` subscription from Cashier POS.
- Removed the stock event listener that could overwrite current product/cart stock from a second data stream.
- Removed the refresh behavior that could visually collapse POS products during loading.
- Removed duplicate stock field assumptions and replaced them with one normalization path.

## Frontend Stock Logic Added
- Added normalized stock helpers:
  - `toNumber`
  - `getAvailableStock`
  - `normProduct`
  - `isProductOutOfStock`
- Added request sequence protection so older inventory responses cannot overwrite newer product data.
- Added refresh states that keep previous products visible:
  - `isLoadingProducts`
  - `isRefreshingProducts`
  - `lastStockSyncAt`
- Added cart reconciliation after successful backend inventory refresh:
  - removes cart lines only when refreshed backend stock is `0`
  - reduces cart quantity only when refreshed backend stock is below cart quantity
  - warns the cashier instead of silently marking everything out of stock
- POS now refreshes sellable products after successful checkout without clearing the visible product list first.

## Backend Endpoint Audited
Active cashier inventory routes were confirmed by `php artisan route:list`:
- `GET api/cashier/inventory/sellable`
- `GET api/cashier/pos/products`
- `GET api/pos/items`

All route to `Cashier\POSController@getProducts`.

The POS frontend uses:
- `GET /cashier/inventory/sellable`

The backend response now includes stable normalized fields for POS display:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Pet Shampoo",
      "price": 120,
      "stock": 25,
      "available_stock": 25,
      "is_sellable": true,
      "stock_status": "in_stock",
      "is_available": true
    }
  ],
  "products": [],
  "count": 1,
  "timestamp": "2026-05-18T00:00:00.000000Z"
}
```

`products` mirrors `data` for older frontend normalization paths.

## POS Transaction Audited
Active POS checkout route was confirmed:
- `POST api/cashier/pos/transaction`

The transaction controller now checks stock inside the database transaction with row-level locking before sale creation and deduction. If a product is unavailable or requested quantity exceeds stock, checkout is rejected before any receipt or stock deduction completes.

The frontend does not deduct stock manually. Stock deduction remains backend-controlled through the POS transaction route.

## Inventory Log Audit
`InventoryService::deductStock()` now writes POS sale deductions with movement type:
- `pos_sale`

Customer order deductions still use the customer order movement type. This keeps POS stock logs aligned with the workflow rule that Cashier POS deducts stock immediately, while payment verification does not deduct inventory.

## Payment Verification Audit
No payment verification stock deduction logic was added or changed. Payment verification remains separate from POS stock deduction.

## API Response Shape Before/After
Before:
- Frontend had to infer stock from mixed fields such as `stock`, `quantity`, `available_stock`, or service cache values.
- Shared inventory sync could emit an empty product list during refresh/failure.
- Backend sellable response did not consistently expose POS-facing `stock_status` and `is_available`.

After:
- Frontend normalizes one cashier sellable response.
- Backend returns `available_stock`, `stock_status`, and `is_available`.
- Failed refresh keeps the previous POS products visible and shows an error/warning instead of false `Out of Stock`.

## Browser Tests Performed
Automated/browser visual testing was not run in this pass because the current task was completed through code audit and validation commands. Recommended manual checks before commit/push:
- Login as cashier and open POS.
- Confirm products with stock stay `In Stock` during manual refresh.
- Click refresh repeatedly and confirm no flicker to `Out of Stock`.
- Add product to cart and confirm quantity cannot exceed available stock.
- Complete POS checkout and confirm receipt appears after backend success.
- Confirm inventory logs include `pos_sale`.

## Console/Network Errors Found/Fixed
Fixed the likely frontend race condition source:
- removed competing `inventorySync` product updates from POS
- prevented stale sellable inventory responses from replacing fresh data
- prevented failed refreshes from clearing visible POS products

No new console/build errors were introduced.

## Validation Results
- `php artisan route:list`: passed, 515 routes registered.
- `php artisan optimize:clear`: passed.
- `php -l app/Http/Controllers/Cashier/POSController.php`: passed.
- `php -l app/Services/InventoryService.php`: passed.
- `npm run build`: passed.

Build warnings remain from pre-existing unused imports, hook dependency warnings, and DOMPurify source-map warnings. None blocked the production build.

## Remaining Risks
- Manual browser confirmation is still recommended for the exact flicker behavior under rapid refresh and checkout timing.
- Existing broader build warnings remain outside this focused POS stock stability fix.

## Final Recommendation
Ready for cashier POS browser verification. The data flow is now stable enough for demo testing: POS stock display uses the cashier sellable inventory API, frontend refreshes do not clear products, stale responses are ignored, and stock deduction remains backend-authoritative through POS checkout.
