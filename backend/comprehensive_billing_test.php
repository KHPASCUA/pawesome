<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== COMPREHENSIVE BILLING VERIFICATION TEST ===" . PHP_EOL;

// Simulate service approval process for all three service types
echo PHP_EOL . "1. VETERINARY SERVICE APPROVAL TEST" . PHP_EOL;

try {
    // Find an approved vet appointment without base service billing
    $appointment = \App\Models\Appointment::where('status', 'approved')
        ->whereNotIn('id', function($query) {
            $query->select('service_id')
                ->from('service_item_usages')
                ->where('service_type', 'veterinary')
                ->where('item_type', 'base_service');
        })
        ->first();

    if ($appointment) {
        echo "Found vet appointment ID: {$appointment->id}" . PHP_EOL;
        echo "Service: {$appointment->service->name}" . PHP_EOL;
        echo "Price: ₱{$appointment->price}" . PHP_EOL;
        
        // Simulate approval process - create base service billing
        $baseItem = \App\Services\ServiceBillingService::createBaseServiceItem(
            'veterinary',
            $appointment->id,
            $appointment->service->name,
            $appointment->price,
            $appointment->pet_id
        );
        
        echo "✅ Base service billing created: ID {$baseItem->id}" . PHP_EOL;
        echo "   Price: ₱{$baseItem->total_price}" . PHP_EOL;
        echo "   Inventory ID: " . ($baseItem->inventory_item_id ?? 'NULL') . PHP_EOL;
        echo "   Batch ID: " . ($baseItem->batch_id ?? 'NULL') . PHP_EOL;
        
        // Verify billing total
        $totalBill = \App\Models\ServiceItemUsage::calculateTotalBill('veterinary', $appointment->id);
        echo "   Total Bill: ₱{$totalBill}" . PHP_EOL;
        
        if ($totalBill == $appointment->price) {
            echo "✅ VERIFIED: Billing amount matches service price" . PHP_EOL;
        } else {
            echo "❌ MISMATCH: Expected ₱{$appointment->price}, got ₱{$totalBill}" . PHP_EOL;
        }
    } else {
        echo "No vet appointments available for testing" . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "2. GROOMING SERVICE APPROVAL TEST" . PHP_EOL;

try {
    // Find a grooming appointment
    $grooming = \App\Models\GroomingAppointment::where('status', 'approved')->first();
    
    if ($grooming) {
        echo "Found grooming appointment ID: {$grooming->id}" . PHP_EOL;
        echo "Service: {$grooming->service}" . PHP_EOL;
        
        // Get grooming price from the hardcoded prices in GroomingController
        $groomingPrices = [
            'bath' => 500,
            'haircut' => 800,
            'nailTrim' => 200
        ];
        $expectedPrice = $groomingPrices[$grooming->service] ?? 500;
        
        echo "Expected Price: ₱{$expectedPrice}" . PHP_EOL;
        
        // Simulate approval process - create base service billing
        $baseItem = \App\Services\ServiceBillingService::createBaseServiceItem(
            'grooming',
            $grooming->id,
            ucfirst($grooming->service) . ' Service',
            $expectedPrice,
            $grooming->pet_id
        );
        
        echo "✅ Base service billing created: ID {$baseItem->id}" . PHP_EOL;
        echo "   Price: ₱{$baseItem->total_price}" . PHP_EOL;
        echo "   Inventory ID: " . ($baseItem->inventory_item_id ?? 'NULL') . PHP_EOL;
        echo "   Batch ID: " . ($baseItem->batch_id ?? 'NULL') . PHP_EOL;
        
        // Verify billing total
        $totalBill = \App\Models\ServiceItemUsage::calculateTotalBill('grooming', $grooming->id);
        echo "   Total Bill: ₱{$totalBill}" . PHP_EOL;
        
        if ($totalBill == $expectedPrice) {
            echo "✅ VERIFIED: Billing amount matches service price" . PHP_EOL;
        } else {
            echo "❌ MISMATCH: Expected ₱{$expectedPrice}, got ₱{$totalBill}" . PHP_EOL;
        }
    } else {
        echo "No grooming appointments available for testing" . PHP_EOL;
        // Create a test grooming appointment
        echo "Creating test grooming appointment..." . PHP_EOL;
        $pet = \App\Models\Pet::first();
        if ($pet) {
            $testGrooming = \App\Models\GroomingAppointment::create([
                'pet_id' => $pet->id,
                'pet_name' => $pet->name,
                'service' => 'bath',
                'appointment_date' => now()->addDay(),
                'status' => 'approved',
                'notes' => 'Test grooming appointment'
            ]);
            
            $expectedPrice = 500; // bath price
            $baseItem = \App\Services\ServiceBillingService::createBaseServiceItem(
                'grooming',
                $testGrooming->id,
                'Basic Bath Service',
                $expectedPrice,
                $testGrooming->pet_id
            );
            
            echo "✅ Created test grooming appointment with billing: ID {$testGrooming->id}" . PHP_EOL;
            echo "   Billing Price: ₱{$baseItem->total_price}" . PHP_EOL;
            echo "   Inventory ID: " . ($baseItem->inventory_item_id ?? 'NULL') . PHP_EOL;
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "3. BOARDING SERVICE APPROVAL TEST" . PHP_EOL;

try {
    // Find a boarding reservation
    $boarding = \App\Models\Boarding::where('status', 'approved')->first();
    
    if ($boarding) {
        echo "Found boarding reservation ID: {$boarding->id}" . PHP_EOL;
        echo "Room: " . ($boarding->hotelRoom->name ?? 'No Room') . PHP_EOL;
        
        if ($boarding->hotelRoom) {
            $checkIn = new \Carbon\Carbon($boarding->check_in);
            $checkOut = new \Carbon\Carbon($boarding->check_out);
            $days = max(1, $checkIn->diffInDays($checkOut));
            $expectedPrice = $days * $boarding->hotelRoom->daily_rate;
            
            echo "Stay Duration: {$days} day(s)" . PHP_EOL;
            echo "Daily Rate: ₱{$boarding->hotelRoom->daily_rate}" . PHP_EOL;
            echo "Expected Price: ₱{$expectedPrice}" . PHP_EOL;
            
            // Simulate approval process - create base service billing
            $baseItem = \App\Services\ServiceBillingService::createBaseServiceItem(
                'boarding',
                $boarding->id,
                $boarding->hotelRoom->name . ' - ' . $days . ' day(s)',
                $expectedPrice,
                $boarding->pet_id
            );
            
            echo "✅ Base service billing created: ID {$baseItem->id}" . PHP_EOL;
            echo "   Price: ₱{$baseItem->total_price}" . PHP_EOL;
            echo "   Inventory ID: " . ($baseItem->inventory_item_id ?? 'NULL') . PHP_EOL;
            echo "   Batch ID: " . ($baseItem->batch_id ?? 'NULL') . PHP_EOL;
            
            // Verify billing total
            $totalBill = \App\Models\ServiceItemUsage::calculateTotalBill('boarding', $boarding->id);
            echo "   Total Bill: ₱{$totalBill}" . PHP_EOL;
            
            if ($totalBill == $expectedPrice) {
                echo "✅ VERIFIED: Billing amount matches calculated price" . PHP_EOL;
            } else {
                echo "❌ MISMATCH: Expected ₱{$expectedPrice}, got ₱{$totalBill}" . PHP_EOL;
            }
        } else {
            echo "❌ No room assigned to boarding reservation" . PHP_EOL;
        }
    } else {
        echo "No boarding reservations available for testing" . PHP_EOL;
        // Create a test boarding reservation
        echo "Creating test boarding reservation..." . PHP_EOL;
        $pet = \App\Models\Pet::first();
        $room = \App\Models\HotelRoom::first();
        
        if ($pet && $room) {
            $testBoarding = \App\Models\Boarding::create([
                'pet_id' => $pet->id,
                'pet_name' => $pet->name,
                'customer_id' => $pet->customer_id,
                'hotel_room_id' => $room->id,
                'check_in' => now()->addDay(),
                'check_out' => now()->addDays(3),
                'status' => 'approved',
                'notes' => 'Test boarding reservation'
            ]);
            
            $days = 3;
            $expectedPrice = $days * $room->daily_rate;
            $baseItem = \App\Services\ServiceBillingService::createBaseServiceItem(
                'boarding',
                $testBoarding->id,
                $room->name . ' - ' . $days . ' day(s)',
                $expectedPrice,
                $testBoarding->pet_id
            );
            
            echo "✅ Created test boarding reservation with billing: ID {$testBoarding->id}" . PHP_EOL;
            echo "   Billing Price: ₱{$baseItem->total_price}" . PHP_EOL;
            echo "   Inventory ID: " . ($baseItem->inventory_item_id ?? 'NULL') . PHP_EOL;
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "4. BILLING SYSTEM ARCHITECTURE VERIFICATION" . PHP_EOL;

// Verify that billing fees have NULL inventory references
$baseServiceItems = \App\Models\ServiceItemUsage::where('item_type', 'base_service')->get();
$addOnItems = \App\Models\ServiceItemUsage::where('item_type', 'add_on_service')->get();
$inventoryItems = \App\Models\ServiceItemUsage::where('item_type', 'inventory_usage')->get();

echo "Base Service Items: " . $baseServiceItems->count() . PHP_EOL;
foreach ($baseServiceItems->take(3) as $item) {
    $invNull = $item->inventory_item_id === null ? '✅ NULL' : '❌ NOT NULL';
    $batchNull = $item->batch_id === null ? '✅ NULL' : '❌ NOT NULL';
    echo "  ID {$item->id}: {$invNull} inventory, {$batchNull} batch" . PHP_EOL;
}

echo "Add-on Service Items: " . $addOnItems->count() . PHP_EOL;
foreach ($addOnItems->take(3) as $item) {
    $invNull = $item->inventory_item_id === null ? '✅ NULL' : '❌ NOT NULL';
    $batchNull = $item->batch_id === null ? '✅ NULL' : '❌ NOT NULL';
    echo "  ID {$item->id}: {$invNull} inventory, {$batchNull} batch" . PHP_EOL;
}

echo "Inventory Usage Items: " . $inventoryItems->count() . PHP_EOL;
foreach ($inventoryItems->take(3) as $item) {
    $invValid = $item->inventory_item_id > 0 ? '✅ VALID' : '❌ INVALID';
    $batchValid = $item->batch_id > 0 ? '✅ VALID' : '❌ INVALID';
    echo "  ID {$item->id}: {$invValid} inventory, {$batchValid} batch" . PHP_EOL;
}

echo PHP_EOL . "=== COMPREHENSIVE TEST COMPLETE ===" . PHP_EOL;
