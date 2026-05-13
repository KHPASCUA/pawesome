<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TESTING CORRECTED BILLING SYSTEM ===" . PHP_EOL;

// Test 1: Create base service billing item with NULL inventory references
echo PHP_EOL . "1. TESTING BASE SERVICE BILLING WITH NULL REFERENCES" . PHP_EOL;

try {
    $appointment = \App\Models\Appointment::find(15); // Use appointment 15
    if (!$appointment) {
        echo "Appointment 15 not found" . PHP_EOL;
        exit(1);
    }
    
    // Check if base service billing item already exists
    $existingBaseItem = \App\Models\ServiceItemUsage::where('service_type', 'veterinary')
        ->where('service_id', $appointment->id)
        ->where('item_type', 'base_service')
        ->first();

    if ($existingBaseItem) {
        echo "Base service billing item already exists: ID {$existingBaseItem->id}" . PHP_EOL;
        echo "  Inventory Item ID: " . ($existingBaseItem->inventory_item_id ?? 'NULL') . PHP_EOL;
        echo "  Batch ID: " . ($existingBaseItem->batch_id ?? 'NULL') . PHP_EOL;
    } else {
        echo "Creating base service billing item with NULL inventory references..." . PHP_EOL;
        
        $baseItem = \App\Services\ServiceBillingService::createBaseServiceItem(
            'veterinary',
            $appointment->id,
            $appointment->service->name ?? 'Veterinary Consultation',
            $appointment->price ?? 500,
            $appointment->pet_id
        );
        
        echo "Successfully created base service billing item:" . PHP_EOL;
        echo "  ID: {$baseItem->id}" . PHP_EOL;
        echo "  Description: {$baseItem->description}" . PHP_EOL;
        echo "  Price: ₱{$baseItem->total_price}" . PHP_EOL;
        echo "  Item Type: {$baseItem->item_type}" . PHP_EOL;
        echo "  Inventory Item ID: " . ($baseItem->inventory_item_id ?? 'NULL') . PHP_EOL;
        echo "  Batch ID: " . ($baseItem->batch_id ?? 'NULL') . PHP_EOL;
    }
    
    // Verify the billing totals
    $totalBill = \App\Models\ServiceItemUsage::calculateTotalBill('veterinary', $appointment->id);
    echo "Updated Billing Summary for Appointment {$appointment->id}:" . PHP_EOL;
    echo "  Total Bill: ₱{$totalBill}" . PHP_EOL;
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}

// Test 2: Test add-on service billing with NULL inventory references
echo PHP_EOL . "2. TESTING ADD-ON SERVICE BILLING WITH NULL REFERENCES" . PHP_EOL;

try {
    $appointment = \App\Models\Appointment::find(15);
    
    echo "Adding add-on service with NULL inventory references..." . PHP_EOL;
    
    $addOnItem = \App\Services\ServiceBillingService::addBillingItem([
        'service_type' => 'veterinary',
        'service_id' => $appointment->id,
        'pet_id' => $appointment->pet_id,
        'item_type' => 'add_on_service',
        'description' => 'Premium Consultation Fee',
        'quantity' => 1,
        'unit_price' => 200,
        'total_price' => 200,
        'inventory_item_id' => null, // Should be NULL for add-on services
        'notes' => 'Additional service fee'
    ]);
    
    echo "Successfully created add-on service billing item:" . PHP_EOL;
    echo "  ID: {$addOnItem['billing_item']->id}" . PHP_EOL;
    echo "  Description: {$addOnItem['billing_item']->description}" . PHP_EOL;
    echo "  Price: ₱{$addOnItem['billing_item']->total_price}" . PHP_EOL;
    echo "  Item Type: {$addOnItem['billing_item']->item_type}" . PHP_EOL;
    echo "  Inventory Item ID: " . ($addOnItem['billing_item']->inventory_item_id ?? 'NULL') . PHP_EOL;
    echo "  Batch ID: " . ($addOnItem['billing_item']->batch_id ?? 'NULL') . PHP_EOL;
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}

// Test 3: Test actual inventory usage with valid inventory and batch IDs
echo PHP_EOL . "3. TESTING ACTUAL INVENTORY USAGE WITH VALID REFERENCES" . PHP_EOL;

try {
    $appointment = \App\Models\Appointment::find(15);
    $inventoryItem = \App\Models\InventoryItem::first();
    $batch = \App\Models\InventoryBatch::first();
    
    if (!$inventoryItem || !$batch) {
        echo "No inventory items or batches found for testing" . PHP_EOL;
    } else {
        echo "Adding inventory usage with valid inventory and batch references..." . PHP_EOL;
        echo "  Using Inventory Item ID: {$inventoryItem->id}" . PHP_EOL;
        echo "  Using Batch ID: {$batch->id}" . PHP_EOL;
        
        $inventoryUsage = \App\Services\ServiceBillingService::addBillingItem([
            'service_type' => 'veterinary',
            'service_id' => $appointment->id,
            'pet_id' => $appointment->pet_id,
            'item_type' => 'inventory_usage',
            'description' => 'Medical Supplies Used',
            'quantity' => 2,
            'unit_price' => 50,
            'total_price' => 100,
            'inventory_item_id' => $inventoryItem->id, // Should be valid ID for inventory usage
            'notes' => 'Actual inventory consumption'
        ]);
        
        echo "Successfully created inventory usage billing item:" . PHP_EOL;
        echo "  ID: {$inventoryUsage['billing_item']->id}" . PHP_EOL;
        echo "  Description: {$inventoryUsage['billing_item']->description}" . PHP_EOL;
        echo "  Price: ₱{$inventoryUsage['billing_item']->total_price}" . PHP_EOL;
        echo "  Item Type: {$inventoryUsage['billing_item']->item_type}" . PHP_EOL;
        echo "  Inventory Item ID: " . ($inventoryUsage['billing_item']->inventory_item_id ?? 'NULL') . PHP_EOL;
        echo "  Batch ID: " . ($inventoryUsage['billing_item']->batch_id ?? 'NULL') . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}

// Test 4: Verify final billing totals
echo PHP_EOL . "4. VERIFYING FINAL BILLING TOTALS" . PHP_EOL;

try {
    $appointment = \App\Models\Appointment::find(15);
    $billing = \App\Models\ServiceItemUsage::getItemizedBilling('veterinary', $appointment->id);
    $totalBill = \App\Models\ServiceItemUsage::calculateTotalBill('veterinary', $appointment->id);
    
    echo "Final Billing Summary for Appointment {$appointment->id}:" . PHP_EOL;
    echo "  Total Bill: ₱{$totalBill}" . PHP_EOL;
    echo "  Billing Items: " . $billing->count() . PHP_EOL;
    
    foreach ($billing as $item) {
        echo "    - {$item->description}: ₱{$item->total_price} ({$item->item_type})" . PHP_EOL;
        echo "      Inventory ID: " . ($item->inventory_item_id ?? 'NULL') . PHP_EOL;
        echo "      Batch ID: " . ($item->batch_id ?? 'NULL') . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== CORRECTED BILLING TEST COMPLETE ===" . PHP_EOL;
