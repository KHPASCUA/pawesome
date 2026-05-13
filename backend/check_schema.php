<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== SERVICE_ITEM_USAGES SCHEMA ===" . PHP_EOL;

$columns = \Illuminate\Support\Facades\Schema::getColumnListing('service_item_usages');
foreach ($columns as $column) {
    $columnType = \Illuminate\Support\Facades\Schema::getColumnType('service_item_usages', $column);
    echo "{$column}: {$columnType}" . PHP_EOL;
}

echo PHP_EOL . "=== CHECKING EXISTING BASE SERVICE ITEMS ===" . PHP_EOL;

$baseServiceItems = \App\Models\ServiceItemUsage::where('item_type', 'base_service')->get();
echo "Base service items found: " . $baseServiceItems->count() . PHP_EOL;

foreach ($baseServiceItems as $item) {
    echo "ID: {$item->id}, inventory_item_id: " . ($item->inventory_item_id ?? 'NULL') . PHP_EOL;
}

echo PHP_EOL . "=== TESTING INVENTORY ITEM ID ===" . PHP_EOL;

// Try to set inventory_item_id to 0 instead of null
try {
    $testItem = \App\Models\ServiceItemUsage::create([
        'service_type' => 'test',
        'service_id' => 999,
        'pet_id' => 1,
        'inventory_item_id' => 0, // Try 0 instead of null
        'batch_id' => null,
        'quantity_used' => 1,
        'unit' => 'test',
        'used_by' => 1,
        'notes' => 'Test item',
        'item_type' => 'base_service',
        'description' => 'Test',
        'unit_price' => 100,
        'total_price' => 100,
        'is_billable' => true,
        'is_paid' => false,
    ]);
    
    echo "Successfully created test item with inventory_item_id = 0" . PHP_EOL;
    $testItem->delete(); // Clean up
    
} catch (Exception $e) {
    echo "Failed with inventory_item_id = 0: " . $e->getMessage() . PHP_EOL;
}
