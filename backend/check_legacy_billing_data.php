<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== LEGACY BILLING DATA CLEANUP ===" . PHP_EOL;

// Task 1: Check for legacy non-inventory billing rows with invalid inventory references
echo PHP_EOL . "1. CHECKING LEGACY NON-INVENTORY BILLING ROWS" . PHP_EOL;

$nonInventoryTypes = ['base_service', 'add_on_service', 'professional_fee', 'service_fee'];
$legacyRows = \Illuminate\Support\Facades\DB::table('service_item_usages')
    ->whereIn('item_type', $nonInventoryTypes)
    ->where(function($query) {
        $query->whereNotNull('inventory_item_id')
              ->orWhereNotNull('batch_id');
    })
    ->get();

echo "Found " . $legacyRows->count() . " legacy rows with invalid inventory references:" . PHP_EOL;

foreach ($legacyRows as $row) {
    echo "  ID: {$row->id}, Type: {$row->item_type}, inventory_id: " . ($row->inventory_item_id ?? 'NULL') . ", batch_id: " . ($row->batch_id ?? 'NULL') . PHP_EOL;
}

// Task 2: Update invalid rows to NULL
if ($legacyRows->isNotEmpty()) {
    echo PHP_EOL . "2. UPDATING LEGACY ROWS TO NULL REFERENCES" . PHP_EOL;
    
    $updated = \Illuminate\Support\Facades\DB::table('service_item_usages')
        ->whereIn('item_type', $nonInventoryTypes)
        ->where(function($query) {
            $query->whereNotNull('inventory_item_id')
                  ->orWhereNotNull('batch_id');
        })
        ->update([
            'inventory_item_id' => null,
            'batch_id' => null
        ]);
    
    echo "✅ Updated {$updated} legacy rows to force NULL inventory references" . PHP_EOL;
} else {
    echo PHP_EOL . "✅ No legacy rows found - data is already clean" . PHP_EOL;
}

// Task 3: Check current state after cleanup
echo PHP_EOL . "3. VERIFYING CLEANUP RESULTS" . PHP_EOL;

$afterCleanup = \Illuminate\Support\Facades\DB::table('service_item_usages')
    ->whereIn('item_type', $nonInventoryTypes)
    ->where(function($query) {
        $query->whereNotNull('inventory_item_id')
              ->orWhereNotNull('batch_id');
    })
    ->count();

if ($afterCleanup === 0) {
    echo "✅ All non-inventory billing rows now have NULL inventory references" . PHP_EOL;
} else {
    echo "❌ Still found {$afterCleanup} rows with invalid references" . PHP_EOL;
}

// Show current distribution
$currentDistribution = \Illuminate\Support\Facades\DB::table('service_item_usages')
    ->selectRaw('item_type, COUNT(*) as count, COUNT(CASE WHEN inventory_item_id IS NOT NULL THEN 1 END) as with_inventory, COUNT(CASE WHEN batch_id IS NOT NULL THEN 1 END) as with_batch')
    ->groupBy('item_type')
    ->orderBy('count', 'desc')
    ->get();

echo PHP_EOL . "Current item_type distribution:" . PHP_EOL;
foreach ($currentDistribution as $type) {
    $status = in_array($type->item_type, $nonInventoryTypes) ? 
        ($type->with_inventory == 0 && $type->with_batch == 0 ? '✅' : '❌') : '✅';
    echo "  {$status} {$type->item_type}: {$type->count} records (inventory: {$type->with_inventory}, batch: {$type->with_batch})" . PHP_EOL;
}

echo PHP_EOL . "=== LEGACY CLEANUP COMPLETE ===" . PHP_EOL;
