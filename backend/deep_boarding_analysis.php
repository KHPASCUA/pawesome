<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== DEEP BOARDING ANALYSIS ===" . PHP_EOL;

// Get ALL boarding reservations and check each one
echo PHP_EOL . "1. ANALYZING ALL BOARDING RESERVATIONS" . PHP_EOL;

$boardingReservations = \App\Models\Boarding::where('status', 'approved')
    ->orderBy('id')
    ->get();

$totalBoardings = $boardingReservations->count();
$matchedBoardings = 0;
$mismatchedBoardings = [];

echo "Found {$totalBoardings} approved boarding reservations:" . PHP_EOL . PHP_EOL;

foreach ($boardingReservations as $boarding) {
    echo "=== Boarding Reservation {$boarding->id} ===" . PHP_EOL;
    
    // Get reservation details
    echo "Reservation Details:" . PHP_EOL;
    echo "  Reservation ID: {$boarding->id}" . PHP_EOL;
    echo "  Pet Name: {$boarding->pet_name}" . PHP_EOL;
    echo "  Customer: " . ($boarding->customer->name ?? 'N/A') . PHP_EOL;
    echo "  Check-in: {$boarding->check_in}" . PHP_EOL;
    echo "  Check-out: {$boarding->check_out}" . PHP_EOL;
    
    // Get room details
    $room = $boarding->hotelRoom;
    if ($room) {
        echo "  Room: {$room->name}" . PHP_EOL;
        echo "  Daily Rate: ₱{$room->daily_rate}" . PHP_EOL;
    } else {
        echo "  Room: NOT FOUND ❌" . PHP_EOL;
        continue;
    }
    
    // Calculate expected values
    $checkIn = new \Carbon\Carbon($boarding->check_in);
    $checkOut = new \Carbon\Carbon($boarding->check_out);
    $diffInDays = $checkIn->diffInDays($checkOut);
    $calculatedNights = max(1, $diffInDays);
    $expectedBasePrice = $calculatedNights * $room->daily_rate;
    
    echo "  Calculated Nights: {$calculatedNights}" . PHP_EOL;
    echo "  Expected Base Service Price: ₱{$expectedBasePrice}" . PHP_EOL;
    
    // Get all billing items for this reservation
    $billingItems = \App\Models\ServiceItemUsage::where('service_type', 'boarding')
        ->where('service_id', $boarding->id)
        ->get();
    
    if ($billingItems->isEmpty()) {
        echo "  Billing Items: NONE FOUND ❌" . PHP_EOL;
        $mismatchedBoardings[] = [
            'id' => $boarding->id,
            'issue' => 'No billing items found'
        ];
        echo PHP_EOL;
        continue;
    }
    
    echo "  Billing Items ({$billingItems->count()}):" . PHP_EOL;
    
    $baseServicePrice = 0;
    $addOnServicePrice = 0;
    $inventoryUsagePrice = 0;
    $otherItemsPrice = 0;
    
    foreach ($billingItems as $item) {
        echo "    - {$item->description}: ₱{$item->total_price} ({$item->item_type})" . PHP_EOL;
        
        switch ($item->item_type) {
            case 'base_service':
                $baseServicePrice += $item->total_price;
                break;
            case 'add_on_service':
                $addOnServicePrice += $item->total_price;
                break;
            case 'inventory_usage':
                $inventoryUsagePrice += $item->total_price;
                break;
            default:
                $otherItemsPrice += $item->total_price;
                break;
        }
    }
    
    // Calculate totals
    $calculatedTotal = $baseServicePrice + $addOnServicePrice + $inventoryUsagePrice + $otherItemsPrice;
    $systemTotal = \App\Models\ServiceItemUsage::calculateTotalBill('boarding', $boarding->id);
    
    echo "  Billing Breakdown:" . PHP_EOL;
    echo "    Base Service: ₱{$baseServicePrice}" . PHP_EOL;
    echo "    Add-on Service: ₱{$addOnServicePrice}" . PHP_EOL;
    echo "    Inventory Usage: ₱{$inventoryUsagePrice}" . PHP_EOL;
    echo "    Other Items: ₱{$otherItemsPrice}" . PHP_EOL;
    echo "    Calculated Total: ₱{$calculatedTotal}" . PHP_EOL;
    echo "    System Total: ₱{$systemTotal}" . PHP_EOL;
    
    // Check for matches
    $baseServiceMatches = abs($baseServicePrice - $expectedBasePrice) < 0.01;
    $totalMatches = abs($calculatedTotal - $systemTotal) < 0.01;
    
    echo "  Verification:" . PHP_EOL;
    echo "    Base Service Matches Expected: " . ($baseServiceMatches ? '✅' : '❌') . PHP_EOL;
    echo "    Total Calculation Matches: " . ($totalMatches ? '✅' : '❌') . PHP_EOL;
    
    if ($baseServiceMatches && $totalMatches) {
        $matchedBoardings++;
        echo "    Overall: ✅ MATCHED" . PHP_EOL;
    } else {
        $mismatchedBoardings[] = [
            'id' => $boarding->id,
            'expected_base' => $expectedBasePrice,
            'actual_base' => $baseServicePrice,
            'base_diff' => $baseServicePrice - $expectedBasePrice,
            'calculated_total' => $calculatedTotal,
            'system_total' => $systemTotal,
            'total_diff' => $systemTotal - $calculatedTotal
        ];
        echo "    Overall: ❌ MISMATCH" . PHP_EOL;
        
        if (!$baseServiceMatches) {
            echo "    Base Service Issue: Expected ₱{$expectedBasePrice}, Got ₱{$baseServicePrice} (diff: ₱" . ($baseServicePrice - $expectedBasePrice) . ")" . PHP_EOL;
        }
        if (!$totalMatches) {
            echo "    Total Calculation Issue: Calculated ₱{$calculatedTotal}, System ₱{$systemTotal} (diff: ₱" . ($systemTotal - $calculatedTotal) . ")" . PHP_EOL;
        }
    }
    
    echo PHP_EOL;
}

// Summary
echo "=== SUMMARY ===" . PHP_EOL;
echo "Total Boarding Reservations: {$totalBoardings}" . PHP_EOL;
echo "Matched: {$matchedBoardings}" . PHP_EOL;
echo "Mismatched: " . count($mismatchedBoardings) . PHP_EOL;

if (!empty($mismatchedBoardings)) {
    echo PHP_EOL . "MISMATCHED RESERVATIONS:" . PHP_EOL;
    foreach ($mismatchedBoardings as $mismatch) {
        echo "  Boarding {$mismatch['id']}:" . PHP_EOL;
        if (isset($mismatch['issue'])) {
            echo "    Issue: {$mismatch['issue']}" . PHP_EOL;
        } else {
            echo "    Expected Base: ₱{$mismatch['expected_base']}" . PHP_EOL;
            echo "    Actual Base: ₱{$mismatch['actual_base']}" . PHP_EOL;
            echo "    Base Diff: ₱{$mismatch['base_diff']}" . PHP_EOL;
            echo "    Calculated Total: ₱{$mismatch['calculated_total']}" . PHP_EOL;
            echo "    System Total: ₱{$mismatch['system_total']}" . PHP_EOL;
            echo "    Total Diff: ₱{$mismatch['total_diff']}" . PHP_EOL;
        }
    }
} else {
    echo "✅ ALL BOARDING RESERVATIONS MATCHED" . PHP_EOL;
}

echo PHP_EOL . "=== ANALYSIS COMPLETE ===" . PHP_EOL;
