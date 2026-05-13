<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== INVENTORY ITEMS CHECK ===" . PHP_EOL;

$inventoryItems = \App\Models\InventoryItem::limit(5)->get();
echo "Total inventory items: " . \App\Models\InventoryItem::count() . PHP_EOL;

foreach ($inventoryItems as $item) {
    echo "ID: {$item->id}, Name: {$item->name}, Price: ₱{$item->unit_price}" . PHP_EOL;
}

if ($inventoryItems->isEmpty()) {
    echo "No inventory items found. Creating a dummy inventory item for base services..." . PHP_EOL;
    
    try {
        $dummyItem = \App\Models\InventoryItem::create([
            'name' => 'Base Service Placeholder',
            'sku' => 'BASE-SERVICE',
            'description' => 'Placeholder for base service billing items',
            'unit_price' => 0,
            'stock' => 999999,
            'unit' => 'service',
            'category' => 'system'
        ]);
        
        echo "Created dummy inventory item ID: {$dummyItem->id}" . PHP_EOL;
        $firstItemId = $dummyItem->id;
        
    } catch (Exception $e) {
        echo "Failed to create dummy inventory item: " . $e->getMessage() . PHP_EOL;
        exit(1);
    }
} else {
    $firstItemId = $inventoryItems->first()->id;
}

echo PHP_EOL . "=== TESTING BASE SERVICE WITH INVENTORY ITEM {$firstItemId} ===" . PHP_EOL;

// Now test creating base service billing item with a valid inventory item
try {
    $appointment = \App\Models\Appointment::find(11);
    if (!$appointment) {
        echo "Appointment 11 not found" . PHP_EOL;
        exit(1);
    }
    
    // Check if base service billing item already exists
    $existingBaseItem = \App\Models\ServiceItemUsage::where('service_type', 'veterinary')
        ->where('service_id', $appointment->id)
        ->where('item_type', 'base_service')
        ->first();

    if ($existingBaseItem) {
        echo "Base service billing item already exists: ID {$existingBaseItem->id}" . PHP_EOL;
    } else {
        echo "Creating base service billing item with inventory_item_id = {$firstItemId}..." . PHP_EOL;
        
        $baseItem = \App\Models\ServiceItemUsage::create([
            'service_type' => 'veterinary',
            'service_id' => $appointment->id,
            'pet_id' => $appointment->pet_id,
            'inventory_item_id' => $firstItemId,
            'batch_id' => 0,
            'quantity_used' => 1,
            'unit' => 'service',
            'used_by' => 0,
            'notes' => 'Base service charge',
            'item_type' => 'base_service',
            'description' => $appointment->service->name ?? 'Veterinary Consultation',
            'unit_price' => $appointment->price ?? 500,
            'total_price' => $appointment->price ?? 500,
            'is_billable' => true,
            'is_paid' => false,
        ]);
        
        echo "Successfully created base service billing item:" . PHP_EOL;
        echo "  ID: {$baseItem->id}" . PHP_EOL;
        echo "  Description: {$baseItem->description}" . PHP_EOL;
        echo "  Price: ₱{$baseItem->total_price}" . PHP_EOL;
        echo "  Item Type: {$baseItem->item_type}" . PHP_EOL;
        echo "  Inventory Item ID: {$baseItem->inventory_item_id}" . PHP_EOL;
    }
    
    // Verify the billing totals
    $totalBill = \App\Models\ServiceItemUsage::calculateTotalBill('veterinary', $appointment->id);
    echo PHP_EOL . "Updated Billing Summary for Appointment {$appointment->id}:" . PHP_EOL;
    echo "  Total Bill: ₱{$totalBill}" . PHP_EOL;
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== CHECK COMPLETE ===" . PHP_EOL;
