<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== STANDARDIZING ITEM_TYPE NAMING ===" . PHP_EOL;

// Update existing records from inventory_usage to inventory_item
echo PHP_EOL . "1. UPDATING EXISTING inventory_usage RECORDS" . PHP_EOL;

$inventoryUsageRecords = \Illuminate\Support\Facades\DB::table('service_item_usages')
    ->where('item_type', 'inventory_usage')
    ->get();

echo "Found " . $inventoryUsageRecords->count() . " records with item_type = inventory_usage" . PHP_EOL;

if ($inventoryUsageRecords->isNotEmpty()) {
    $updated = \Illuminate\Support\Facades\DB::table('service_item_usages')
        ->where('item_type', 'inventory_usage')
        ->update(['item_type' => 'inventory_item']);
    
    echo "✅ Updated {$updated} records from inventory_usage to inventory_item" . PHP_EOL;
} else {
    echo "✅ No inventory_usage records found - already standardized" . PHP_EOL;
}

// Verify the update
echo PHP_EOL . "2. VERIFYING STANDARDIZATION RESULTS" . PHP_EOL;

$remainingInventoryUsage = \Illuminate\Support\Facades\DB::table('service_item_usages')
    ->where('item_type', 'inventory_usage')
    ->count();

$newInventoryItemRecords = \Illuminate\Support\Facades\DB::table('service_item_usages')
    ->where('item_type', 'inventory_item')
    ->count();

echo "Remaining inventory_usage records: {$remainingInventoryUsage}" . PHP_EOL;
echo "New inventory_item records: {$newInventoryItemRecords}" . PHP_EOL;

if ($remainingInventoryUsage === 0) {
    echo "✅ All records successfully standardized to inventory_item" . PHP_EOL;
} else {
    echo "❌ Still found {$remainingInventoryUsage} inventory_usage records" . PHP_EOL;
}

// Show current item_type distribution
echo PHP_EOL . "3. CURRENT ITEM_TYPE DISTRIBUTION" . PHP_EOL;

$itemTypeDistribution = \Illuminate\Support\Facades\DB::table('service_item_usages')
    ->selectRaw('item_type, COUNT(*) as count')
    ->groupBy('item_type')
    ->orderBy('count', 'desc')
    ->get();

echo "Current item types in database:" . PHP_EOL;
foreach ($itemTypeDistribution as $type) {
    $validTypes = ['base_service', 'add_on_service', 'professional_fee', 'service_fee', 'inventory_item', 'manual_charge', 'discount'];
    $status = in_array($type->item_type, $validTypes) ? '✅' : '⚠️';
    echo "  {$status} {$type->item_type}: {$type->count} records" . PHP_EOL;
}

// Verify that inventory_item records have proper inventory references
echo PHP_EOL . "4. VERIFYING INVENTORY_ITEM RECORDS HAVE PROPER REFERENCES" . PHP_EOL;

$inventoryItemRecords = \Illuminate\Support\Facades\DB::table('service_item_usages')
    ->where('item_type', 'inventory_item')
    ->get();

$withValidInventory = 0;
$withValidBatch = 0;

foreach ($inventoryItemRecords as $record) {
    if ($record->inventory_item_id > 0) {
        $withValidInventory++;
    }
    if ($record->batch_id > 0) {
        $withValidBatch++;
    }
}

echo "Inventory item records: " . $inventoryItemRecords->count() . PHP_EOL;
echo "  With valid inventory_item_id: {$withValidInventory}" . PHP_EOL;
echo "  With valid batch_id: {$withValidBatch}" . PHP_EOL;

if ($inventoryItemRecords->count() > 0) {
    $inventoryPercent = ($withValidInventory / $inventoryItemRecords->count()) * 100;
    $batchPercent = ($withValidBatch / $inventoryItemRecords->count()) * 100;
    echo "  Valid inventory references: " . number_format($inventoryPercent, 1) . "%" . PHP_EOL;
    echo "  Valid batch references: " . number_format($batchPercent, 1) . "%" . PHP_EOL;
}

echo PHP_EOL . "=== STANDARDIZATION COMPLETE ===" . PHP_EOL;
