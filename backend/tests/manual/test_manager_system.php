<?php

require_once 'backend/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== MANAGER E2E TEST SETUP ===\n";

// Check Manager users
echo "\n1. Checking Manager Users:\n";
$managerUsers = DB::table('users')->where('role', 'manager')->get(['id', 'email', 'name']);
foreach ($managerUsers as $user) {
    echo "ID: {$user->id}, Email: {$user->email}, Name: {$user->name}\n";
}

// Check staff data for management
echo "\n2. Checking Staff Data:\n";
$staffCount = DB::table('users')->whereIn('role', ['cashier', 'receptionist', 'veterinary', 'manager'])->count();
echo "Total Staff Members: {$staffCount}\n";

$staffByRole = DB::table('users')
    ->whereIn('role', ['cashier', 'receptionist', 'veterinary', 'manager'])
    ->select('role', DB::raw('count(*) as count'))
    ->groupBy('role')
    ->get();

foreach ($staffByRole as $role) {
    echo "{$role->role}: {$role->count}\n";
}

// Check attendance records
echo "\n3. Checking Attendance Records:\n";
$attendanceCount = DB::table('attendance_records')->count();
echo "Total Attendance Records: {$attendanceCount}\n";

$recentAttendance = DB::table('attendance_records')
    ->orderBy('created_at', 'desc')
    ->limit(3)
    ->get(['id', 'staff_id', 'name', 'date', 'status']);

foreach ($recentAttendance as $attendance) {
    echo "ID: {$attendance->id}, Staff: {$attendance->staff_id}, Name: {$attendance->name}, Date: {$attendance->date}, Status: {$attendance->status}\n";
}

// Check payroll data
echo "\n4. Checking Payroll Data:\n";
$payrollCount = DB::table('payrolls')->count();
echo "Total Payroll Records: {$payrollCount}\n";

// Check recent transactions for reports
echo "\n5. Checking Transaction Data for Reports:\n";
$recentTransactions = DB::table('customer_orders')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['id', 'total_amount', 'status', 'payment_status', 'created_at']);

foreach ($recentTransactions as $transaction) {
    echo "Order ID: {$transaction->id}, Total: {$transaction->total_amount}, Status: {$transaction->status}, Created: {$transaction->created_at}\n";
}

// Check inventory data for reports
echo "\n6. Checking Inventory Data for Reports:\n";
$inventoryCount = DB::table('inventory_items')->count();
echo "Total Inventory Items: {$inventoryCount}\n";

$lowStockItems = DB::table('inventory_items')
    ->where('stock', '<=', 5)
    ->where('stock', '>', 0)
    ->count();
echo "Low Stock Items (<=5): {$lowStockItems}\n";

$outOfStockItems = DB::table('inventory_items')
    ->where('stock', '<=', 0)
    ->count();
echo "Out of Stock Items: {$outOfStockItems}\n";

echo "\n=== MANAGER E2E SETUP COMPLETE ===\n";
