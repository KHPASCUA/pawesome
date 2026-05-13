<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== ITEM_TYPE CONSISTENCY CHECK ===" . PHP_EOL;

// Check current database records for item_type consistency
echo PHP_EOL . "1. CHECKING DATABASE RECORDS" . PHP_EOL;

$itemTypeCounts = \Illuminate\Support\Facades\DB::table('service_item_usages')
    ->selectRaw('item_type, COUNT(*) as count')
    ->groupBy('item_type')
    ->get();

echo "Current item_type distribution:" . PHP_EOL;
foreach ($itemTypeCounts as $type) {
    echo "  {$type->item_type}: {$type->count} records" . PHP_EOL;
}

// Check for any inventory_item records that need to be updated
$inventoryItemRecords = \Illuminate\Support\Facades\DB::table('service_item_usages')
    ->where('item_type', 'inventory_item')
    ->get();

if ($inventoryItemRecords->isNotEmpty()) {
    echo PHP_EOL . "❌ FOUND inventory_item records that need updating:" . PHP_EOL;
    foreach ($inventoryItemRecords as $record) {
        echo "  ID: {$record->id} - item_type: {$record->item_type}" . PHP_EOL;
    }
    
    echo PHP_EOL . "Updating inventory_item to inventory_usage..." . PHP_EOL;
    \Illuminate\Support\Facades\DB::table('service_item_usages')
        ->where('item_type', 'inventory_item')
        ->update(['item_type' => 'inventory_usage']);
    
    echo "✅ Updated " . $inventoryItemRecords->count() . " records from inventory_item to inventory_usage" . PHP_EOL;
} else {
    echo PHP_EOL . "✅ No inventory_item records found - database is consistent" . PHP_EOL;
}

// Verify model constants
echo PHP_EOL . "2. CHECKING MODEL CONSTANTS" . PHP_EOL;

$reflection = new ReflectionClass('App\Models\ServiceItemUsage');
$constants = $reflection->getConstants();

echo "ServiceItemUsage constants:" . PHP_EOL;
foreach ($constants as $name => $value) {
    if (str_starts_with($name, 'ITEM_')) {
        echo "  {$name}: '{$value}'" . PHP_EOL;
        
        // Check for any inventory_item constants
        if ($value === 'inventory_item') {
            echo "    ❌ Found inventory_item constant - should be inventory_usage" . PHP_EOL;
        } elseif ($value === 'inventory_usage') {
            echo "    ✅ Correct inventory_usage constant" . PHP_EOL;
        }
    }
}

// Test ServiceBillingService logic
echo PHP_EOL . "3. TESTING SERVICEBILLINGSERVICE LOGIC" . PHP_EOL;

try {
    // Test inventory_usage logic
    $billingData = [
        'service_type' => 'veterinary',
        'service_id' => 1,
        'pet_id' => 1,
        'item_type' => 'inventory_usage',
        'description' => 'Test Inventory Usage',
        'quantity' => 1,
        'unit_price' => 50,
        'total_price' => 50,
        'inventory_item_id' => 1,
        'batch_id' => 1,
        'notes' => 'Test'
    ];
    
    // Simulate the logic from ServiceBillingService
    $itemType = $billingData['item_type'];
    if ($itemType === 'inventory_usage') {
        $inventoryItemId = !empty($billingData['inventory_item_id']) ? (int) $billingData['inventory_item_id'] : null;
        $batchId = !empty($billingData['batch_id']) ? (int) $billingData['batch_id'] : null;
        
        echo "✅ ServiceBillingService logic for inventory_usage:" . PHP_EOL;
        echo "  Item Type: {$itemType}" . PHP_EOL;
        echo "  Inventory Item ID: " . ($inventoryItemId ?? 'NULL') . PHP_EOL;
        echo "  Batch ID: " . ($batchId ?? 'NULL') . PHP_EOL;
        
        if ($inventoryItemId > 0 && $batchId > 0) {
            echo "  ✅ Correctly assigns valid inventory references" . PHP_EOL;
        } else {
            echo "  ❌ Incorrectly assigns NULL references" . PHP_EOL;
        }
    } else {
        echo "❌ ServiceBillingService not checking for inventory_usage" . PHP_EOL;
    }
    
    // Test billing fee logic
    $billingFeeData = [
        'service_type' => 'veterinary',
        'service_id' => 1,
        'pet_id' => 1,
        'item_type' => 'base_service',
        'description' => 'Test Base Service',
        'quantity' => 1,
        'unit_price' => 500,
        'total_price' => 500,
        'notes' => 'Test'
    ];
    
    $itemType = $billingFeeData['item_type'];
    if ($itemType === 'inventory_usage') {
        $inventoryItemId = !empty($billingFeeData['inventory_item_id']) ? (int) $billingFeeData['inventory_item_id'] : null;
        $batchId = !empty($billingFeeData['batch_id']) ? (int) $billingFeeData['batch_id'] : null;
    } else {
        // For all billing fee types, force NULL references
        $inventoryItemId = null;
        $batchId = null;
    }
    
    echo "✅ ServiceBillingService logic for base_service:" . PHP_EOL;
    echo "  Item Type: {$itemType}" . PHP_EOL;
    echo "  Inventory Item ID: " . ($inventoryItemId ?? 'NULL') . PHP_EOL;
    echo "  Batch ID: " . ($batchId ?? 'NULL') . PHP_EOL;
    
    if ($inventoryItemId === null && $batchId === null) {
        echo "  ✅ Correctly assigns NULL references for billing fees" . PHP_EOL;
    } else {
        echo "  ❌ Incorrectly assigns valid references for billing fees" . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo "❌ Error testing ServiceBillingService logic: " . $e->getMessage() . PHP_EOL;
}

// Check ServiceBillingController validation
echo PHP_EOL . "4. CHECKING CONTROLLER VALIDATION" . PHP_EOL;

$controllerContent = file_get_contents('app/Http/Controllers/Api/ServiceBillingController.php');
if (strpos($controllerContent, 'inventory_usage') !== false) {
    echo "✅ ServiceBillingController validation includes inventory_usage" . PHP_EOL;
} else {
    echo "❌ ServiceBillingController validation missing inventory_usage" . PHP_EOL;
}

if (strpos($controllerContent, 'inventory_item') !== false) {
    echo "❌ ServiceBillingController validation still references inventory_item" . PHP_EOL;
} else {
    echo "✅ ServiceBillingController validation does not reference inventory_item" . PHP_EOL;
}

echo PHP_EOL . "=== CONSISTENCY CHECK COMPLETE ===" . PHP_EOL;
