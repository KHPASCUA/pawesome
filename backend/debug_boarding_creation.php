<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== DEBUG BOARDING CREATION ===" . PHP_EOL;

// Find the most recent boarding reservation
echo PHP_EOL . "1. FINDING RECENT BOARDING RESERVATION" . PHP_EOL;

$boarding = \App\Models\Boarding::orderBy('id', 'desc')->first();
if (!$boarding) {
    echo "❌ No boarding reservations found" . PHP_EOL;
    exit(1);
}

echo "✅ Found boarding reservation {$boarding->id}:" . PHP_EOL;
echo "  Pet ID: {$boarding->pet_id}" . PHP_EOL;
echo "  Room ID: {$boarding->room_id}" . PHP_EOL;
echo "  Status: {$boarding->status}" . PHP_EOL;

// Load relationships
echo PHP_EOL . "2. LOADING RELATIONSHIPS" . PHP_EOL;

$boardingWithRelations = \App\Models\Boarding::with(['hotelRoom', 'pet'])->find($boarding->id);

echo "  Hotel Room: " . ($boardingWithRelations->hotelRoom ? $boardingWithRelations->hotelRoom->name : 'NULL') . PHP_EOL;
echo "  Pet: " . ($boardingWithRelations->pet ? $boardingWithRelations->pet->name : 'NULL') . PHP_EOL;
echo "  Pet ID from relationship: " . ($boardingWithRelations->pet_id ?? 'NULL') . PHP_EOL;

// Check the condition
echo PHP_EOL . "3. CHECKING BILLING CONDITION" . PHP_EOL;

$condition1 = isset($boardingWithRelations->hotelRoom);
$condition2 = isset($boardingWithRelations->pet_id);
$condition3 = !empty($boardingWithRelations->pet_id);

echo "  hotelRoom exists: " . ($condition1 ? '✅' : '❌') . PHP_EOL;
echo "  pet_id exists: " . ($condition2 ? '✅' : '❌') . PHP_EOL;
echo "  pet_id not empty: " . ($condition3 ? '✅' : '❌') . PHP_EOL;
echo "  Combined condition: " . (($condition1 && $condition3) ? '✅' : '❌') . PHP_EOL;

// If status is pending, update it
if ($boarding->status === 'pending') {
    echo PHP_EOL . "4. UPDATING STATUS TO APPROVED" . PHP_EOL;
    
    $boarding->update([
        'status' => 'approved',
        'approved_by' => 1,
        'approved_at' => now(),
        'payment_status' => 'unpaid',
    ]);
    
    echo "✅ Updated status to approved" . PHP_EOL;
    
    // Reload with relationships
    $boardingWithRelations = \App\Models\Boarding::with(['hotelRoom', 'pet'])->find($boarding->id);
}

// Try to create billing
echo PHP_EOL . "5. ATTEMPTING BILLING CREATION" . PHP_EOL;

if ($boardingWithRelations->hotelRoom && $boardingWithRelations->pet_id) {
    echo "✅ Condition passed, creating billing..." . PHP_EOL;
    
    $checkIn = new \Carbon\Carbon($boardingWithRelations->check_in);
    $checkOut = new \Carbon\Carbon($boardingWithRelations->check_out);
    $days = max(1, $checkIn->diffInDays($checkOut));
    $totalAmount = $days * $boardingWithRelations->hotelRoom->daily_rate;
    
    echo "  Check-in: {$checkIn->format('Y-m-d H:i:s')}" . PHP_EOL;
    echo "  Check-out: {$checkOut->format('Y-m-d H:i:s')}" . PHP_EOL;
    echo "  Days: {$days}" . PHP_EOL;
    echo "  Daily Rate: ₱{$boardingWithRelations->hotelRoom->daily_rate}" . PHP_EOL;
    echo "  Total Amount: ₱{$totalAmount}" . PHP_EOL;
    
    // Check if base service billing item already exists
    $existingBaseItem = \App\Models\ServiceItemUsage::where('service_type', 'boarding')
        ->where('service_id', $boardingWithRelations->id)
        ->where('item_type', 'base_service')
        ->first();
    
    if (!$existingBaseItem) {
        echo "  Creating base service billing item..." . PHP_EOL;
        
        try {
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
            
        } catch (Exception $e) {
            echo "  ❌ Error creating billing item: " . $e->getMessage() . PHP_EOL;
        }
    } else {
        echo "  ⚠️ Base service item already exists: ID {$existingBaseItem->id}" . PHP_EOL;
    }
} else {
    echo "❌ Condition failed" . PHP_EOL;
    echo "  hotelRoom: " . ($boardingWithRelations->hotelRoom ? 'EXISTS' : 'NULL') . PHP_EOL;
    echo "  pet_id: " . ($boardingWithRelations->pet_id ?? 'NULL') . PHP_EOL;
}

echo PHP_EOL . "=== DEBUG COMPLETE ===" . PHP_EOL;
