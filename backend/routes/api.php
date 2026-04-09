<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CustomersController;
use App\Http\Controllers\Admin\ChatbotController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\Customer\PortalController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Cashier\DashboardController as CashierDashboardController;
use App\Http\Controllers\Receptionist\DashboardController as ReceptionistDashboardController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::put('profile', [AuthController::class, 'updateProfile']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::prefix('admin')->group(function () {
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

    Route::get('reports/summary', [ReportsController::class, 'summary']);
});

Route::middleware('auth:api')->prefix('customer')->group(function () {
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

Route::prefix('cashier')->group(function () {
    Route::get('dashboard', [CashierDashboardController::class, 'overview']);
    Route::get('sales', [CashierDashboardController::class, 'sales']);
    Route::get('transactions', [CashierDashboardController::class, 'transactions']);
});

Route::prefix('receptionist')->group(function () {
    Route::get('dashboard', [ReceptionistDashboardController::class, 'overview']);
    Route::get('appointments', [ReceptionistDashboardController::class, 'appointments']);
    Route::get('customers', [ReceptionistDashboardController::class, 'customers']);
});
