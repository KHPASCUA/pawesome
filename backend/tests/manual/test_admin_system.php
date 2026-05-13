<?php

require_once 'backend/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== ADMIN E2E TEST SETUP ===\n";

// Check Admin users
echo "\n1. Checking Admin Users:\n";
$adminUsers = DB::table('users')->where('role', 'admin')->get(['id', 'email', 'name']);
foreach ($adminUsers as $user) {
    echo "ID: {$user->id}, Email: {$user->email}, Name: {$user->name}\n";
}

// Check all users for user management
echo "\n2. Checking All Users for Management:\n";
$totalUsers = DB::table('users')->count();
echo "Total Users: {$totalUsers}\n";

$usersByRole = DB::table('users')
    ->select('role', DB::raw('count(*) as count'))
    ->groupBy('role')
    ->get();

echo "Users by Role:\n";
foreach ($usersByRole as $role) {
    echo "- {$role->role}: {$role->count}\n";
}

// Check system data for admin reports
echo "\n3. Checking System Data for Admin Reports:\n";

// Transaction data
$totalTransactions = DB::table('customer_orders')->count();
$totalRevenue = DB::table('customer_orders')->sum('total_amount');
echo "Total Transactions: {$totalTransactions}\n";
echo "Total Revenue: {$totalRevenue}\n";

// Inventory data
$totalInventory = DB::table('inventory_items')->count();
$totalStockValue = DB::table('inventory_items')->sum(DB::raw('stock * price'));
echo "Total Inventory Items: {$totalInventory}\n";
echo "Total Stock Value: {$totalStockValue}\n";

// Staff data
$totalStaff = DB::table('users')->whereIn('role', ['cashier', 'receptionist', 'veterinary', 'manager'])->count();
echo "Total Staff Members: {$totalStaff}\n";

// Check system settings
echo "\n4. Checking System Settings:\n";
$systemSettings = [
    'app_name' => 'Pawesome Pet Management System',
    'timezone' => 'Asia/Manila',
    'currency' => 'PHP',
    'date_format' => 'Y-m-d'
];

foreach ($systemSettings as $key => $value) {
    echo "{$key}: {$value}\n";
}

// Check recent activity
echo "\n5. Checking Recent System Activity:\n";
$recentOrders = DB::table('customer_orders')
    ->orderBy('created_at', 'desc')
    ->limit(3)
    ->get(['id', 'total_amount', 'status', 'created_at']);

echo "Recent Orders:\n";
foreach ($recentOrders as $order) {
    echo "- Order {$order->id}: {$order->total_amount} ({$order->status}) at {$order->created_at}\n";
}

$recentInventoryLogs = DB::table('inventory_logs')
    ->orderBy('created_at', 'desc')
    ->limit(3)
    ->get(['id', 'movement_type', 'quantity', 'stock_after', 'created_at']);

echo "Recent Inventory Activity:\n";
foreach ($recentInventoryLogs as $log) {
    echo "- Log {$log->id}: {$log->movement_type} (Qty: {$log->quantity}, Stock After: {$log->stock_after}) at {$log->created_at}\n";
}

echo "\n=== ADMIN E2E SETUP COMPLETE ===\n";
