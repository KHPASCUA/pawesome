<?php

require_once 'backend/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== MANAGER E2E TEST SETUP ===\n";

// A. Manager Authentication Test
echo "\n=== A. MANAGER AUTHENTICATION TEST ===\n";
$managerUsers = DB::table('users')->where('role', 'manager')->get(['id', 'email', 'name']);
echo "Manager Users Found: " . $managerUsers->count() . "\n";
foreach ($managerUsers as $user) {
    echo "ID: {$user->id}, Email: {$user->email}, Name: {$user->name}\n";
}

// B. Staff Data for Manager Reports
echo "\n=== B. STAFF DATA FOR MANAGER REPORTS ===\n";
$totalStaff = DB::table('users')->whereIn('role', ['cashier', 'receptionist', 'veterinary', 'manager'])->count();
echo "Total Staff Members: {$totalStaff}\n";

$staffByRole = DB::table('users')
    ->whereIn('role', ['cashier', 'receptionist', 'veterinary', 'manager'])
    ->select('role', DB::raw('count(*) as count'))
    ->groupBy('role')
    ->get();

echo "Staff by Role:\n";
foreach ($staffByRole as $role) {
    echo "- {$role->role}: {$role->count}\n";
}

// C. Recent POS Sales for Manager Reports
echo "\n=== C. RECENT POS SALES FOR MANAGER REPORTS ===\n";
$recentPosSales = DB::table('customer_orders')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['id', 'total_amount', 'status', 'payment_status', 'created_at']);

echo "Recent POS Sales:\n";
foreach ($recentPosSales as $sale) {
    echo "- Order ID: {$sale->id}, Total: {$sale->total_amount}, Status: {$sale->status}, Payment: {$sale->payment_status}, Created: {$sale->created_at}\n";
}

// D. Service Data for Manager Reports
echo "\n=== D. SERVICE DATA FOR MANAGER REPORTS ===\n";

// Veterinary Appointments
$vetAppointments = DB::table('vet_appointments')
    ->orderBy('created_at', 'desc')
    ->limit(3)
    ->get(['id', 'pet_id', 'pet_name', 'service', 'appointment_date', 'status']);

echo "Recent Veterinary Appointments:\n";
foreach ($vetAppointments as $appointment) {
    echo "- ID: {$appointment->id}, Pet: {$appointment->pet_id}, Pet Name: {$appointment->pet_name}, Service: {$appointment->service}, Date: {$appointment->appointment_date}, Status: {$appointment->status}\n";
}

// Grooming Appointments
$groomingAppointments = DB::table('grooming_appointments')
    ->orderBy('created_at', 'desc')
    ->limit(3)
    ->get(['id', 'pet_id', 'appointment_date', 'status']);

echo "Recent Grooming Appointments:\n";
foreach ($groomingAppointments as $appointment) {
    echo "- ID: {$appointment->id}, Pet: {$appointment->pet_id}, Date: {$appointment->appointment_date}, Status: {$appointment->status}\n";
}

// Boarding Requests
$boardingRequests = DB::table('boardings')
    ->orderBy('created_at', 'desc')
    ->limit(3)
    ->get(['id', 'pet_id', 'check_in', 'check_out', 'status']);

echo "Recent Boarding Requests:\n";
foreach ($boardingRequests as $request) {
    echo "- ID: {$request->id}, Pet: {$request->pet_id}, Check-in: {$request->check_in}, Check-out: {$request->check_out}, Status: {$request->status}\n";
}

// E. Inventory Data for Manager Reports
echo "\n=== E. INVENTORY DATA FOR MANAGER REPORTS ===\n";
$inventorySummary = DB::table('inventory_items')
    ->select(
        'category',
        DB::raw('COUNT(*) as total_items'),
        DB::raw('SUM(stock) as total_stock'),
        DB::raw('SUM(CASE WHEN stock <= 5 AND stock > 0 THEN 1 ELSE 0 END) as low_stock_count'),
        DB::raw('SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END) as out_of_stock_count')
    )
    ->groupBy('category')
    ->get();

echo "Inventory Summary by Category:\n";
foreach ($inventorySummary as $summary) {
    echo "- {$summary->category}: {$summary->total_items} items, Total Stock: {$summary->total_stock}, Low Stock: {$summary->low_stock_count}, Out of Stock: {$summary->out_of_stock_count}\n";
}

// F. Movement Logs for Manager Reports
echo "\n=== F. MOVEMENT LOGS FOR MANAGER REPORTS ===\n";
$movementLogs = DB::table('inventory_logs')
    ->select(
        'movement_type',
        DB::raw('COUNT(*) as count'),
        DB::raw('SUM(quantity) as total_quantity')
    )
    ->groupBy('movement_type')
    ->get();

echo "Movement Logs by Type:\n";
foreach ($movementLogs as $log) {
    echo "- {$log->movement_type}: {$log->count} movements, Total Quantity: {$log->total_quantity}\n";
}

echo "\n=== MANAGER E2E SETUP COMPLETE ===\n";
echo "Ready for browser-based testing with:\n";
echo "- Manager users: " . $managerUsers->count() . " available\n";
echo "- Staff data: {$totalStaff} staff members across 4 roles\n";
echo "- POS sales data: " . $recentPosSales->count() . " recent transactions\n";
echo "- Service data: Veterinary, Grooming, and Boarding appointments available\n";
echo "- Inventory data: Category summaries and movement logs available\n";
