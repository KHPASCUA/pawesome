<?php

require_once 'backend/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== RECEPTIONIST E2E TEST RESULTS VERIFICATION ===\n";

// Check E2E test items
echo "\n1. E2E Test Items Status:\n";
$boardingFood = DB::table('inventory_items')->where('name', 'E2E Boarding Food')->first();
$groomingShampoo = DB::table('inventory_items')->where('name', 'E2E Grooming Shampoo')->first();

echo "E2E Boarding Food - ID: {$boardingFood->id}, Stock: {$boardingFood->stock}\n";
echo "E2E Grooming Shampoo - ID: {$groomingShampoo->id}, Stock: {$groomingShampoo->stock}\n";

// Check recent service_item_usages
echo "\n2. Recent Service Item Usages:\n";
$recentUsages = DB::table('service_item_usages')
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get(['id', 'service_type', 'service_id', 'inventory_item_id', 'quantity_used', 'notes', 'created_at']);

foreach ($recentUsages as $usage) {
    echo "ID: {$usage->id}, Type: {$usage->service_type}, Item ID: {$usage->inventory_item_id}, Qty: {$usage->quantity_used}, Notes: {$usage->notes}, Created: {$usage->created_at}\n";
}

// Check recent inventory_logs
echo "\n3. Recent Inventory Logs:\n";
$recentLogs = DB::table('inventory_logs')
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get(['id', 'inventory_item_id', 'movement_type', 'quantity', 'stock_after', 'reference_id', 'reference_type', 'created_at']);

foreach ($recentLogs as $log) {
    echo "ID: {$log->id}, Item ID: {$log->inventory_item_id}, Movement: {$log->movement_type}, Qty: {$log->quantity}, Stock After: {$log->stock_after}, Ref: {$log->reference_type}:{$log->reference_id}, Created: {$log->created_at}\n";
}

// Check service request status changes
echo "\n4. Recent Service Request Status Changes:\n";
$recentRequests = DB::table('service_requests')
    ->orderBy('updated_at', 'desc')
    ->limit(5)
    ->get(['id', 'service_type', 'status', 'customer_id', 'pet_id', 'updated_at']);

foreach ($recentRequests as $request) {
    echo "ID: {$request->id}, Type: {$request->service_type}, Status: {$request->status}, Customer: {$request->customer_id}, Pet: {$request->pet_id}, Updated: {$request->updated_at}\n";
}

// Movement Type Verification Table
echo "\n5. MOVEMENT TYPE VERIFICATION:\n";
echo "Source | Expected | Actual | Result\n";
echo "-------|----------|--------|-------\n";

// Check boarding usage
$boardingUsage = DB::table('inventory_logs')
    ->where('movement_type', 'boarding_food_usage')
    ->orderBy('created_at', 'desc')
    ->first();

if ($boardingUsage) {
    echo "Boarding | boarding_food_usage | boarding_food_usage | PASS\n";
} else {
    echo "Boarding | boarding_food_usage | None | FAIL\n";
}

// Check grooming usage
$groomingUsage = DB::table('inventory_logs')
    ->where('movement_type', 'grooming_usage')
    ->orderBy('created_at', 'desc')
    ->first();

if ($groomingUsage) {
    echo "Grooming | grooming_usage | grooming_usage | PASS\n";
} else {
    echo "Grooming | grooming_usage | None | FAIL\n";
}

// Check POS usage (should exist from previous tests)
$posUsage = DB::table('inventory_logs')
    ->where('movement_type', 'pos_sale_deduction')
    ->orderBy('created_at', 'desc')
    ->first();

if ($posUsage) {
    echo "POS | pos_sale_deduction | pos_sale_deduction | PASS\n";
} else {
    echo "POS | pos_sale_deduction | None | FAIL\n";
}

// Check veterinary usage
$vetUsage = DB::table('inventory_logs')
    ->where('movement_type', 'vet_usage')
    ->orderBy('created_at', 'desc')
    ->first();

if ($vetUsage) {
    echo "Veterinary | vet_usage | vet_usage | PASS\n";
} else {
    echo "Veterinary | vet_usage | None | FAIL\n";
}

echo "\n=== VERIFICATION COMPLETE ===\n";
