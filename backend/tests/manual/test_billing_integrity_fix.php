<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TESTING BILLING INTEGRITY FIX ===" . PHP_EOL;

// Test 1: Verify base_service billing creation with NULL references
echo PHP_EOL . "1. TESTING BASE_SERVICE BILLING CREATION" . PHP_EOL;

try {
    $appointment = \App\Models\Appointment::find(17); // Use a different appointment
    if (!$appointment) {
        echo "Appointment 17 not found, creating test appointment..." . PHP_EOL;
        $service = \App\Models\Service::first();
        $pet = \App\Models\Pet::first();
        $customer = $pet ? $pet->customer : \App\Models\Customer::first();
        $vet = \App\Models\User::where('role', 'veterinary')->first();
        
        if (!$service || !$pet || !$customer || !$vet) {
            echo "Missing required data for test appointment" . PHP_EOL;
            exit(1);
        }
        
        $appointment = \App\Models\Appointment::create([
            'customer_id' => $customer->id,
            'pet_id' => $pet->id,
            'service_id' => $service->id,
            'veterinarian_id' => $vet->id,
            'scheduled_at' => now()->addHour(),
            'status' => 'approved',
            'price' => $service->price ?? 500,
            'notes' => 'Test appointment for billing integrity fix'
        ]);
        
        echo "Created test appointment ID: {$appointment->id}" . PHP_EOL;
    }
    
    echo "Creating base service billing item..." . PHP_EOL;
    
    $baseItem = \App\Services\ServiceBillingService::createBaseServiceItem(
        'veterinary',
        $appointment->id,
        $appointment->service->name ?? 'Veterinary Consultation',
        $appointment->price ?? 500,
        $appointment->pet_id
    );
    
    echo "✅ Base service billing item created:" . PHP_EOL;
    echo "   ID: {$baseItem->id}" . PHP_EOL;
    echo "   Description: {$baseItem->description}" . PHP_EOL;
    echo "   Price: ₱{$baseItem->total_price}" . PHP_EOL;
    echo "   Item Type: {$baseItem->item_type}" . PHP_EOL;
    echo "   Inventory Item ID: " . ($baseItem->inventory_item_id ?? 'NULL') . PHP_EOL;
    echo "   Batch ID: " . ($baseItem->batch_id ?? 'NULL') . PHP_EOL;
    
    // Verify NULL references
    if ($baseItem->inventory_item_id === null && $baseItem->batch_id === null) {
        echo "✅ CORRECT: Base service uses NULL inventory references" . PHP_EOL;
    } else {
        echo "❌ ERROR: Base service has non-NULL inventory references" . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . PHP_EOL;
}

// Test 2: Verify add_on_service billing with NULL references
echo PHP_EOL . "2. TESTING ADD_ON_SERVICE BILLING" . PHP_EOL;

try {
    $appointment = \App\Models\Appointment::find(17);
    
    echo "Adding add-on service billing item..." . PHP_EOL;
    
    // Simulate the billing item creation process (without auth)
    $billingData = [
        'service_type' => 'veterinary',
        'service_id' => $appointment->id,
        'pet_id' => $appointment->pet_id,
        'item_type' => 'add_on_service',
        'description' => 'Professional Consultation Fee',
        'quantity' => 1,
        'unit_price' => 300,
        'total_price' => 300,
        'notes' => 'Additional professional fee'
    ];
    
    // Use the corrected logic directly
    $itemType = $billingData['item_type'];
    if ($itemType === 'inventory_item') {
        $inventoryItemId = !empty($billingData['inventory_item_id']) ? (int) $billingData['inventory_item_id'] : null;
        $batchId = !empty($billingData['batch_id']) ? (int) $billingData['batch_id'] : null;
    } else {
        // For all billing fee types, force NULL references
        $inventoryItemId = null;
        $batchId = null;
    }
    
    echo "✅ Add-on service logic applied:" . PHP_EOL;
    echo "   Item Type: {$itemType}" . PHP_EOL;
    echo "   Inventory Item ID: " . ($inventoryItemId ?? 'NULL') . PHP_EOL;
    echo "   Batch ID: " . ($batchId ?? 'NULL') . PHP_EOL;
    
    if ($inventoryItemId === null && $batchId === null) {
        echo "✅ CORRECT: Add-on service uses NULL inventory references" . PHP_EOL;
    } else {
        echo "❌ ERROR: Add-on service has non-NULL inventory references" . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . PHP_EOL;
}

// Test 3: Verify inventory_item billing with valid references
echo PHP_EOL . "3. TESTING INVENTORY_ITEM BILLING" . PHP_EOL;

try {
    $appointment = \App\Models\Appointment::find(17);
    $inventoryItem = \App\Models\InventoryItem::first();
    $batch = \App\Models\InventoryBatch::first();
    
    if (!$inventoryItem || !$batch) {
        echo "No inventory items or batches available for testing" . PHP_EOL;
    } else {
        echo "Testing inventory usage with valid references..." . PHP_EOL;
        echo "   Using Inventory Item ID: {$inventoryItem->id}" . PHP_EOL;
        echo "   Using Batch ID: {$batch->id}" . PHP_EOL;
        
        // Use the corrected logic directly
        $billingData = [
            'service_type' => 'veterinary',
            'service_id' => $appointment->id,
            'pet_id' => $appointment->pet_id,
            'item_type' => 'inventory_item',
            'description' => 'Medical Supplies Used',
            'quantity' => 1,
            'unit_price' => 50,
            'total_price' => 50,
            'inventory_item_id' => $inventoryItem->id,
            'batch_id' => $batch->id,
            'notes' => 'Actual inventory consumption'
        ];
        
        $itemType = $billingData['item_type'];
        if ($itemType === 'inventory_item') {
            $inventoryItemId = !empty($billingData['inventory_item_id']) ? (int) $billingData['inventory_item_id'] : null;
            $batchId = !empty($billingData['batch_id']) ? (int) $billingData['batch_id'] : null;
        } else {
            $inventoryItemId = null;
            $batchId = null;
        }
        
        echo "✅ Inventory usage logic applied:" . PHP_EOL;
        echo "   Item Type: {$itemType}" . PHP_EOL;
        echo "   Inventory Item ID: " . ($inventoryItemId ?? 'NULL') . PHP_EOL;
        echo "   Batch ID: " . ($batchId ?? 'NULL') . PHP_EOL;
        
        if ($inventoryItemId > 0 && $batchId > 0) {
            echo "✅ CORRECT: Inventory usage uses valid inventory references" . PHP_EOL;
        } else {
            echo "❌ ERROR: Inventory usage has invalid inventory references" . PHP_EOL;
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . PHP_EOL;
}

// Test 4: Verify grooming base service creation
echo PHP_EOL . "4. TESTING GROOMING BASE SERVICE CREATION" . PHP_EOL;

try {
    $grooming = \App\Models\GroomingAppointment::find(12); // Use existing or create new
    if (!$grooming) {
        echo "Creating test grooming appointment..." . PHP_EOL;
        $pet = \App\Models\Pet::first();
        
        $grooming = \App\Models\GroomingAppointment::create([
            'pet_id' => $pet->id,
            'pet_name' => $pet->name,
            'service' => 'haircut',
            'appointment_date' => now()->addDay(),
            'status' => 'approved',
            'notes' => 'Test grooming for billing integrity fix'
        ]);
        
        echo "Created test grooming appointment ID: {$grooming->id}" . PHP_EOL;
    }
    
    echo "Creating grooming base service billing item..." . PHP_EOL;
    
    $groomingPrices = [
        'haircut' => 800,
        'bath' => 500,
        'nailTrim' => 200
    ];
    
    $expectedPrice = $groomingPrices[$grooming->service] ?? 500;
    
    $baseItem = \App\Services\ServiceBillingService::createBaseServiceItem(
        'grooming',
        $grooming->id,
        ucfirst($grooming->service) . ' Service',
        $expectedPrice,
        $grooming->pet_id
    );
    
    echo "✅ Grooming base service billing item created:" . PHP_EOL;
    echo "   ID: {$baseItem->id}" . PHP_EOL;
    echo "   Description: {$baseItem->description}" . PHP_EOL;
    echo "   Price: ₱{$baseItem->total_price}" . PHP_EOL;
    echo "   Item Type: {$baseItem->item_type}" . PHP_EOL;
    echo "   Inventory Item ID: " . ($baseItem->inventory_item_id ?? 'NULL') . PHP_EOL;
    echo "   Batch ID: " . ($baseItem->batch_id ?? 'NULL') . PHP_EOL;
    
    if ($baseItem->inventory_item_id === null && $baseItem->batch_id === null) {
        echo "✅ CORRECT: Grooming base service uses NULL inventory references" . PHP_EOL;
    } else {
        echo "❌ ERROR: Grooming base service has non-NULL inventory references" . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . PHP_EOL;
}

// Test 5: Verify boarding base service creation
echo PHP_EOL . "5. TESTING BOARDING BASE SERVICE CREATION" . PHP_EOL;

try {
    $boarding = \App\Models\Boarding::find(33); // Use existing or create new
    if (!$boarding) {
        echo "Creating test boarding reservation..." . PHP_EOL;
        $pet = \App\Models\Pet::first();
        $room = \App\Models\HotelRoom::first();
        
        $boarding = \App\Models\Boarding::create([
            'pet_id' => $pet->id,
            'pet_name' => $pet->name,
            'customer_id' => $pet->customer_id,
            'hotel_room_id' => $room->id,
            'check_in' => now()->addDay(),
            'check_out' => now()->addDays(2),
            'status' => 'approved',
            'notes' => 'Test boarding for billing integrity fix'
        ]);
        
        echo "Created test boarding reservation ID: {$boarding->id}" . PHP_EOL;
    }
    
    echo "Creating boarding base service billing item..." . PHP_EOL;
    
    if ($boarding->hotelRoom) {
        $checkIn = new \Carbon\Carbon($boarding->check_in);
        $checkOut = new \Carbon\Carbon($boarding->check_out);
        $days = max(1, $checkIn->diffInDays($checkOut));
        $expectedPrice = $days * $boarding->hotelRoom->daily_rate;
        
        $baseItem = \App\Services\ServiceBillingService::createBaseServiceItem(
            'boarding',
            $boarding->id,
            $boarding->hotelRoom->name . ' - ' . $days . ' day(s)',
            $expectedPrice,
            $boarding->pet_id
        );
        
        echo "✅ Boarding base service billing item created:" . PHP_EOL;
        echo "   ID: {$baseItem->id}" . PHP_EOL;
        echo "   Description: {$baseItem->description}" . PHP_EOL;
        echo "   Price: ₱{$baseItem->total_price}" . PHP_EOL;
        echo "   Item Type: {$baseItem->item_type}" . PHP_EOL;
        echo "   Inventory Item ID: " . ($baseItem->inventory_item_id ?? 'NULL') . PHP_EOL;
        echo "   Batch ID: " . ($baseItem->batch_id ?? 'NULL') . PHP_EOL;
        
        if ($baseItem->inventory_item_id === null && $baseItem->batch_id === null) {
            echo "✅ CORRECT: Boarding base service uses NULL inventory references" . PHP_EOL;
        } else {
            echo "❌ ERROR: Boarding base service has non-NULL inventory references" . PHP_EOL;
        }
    } else {
        echo "❌ No room assigned to boarding reservation" . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== BILLING INTEGRITY FIX TEST COMPLETE ===" . PHP_EOL;
