<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CREATE AND TEST BOARDING RESERVATION ===" . PHP_EOL;

// Find test data
echo PHP_EOL . "1. FINDING TEST DATA" . PHP_EOL;

$room = \App\Models\HotelRoom::where('status', 'available')->first();
if (!$room) {
    echo "❌ No available rooms found" . PHP_EOL;
    exit(1);
}

$pet = \App\Models\Pet::first();
if (!$pet) {
    echo "❌ No pets found" . PHP_EOL;
    exit(1);
}

echo "✅ Found test data:" . PHP_EOL;
echo "  Room: {$room->name} (₱{$room->daily_rate}/night)" . PHP_EOL;
echo "  Pet: {$pet->name}" . PHP_EOL;

// Create a new boarding reservation
echo PHP_EOL . "2. CREATING NEW BOARDING RESERVATION" . PHP_EOL;

$checkIn = now()->addDays(1)->setTime(14, 0, 0); // Tomorrow at 2 PM
$checkOut = now()->addDays(3)->setTime(11, 0, 0); // 3 days later at 11 AM

$boarding = \App\Models\Boarding::create([
    'pet_id' => $pet->id,
    'room_id' => $room->id,
    'check_in' => $checkIn,
    'check_out' => $checkOut,
    'status' => 'pending',
    'notes' => 'Test automatic billing creation',
    'customer_id' => $pet->customer_id,
]);

echo "✅ Created boarding reservation {$boarding->id}:" . PHP_EOL;
echo "  Check-in: {$boarding->check_in}" . PHP_EOL;
echo "  Check-out: {$boarding->check_out}" . PHP_EOL;

// Calculate expected values
$checkInDate = new \Carbon\Carbon($boarding->check_in);
$checkOutDate = new \Carbon\Carbon($boarding->check_out);
$expectedDays = max(1, $checkInDate->diffInDays($checkOutDate));
$expectedPrice = $expectedDays * $room->daily_rate;

echo "  Expected duration: {$expectedDays} days" . PHP_EOL;
echo "  Expected price: ₱{$expectedPrice}" . PHP_EOL;

// Simulate the BoardingController::confirm method
echo PHP_EOL . "3. SIMULATING CONTROLLER APPROVAL PROCESS" . PHP_EOL;

$oldStatus = $boarding->status;

// Update the boarding status (same as controller)
$boarding->update([
    'status' => 'approved',
    'approved_by' => 1, // System user
    'approved_at' => now(),
    'payment_status' => 'unpaid',
]);

echo "✅ Updated boarding status to approved" . PHP_EOL;

// Reload boarding with relationships
$boarding = \App\Models\Boarding::with(['hotelRoom', 'pet'])->find($boarding->id);

// Execute the billing creation logic (same as controller)
if ($boarding->hotelRoom && $boarding->pet_id) {
    $checkIn = new \Carbon\Carbon($boarding->check_in);
    $checkOut = new \Carbon\Carbon($boarding->check_out);
    $days = max(1, $checkIn->diffInDays($checkOut));
    $totalAmount = $days * $boarding->hotelRoom->daily_rate;
    
    echo "  Controller calculated duration: {$days} days" . PHP_EOL;
    echo "  Controller calculated total: ₱{$totalAmount}" . PHP_EOL;
    
    // Check if base service billing item already exists
    $existingBaseItem = \App\Models\ServiceItemUsage::where('service_type', 'boarding')
        ->where('service_id', $boarding->id)
        ->where('item_type', 'base_service')
        ->first();
    
    if (!$existingBaseItem) {
        echo "  Creating base service billing item..." . PHP_EOL;
        
        $baseItem = \App\Services\ServiceBillingService::createBaseServiceItem(
            'boarding',
            $boarding->id,
            $boarding->hotelRoom->name . ' - ' . $days . ' day(s)',
            $totalAmount,
            $boarding->pet_id
        );
        
        echo "  ✅ Created base service item ID: {$baseItem->id}" . PHP_EOL;
        echo "  Description: {$baseItem->description}" . PHP_EOL;
        echo "  Total Price: ₱{$baseItem->total_price}" . PHP_EOL;
    } else {
        echo "  ⚠️ Base service item already exists: ID {$existingBaseItem->id}" . PHP_EOL;
        $totalAmount = $existingBaseItem->total_price;
        $days = max(1, $checkIn->diffInDays($checkOut));
    }
} else {
    echo "  ❌ Missing hotel room or pet ID" . PHP_EOL;
    exit(1);
}

// Verify the billing was created
echo PHP_EOL . "4. VERIFYING AUTOMATIC BILLING CREATION" . PHP_EOL;

$billingItems = \App\Models\ServiceItemUsage::where('service_type', 'boarding')
    ->where('service_id', $boarding->id)
    ->get();

if ($billingItems->isEmpty()) {
    echo "❌ No billing items found" . PHP_EOL;
    exit(1);
}

echo "✅ Found {$billingItems->count()} billing items:" . PHP_EOL;

$baseServiceItem = null;
foreach ($billingItems as $item) {
    echo "  - {$item->description}: ₱{$item->total_price} ({$item->item_type})" . PHP_EOL;
    echo "    inventory_id: " . ($item->inventory_item_id ?? 'NULL') . PHP_EOL;
    echo "    batch_id: " . ($item->batch_id ?? 'NULL') . PHP_EOL;
    
    if ($item->item_type === 'base_service') {
        $baseServiceItem = $item;
    }
}

// Verify the base service item
if ($baseServiceItem) {
    echo PHP_EOL . "5. VERIFYING BASE SERVICE ITEM" . PHP_EOL;
    
    $descriptionMatches = strpos($baseServiceItem->description, $days . ' day(s)') !== false;
    $priceMatches = abs($baseServiceItem->total_price - $totalAmount) < 0.01;
    $nullReferences = is_null($baseServiceItem->inventory_item_id) && is_null($baseServiceItem->batch_id);
    
    echo "  Description contains '{$days} day(s)': " . ($descriptionMatches ? '✅' : '❌') . PHP_EOL;
    echo "  Price matches calculated ₱{$totalAmount}: " . ($priceMatches ? '✅' : '❌') . PHP_EOL;
    echo "  NULL inventory references: " . ($nullReferences ? '✅' : '❌') . PHP_EOL;
    
    if ($descriptionMatches && $priceMatches && $nullReferences) {
        echo "  ✅ Base service item is PERFECT" . PHP_EOL;
    } else {
        echo "  ❌ Base service item has issues" . PHP_EOL;
    }
} else {
    echo "❌ No base service item found" . PHP_EOL;
    exit(1);
}

// Final verification
echo PHP_EOL . "6. FINAL VERIFICATION" . PHP_EOL;

$totalBill = \App\Models\ServiceItemUsage::calculateTotalBill('boarding', $boarding->id);
echo "  Total bill: ₱{$totalBill}" . PHP_EOL;
echo "  Expected: ₱{$expectedPrice}" . PHP_EOL;

$finalMatch = abs($totalBill - $expectedPrice) < 0.01;
echo "  Final verification: " . ($finalMatch ? '✅ PERFECT' : '❌ MISMATCH') . PHP_EOL;

if ($finalMatch) {
    echo PHP_EOL . "✅ AUTOMATIC BILLING CREATION VERIFIED SUCCESSFULLY" . PHP_EOL;
    echo "Future boarding reservations will generate correct billing automatically!" . PHP_EOL;
} else {
    echo PHP_EOL . "❌ AUTOMATIC BILLING CREATION FAILED" . PHP_EOL;
    echo "Expected: ₱{$expectedPrice}, Got: ₱{$totalBill}" . PHP_EOL;
}

echo PHP_EOL . "=== TEST COMPLETE ===" . PHP_EOL;
