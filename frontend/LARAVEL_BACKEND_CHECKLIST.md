# Laravel Backend API Checklist

Complete route/controller structure for Pawesome Pet Care Management System.

---

## Core Controllers (Minimum for Defense-Ready)

### 1. AdminDashboardController
```php
// Routes
GET /api/admin/dashboard
GET /api/admin/users
POST /api/admin/users
PUT /api/admin/users/{id}
DELETE /api/admin/users/{id}
GET /api/admin/reports/daily
GET /api/admin/reports/monthly
GET /api/admin/system/health
```

### 2. ReceptionistDashboardController
```php
// Routes
GET /api/receptionist/dashboard
```

### 3. CashierDashboardController
```php
// Routes
GET /api/cashier/dashboard
GET /api/cashier/today-sales
GET /api/cashier/recent-transactions
```

### 4. CustomerController
```php
// Routes
GET /api/customers
POST /api/customers
GET /api/customers/{id}
PUT /api/customers/{id}
DELETE /api/customers/{id}
GET /api/customers/{id}/bookings
GET /api/customers/{id}/orders
GET /api/customers/{id}/payments
```

### 5. PetController
```php
// Routes
GET /api/pets
POST /api/pets
GET /api/pets/{id}
PUT /api/pets/{id}
DELETE /api/pets/{id}
GET /api/pets/{id}/bookings
GET /api/pets/{id}/medical-records
GET /api/pets/{id}/grooming-history
```

### 6. BookingController
```php
// Routes
GET /api/bookings
POST /api/bookings
GET /api/bookings/{id}
PUT /api/bookings/{id}/status
DELETE /api/bookings/{id}
GET /api/bookings?customer_id={id}
GET /api/bookings?pet_id={id}
GET /api/bookings?status={status}
GET /api/bookings?date={date}
```

### 7. OrderController
```php
// Routes
GET /api/orders
POST /api/orders
GET /api/orders/{id}
PUT /api/orders/{id}/status
DELETE /api/orders/{id}
GET /api/orders?customer_id={id}
GET /api/receptionist/orders
PUT /api/receptionist/orders/{order}/status
```

### 8. PaymentController
```php
// Routes
GET /api/payments
POST /api/payments
GET /api/payments/{id}
PUT /api/payments/{id}
DELETE /api/payments/{id}
GET /api/payments?order_id={id}
GET /api/payments?customer_id={id}
GET /api/payments?status={status}
GET /api/cashier/payments/today
GET /api/cashier/payments/pending
```

### 9. BoardingController
```php
// Routes
GET /api/boardings
POST /api/boardings
GET /api/boardings/{id}
PUT /api/boardings/{id}
DELETE /api/boardings/{id}
POST /api/boardings/{id}/check-in
POST /api/boardings/{id}/check-out
GET /api/boardings?customer_id={id}
GET /api/boardings?status={status}
GET /api/boardings/current-boarders
GET /api/boardings/today-activity
```

### 10. Broadcast Events
```php
// Events
BookingUpdated - Channel: 'receptionist-dashboard'
OrderUpdated - Channel: 'receptionist-dashboard'
PaymentReceived - Channel: 'cashier-dashboard'
CheckInCompleted - Channel: 'receptionist-dashboard'
CheckOutCompleted - Channel: 'receptionist-dashboard'
SystemAlert - Channel: 'admin-dashboard'
```

---

## Advanced Controllers (Optional for Full System)

### 11. InventoryController
```php
// Routes
GET /api/inventory
POST /api/inventory
GET /api/inventory/{id}
PUT /api/inventory/{id}
DELETE /api/inventory/{id}
GET /api/inventory?category={category}
GET /api/inventory?low_stock=true
POST /api/inventory/{id}/restock
GET /api/inventory/alerts
```

### 12. VetAppointmentController
```php
// Routes
GET /api/vet/appointments
POST /api/vet/appointments
GET /api/vet/appointments/{id}
PUT /api/vet/appointments/{id}
DELETE /api/vet/appointments/{id}
GET /api/vet/appointments?status={status}
GET /api/vet/appointments?date={date}
POST /api/vet/appointments/{id}/medical-notes
GET /api/vet/appointments/{id}/medical-history
```

### 13. GroomingController
```php
// Routes
GET /api/grooming/appointments
POST /api/grooming/appointments
GET /api/grooming/appointments/{id}
PUT /api/grooming/appointments/{id}
DELETE /api/grooming/appointments/{id}
GET /api/grooming/appointments?status={status}
GET /api/grooming/appointments?date={date}
GET /api/grooming/services
GET /api/grooming/services/{id}
POST /api/grooming/appointments/{id}/complete
```

### 14. ReportsController
```php
// Routes
GET /api/reports/daily
GET /api/reports/weekly
GET /api/reports/monthly
GET /api/reports/yearly
GET /api/reports/sales
GET /api/reports/bookings
GET /api/reports/services
GET /api/reports/inventory
GET /api/reports/export/{type}
```

### 15. NotificationController
```php
// Routes
GET /api/notifications
POST /api/notifications
GET /api/notifications/{id}
PUT /api/notifications/{id}/read
DELETE /api/notifications/{id}
GET /api/notifications?user_id={id}
GET /api/notifications?unread=true
POST /api/notifications/mark-all-read
```

### 16. ReceiptController
```php
// Routes
GET /api/receipts
POST /api/receipts
GET /api/receipts/{id}
GET /api/receipts/{id}/download
GET /api/receipts?order_id={id}
GET /api/receipts?payment_id={id}
GET /api/cashier/receipts/today
```

---

## Role-Based Route Groups

### Admin Routes
```php
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Admin Dashboard
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index']);
    
    // User Management
    Route::apiResource('/admin/users', UserController::class);
    
    // System Reports
    Route::get('/admin/reports/{period}', [ReportsController::class, 'generate']);
    Route::get('/admin/system/health', [AdminController::class, 'healthCheck']);
    
    // Inventory Management
    Route::apiResource('/inventory', InventoryController::class);
    Route::post('/inventory/{id}/restock', [InventoryController::class, 'restock']);
    Route::get('/inventory/alerts', [InventoryController::class, 'alerts']);
});
```

### Receptionist Routes
```php
Route::middleware(['auth:sanctum', 'role:receptionist'])->group(function () {
    // Receptionist Dashboard
    Route::get('/receptionist/dashboard', [ReceptionistDashboardController::class, 'index']);
    
    // Customer Management
    Route::apiResource('/customers', CustomerController::class);
    Route::get('/customers/{id}/bookings', [CustomerController::class, 'bookings']);
    Route::get('/customers/{id}/orders', [CustomerController::class, 'orders']);
    
    // Pet Management
    Route::apiResource('/pets', PetController::class);
    Route::get('/pets/{id}/bookings', [PetController::class, 'bookings']);
    Route::get('/pets/{id}/medical-records', [PetController::class, 'medicalRecords']);
    
    // Booking Management
    Route::apiResource('/bookings', BookingController::class);
    Route::put('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
    
    // Order Management
    Route::get('/receptionist/orders', [ReceptionistOrderController::class, 'index']);
    Route::put('/receptionist/orders/{order}/status', [ReceptionistOrderController::class, 'updateStatus']);
    
    // Boarding/Check-in/Check-out
    Route::apiResource('/boardings', BoardingController::class);
    Route::post('/boardings/{boarding}/check-in', [BoardingController::class, 'checkIn']);
    Route::post('/boardings/{boarding}/check-out', [BoardingController::class, 'checkOut']);
    
    // Notifications
    Route::apiResource('/notifications', NotificationController::class);
});
```

### Cashier Routes
```php
Route::middleware(['auth:sanctum', 'role:cashier'])->group(function () {
    // Cashier Dashboard
    Route::get('/cashier/dashboard', [CashierDashboardController::class, 'index']);
    Route::get('/cashier/today-sales', [CashierDashboardController::class, 'todaySales']);
    Route::get('/cashier/recent-transactions', [CashierDashboardController::class, 'recentTransactions']);
    
    // Payment Processing
    Route::apiResource('/payments', PaymentController::class);
    Route::get('/cashier/payments/today', [PaymentController::class, 'todayPayments']);
    Route::get('/cashier/payments/pending', [PaymentController::class, 'pendingPayments']);
    
    // Receipts
    Route::apiResource('/receipts', ReceiptController::class);
    Route::get('/receipts/{id}/download', [ReceiptController::class, 'download']);
    Route::get('/cashier/receipts/today', [ReceiptController::class, 'todayReceipts']);
});
```

### Vet Routes
```php
Route::middleware(['auth:sanctum', 'role:vet'])->group(function () {
    // Vet Dashboard
    Route::get('/vet/dashboard', [VetDashboardController::class, 'index']);
    
    // Vet Appointments
    Route::apiResource('/vet/appointments', VetAppointmentController::class);
    Route::post('/vet/appointments/{id}/medical-notes', [VetAppointmentController::class, 'addMedicalNotes']);
    Route::get('/vet/appointments/{id}/medical-history', [VetAppointmentController::class, 'medicalHistory']);
});
```

### Groomer Routes
```php
Route::middleware(['auth:sanctum', 'role:groomer'])->group(function () {
    // Groomer Dashboard
    Route::get('/groomer/dashboard', [GroomerDashboardController::class, 'index']);
    
    // Grooming Appointments
    Route::apiResource('/grooming/appointments', GroomingController::class);
    Route::get('/grooming/services', [GroomingController::class, 'services']);
    Route::apiResource('/grooming/services', GroomingServiceController::class);
    Route::post('/grooming/appointments/{id}/complete', [GroomingController::class, 'complete']);
});
```

### Customer Routes
```php
Route::middleware(['auth:sanctum', 'role:customer'])->group(function () {
    // Customer Dashboard
    Route::get('/customer/dashboard', [CustomerDashboardController::class, 'index']);
    
    // Customer Profile
    Route::get('/customer/profile', [CustomerController::class, 'profile']);
    Route::put('/customer/profile', [CustomerController::class, 'updateProfile']);
    
    // Customer Pets
    Route::get('/customer/pets', [PetController::class, 'myPets']);
    Route::post('/customer/pets', [PetController::class, 'createPet']);
    Route::put('/customer/pets/{id}', [PetController::class, 'updatePet']);
    
    // Customer Bookings
    Route::get('/customer/bookings', [BookingController::class, 'myBookings']);
    Route::post('/customer/bookings', [BookingController::class, 'createBooking']);
    Route::put('/customer/bookings/{id}', [BookingController::class, 'updateBooking']);
    Route::delete('/customer/bookings/{id}', [BookingController::class, 'cancelBooking']);
    
    // Customer Orders
    Route::get('/customer/orders', [OrderController::class, 'myOrders']);
    Route::post('/customer/orders', [OrderController::class, 'createOrder']);
    
    // Customer Payments
    Route::get('/customer/payments', [PaymentController::class, 'myPayments']);
    Route::post('/customer/payments', [PaymentController::class, 'makePayment']);
});
```

---

## Current Frontend ↔ Backend Connection Status

### ✅ Connected (Laravel-Compliant)
- ReceptionistDashboard → `/api/receptionist/dashboard`
- ReceptionistCustomersProfile → `/api/customers` and `/api/pets`
- ReceptionistBookings → `/api/bookings` and `/api/boardings`
- ReceptionistCheckInForm → `/api/boardings/{id}/check-in`
- ReceptionistCheckOutForm → `/api/boardings/{id}/check-out`
- ReceptionistCustomerManagement → `/api/customers` and `/api/bookings`
- ReceptionistCustomerOrders → `/api/receptionist/orders`

### ❌ Not Yet Connected (Need Backend Controllers)
- AdminDashboard → Needs `AdminDashboardController`
- CashierDashboard → Needs `CashierDashboardController`
- VetDashboard → Needs `VetDashboardController`
- GroomerDashboard → Needs `GroomerDashboardController`
- CustomerDashboard → Needs `CustomerDashboardController`
- InventoryModule → Needs `InventoryController`
- ReportsModule → Needs `ReportsController`
- ReceiptModule → Needs `ReceiptController`

---

## Implementation Priority

### Phase 1: Defense-Ready (Minimum)
1. ✅ ReceptionistDashboardController
2. ✅ CustomerController
3. ✅ PetController
4. ✅ BookingController
5. ✅ BoardingController
6. ✅ OrderController (Receptionist)
7. ⚠️ CashierDashboardController
8. ⚠️ PaymentController
9. ⚠️ AdminDashboardController
10. ⚠️ Broadcast Events

### Phase 2: Advanced Features
11. InventoryController
12. VetAppointmentController
13. GroomingController
14. ReportsController
15. NotificationController
16. ReceiptController

---

## Authentication & Authorization

### Middleware Setup
```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    // All protected routes here
});

// Role-based access
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Admin-only routes
});
```

### Sanctum Configuration
```php
// config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
```

---

## Broadcast Channels

### Channel Definitions
```php
// routes/channels.php
Broadcast::channel('receptionist-dashboard', function ($user) {
    return $user->role === 'receptionist' || $user->role === 'admin';
});

Broadcast::channel('cashier-dashboard', function ($user) {
    return $user->role === 'cashier' || $user->role === 'admin';
});

Broadcast::channel('admin-dashboard', function ($user) {
    return $user->role === 'admin';
});
```

### Event Broadcasting
```php
// Events
- BookingUpdated → Channel: 'receptionist-dashboard'
- OrderUpdated → Channel: 'receptionist-dashboard'
- PaymentReceived → Channel: 'cashier-dashboard'
- CheckInCompleted → Channel: 'receptionist-dashboard'
- CheckOutCompleted → Channel: 'receptionist-dashboard'
- SystemAlert → Channel: 'admin-dashboard'
- InventoryAlert → Channel: 'admin-dashboard'
```

---

## Summary

**Defense-Ready Status:**
- ✅ Receptionist Flow: Complete
- ⚠️ Cashier Flow: Partial (needs dashboard + payment controller)
- ⚠️ Admin Flow: Partial (needs dashboard + reports)
- ❌ Vet Flow: Not started
- ❌ Groomer Flow: Not started
- ❌ Customer Flow: Not started
