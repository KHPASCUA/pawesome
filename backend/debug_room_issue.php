<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== DEBUG ROOM ISSUE ===" . PHP_EOL;

// Check the most recent boarding reservation
$boarding = \App\Models\Boarding::orderBy('id', 'desc')->first();
if (!$boarding) {
    echo "❌ No boarding reservations found" . PHP_EOL;
    exit(1);
}

echo "Boarding reservation {$boarding->id}:" . PHP_EOL;
echo "  Room ID: " . ($boarding->room_id ?? 'NULL') . PHP_EOL;
echo "  Pet ID: {$boarding->pet_id}" . PHP_EOL;
echo "  Status: {$boarding->status}" . PHP_EOL;

// Check if room exists
if ($boarding->room_id) {
    $room = \App\Models\HotelRoom::find($boarding->room_id);
    echo "  Room exists: " . ($room ? '✅' : '❌') . PHP_EOL;
    if ($room) {
        echo "  Room name: {$room->name}" . PHP_EOL;
        echo "  Room status: {$room->status}" . PHP_EOL;
    }
} else {
    echo "  Room ID is NULL" . PHP_EOL;
}

// Try to load relationship
$boardingWithRelations = \App\Models\Boarding::with(['hotelRoom', 'pet'])->find($boarding->id);
echo "  Hotel Room relationship: " . ($boardingWithRelations->hotelRoom ? 'LOADED' : 'NULL') . PHP_EOL;
echo "  Pet relationship: " . ($boardingWithRelations->pet ? 'LOADED' : 'NULL') . PHP_EOL;

// Check if we can manually create a working boarding reservation
echo PHP_EOL . "CREATING MANUAL TEST RESERVATION" . PHP_EOL;

$room = \App\Models\HotelRoom::first();
$pet = \App\Models\Pet::first();

if ($room && $pet) {
    echo "Using room {$room->id} and pet {$pet->id}" . PHP_EOL;
    
    // Create with explicit room_id
    $testBoarding = \App\Models\Boarding::create([
        'pet_id' => $pet->id,
        'room_id' => $room->id,
        'check_in' => now()->addDays(1),
        'check_out' => now()->addDays(3),
        'status' => 'pending',
        'notes' => 'Manual test',
        'customer_id' => $pet->customer_id,
    ]);
    
    echo "Created boarding {$testBoarding->id} with room_id {$testBoarding->room_id}" . PHP_EOL;
    
    // Load with relationships
    $testBoardingWithRelations = \App\Models\Boarding::with(['hotelRoom', 'pet'])->find($testBoarding->id);
    echo "  Hotel Room relationship: " . ($testBoardingWithRelations->hotelRoom ? 'LOADED' : 'NULL') . PHP_EOL;
    
    if ($testBoardingWithRelations->hotelRoom) {
        echo "  ✅ Room relationship works!" . PHP_EOL;
        
        // Now test the billing creation
        echo PHP_EOL . "TESTING BILLING CREATION" . PHP_EOL;
        
        $checkIn = new \Carbon\Carbon($testBoardingWithRelations->check_in);
        $checkOut = new \Carbon\Carbon($testBoardingWithRelations->check_out);
        $nights = max(1, $checkIn->diffInDays($checkOut));
        $totalAmount = $nights * $testBoardingWithRelations->hotelRoom->daily_rate;
        
        echo "  Nights: {$nights}" . PHP_EOL;
        echo "  Total Amount: ₱{$totalAmount}" . PHP_EOL;
        
        // Create billing
        $baseItem = \App\Services\ServiceBillingService::createBaseServiceItem(
            'boarding',
            $testBoardingWithRelations->id,
            $testBoardingWithRelations->hotelRoom->name . ' - ' . $nights . ' day(s)',
            $totalAmount,
            $testBoardingWithRelations->pet_id
        );
        
        echo "  ✅ Created billing item ID: {$baseItem->id}" . PHP_EOL;
        echo "  Description: {$baseItem->description}" . PHP_EOL;
        echo "  Price: ₱{$baseItem->total_price}" . PHP_EOL;
        echo "  inventory_item_id: " . ($baseItem->inventory_item_id ?? 'NULL') . PHP_EOL;
        echo "  batch_id: " . ($baseItem->batch_id ?? 'NULL') . PHP_EOL;
        
    } else {
        echo "  ❌ Room relationship still fails" . PHP_EOL;
    }
}

echo PHP_EOL . "=== DEBUG COMPLETE ===" . PHP_EOL;
