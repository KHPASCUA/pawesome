# Centralized Data Flow Testing Guide

## Overview
This guide explains how to test that data flows correctly through the entire system:
**Frontend → Backend → Database → All Dashboards**

## Test Files Created

### 1. `tests/Feature/CentralizedDataFlowTest.php`
**7 comprehensive integration tests:**

| Test | Description |
|------|-------------|
| `test_inventory_data_flows_to_dashboard` | Verifies inventory items appear in Inventory Dashboard |
| `test_sale_data_flows_through_system` | End-to-end sale: POS → Database → Cashier Dashboard |
| `test_customer_store_shows_centralized_inventory` | Customer Store sees same inventory data |
| `test_stock_changes_reflect_across_all_dashboards` | Stock reduction visible everywhere |
| `test_categories_are_consistent_across_all_dashboards` | P0.2 - No category corruption |
| `test_concurrent_stock_updates_handle_correctly` | Race condition handling |
| `test_complete_business_flow` | Full workflow: Admin → Cashier → Customer |

### 2. Supporting Test Files
- `InventoryTest.php` - CRUD operations, P0 fixes validation
- `InventoryDashboardTest.php` - Dashboard statistics accuracy
- `POSTest.php` - POS integration, sales processing
- `InventoryItemValidationTest.php` - Model-level constraints

## Quick Start

### Option 1: Run All Tests (Recommended)
```bash
cd c:\Users\ACER\Pawesome_frontend\backend
php artisan test
```

### Option 2: Run Centralized Flow Tests Only
```bash
php artisan test --filter=CentralizedDataFlowTest
```

### Option 3: Run with Verbose Output
```bash
php artisan test --filter=CentralizedDataFlowTest --testdox
```

### Option 4: Run Specific Test
```bash
php artisan test --filter=test_complete_business_flow
```

## Expected Test Results

### ✅ Passing Tests Mean:
1. **Frontend → Backend**: API endpoints receive and process data correctly
2. **Backend → Database**: Data persists with constraints enforced
3. **Database → Inventory Dashboard**: Admin sees correct inventory data
4. **Database → Cashier Dashboard**: Cashier sees products and can sell
5. **Database → Customer Store**: Customers see available products
6. **Stock Consistency**: All dashboards show same stock levels
7. **Category Consistency**: No data corruption across the flow (P0.2)
8. **Field Handling**: Both `stock` and `quantity` work (P0.3)
9. **Constraints Active**: Invalid data is auto-corrected (P0.5)

## Test Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Admin Dashboard (Frontend)                               │
│    - Add Product: SKU=TEST-001, Category=Food, Stock=100    │
└──────────────────┬──────────────────────────────────────────┘
                   │ POST /api/admin/inventory/items
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend (Laravel)                                        │
│    - Validate input                                         │
│    - Apply model constraints (P0.5)                         │
│    - Auto-correct invalid category (P0.2)                 │
│    - Save to database                                       │
└──────────────────┬──────────────────────────────────────────┘
                   │ INSERT inventory_items
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Database (MySQL)                                         │
│    - ENUM constraint on category (P0.5)                   │
│    - CHECK stock >= 0                                       │
│    - CHECK price >= 0                                     │
│    - Index on category for fast filtering                 │
└──────────────────┬──────────────────────────────────────────┘
                   │ Data available via API
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Inventory│ │ Cashier  │ │ Customer │
│ Dashboard│ │ Dashboard│ │ Store    │
├──────────┤ ├──────────┤ ├──────────┤
│ Stock:100│ │ Stock:100│ │ In Stock │
│ Food     │ │ Available│ │ ₱XXX     │
│ ₱XXX     │ │ for Sale │ │          │
└──────────┘ └──────────┘ └──────────┘
        │          │          │
        └──────────┼──────────┘
                   │
                   ▼ Purchase
┌─────────────────────────────────────────────────────────────┐
│ 4. Cashier sells 5 items                                    │
│    - Stock reduces to 95                                    │
│    - Sale recorded                                          │
│    - Inventory log created                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Inventory│ │ Cashier  │ │ Customer │
│ Dashboard│ │ Dashboard│ │ Store    │
├──────────┤ ├──────────┤ ├──────────┤
│ Stock:95 │ │ Stock:95 │ │ 95 Left  │
│ (synced) │ │ (synced) │ │ (synced) │
└──────────┘ └──────────┘ └──────────┘
```

## P0 Issue Validation in Tests

### P0.1: API Rate Limiting
- All endpoints throttle requests
- No single client can overwhelm the system

### P0.2: Category Consistency
```php
// Test validates:
$invalidItem = InventoryItem::create([
    'category' => 'InvalidCategory', // Rejected
]);
// Auto-corrected to 'Accessories'
```

### P0.3: Field Name Mismatch
```php
// Both work:
$request1 = ['stock' => 50];     // ✅ Works
$request2 = ['quantity' => 50]; // ✅ Also works
```

### P0.4: Unused Variables (Frontend)
- All frontend components cleaned
- No build warnings

### P0.5: Database Constraints
```php
// Test validates:
$item->stock = -10;
$item->save();
// Result: stock = 0 (auto-corrected)
```

## API Endpoints Tested

| Endpoint | Dashboard | Method |
|----------|-----------|--------|
| `/api/admin/inventory/items` | Inventory | CRUD |
| `/api/inventory/dashboard/overview` | Inventory | GET |
| `/api/cashier/pos/transaction` | Cashier | POST |
| `/api/cashier/dashboard/overview` | Cashier | GET |
| `/api/inventory/items` | Customer | GET |
| `/api/admin/reports/sales` | Admin | GET |

## Troubleshooting

### Tests Failing?

1. **Database not migrated:**
   ```bash
   php artisan migrate:fresh --seed
   ```

2. **Seeders not run:**
   ```bash
   php artisan db:seed --class=InventorySeeder
   ```

3. **API routes not working:**
   ```bash
   php artisan route:clear
   php artisan cache:clear
   ```

4. **Permission issues:**
   - Ensure test users have correct roles (admin, cashier)

### Verify Centralization Manually

1. **Add product via Admin:**
   - Login to Admin Dashboard
   - Add product: SKU=MANUAL-001, Stock=50

2. **Check Cashier sees it:**
   - Login to Cashier POS
   - Search for MANUAL-001
   - Should appear with Stock=50

3. **Check Customer Store:**
   - Open Customer Store
   - Product should be listed
   - Stock should show 50

4. **Make a sale:**
   - Sell 5 items in Cashier POS
   - Stock should reduce to 45

5. **Verify all dashboards:**
   - Admin: Stock=45
   - Cashier: Stock=45
   - Customer: Stock=45 or "45 Left"

## Summary

If all tests pass, your system has:
- ✅ **True data centralization** - One source of truth
- ✅ **Consistent categories** - No corruption
- ✅ **Flexible field names** - stock/quantity both work
- ✅ **Protected data** - Constraints prevent corruption
- ✅ **Real-time sync** - All dashboards updated
- ✅ **Race condition safety** - Concurrent access handled
