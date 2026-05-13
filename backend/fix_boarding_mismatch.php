<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== FIXING BOARDING BILLING MISMATCH ===" . PHP_EOL;

// Fix boarding reservation 32
echo PHP_EOL . "1. FIXING BOARDING RESERVATION 32" . PHP_EOL;

$boarding = \App\Models\Boarding::find(32);
if (!$boarding) {
    echo "❌ Boarding reservation 32 not found" . PHP_EOL;
    exit(1);
}

echo "Current reservation details:" . PHP_EOL;
echo "  ID: {$boarding->id}" . PHP_EOL;
echo "  Pet: {$boarding->pet_name}" . PHP_EOL;
echo "  Room: " . ($boarding->hotelRoom->name ?? 'N/A') . PHP_EOL;
echo "  Check-in: {$boarding->check_in}" . PHP_EOL;
echo "  Check-out: {$boarding->check_out}" . PHP_EOL;
echo "  Daily Rate: ₱{$boarding->hotelRoom->daily_rate}" . PHP_EOL;

// Calculate correct days and price
$checkIn = new \Carbon\Carbon($boarding->check_in);
$checkOut = new \Carbon\Carbon($boarding->check_out);
$correctDays = max(1, $checkIn->diffInDays($checkOut));
$correctPrice = $correctDays * $boarding->hotelRoom->daily_rate;

echo "Correct calculation:" . PHP_EOL;
echo "  Days: {$correctDays}" . PHP_EOL;
echo "  Expected Price: ₱{$correctPrice}" . PHP_EOL;

// Find and update the base service item
$baseServiceItem = \App\Models\ServiceItemUsage::where('service_type', 'boarding')
    ->where('service_id', $boarding->id)
    ->where('item_type', 'base_service')
    ->first();

if ($baseServiceItem) {
    echo PHP_EOL . "Current base service item:" . PHP_EOL;
    echo "  ID: {$baseServiceItem->id}" . PHP_EOL;
    echo "  Description: {$baseServiceItem->description}" . PHP_EOL;
    echo "  Unit Price: ₱{$baseServiceItem->unit_price}" . PHP_EOL;
    echo "  Total Price: ₱{$baseServiceItem->total_price}" . PHP_EOL;
    
    echo PHP_EOL . "Updating base service item..." . PHP_EOL;
    
    $baseServiceItem->description = $boarding->hotelRoom->name . ' - ' . $correctDays . ' day(s)';
    $baseServiceItem->unit_price = $boarding->hotelRoom->daily_rate;
    $baseServiceItem->total_price = $correctPrice;
    $baseServiceItem->save();
    
    echo "✅ Updated base service item:" . PHP_EOL;
    echo "  New Description: {$baseServiceItem->description}" . PHP_EOL;
    echo "  New Unit Price: ₱{$baseServiceItem->unit_price}" . PHP_EOL;
    echo "  New Total Price: ₱{$baseServiceItem->total_price}" . PHP_EOL;
} else {
    echo "❌ No base service item found for boarding reservation 32" . PHP_EOL;
    exit(1);
}

// Verify the fix
echo PHP_EOL . "2. VERIFYING THE FIX" . PHP_EOL;

$newTotalBill = \App\Models\ServiceItemUsage::calculateTotalBill('boarding', $boarding->id);
echo "New total bill: ₱{$newTotalBill}" . PHP_EOL;
echo "Expected price: ₱{$correctPrice}" . PHP_EOL;

$matches = abs($newTotalBill - $correctPrice) < 0.01;
echo "Fix verification: " . ($matches ? '✅ MATCHES' : '❌ STILL MISMATCH') . PHP_EOL;

if ($matches) {
    echo "✅ Boarding reservation 32 is now correctly calculated" . PHP_EOL;
} else {
    echo "❌ Fix failed - still mismatched" . PHP_EOL;
    echo "  Difference: ₱" . ($newTotalBill - $correctPrice) . PHP_EOL;
}

echo PHP_EOL . "=== FIX COMPLETE ===" . PHP_EOL;
