<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== INVENTORY BATCHES CHECK ===" . PHP_EOL;

$batches = \App\Models\InventoryBatch::limit(5)->get();
echo "Total inventory batches: " . \App\Models\InventoryBatch::count() . PHP_EOL;

foreach ($batches as $batch) {
    echo "ID: {$batch->id}, Item ID: {$batch->inventory_item_id}, Remaining: {$batch->remaining_quantity}" . PHP_EOL;
}

if ($batches->isEmpty()) {
    echo "No inventory batches found. Creating a dummy batch for base services..." . PHP_EOL;
    
    try {
        $dummyItem = \App\Models\InventoryItem::first();
        if (!$dummyItem) {
            echo "No inventory items found to create batch" . PHP_EOL;
            exit(1);
        }
        
        $dummyBatch = \App\Models\InventoryBatch::create([
            'inventory_item_id' => $dummyItem->id,
            'quantity' => 999999,
            'remaining_quantity' => 999999,
            'cost_per_unit' => 0,
            'expiry_date' => now()->addYears(10),
            'batch_number' => 'BASE-SERVICE-BATCH',
            'supplier' => 'System Generated'
        ]);
        
        echo "Created dummy inventory batch ID: {$dummyBatch->id}" . PHP_EOL;
        $firstBatchId = $dummyBatch->id;
        
    } catch (Exception $e) {
        echo "Failed to create dummy inventory batch: " . $e->getMessage() . PHP_EOL;
        exit(1);
    }
} else {
    $firstBatchId = $batches->first()->id;
}

echo PHP_EOL . "=== TESTING BASE SERVICE WITH BATCH {$firstBatchId} ===" . PHP_EOL;

// Now test creating base service billing item with valid inventory and batch
try {
    $appointment = \App\Models\Appointment::find(11);
    if (!$appointment) {
        echo "Appointment 11 not found" . PHP_EOL;
        exit(1);
    }
    
    $firstItemId = \App\Models\InventoryItem::first()->id;
    
    echo "Creating base service billing item with inventory_item_id = {$firstItemId}, batch_id = {$firstBatchId}..." . PHP_EOL;
    
    $baseItem = \App\Models\ServiceItemUsage::create([
        'service_type' => 'veterinary',
        'service_id' => $appointment->id,
        'pet_id' => $appointment->pet_id,
        'inventory_item_id' => $firstItemId,
        'batch_id' => $firstBatchId,
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
    echo "  Batch ID: {$baseItem->batch_id}" . PHP_EOL;
    
    // Verify the billing totals
    $totalBill = \App\Models\ServiceItemUsage::calculateTotalBill('veterinary', $appointment->id);
    echo PHP_EOL . "Updated Billing Summary for Appointment {$appointment->id}:" . PHP_EOL;
    echo "  Total Bill: ₱{$totalBill}" . PHP_EOL;
    
    // Get itemized billing
    $items = \App\Models\ServiceItemUsage::getItemizedBilling('veterinary', $appointment->id);
    echo "  Billing Items: " . $items->count() . PHP_EOL;
    
    foreach ($items as $item) {
        echo "    - {$item->description}: ₱{$item->total_price} ({$item->item_type})" . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== CHECK COMPLETE ===" . PHP_EOL;
