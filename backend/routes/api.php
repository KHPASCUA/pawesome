<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CustomersController;
use App\Http\Controllers\Admin\ChatbotController;
use App\Http\Controllers\Admin\ChatbotFaqController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\ChatbotController as SharedChatbotController;
use App\Http\Controllers\ChatbotWorkflowController;
use App\Http\Controllers\Customer\PortalController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Cashier\DashboardController as CashierDashboardController;
use App\Http\Controllers\Inventory\DashboardController as InventoryDashboardController;
use App\Http\Controllers\Manager\DashboardController as ManagerDashboardController;
use App\Http\Controllers\Receptionist\DashboardController as ReceptionistDashboardController;
use App\Http\Controllers\Veterinary\DashboardController as VeterinaryDashboardController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::get('me', [AuthController::class, 'me']);
    
    Route::middleware('auth:api')->group(function () {
        Route::put('profile', [AuthController::class, 'updateProfile']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::middleware(['auth:api', 'role:admin'])->prefix('admin')->group(function () {
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

    Route::get('inventory', [InventoryController::class, 'index']);
    Route::post('inventory', [InventoryController::class, 'store']);
    Route::put('inventory/{id}', [InventoryController::class, 'update']);
    Route::delete('inventory/{id}', [InventoryController::class, 'destroy']);

    Route::get('customers', [CustomersController::class, 'index']);
    Route::put('customers/{id}', [CustomersController::class, 'update']);

    Route::get('chatbot/logs', [ChatbotController::class, 'index']);
    Route::get('chatbot/logs/user/{user}', [ChatbotController::class, 'userHistory']);
    Route::get('chatbot/faqs', [ChatbotFaqController::class, 'index']);
    Route::post('chatbot/faqs', [ChatbotFaqController::class, 'store']);
    Route::put('chatbot/faqs/{faq}', [ChatbotFaqController::class, 'update']);
    Route::delete('chatbot/faqs/{faq}', [ChatbotFaqController::class, 'destroy']);

    Route::get('reports/summary', [ReportsController::class, 'summary']);
});

Route::middleware(['auth:api'])->prefix('chatbot')->group(function () {
    Route::get('welcome', [SharedChatbotController::class, 'welcome']);
    Route::post('message', [SharedChatbotController::class, 'message']);
    Route::get('workflow/booking-options', [ChatbotWorkflowController::class, 'bookingOptions']);
    Route::post('workflow/bookings', [ChatbotWorkflowController::class, 'createBooking']);
    Route::post('workflow/appointments/lookup', [ChatbotWorkflowController::class, 'lookupAppointments']);
    Route::post('workflow/inventory/search', [ChatbotWorkflowController::class, 'searchInventory']);
});

Route::middleware(['auth:api', 'role:customer'])->prefix('customer')->group(function () {
    Route::get('overview', [PortalController::class, 'overview']);
    Route::get('pets', [PortalController::class, 'pets']);
    Route::post('pets', [PortalController::class, 'addPet']);
    Route::get('appointments', [PortalController::class, 'appointments']);
    Route::post('appointments', [PortalController::class, 'bookAppointment']);
    Route::get('boardings', [PortalController::class, 'boardings']);
    Route::post('boardings', [PortalController::class, 'bookBoarding']);
    Route::get('services', [PortalController::class, 'services']);
    Route::post('chatbot', [PortalController::class, 'chatbot']);
});

Route::middleware(['auth:api', 'role:cashier'])->prefix('cashier')->group(function () {
    Route::get('dashboard', [CashierDashboardController::class, 'overview']);
    Route::get('sales', [CashierDashboardController::class, 'sales']);
    Route::get('transactions', [CashierDashboardController::class, 'transactions']);
});

Route::middleware(['auth:api', 'role:receptionist'])->prefix('receptionist')->group(function () {
    Route::get('dashboard', [ReceptionistDashboardController::class, 'overview']);
    Route::get('appointments', [ReceptionistDashboardController::class, 'appointments']);
    Route::get('customers', [ReceptionistDashboardController::class, 'customers']);
});

Route::middleware(['auth:api', 'role:inventory'])->prefix('inventory')->group(function () {
    Route::get('dashboard', [InventoryDashboardController::class, 'overview']);
    Route::get('items', [InventoryDashboardController::class, 'items']);
    Route::get('logs', [InventoryDashboardController::class, 'logs']);
});

Route::middleware(['auth:api', 'role:manager'])->prefix('manager')->group(function () {
    Route::get('dashboard', [ManagerDashboardController::class, 'overview']);
    Route::get('staff', [ManagerDashboardController::class, 'staff']);
});

Route::middleware(['auth:api', 'role:veterinary'])->prefix('veterinary')->group(function () {
    Route::get('dashboard', [VeterinaryDashboardController::class, 'overview']);
    Route::get('appointments', [VeterinaryDashboardController::class, 'appointments']);
    Route::get('patients', [VeterinaryDashboardController::class, 'patients']);
});
