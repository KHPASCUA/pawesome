<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== INVESTIGATING BOARDING BILLING MISMATCH ===" . PHP_EOL;

// Find the boarding reservation with mismatch
echo PHP_EOL . "1. FINDING BOARDING RESERVATION WITH MISMATCH" . PHP_EOL;

$boardingReservations = \App\Models\Boarding::where('status', 'approved')
    ->limit(5)
    ->get();

$mismatchFound = false;
$mismatchDetails = null;

foreach ($boardingReservations as $boarding) {
    $totalBill = \App\Models\ServiceItemUsage::calculateTotalBill('boarding', $boarding->id);
    $baseServiceItem = \App\Models\ServiceItemUsage::where('service_type', 'boarding')
        ->where('service_id', $boarding->id)
        ->where('item_type', 'base_service')
        ->first();
    
    if ($baseServiceItem && $boarding->hotelRoom) {
        $checkIn = new \Carbon\Carbon($boarding->check_in);
        $checkOut = new \Carbon\Carbon($boarding->check_out);
        $days = max(1, $checkIn->diffInDays($checkOut));
        $expectedPrice = $days * $boarding->hotelRoom->daily_rate;
        $matches = abs($totalBill - $expectedPrice) < 0.01;
        
        echo "Boarding {$boarding->id}: Expected ₱{$expectedPrice} = Total Bill ₱{$totalBill} " . ($matches ? '✅' : '❌') . PHP_EOL;
        
        if (!$matches) {
            $mismatchFound = true;
            $mismatchDetails = [
                'boarding' => $boarding,
                'total_bill' => $totalBill,
                'expected_price' => $expectedPrice,
                'days' => $days,
                'daily_rate' => $boarding->hotelRoom->daily_rate
            ];
            break;
        }
    } else {
        echo "Boarding {$boarding->id}: No base service item or room found ⚠️" . PHP_EOL;
    }
}

if (!$mismatchFound) {
    echo "✅ No boarding mismatches found" . PHP_EOL;
    exit;
}

echo PHP_EOL . "2. ANALYZING MISMATCH FOR BOARDING {$mismatchDetails['boarding']->id}" . PHP_EOL;

$boarding = $mismatchDetails['boarding'];
echo "Reservation Details:" . PHP_EOL;
echo "  ID: {$boarding->id}" . PHP_EOL;
echo "  Pet: {$boarding->pet_name}" . PHP_EOL;
echo "  Room: " . ($boarding->hotelRoom->name ?? 'N/A') . PHP_EOL;
echo "  Check-in: {$boarding->check_in}" . PHP_EOL;
echo "  Check-out: {$boarding->check_out}" . PHP_EOL;
echo "  Daily Rate: ₱{$mismatchDetails['daily_rate']}" . PHP_EOL;
echo "  Calculated Days: {$mismatchDetails['days']}" . PHP_EOL;
echo "  Expected Price: ₱{$mismatchDetails['expected_price']}" . PHP_EOL;
echo "  Actual Total Bill: ₱{$mismatchDetails['total_bill']}" . PHP_EOL;
echo "  Difference: ₱" . ($mismatchDetails['total_bill'] - $mismatchDetails['expected_price']) . PHP_EOL;

// Check all billing items for this reservation
echo PHP_EOL . "3. BILLING ITEMS BREAKDOWN" . PHP_EOL;

$billingItems = \App\Models\ServiceItemUsage::where('service_type', 'boarding')
    ->where('service_id', $boarding->id)
    ->get();

if ($billingItems->isEmpty()) {
    echo "  ❌ No billing items found for this reservation" . PHP_EOL;
} else {
    $calculatedTotal = 0;
    foreach ($billingItems as $item) {
        echo "  - {$item->description}: ₱{$item->total_price} ({$item->item_type})" . PHP_EOL;
        echo "    inventory_id: " . ($item->inventory_item_id ?? 'NULL') . PHP_EOL;
        echo "    batch_id: " . ($item->batch_id ?? 'NULL') . PHP_EOL;
        $calculatedTotal += $item->total_price;
    }
    
    echo PHP_EOL . "  Calculated Total: ₱{$calculatedTotal}" . PHP_EOL;
    echo "  System Total: ₱{$mismatchDetails['total_bill']}" . PHP_EOL;
    
    if (abs($calculatedTotal - $mismatchDetails['total_bill']) < 0.01) {
        echo "  ✅ Calculated total matches system total" . PHP_EOL;
    } else {
        echo "  ❌ Calculated total does not match system total" . PHP_EOL;
    }
}

// Manual date calculation verification
echo PHP_EOL . "4. MANUAL DATE CALCULATION VERIFICATION" . PHP_EOL;

$checkIn = new \Carbon\Carbon($boarding->check_in);
$checkOut = new \Carbon\Carbon($boarding->check_out);
echo "  Check-in: {$checkIn->format('Y-m-d H:i:s')}" . PHP_EOL;
echo "  Check-out: {$checkOut->format('Y-m-d H:i:s')}" . PHP_EOL;

$manualDays = $checkIn->diffInDays($checkOut);
echo "  diffInDays: {$manualDays}" . PHP_EOL;

$manualDaysMax1 = max(1, $manualDays);
echo "  max(1, diffInDays): {$manualDaysMax1}" . PHP_EOL;

// Check if there are any partial days
$hours = $checkIn->diffInHours($checkOut);
echo "  Total hours: {$hours}" . PHP_EOL;
$partialDays = $hours / 24;
echo "  Hours/24: " . number_format($partialDays, 2) . PHP_EOL;

// Check if the base service item was calculated correctly
echo PHP_EOL . "5. BASE SERVICE ITEM ANALYSIS" . PHP_EOL;

$baseServiceItem = \App\Models\ServiceItemUsage::where('service_type', 'boarding')
    ->where('service_id', $boarding->id)
    ->where('item_type', 'base_service')
    ->first();

if ($baseServiceItem) {
    echo "  Base Service Item:" . PHP_EOL;
    echo "    ID: {$baseServiceItem->id}" . PHP_EOL;
    echo "    Description: {$baseServiceItem->description}" . PHP_EOL;
    echo "    Unit Price: ₱{$baseServiceItem->unit_price}" . PHP_EOL;
    echo "    Total Price: ₱{$baseServiceItem->total_price}" . PHP_EOL;
    echo "    Created: {$baseServiceItem->created_at}" . PHP_EOL;
    
    // Try to parse the description to see how it was calculated
    if (preg_match('/(\d+)\s+day\(s\)/', $baseServiceItem->description, $matches)) {
        $recordedDays = (int) $matches[1];
        echo "    Recorded days from description: {$recordedDays}" . PHP_EOL;
        
        $recordedPrice = $recordedDays * $boarding->hotelRoom->daily_rate;
        echo "    Expected from recorded days: ₱{$recordedPrice}" . PHP_EOL;
        
        if (abs($baseServiceItem->total_price - $recordedPrice) < 0.01) {
            echo "    ✅ Base service price matches recorded days calculation" . PHP_EOL;
        } else {
            echo "    ❌ Base service price does not match recorded days calculation" . PHP_EOL;
        }
    }
} else {
    echo "  ❌ No base service item found" . PHP_EOL;
}

echo PHP_EOL . "=== INVESTIGATION COMPLETE ===" . PHP_EOL;
