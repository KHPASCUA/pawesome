<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CustomersController;
use App\Http\Controllers\Admin\ChatbotController;
use App\Http\Controllers\Admin\ChatbotFaqController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\LoginLogController;
use App\Http\Controllers\ChatbotController as SharedChatbotController;
use App\Http\Controllers\ChatbotWorkflowController;
use App\Http\Controllers\Customer\PortalController;
use App\Http\Controllers\Customer\CustomerStoreController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Cashier\DashboardController as CashierDashboardController;
use App\Http\Controllers\Cashier\POSController;
use App\Http\Controllers\Inventory\DashboardController as InventoryDashboardController;
use App\Http\Controllers\Manager\DashboardController as ManagerDashboardController;
use App\Http\Controllers\Receptionist\DashboardController as ReceptionistDashboardController;
use App\Http\Controllers\Veterinary\DashboardController as VeterinaryDashboardController;
use App\Http\Controllers\Veterinary\MedicalRecordController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\BoardingController;
use App\Http\Controllers\HotelRoomController;
use App\Http\Controllers\TelegramBotController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceRecordController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\GiftCardController;
use App\Http\Controllers\GroomingController;
use App\Http\Controllers\Api\GroomingController as ApiGroomingController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\VetController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\CashierPaymentController;
use App\Http\Controllers\Api\ServiceRequestController;
use App\Http\Controllers\Api\ReceptionistCustomerController;
use App\Http\Controllers\Api\ReceptionistPetController;
use App\Http\Controllers\Api\PayrollController as ApiPayrollController;
use App\Http\Controllers\Api\NotificationController as ApiNotificationController;
use App\Http\Controllers\ReceptionistRequestController;
use Illuminate\Support\Facades\Route;

// Health check endpoint for deployment monitoring
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Service Request API (public endpoints for customer booking)
Route::post('/customer/requests', [ServiceRequestController::class, 'store']);
Route::get('/customer/my-requests', [ServiceRequestController::class, 'customerRequests']);
Route::get('/receptionist/requests', [ServiceRequestController::class, 'receptionistRequests']);
Route::patch('/receptionist/requests/{id}/status', [ServiceRequestController::class, 'updateStatus']);

Route::middleware('throttle:auth')->prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('password/forgot', [AuthController::class, 'forgotPassword']);
    Route::post('password/reset', [AuthController::class, 'resetPassword']);

    Route::middleware('auth.api')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::put('profile', [AuthController::class, 'updateProfile']);
        Route::post('profile-photo', [AuthController::class, 'uploadProfilePhoto']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('telegram/unlink', [AuthController::class, 'unlinkTelegram']);
    });
});

Route::middleware(['auth.api', 'throttle:api', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'overview']);

    Route::get('users', [UserController::class, 'index']);
    Route::post('users', [UserController::class, 'store']);
    Route::put('users/{id}', [UserController::class, 'update']);
    Route::patch('users/{id}/toggle', [UserController::class, 'toggle']);
    Route::delete('users/{id}', [UserController::class, 'destroy']);

    Route::get('services', [ServiceController::class, 'index']);
    Route::post('services', [ServiceController::class, 'store']);
    Route::put('services/{id}', [ServiceController::class, 'update']);
    Route::delete('services/{id}', [ServiceController::class, 'destroy']);

    // Inventory Management (Admin Routes)
    Route::get('inventory', [InventoryController::class, 'index']);
    Route::get('inventory/items', [InventoryController::class, 'index']); // Frontend compatibility
    Route::post('inventory', [InventoryController::class, 'store']);
    Route::post('inventory/items', [InventoryController::class, 'store']); // Frontend compatibility
    Route::get('inventory/{id}', [InventoryController::class, 'show']);
    Route::get('inventory/items/{id}', [InventoryController::class, 'show']); // Frontend compatibility
    Route::put('inventory/{id}', [InventoryController::class, 'update']);
    Route::put('inventory/items/{id}', [InventoryController::class, 'update']); // Frontend compatibility
    Route::delete('inventory/{id}', [InventoryController::class, 'destroy']);
    Route::delete('inventory/items/{id}', [InventoryController::class, 'destroy']); // Frontend compatibility
    Route::post('inventory/{id}/adjust-stock', [InventoryController::class, 'adjustStock']);
    Route::post('inventory/items/{id}/adjust', [InventoryController::class, 'adjustStock']); // Frontend compatibility
    Route::patch('inventory/{id}/stock', [InventoryController::class, 'updateStock']); // Simple stock update
    Route::get('inventory/{id}/history', [InventoryController::class, 'stockHistory']);
    Route::get('inventory/items/{id}/logs', [InventoryController::class, 'stockHistory']);
    Route::get('inventory/history', [InventoryController::class, 'getHistory']); // Frontend compatibility
    Route::get('inventory/low-stock', [InventoryController::class, 'lowStock']);
    Route::get('inventory/out-of-stock', [InventoryController::class, 'outOfStock']);
    Route::get('inventory/summary', [InventoryController::class, 'summary']);
    Route::get('inventory/dashboard', [InventoryController::class, 'summary']); // Frontend compatibility
    Route::get('inventory/reports', [InventoryController::class, 'index']); // Frontend compatibility

    Route::get('customers', [CustomersController::class, 'index']);
    Route::post('customers', [CustomersController::class, 'store']);
    Route::get('customers/{id}', [CustomersController::class, 'show']);
    Route::put('customers/{id}', [CustomersController::class, 'update']);
    Route::delete('customers/{id}', [CustomersController::class, 'destroy']);
    Route::get('customers/{id}/pets', [CustomersController::class, 'pets']);
    Route::post('customers/{id}/pets', [CustomersController::class, 'addPet']);
    Route::get('customers/search', [CustomersController::class, 'search']);
    Route::get('customers/{id}/purchases', [CustomersController::class, 'purchases']);

    Route::get('chatbot/logs', [ChatbotController::class, 'index']);
    Route::get('chatbot/logs/user/{user}', [ChatbotController::class, 'userHistory']);
    Route::get('chatbot/faqs', [ChatbotFaqController::class, 'index']);
    Route::post('chatbot/faqs', [ChatbotFaqController::class, 'store']);
    Route::put('chatbot/faqs/{faq}', [ChatbotFaqController::class, 'update']);
    Route::delete('chatbot/faqs/{faq}', [ChatbotFaqController::class, 'destroy']);

    Route::get('reports/summary', [ReportsController::class, 'summary']);
    Route::get('reports/sales', [ReportsController::class, 'sales']);

    // Activity Logs
    Route::get('activity-logs', [ActivityLogController::class, 'index']);
    Route::get('activity-logs/statistics', [ActivityLogController::class, 'statistics']);
    Route::get('activity-logs/filters', [ActivityLogController::class, 'filters']);
    Route::get('activity-logs/{id}', [ActivityLogController::class, 'show']);
    Route::get('activity-logs/user/{userId}', [ActivityLogController::class, 'userLogs']);

    // Login Logs
    Route::get('login-logs', [LoginLogController::class, 'index']);
    Route::get('login-logs/statistics', [LoginLogController::class, 'statistics']);
    Route::get('login-logs/recent', [LoginLogController::class, 'recent']);
    Route::get('login-logs/user/{userId}', [LoginLogController::class, 'userLogs']);
    Route::get('login-logs/user/{userId}/sessions', [LoginLogController::class, 'userSessions']);

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
});

Route::middleware(['auth.api', 'throttle:api'])->prefix('chatbot')->group(function () {
    Route::get('welcome', [SharedChatbotController::class, 'welcome']);
    Route::post('message', [SharedChatbotController::class, 'message']);
    Route::get('workflow/booking-options', [ChatbotWorkflowController::class, 'bookingOptions']);
    Route::post('workflow/bookings', [ChatbotWorkflowController::class, 'createBooking']);
    Route::post('workflow/appointments/lookup', [ChatbotWorkflowController::class, 'lookupAppointments']);
    Route::post('workflow/inventory/search', [ChatbotWorkflowController::class, 'searchInventory']);
    // Hotel booking workflow routes
    Route::get('workflow/hotel-options', [ChatbotWorkflowController::class, 'hotelOptions']);
    Route::get('workflow/hotel/availability', [ChatbotWorkflowController::class, 'checkHotelAvailability']);
    Route::post('workflow/hotel-bookings', [ChatbotWorkflowController::class, 'createHotelBooking']);
});

Route::middleware(['auth.api', 'throttle:api', 'role:customer'])->prefix('customer')->group(function () {
    Route::get('overview', [PortalController::class, 'overview']);
    Route::get('dashboard', [PortalController::class, 'overview']);
    Route::get('pets', [PortalController::class, 'pets']);
    Route::post('pets', [PortalController::class, 'addPet']);
    Route::get('appointments', [PortalController::class, 'appointments']);
    Route::post('appointments', [PortalController::class, 'bookAppointment']);
    Route::get('boardings', [PortalController::class, 'boardings']);
    Route::post('boardings', [PortalController::class, 'bookBoarding']);
    Route::get('services', [PortalController::class, 'services']);
    Route::post('chatbot', [PortalController::class, 'chatbot']);
    
    // Customer Store Checkout
    Route::post('store/checkout', [CustomerStoreController::class, 'checkout']);
    Route::get('store/orders', [CustomerStoreController::class, 'orders']);
});

Route::middleware(['auth.api', 'throttle:api', 'role:cashier'])->prefix('cashier')->group(function () {
    Route::get('dashboard', [CashierDashboardController::class, 'overview']);
    Route::get('dashboard/overview', [CashierDashboardController::class, 'overviewWrapped']);
    Route::get('sales', [CashierDashboardController::class, 'sales']);
    Route::get('transactions', [CashierDashboardController::class, 'transactions']);
    Route::get('transactions/search', [CashierDashboardController::class, 'searchTransactions']);

    // Cashier Transaction Operations
    Route::post('refund', [CashierDashboardController::class, 'refund']);
    Route::post('multi-payment', [CashierDashboardController::class, 'multiPayment']);
    Route::post('apply-discount', [CashierDashboardController::class, 'applyDiscount']);
    Route::post('handover', [CashierDashboardController::class, 'handover']);
    Route::post('void', [CashierDashboardController::class, 'voidTransaction']);
    Route::get('receipt/{id}', [CashierDashboardController::class, 'generateReceipt']);

    // Payment Verification Routes
    Route::get('payment-requests', [CashierDashboardController::class, 'getPaymentRequests']);
    Route::put('payment-requests/{id}/verify', [CashierDashboardController::class, 'verifyPayment']);

    // Existing Payment Verification Routes
    Route::get('payments', [CashierPaymentController::class, 'index']);
    Route::put('payments/{payment}/verify', [CashierPaymentController::class, 'verify']);
    Route::put('payments/{payment}/reject', [CashierPaymentController::class, 'reject']);

    // POS Endpoints
    Route::post('pos/transaction', [POSController::class, 'processTransaction']);
    Route::get('pos/products', [POSController::class, 'getProducts']);
    Route::get('pos/services', [POSController::class, 'getServices']);
    Route::get('pos/transactions', [POSController::class, 'getTransactions']);
    Route::get('pos/transaction/{id}', [POSController::class, 'getTransaction']);
    Route::post('pos/transaction/{id}/void', [POSController::class, 'voidTransaction']);
    Route::get('pos/invoice/{id}', [POSController::class, 'downloadInvoice']);
});

Route::middleware(['auth.api', 'throttle:api', 'role:receptionist'])->prefix('receptionist')->group(function () {
    Route::get('dashboard', [ReceptionistDashboardController::class, 'overview']);
    Route::get('appointments', [ReceptionistDashboardController::class, 'appointments']);
    Route::get('customers', [ReceptionistDashboardController::class, 'customers']);

    // Customer Order Management
    Route::get('orders', [ReceptionistDashboardController::class, 'orders']);
    Route::put('orders/{id}/status', [ReceptionistDashboardController::class, 'updateOrderStatus']);

    // Appointment management
    Route::get('appointment/list', [AppointmentController::class, 'index']);
    Route::post('appointments', [AppointmentController::class, 'store']);
    Route::get('appointments/{id}', [AppointmentController::class, 'show']);
    Route::put('appointments/{id}', [AppointmentController::class, 'update']);
    Route::post('appointments/{id}/approve', [AppointmentController::class, 'approve']);
    Route::post('appointments/{id}/reject', [AppointmentController::class, 'reject']);
    Route::post('appointments/{id}/reschedule', [AppointmentController::class, 'reschedule']);
    Route::post('appointments/{id}/cancel', [AppointmentController::class, 'cancel']);
    Route::get('veterinarians/available', [AppointmentController::class, 'availableVeterinarians']);
    Route::get('veterinarians/{id}/schedule', [AppointmentController::class, 'veterinarianSchedule']);

    // Customer Profile Management
    Route::get('customers', [ReceptionistCustomerController::class, 'index']);
    Route::post('customers', [ReceptionistCustomerController::class, 'store']);

    // Pet Management
    Route::get('pets', [ReceptionistPetController::class, 'index']);
    Route::post('pets', [ReceptionistPetController::class, 'store']);

    // Service Request Management
    Route::get('requests', [ReceptionistRequestController::class, 'index']);
    Route::get('requests/pending', [ReceptionistRequestController::class, 'pending']);
    Route::post('requests', [ReceptionistRequestController::class, 'store']);
    Route::patch('requests/{id}/status', [ReceptionistRequestController::class, 'updateStatus']);
});

Route::middleware(['auth.api', 'throttle:api'])->get('inventory/items', [InventoryDashboardController::class, 'publicItems']);

Route::middleware(['auth.api', 'throttle:api', 'role:admin,inventory'])->prefix('inventory')->group(function () {
    Route::get('dashboard', [InventoryDashboardController::class, 'overview']);
    Route::get('dashboard/overview', [InventoryDashboardController::class, 'dashboardOverview']);
    Route::get('dashboard/low-stock', [InventoryDashboardController::class, 'lowStockDashboard']);
    Route::get('dashboard/recent-activity', [InventoryDashboardController::class, 'recentActivity']);
    Route::get('items', [InventoryDashboardController::class, 'items']);
    Route::get('items/{id}', [InventoryDashboardController::class, 'showItem']);
    Route::post('items', [InventoryDashboardController::class, 'storeItem']);
    Route::put('items/{id}', [InventoryDashboardController::class, 'updateItem']);
    Route::delete('items/{id}', [InventoryDashboardController::class, 'destroyItem']);
    Route::get('logs', [InventoryDashboardController::class, 'logs']);
});

Route::middleware(['auth.api', 'throttle:api', 'role:manager'])->prefix('manager')->group(function () {
    Route::get('dashboard', [ManagerDashboardController::class, 'overview']);
    Route::get('staff', [ManagerDashboardController::class, 'staff']);
});

// Attendance Routes (Admin and Manager)
Route::middleware(['auth.api', 'throttle:api', 'role:admin,manager'])->prefix('attendance')->group(function () {
    Route::get('/', [AttendanceController::class, 'index']);
    Route::post('/', [AttendanceController::class, 'store']);
    Route::get('/today', [AttendanceController::class, 'today']);
    Route::get('/statistics', [AttendanceController::class, 'statistics']);
    Route::get('/export', [AttendanceController::class, 'export']);
    Route::get('/{id}', [AttendanceController::class, 'show']);
    Route::put('/{id}', [AttendanceController::class, 'update']);
    Route::delete('/{id}', [AttendanceController::class, 'destroy']);
});

// Manager Attendance Records Routes (Simple attendance tracking)
Route::middleware(['auth.api', 'throttle:api', 'role:admin,manager'])->prefix('attendance-records')->group(function () {
    Route::get('/', [AttendanceRecordController::class, 'index']);
    Route::post('/', [AttendanceRecordController::class, 'store']);
    Route::get('/summary', [AttendanceRecordController::class, 'summary']);
});

// Payroll Routes (Admin and Manager)
Route::middleware(['auth.api', 'throttle:api', 'role:admin,manager'])->prefix('payroll')->group(function () {
    Route::get('/', [ApiPayrollController::class, 'index']);
    Route::post('/generate', [ApiPayrollController::class, 'generate']);
    Route::get('/{payroll}', [ApiPayrollController::class, 'show']);
    Route::patch('/{payroll}/approve', [ApiPayrollController::class, 'approve']);
    Route::patch('/{payroll}/paid', [ApiPayrollController::class, 'markAsPaid']);
    Route::delete('/{payroll}', [ApiPayrollController::class, 'destroy']);

    // Legacy routes using main controller
    Route::post('/', [PayrollController::class, 'store']);
    Route::put('/{id}', [PayrollController::class, 'update']);
    Route::get('/summary', [PayrollController::class, 'summary']);
    Route::post('/{id}/process', [PayrollController::class, 'processPayment']);
    Route::get('/{id}/payslip', [PayrollController::class, 'payslip']);
});

// Role-based Notifications API Routes
Route::middleware(['auth.api', 'throttle:api'])->prefix('notifications')->group(function () {
    Route::get('/', [ApiNotificationController::class, 'index']);
    Route::patch('/{notification}/read', [ApiNotificationController::class, 'markAsRead']);
    Route::patch('/read-all', [ApiNotificationController::class, 'markAllAsRead']);
});

// Employee self-service routes
Route::middleware(['auth.api', 'throttle:api'])->group(function () {
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);
    Route::get('/my-payroll', [PayrollController::class, 'myPayroll']);
});

Route::middleware(['auth.api', 'throttle:api', 'role:veterinary'])->prefix('veterinary')->group(function () {
    Route::get('dashboard', [VeterinaryDashboardController::class, 'overview']);
    Route::get('appointments', [VeterinaryDashboardController::class, 'appointments']);
    Route::get('appointments/{id}', [VeterinaryDashboardController::class, 'appointment']);
    Route::get('patients', [VeterinaryDashboardController::class, 'patients']);
    Route::get('history', [VeterinaryDashboardController::class, 'history']);
    Route::get('reports', [VeterinaryDashboardController::class, 'reports']);
    Route::get('receipt/{id}', [VeterinaryDashboardController::class, 'receipt']);
    
    // Veterinarian appointment actions
    Route::post('appointments/{id}/complete', [AppointmentController::class, 'complete']);
    
    // Medical Records Management
    Route::get('medical-records', [MedicalRecordController::class, 'index']);
    Route::post('medical-records', [MedicalRecordController::class, 'store']);
    Route::get('medical-records/{id}', [MedicalRecordController::class, 'show']);
    Route::put('medical-records/{id}', [MedicalRecordController::class, 'update']);
    Route::delete('medical-records/{id}', [MedicalRecordController::class, 'destroy']);
    Route::post('medical-records/{id}/lock', [MedicalRecordController::class, 'lock']);
    
    // Pet-specific medical data
    Route::get('pets/{petId}/medical-records', [MedicalRecordController::class, 'forPet']);
    Route::get('pets/{petId}/vaccinations', [MedicalRecordController::class, 'petVaccinations']);
    Route::post('pets/{petId}/vaccinations', [MedicalRecordController::class, 'createVaccination']);
});

// Public Inventory Read Routes (available to all authenticated users for store/pos)
Route::middleware(['auth.api', 'throttle:api'])->prefix('inventory')->group(function () {
    Route::get('/public/items', [InventoryDashboardController::class, 'publicItems']);
    Route::get('/public/categories', [InventoryDashboardController::class, 'categories']);
    Route::get('/public/item/{id}', [InventoryDashboardController::class, 'showPublicItem']);
    Route::get('/sellable', [InventoryController::class, 'sellable']); // For POS and Customer Store
});

// Product Search Routes (for Cashier POS)
Route::middleware(['auth.api', 'throttle:api'])->prefix('products')->group(function () {
    Route::get('/search', [InventoryDashboardController::class, 'searchProducts']);
    Route::get('/barcode/{barcode}', [InventoryDashboardController::class, 'lookupBarcode']);
});

// Gift Card Routes (for Cashier POS)
Route::middleware(['auth.api', 'throttle:api'])->prefix('gift-cards')->group(function () {
    Route::get('/{number}/balance', [GiftCardController::class, 'checkBalance']);
});

// Notification Routes (available to all authenticated users)
Route::middleware(['auth.api', 'throttle:api'])->prefix('notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::get('/unread', [NotificationController::class, 'getUnread']);
    Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::post('/clear-all', [NotificationController::class, 'clearAll']);
    Route::delete('/{id}', [NotificationController::class, 'destroy']);
});

Route::middleware(['auth.api', 'throttle:api', 'role:admin'])->prefix('notifications')->group(function () {
    Route::post('/', [NotificationController::class, 'store']);
});

// Hotel Room Management Routes (Admin/Manager/Receptionist)
Route::middleware(['auth.api', 'throttle:api', 'role:admin,manager,receptionist'])->prefix('hotel-rooms')->group(function () {
    Route::get('/', [HotelRoomController::class, 'index']);
    Route::post('/', [HotelRoomController::class, 'store']);
    Route::get('/{id}', [HotelRoomController::class, 'show']);
    Route::put('/{id}', [HotelRoomController::class, 'update']);
    Route::delete('/{id}', [HotelRoomController::class, 'destroy']);
    Route::post('/{id}/status', [HotelRoomController::class, 'setStatus']);
});

// Boarding/Hotel Reservation Routes (Receptionist, Admin, Manager)
Route::middleware(['auth.api', 'throttle:api', 'role:receptionist,admin,manager'])->prefix('boardings')->group(function () {
    Route::get('/', [BoardingController::class, 'index']);
    Route::post('/', [BoardingController::class, 'store']);
    Route::get('/available-rooms', [BoardingController::class, 'availableRooms']);
    Route::get('/current-boarders', [BoardingController::class, 'currentBoarders']);
    Route::get('/today-activity', [BoardingController::class, 'todayActivity']);
    Route::get('/occupancy-stats', [BoardingController::class, 'occupancyStats']);
    Route::get('/{id}', [BoardingController::class, 'show']);
    Route::put('/{id}', [BoardingController::class, 'update']);
    Route::delete('/{id}', [BoardingController::class, 'destroy']);
    Route::post('/{id}/confirm', [BoardingController::class, 'confirm']);
    Route::post('/{id}/reject', [BoardingController::class, 'reject']);
    Route::post('/{id}/check-in', [BoardingController::class, 'checkIn']);
    Route::post('/{id}/check-out', [BoardingController::class, 'checkOut']);
    Route::post('/{id}/cancel', [BoardingController::class, 'cancel']);
    Route::post('/{id}/pay', [BoardingController::class, 'markAsPaid']);
    Route::post('/{boarding}/payment', [PaymentController::class, 'storeBoardingPayment']);
});

// Customer Boarding Routes (View own reservations, create new)
Route::middleware(['auth.api', 'throttle:api', 'role:customer'])->prefix('customer/boardings')->group(function () {
    Route::get('/', [BoardingController::class, 'index']);
    Route::post('/', [BoardingController::class, 'store']);
    Route::get('/available-rooms', [BoardingController::class, 'availableRooms']);
    Route::get('/{id}', [BoardingController::class, 'show']);
    Route::post('/{id}/cancel', [BoardingController::class, 'cancel']);
});

// Vet Boarding Routes (View current boarders for emergency access)
Route::middleware(['auth.api', 'throttle:api', 'role:veterinary'])->prefix('veterinary/boardings')->group(function () {
    Route::get('/current-boarders', [BoardingController::class, 'currentBoarders']);
    Route::get('/{id}', [BoardingController::class, 'show']);
});

// Grooming Appointment Routes (Receptionist, Admin, Manager)
Route::middleware(['auth.api', 'throttle:api', 'role:receptionist,admin,manager'])->prefix('grooming')->group(function () {
    Route::get('/', [ApiGroomingController::class, 'index']);
    Route::post('/', [ApiGroomingController::class, 'store']);
    Route::put('/{grooming}/status', [ApiGroomingController::class, 'updateStatus']);
});

// Customer Grooming Routes (View own appointments, create new)
Route::middleware(['auth.api', 'throttle:api', 'role:customer'])->prefix('customer/grooming')->group(function () {
    Route::get('/', [GroomingController::class, 'index']);
    Route::post('/', [GroomingController::class, 'store']);
    Route::get('/{id}', [GroomingController::class, 'show']);
});

// Vet Appointment Routes (Receptionist, Admin, Manager)
Route::middleware(['auth.api', 'throttle:api', 'role:receptionist,admin,manager'])->prefix('vet')->group(function () {
    Route::get('/', [VetController::class, 'index']);
    Route::post('/', [VetController::class, 'store']);
    Route::get('/{id}', [VetController::class, 'show']);
    Route::patch('/{id}/status', [VetController::class, 'updateStatus']);
    Route::delete('/{id}', [VetController::class, 'destroy']);
});

// Customer Vet Routes (View own appointments, create new)
Route::middleware(['auth.api', 'throttle:api', 'role:customer'])->prefix('customer/vet')->group(function () {
    Route::get('/', [VetController::class, 'index']);
    Route::post('/', [VetController::class, 'store']);
    Route::get('/{id}', [VetController::class, 'show']);
});

// Pets Routes (Receptionist, Admin, Manager, Customer)
Route::middleware(['auth.api', 'throttle:api', 'role:receptionist,admin,manager,customer'])->prefix('pets')->group(function () {
    Route::get('/', [PetController::class, 'index']);
    Route::post('/', [PetController::class, 'store']);
    Route::get('/{id}', [PetController::class, 'show']);
    Route::put('/{id}', [PetController::class, 'update']);
    Route::delete('/{id}', [PetController::class, 'destroy']);
});

// Legacy Route Aliases (for backward compatibility with tests)
Route::middleware(['auth.api', 'throttle:api'])->group(function () {
    // Legacy appointments endpoint (alias to receptionist appointments)
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
});

// Telegram Bot Webhook (public - receives updates from Telegram, rate limited)
Route::middleware('throttle:60,1')->post('/telegram/webhook', [TelegramBotController::class, 'webhook']);

// Telegram Admin Routes (setup webhooks)
Route::middleware(['auth.api', 'throttle:api', 'role:admin'])->prefix('admin/telegram')->group(function () {
    Route::post('/set-webhook', [TelegramBotController::class, 'setWebhook']);
    Route::post('/remove-webhook', [TelegramBotController::class, 'removeWebhook']);
    Route::get('/webhook-info', [TelegramBotController::class, 'getWebhookInfo']);
});
