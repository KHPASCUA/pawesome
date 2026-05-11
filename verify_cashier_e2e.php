<?php

require_once 'backend/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CASHIER E2E TEST RESULTS VERIFICATION ===\n";

// Check cashier users
echo "\n1. Cashier Users:\n";
$cashierUsers = DB::table('users')->where('role', 'cashier')->get(['id', 'email', 'name']);
foreach ($cashierUsers as $user) {
    echo "ID: {$user->id}, Email: {$user->email}, Name: {$user->name}\n";
}

// Check E2E POS Test Product
echo "\n2. E2E POS Test Product Status:\n";
$e2eProduct = DB::table('inventory_items')->where('name', 'E2E POS Test Product')->first();
if ($e2eProduct) {
    echo "E2E POS Test Product - ID: {$e2eProduct->id}, Stock: {$e2eProduct->stock}, Price: {$e2eProduct->price}, Sellable: " . ($e2eProduct->is_sellable ? 'Yes' : 'No') . "\n";
} else {
    echo "E2E POS Test Product not found\n";
}

// Check recent POS inventory usage
echo "\n3. Recent POS Inventory Usage:\n";
$recentPosUsage = DB::table('service_item_usages')
    ->where('service_type', 'pos')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['id', 'service_id', 'inventory_item_id', 'quantity_used', 'notes', 'created_at']);

foreach ($recentPosUsage as $usage) {
    echo "ID: {$usage->id}, Service ID: {$usage->service_id}, Item ID: {$usage->inventory_item_id}, Quantity: {$usage->quantity_used}, Notes: {$usage->notes}, Created: {$usage->created_at}\n";
}

// Check recent POS inventory logs
echo "\n4. Recent POS Inventory Logs:\n";
$recentPosLogs = DB::table('inventory_logs')
    ->where('movement_type', 'pos_sale')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['id', 'inventory_item_id', 'quantity', 'stock_after', 'reference_id', 'reference_type', 'created_at']);

foreach ($recentPosLogs as $log) {
    $movementType = $log->movement_type ?? 'unknown';
    echo "ID: {$log->id}, Item ID: {$log->inventory_item_id}, Movement: {$movementType}, Quantity: {$log->quantity}, Stock After: {$log->stock_after}, Ref: {$log->reference_type}:{$log->reference_id}, Created: {$log->created_at}\n";
}

// Check customer orders
echo "\n5. Recent Customer Orders:\n";
$recentOrders = DB::table('customer_orders')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['id', 'customer_id', 'total_amount', 'status', 'payment_status', 'created_at']);

foreach ($recentOrders as $order) {
    echo "ID: {$order->id}, Customer: {$order->customer_id}, Total: {$order->total_amount}, Status: {$order->status}, Payment: {$order->payment_status}, Created: {$order->created_at}\n";
}

// Check customer order items
echo "\n6. Recent Customer Order Items:\n";
$recentOrderItems = DB::table('customer_order_items')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['id', 'customer_order_id', 'inventory_item_id', 'quantity', 'price', 'created_at']);

foreach ($recentOrderItems as $item) {
    echo "ID: {$item->id}, Order ID: {$item->customer_order_id}, Item ID: {$item->inventory_item_id}, Quantity: {$item->quantity}, Price: {$item->price}, Created: {$item->created_at}\n";
}

// Movement Type Verification
echo "\n7. MOVEMENT TYPE VERIFICATION:\n";
echo "Source | Expected | Actual | Result\n";
echo "-------|----------|--------|-------\n";

// Check POS usage
$posUsage = DB::table('inventory_logs')
    ->where('movement_type', 'pos_sale')
    ->orderBy('created_at', 'desc')
    ->first();

if ($posUsage) {
    echo "POS | pos_sale | pos_sale | PASS\n";
} else {
    echo "POS | pos_sale | None | FAIL\n";
}

// Check other movement types
$boardingUsage = DB::table('inventory_logs')
    ->where('movement_type', 'boarding_food_usage')
    ->orderBy('created_at', 'desc')
    ->first();

$groomingUsage = DB::table('inventory_logs')
    ->where('movement_type', 'grooming_usage')
    ->orderBy('created_at', 'desc')
    ->first();

$vetUsage = DB::table('inventory_logs')
    ->where('movement_type', 'vet_usage')
    ->orderBy('created_at', 'desc')
    ->first();

echo "Boarding | boarding_food_usage | " . ($boardingUsage ? "boarding_food_usage" : "None") . " | " . ($boardingUsage ? "PASS" : "FAIL") . "\n";
echo "Grooming | grooming_usage | " . ($groomingUsage ? "grooming_usage" : "None") . " | " . ($groomingUsage ? "PASS" : "FAIL") . "\n";
echo "Veterinary | vet_usage | " . ($vetUsage ? "vet_usage" : "None") . " | " . ($vetUsage ? "PASS" : "FAIL") . "\n";

echo "\n=== CASHIER E2E VERIFICATION COMPLETE ===\n";
