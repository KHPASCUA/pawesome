<?php

require_once 'backend/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CASHIER E2E TEST SYSTEM PREPARATION ===\n";

// Check cashier users
echo "\n1. Checking Cashier Users:\n";
$cashierUsers = DB::table('users')->where('role', 'cashier')->get(['id', 'email', 'name']);
foreach ($cashierUsers as $user) {
    echo "ID: {$user->id}, Email: {$user->email}, Name: {$user->name}\n";
}

// Check sellable inventory items for POS
echo "\n2. Checking Sellable Inventory Items:\n";
$sellableItems = DB::table('inventory_items')
    ->where('is_sellable', 1)
    ->where('stock', '>', 0)
    ->limit(10)
    ->get(['id', 'name', 'category', 'stock', 'price']);

foreach ($sellableItems as $item) {
    echo "ID: {$item->id}, Name: {$item->name}, Category: {$item->category}, Stock: {$item->stock}, Price: {$item->price}\n";
}

// Create E2E POS Test Product
echo "\n3. Creating E2E POS Test Product:\n";
$e2eProduct = DB::table('inventory_items')->where('name', 'E2E POS Test Product')->first();
if (!$e2eProduct) {
    $e2eProductId = DB::table('inventory_items')->insertGetId([
        'name' => 'E2E POS Test Product',
        'sku' => 'E2E-POS-PRODUCT',
        'category' => 'Accessories',
        'stock' => 20,
        'price' => 99.99,
        'is_sellable' => 1,
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "Created E2E POS Test Product with ID: $e2eProductId\n";
} else {
    echo "E2E POS Test Product already exists with ID: {$e2eProduct->id}, Stock: {$e2eProduct->stock}\n";
}

// Check existing customer orders
echo "\n4. Checking Customer Orders:\n";
$customerOrders = DB::table('customer_orders')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['id', 'customer_id', 'total_amount', 'status', 'payment_status', 'created_at']);

foreach ($customerOrders as $order) {
    echo "ID: {$order->id}, Customer: {$order->customer_id}, Total: {$order->total_amount}, Status: {$order->status}, Payment: {$order->payment_status}, Created: {$order->created_at}\n";
}

// Check existing POS inventory usage
echo "\n5. Recent POS Inventory Usage:\n";
$posUsage = DB::table('service_item_usages')
    ->where('service_type', 'pos')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['id', 'service_id', 'inventory_item_id', 'quantity_used', 'notes', 'created_at']);

foreach ($posUsage as $usage) {
    echo "ID: {$usage->id}, Service ID: {$usage->service_id}, Item ID: {$usage->inventory_item_id}, Quantity: {$usage->quantity_used}, Notes: {$usage->notes}, Created: {$usage->created_at}\n";
}

// Check recent POS inventory logs
echo "\n6. Recent POS Inventory Logs:\n";
$posLogs = DB::table('inventory_logs')
    ->where('movement_type', 'pos_sale')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['id', 'inventory_item_id', 'quantity', 'stock_after', 'reference_id', 'reference_type', 'created_at']);

foreach ($posLogs as $log) {
    $movementType = $log->movement_type ?? 'unknown';
    echo "ID: {$log->id}, Item ID: {$log->inventory_item_id}, Movement: {$movementType}, Quantity: {$log->quantity}, Stock After: {$log->stock_after}, Ref: {$log->reference_type}:{$log->reference_id}, Created: {$log->created_at}\n";
}

echo "\n=== CASHIER SYSTEM READY FOR E2E TESTING ===\n";
