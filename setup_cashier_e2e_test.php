<?php

require_once 'backend/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CASHIER E2E TEST SETUP ===\n";

// Check cashier users
echo "\n1. Checking Cashier Users:\n";
$cashierUsers = DB::table('users')->where('role', 'cashier')->get(['id', 'email', 'name']);
foreach ($cashierUsers as $user) {
    echo "ID: {$user->id}, Email: {$user->email}, Name: {$user->name}\n";
}

// Create E2E POS Product
echo "\n2. Creating E2E POS Product:\n";
$e2eProduct = DB::table('inventory_items')->where('name', 'E2E POS Product')->first();
if (!$e2eProduct) {
    $e2eProductId = DB::table('inventory_items')->insertGetId([
        'name' => 'E2E POS Product',
        'sku' => 'E2E-POS-PRODUCT',
        'category' => 'Accessories',
        'stock' => 25,
        'price' => 150.00,
        'is_sellable' => 1,
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "Created E2E POS Product with ID: $e2eProductId\n";
} else {
    echo "E2E POS Product already exists with ID: {$e2eProduct->id}, Stock: {$e2eProduct->stock}\n";
}

// Create test excluded items
echo "\n3. Creating Test Excluded Items:\n";

// Archived item
$archivedItem = DB::table('inventory_items')->where('name', 'E2E Archived Product')->first();
if (!$archivedItem) {
    $archivedItemId = DB::table('inventory_items')->insertGetId([
        'name' => 'E2E Archived Product',
        'sku' => 'E2E-ARCHIVED',
        'category' => 'Accessories',
        'stock' => 10,
        'price' => 50.00,
        'is_sellable' => 1,
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "Created E2E Archived Product with ID: $archivedItemId\n";
} else {
    echo "E2E Archived Product already exists with ID: {$archivedItem->id}\n";
}

// Zero stock item
$zeroStockItem = DB::table('inventory_items')->where('name', 'E2E Zero Stock Product')->first();
if (!$zeroStockItem) {
    $zeroStockItemId = DB::table('inventory_items')->insertGetId([
        'name' => 'E2E Zero Stock Product',
        'sku' => 'E2E-ZERO-STOCK',
        'category' => 'Accessories',
        'stock' => 0,
        'price' => 75.00,
        'is_sellable' => 1,
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "Created E2E Zero Stock Product with ID: $zeroStockItemId\n";
} else {
    echo "E2E Zero Stock Product already exists with ID: {$zeroStockItem->id}\n";
}

// Non-sellable service item
$nonSellableItem = DB::table('inventory_items')->where('name', 'E2E Service Only Item')->first();
if (!$nonSellableItem) {
    $nonSellableItemId = DB::table('inventory_items')->insertGetId([
        'name' => 'E2E Service Only Item',
        'sku' => 'E2E-SERVICE-ONLY',
        'category' => 'Services',
        'stock' => 15,
        'price' => 100.00,
        'is_sellable' => 0,
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "Created E2E Service Only Item with ID: $nonSellableItemId\n";
} else {
    echo "E2E Service Only Item already exists with ID: {$nonSellableItem->id}\n";
}

// Check current sellable items
echo "\n4. Current Sellable Items for POS:\n";
$sellableItems = DB::table('inventory_items')
    ->where('is_sellable', 1)
    ->where('stock', '>', 0)
    ->limit(10)
    ->get(['id', 'name', 'category', 'stock', 'price', 'is_sellable']);

foreach ($sellableItems as $item) {
    echo "ID: {$item->id}, Name: {$item->name}, Category: {$item->category}, Stock: {$item->stock}, Price: {$item->price}, Sellable: " . ($item->is_sellable ? 'Yes' : 'No') . "\n";
}

// Check existing POS transactions
echo "\n5. Existing POS Transactions:\n";
$posTransactions = DB::table('customer_orders')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['id', 'customer_id', 'total_amount', 'status', 'payment_status', 'created_at']);

foreach ($posTransactions as $transaction) {
    echo "ID: {$transaction->id}, Customer: {$transaction->customer_id}, Total: {$transaction->total_amount}, Status: {$transaction->status}, Payment: {$transaction->payment_status}, Created: {$transaction->created_at}\n";
}

echo "\n=== CASHIER E2E SETUP COMPLETE ===\n";
