# Phase 1 Static Data TODO

## Overview
Found 627+ hardcoded array definitions across 121 frontend files. All currently functional but need API integration for Phase 2.

## Priority 1: Critical Dashboard Data

| File Path | Static Data Purpose | Suggested API Source | Priority |
|------------|-------------------|----------------------|----------|
| `src/components/cashier/CashierDashboard.jsx` | 18 hardcoded arrays (sales, products, customers) | `/cashier/dashboard` | High |
| `src/components/receptionist/ReceptionistBookings.jsx` | 17 hardcoded arrays (bookings, appointments) | `/receptionist/bookings` | High |
| `src/components/manager/ManagerReports.jsx` | 15 hardcoded arrays (reports, analytics) | `/manager/reports` | High |
| `src/components/receptionist/ReceptionistApprovals.jsx` | 15 hardcoded arrays (pending requests) | `/receptionist/approvals` | High |
| `src/components/admin/ChatbotLogs.jsx` | 14 hardcoded arrays (chat logs) | `/admin/chatbot/logs` | Medium |
| `src/components/admin/History_Fixed.jsx` | 14 hardcoded arrays (history records) | `/admin/history` | High |

## Priority 2: Component-Level Data

| File Path | Static Data Purpose | Suggested API Source | Priority |
|------------|-------------------|----------------------|----------|
| `src/components/admin/AdminReports.jsx` | 10 hardcoded arrays (admin reports) | `/admin/reports` | Medium |
| `src/components/customers/CustomerBookings.jsx` | 14 hardcoded arrays (customer bookings) | `/customer/bookings` | Medium |
| `src/components/manager/ManagerStaff.jsx` | 14 hardcoded arrays (staff data) | `/manager/staff` | Medium |
| `src/components/inventory/InventoryProducts.jsx` | 13 hardcoded arrays (inventory items) | `/inventory/products` | Medium |
| `src/components/manager/ManagerHistory.jsx` | 13 hardcoded arrays (manager history) | `/manager/history` | Medium |
| `src/components/receptionist/ReceptionistHotelBookings.jsx` | 13 hardcoded arrays (hotel bookings) | `/receptionist/hotel-bookings` | Medium |

## Priority 3: Utility and Hook Data

| File Path | Static Data Purpose | Suggested API Source | Priority |
|------------|-------------------|----------------------|----------|
| `src/hooks/useInventory.js` | `mockData`, `demoData` references | `/inventory/items` | Low |
| `src/components/cashier/CashierHistory_Fixed.jsx` | 10 hardcoded arrays (transaction history) | `/cashier/history` | Medium |
| `src/components/cashier/CashierPOS_New.jsx` | 10 hardcoded arrays (POS products) | `/cashier/pos` | Medium |
| `src/components/inventory/InventoryHistory_Fixed.jsx` | 10 hardcoded arrays (inventory history) | `/inventory/history` | Medium |
| `src/components/inventory/InventoryReports.jsx` | 10 hardcoded arrays (inventory reports) | `/inventory/reports` | Medium |

## Implementation Strategy for Phase 2

### Phase 2A: API Integration (Week 1)
1. **Critical Dashboards First**: Replace hardcoded data in CashierDashboard, ReceptionistBookings, ManagerReports
2. **Component Data Second**: Replace AdminReports, CustomerBookings, ManagerStaff
3. **Utility Hooks Third**: Update useInventory hook to use live API data

### Phase 2B: Data Validation (Week 2)
1. **API Response Validation**: Ensure all API responses match expected data structures
2. **Error Handling**: Implement proper error states when API data is unavailable
3. **Fallback Logic**: Maintain demo data as fallback when API is down

### Phase 2C: Performance Optimization (Week 3)
1. **Caching Strategy**: Implement React Query or similar for API caching
2. **Loading States**: Add proper loading indicators during API calls
3. **Data Refresh**: Implement auto-refresh for real-time data

## Risk Assessment

**Low Risk**: All hardcoded data currently functional
**Medium Risk**: Data inconsistency between components
**High Risk**: No single source of truth for business data

## Notes for Phase 2

- Do NOT remove hardcoded data until API endpoints are verified working
- Maintain backward compatibility during transition
- Test each component individually after API integration
- Keep demo data as fallback for development/testing

## Total Files Requiring API Integration: 121 files
## Total Hardcoded Arrays Identified: 627+
## Estimated Phase 2 Duration: 3 weeks
