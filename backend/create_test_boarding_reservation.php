<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CREATING TEST BOARDING RESERVATION ===" . PHP_EOL;

// Find an available room and pet for testing
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

$customer = $pet->customer;
if (!$customer) {
    echo "❌ No customer found for pet" . PHP_EOL;
    exit(1);
}

echo "✅ Found test data:" . PHP_EOL;
echo "  Room: {$room->name} (₱{$room->daily_rate}/night)" . PHP_EOL;
echo "  Pet: {$pet->name}" . PHP_EOL;
echo "  Customer: {$customer->name}" . PHP_EOL;

// Create a new boarding reservation
echo PHP_EOL . "2. CREATING NEW BOARDING RESERVATION" . PHP_EOL;

$checkIn = now()->addDays(1)->setTime(14, 0, 0); // Tomorrow at 2 PM
$checkOut = now()->addDays(4)->setTime(11, 0, 0); // 4 days later at 11 AM

$boarding = \App\Models\Boarding::create([
    'pet_id' => $pet->id,
    'room_id' => $room->id,
    'check_in' => $checkIn,
    'check_out' => $checkOut,
    'status' => 'pending',
    'notes' => 'Test reservation for automatic billing verification',
    'customer_id' => $customer->id,
]);

echo "✅ Created boarding reservation {$boarding->id}:" . PHP_EOL;
echo "  Check-in: {$boarding->check_in}" . PHP_EOL;
echo "  Check-out: {$boarding->check_out}" . PHP_EOL;

// Calculate expected values
$expectedDays = max(1, $checkIn->diffInDays($checkOut));
$expectedPrice = $expectedDays * $room->daily_rate;

echo "  Expected duration: {$expectedDays} days" . PHP_EOL;
echo "  Expected price: ₱{$expectedPrice}" . PHP_EOL;

// Approve the reservation to trigger automatic billing creation
echo PHP_EOL . "3. APPROVING RESERVATION TO TRIGGER BILLING" . PHP_EOL;

$boarding->update([
    'status' => 'approved',
    'approved_by' => 1, // System user
    'approved_at' => now(),
]);

echo "✅ Approved reservation {$boarding->id}" . PHP_EOL;

// Check if automatic billing was created
echo PHP_EOL . "4. VERIFYING AUTOMATIC BILLING CREATION" . PHP_EOL;

$billingItems = \App\Models\ServiceItemUsage::where('service_type', 'boarding')
    ->where('service_id', $boarding->id)
    ->get();

if ($billingItems->isEmpty()) {
    echo "❌ No billing items created automatically" . PHP_EOL;
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
    
    $descriptionMatches = strpos($baseServiceItem->description, $expectedDays . ' day(s)') !== false;
    $priceMatches = abs($baseServiceItem->total_price - $expectedPrice) < 0.01;
    $nullReferences = is_null($baseServiceItem->inventory_item_id) && is_null($baseServiceItem->batch_id);
    
    echo "  Description contains '{$expectedDays} day(s)': " . ($descriptionMatches ? '✅' : '❌') . PHP_EOL;
    echo "  Price matches expected ₱{$expectedPrice}: " . ($priceMatches ? '✅' : '❌') . PHP_EOL;
    echo "  NULL inventory references: " . ($nullReferences ? '✅' : '❌') . PHP_EOL;
    
    if ($descriptionMatches && $priceMatches && $nullReferences) {
        echo "  ✅ Base service item is PERFECT" . PHP_EOL;
    } else {
        echo "  ❌ Base service item has issues" . PHP_EOL;
    }
} else {
    echo "❌ No base service item found" . PHP_EOL;
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
    echo "Manual intervention may be required for new boarding reservations." . PHP_EOL;
}

echo PHP_EOL . "=== TEST COMPLETE ===" . PHP_EOL;
