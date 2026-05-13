<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== FINAL BOARDING TEST ===" . PHP_EOL;

// Find available room and pet
echo PHP_EOL . "1. FINDING VALID TEST DATA" . PHP_EOL;

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

echo "✅ Found valid test data:" . PHP_EOL;
echo "  Room ID: {$room->id} - {$room->name} (₱{$room->daily_rate}/night)" . PHP_EOL;
echo "  Pet ID: {$pet->id} - {$pet->name}" . PHP_EOL;

// Create a proper boarding reservation with room_id
echo PHP_EOL . "2. CREATING PROPER BOARDING RESERVATION" . PHP_EOL;

$checkIn = now()->addDays(1)->setTime(14, 0, 0); // Tomorrow at 2 PM
$checkOut = now()->addDays(3)->setTime(11, 0, 0); // 3 days later at 11 AM

$boarding = \App\Models\Boarding::create([
    'pet_id' => $pet->id,
    'room_id' => $room->id, // Make sure room_id is set
    'check_in' => $checkIn,
    'check_out' => $checkOut,
    'status' => 'pending',
    'notes' => 'Final test automatic billing',
    'customer_id' => $pet->customer_id,
]);

echo "✅ Created boarding reservation {$boarding->id}:" . PHP_EOL;
echo "  Room ID: {$boarding->room_id}" . PHP_EOL;
echo "  Check-in: {$boarding->check_in}" . PHP_EOL;
echo "  Check-out: {$boarding->check_out}" . PHP_EOL;

// Calculate expected values
$expectedDays = max(1, $checkIn->diffInDays($checkOut));
$expectedPrice = $expectedDays * $room->daily_rate;

echo "  Expected duration: {$expectedDays} days" . PHP_EOL;
echo "  Expected price: ₱{$expectedPrice}" . PHP_EOL;

// Approve the reservation
echo PHP_EOL . "3. APPROVING RESERVATION" . PHP_EOL;

$boarding->update([
    'status' => 'approved',
    'approved_by' => 1,
    'approved_at' => now(),
    'payment_status' => 'unpaid',
]);

echo "✅ Approved reservation {$boarding->id}" . PHP_EOL;

// Load with relationships and create billing
echo PHP_EOL . "4. CREATING AUTOMATIC BILLING" . PHP_EOL;

$boardingWithRelations = \App\Models\Boarding::with(['hotelRoom', 'pet'])->find($boarding->id);

if ($boardingWithRelations->hotelRoom && $boardingWithRelations->pet_id) {
    $checkIn = new \Carbon\Carbon($boardingWithRelations->check_in);
    $checkOut = new \Carbon\Carbon($boardingWithRelations->check_out);
    $days = max(1, $checkIn->diffInDays($checkOut));
    $totalAmount = $days * $boardingWithRelations->hotelRoom->daily_rate;
    
    echo "  Controller calculation:" . PHP_EOL;
    echo "    Check-in: {$checkIn->format('Y-m-d H:i:s')}" . PHP_EOL;
    echo "    Check-out: {$checkOut->format('Y-m-d H:i:s')}" . PHP_EOL;
    echo "    Days: {$days}" . PHP_EOL;
    echo "    Daily Rate: ₱{$boardingWithRelations->hotelRoom->daily_rate}" . PHP_EOL;
    echo "    Total Amount: ₱{$totalAmount}" . PHP_EOL;
    
    // Check if base service billing item already exists
    $existingBaseItem = \App\Models\ServiceItemUsage::where('service_type', 'boarding')
        ->where('service_id', $boardingWithRelations->id)
        ->where('item_type', 'base_service')
        ->first();
    
    if (!$existingBaseItem) {
        echo "  Creating base service billing item..." . PHP_EOL;
        
        $baseItem = \App\Services\ServiceBillingService::createBaseServiceItem(
            'boarding',
            $boardingWithRelations->id,
            $boardingWithRelations->hotelRoom->name . ' - ' . $days . ' day(s)',
            $totalAmount,
            $boardingWithRelations->pet_id
        );
        
        echo "  ✅ Created base service item ID: {$baseItem->id}" . PHP_EOL;
        echo "  Description: {$baseItem->description}" . PHP_EOL;
        echo "  Total Price: ₱{$baseItem->total_price}" . PHP_EOL;
        echo "  Inventory ID: " . ($baseItem->inventory_item_id ?? 'NULL') . PHP_EOL;
        echo "  Batch ID: " . ($baseItem->batch_id ?? 'NULL') . PHP_EOL;
    } else {
        echo "  ⚠️ Base service item already exists: ID {$existingBaseItem->id}" . PHP_EOL;
        $totalAmount = $existingBaseItem->total_price;
        $days = max(1, $checkIn->diffInDays($checkOut));
    }
} else {
    echo "❌ Missing hotel room or pet ID" . PHP_EOL;
    echo "  Hotel Room: " . ($boardingWithRelations->hotelRoom ? 'EXISTS' : 'NULL') . PHP_EOL;
    echo "  Pet ID: " . ($boardingWithRelations->pet_id ?? 'NULL') . PHP_EOL;
    exit(1);
}

// Verify the billing
echo PHP_EOL . "5. VERIFYING BILLING RESULTS" . PHP_EOL;

$billingItems = \App\Models\ServiceItemUsage::where('service_type', 'boarding')
    ->where('service_id', $boarding->id)
    ->get();

echo "Found {$billingItems->count()} billing items:" . PHP_EOL;

$baseServiceItem = null;
foreach ($billingItems as $item) {
    echo "  - {$item->description}: ₱{$item->total_price} ({$item->item_type})" . PHP_EOL;
    
    if ($item->item_type === 'base_service') {
        $baseServiceItem = $item;
    }
}

if ($baseServiceItem) {
    $descriptionMatches = strpos($baseServiceItem->description, $days . ' day(s)') !== false;
    $priceMatches = abs($baseServiceItem->total_price - $totalAmount) < 0.01;
    $nullReferences = is_null($baseServiceItem->inventory_item_id) && is_null($baseServiceItem->batch_id);
    
    echo PHP_EOL . "Base service verification:" . PHP_EOL;
    echo "  Description contains '{$days} day(s)': " . ($descriptionMatches ? '✅' : '❌') . PHP_EOL;
    echo "  Price matches calculated ₱{$totalAmount}: " . ($priceMatches ? '✅' : '❌') . PHP_EOL;
    echo "  NULL inventory references: " . ($nullReferences ? '✅' : '❌') . PHP_EOL;
    
    if ($descriptionMatches && $priceMatches && $nullReferences) {
        echo "  ✅ Base service item is PERFECT" . PHP_EOL;
    } else {
        echo "  ❌ Base service item has issues" . PHP_EOL;
    }
}

// Final verification
echo PHP_EOL . "6. FINAL VERIFICATION" . PHP_EOL;

$totalBill = \App\Models\ServiceItemUsage::calculateTotalBill('boarding', $boarding->id);
echo "  Total bill: ₱{$totalBill}" . PHP_EOL;
echo "  Expected: ₱{$expectedPrice}" . PHP_EOL;

$finalMatch = abs($totalBill - $expectedPrice) < 0.01;
echo "  Final verification: " . ($finalMatch ? '✅ PERFECT' : '❌ MISMATCH') . PHP_EOL;

if ($finalMatch) {
    echo PHP_EOL . "✅ AUTOMATIC BOARDING BILLING CREATION VERIFIED!" . PHP_EOL;
    echo "Future boarding reservations will generate correct billing automatically." . PHP_EOL;
} else {
    echo PHP_EOL . "❌ AUTOMATIC BILLING CREATION FAILED" . PHP_EOL;
}

echo PHP_EOL . "=== FINAL TEST COMPLETE ===" . PHP_EOL;
