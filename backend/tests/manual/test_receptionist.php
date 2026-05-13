<?php

require_once 'backend/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== RECEPTIONIST E2E TEST PREPARATION ===\n";

// Check receptionist users
echo "\n1. Checking Receptionist Users:\n";
$receptionistUsers = DB::table('users')->where('role', 'receptionist')->get(['id', 'email', 'name']);
foreach ($receptionistUsers as $user) {
    echo "ID: {$user->id}, Email: {$user->email}, Name: {$user->name}\n";
}

// Check pending service requests
echo "\n2. Checking Pending Service Requests:\n";
$pendingRequests = DB::table('service_requests')
    ->where('status', 'pending')
    ->limit(5)
    ->get(['id', 'customer_id', 'pet_id', 'service_type', 'status', 'created_at']);

foreach ($pendingRequests as $request) {
    echo "ID: {$request->id}, Type: {$request->service_type}, Status: {$request->status}, Created: {$request->created_at}\n";
}

// Check inventory items for testing
echo "\n3. Checking Test Inventory Items:\n";
$testItems = DB::table('inventory_items')
    ->where('name', 'like', '%E2E%')
    ->orWhere('name', 'like', '%Test%')
    ->get(['id', 'name', 'category', 'stock']);

foreach ($testItems as $item) {
    echo "ID: {$item->id}, Name: {$item->name}, Category: {$item->category}, Stock: {$item->stock}\n";
}

// Check existing service_item_usages
echo "\n4. Existing Service Item Usages:\n";
$existingUsages = DB::table('service_item_usages')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['id', 'service_type', 'service_id', 'inventory_item_id', 'quantity_used', 'created_at']);

foreach ($existingUsages as $usage) {
    echo "ID: {$usage->id}, Service Type: {$usage->service_type}, Item ID: {$usage->inventory_item_id}, Quantity: {$usage->quantity_used}, Created: {$usage->created_at}\n";
}

// Check existing inventory_logs
echo "\n5. Recent Inventory Logs:\n";
$recentLogs = DB::table('inventory_logs')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['id', 'inventory_item_id', 'movement_type', 'quantity', 'stock_after', 'created_at']);

foreach ($recentLogs as $log) {
    echo "ID: {$log->id}, Item ID: {$log->inventory_item_id}, Movement: {$log->movement_type}, Quantity: {$log->quantity}, Stock After: {$log->stock_after}, Created: {$log->created_at}\n";
}

echo "\n=== END PREPARATION ===\n";
