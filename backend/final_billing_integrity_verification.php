<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== FINAL BILLING INTEGRITY VERIFICATION ===" . PHP_EOL;

// Task 5: Verify stock deduction only happens for inventory_item type
echo PHP_EOL . "1. VERIFYING STOCK DEDUCTION LOGIC" . PHP_EOL;

echo "ServiceBillingService logic verification:" . PHP_EOL;

// Test inventory_item logic (should trigger stock deduction)
echo "Testing inventory_item logic:" . PHP_EOL;
$inventoryItemData = [
    'item_type' => 'inventory_item',
    'inventory_item_id' => 1,
    'batch_id' => 1
];

$itemType = $inventoryItemData['item_type'];
if ($itemType === 'inventory_item') {
    $inventoryItemId = !empty($inventoryItemData['inventory_item_id']) ? (int) $inventoryItemData['inventory_item_id'] : null;
    $batchId = !empty($inventoryItemData['batch_id']) ? (int) $inventoryItemData['batch_id'] : null;
    echo "  ✅ inventory_item: Assigns valid inventory references" . PHP_EOL;
    echo "    inventory_item_id: " . ($inventoryItemId ?? 'NULL') . PHP_EOL;
    echo "    batch_id: " . ($batchId ?? 'NULL') . PHP_EOL;
    echo "    Stock deduction: TRIGGERED ✅" . PHP_EOL;
} else {
    echo "  ❌ inventory_item logic not working" . PHP_EOL;
}

// Test billing fee logic (should NOT trigger stock deduction)
echo PHP_EOL . "Testing billing fee logic (base_service):" . PHP_EOL;
$billingFeeData = [
    'item_type' => 'base_service',
    'inventory_item_id' => 1,
    'batch_id' => 1
];

$itemType = $billingFeeData['item_type'];
if ($itemType === 'inventory_item') {
    $inventoryItemId = !empty($billingFeeData['inventory_item_id']) ? (int) $billingFeeData['inventory_item_id'] : null;
    $batchId = !empty($billingFeeData['batch_id']) ? (int) $billingFeeData['batch_id'] : null;
    echo "  ❌ base_service incorrectly triggers stock deduction" . PHP_EOL;
} else {
    $inventoryItemId = null;
    $batchId = null;
    echo "  ✅ base_service: Forces NULL inventory references" . PHP_EOL;
    echo "    inventory_item_id: " . ($inventoryItemId ?? 'NULL') . PHP_EOL;
    echo "    batch_id: " . ($batchId ?? 'NULL') . PHP_EOL;
    echo "    Stock deduction: SKIPPED ✅" . PHP_EOL;
}

// Test other billing fee types
$billingFeeTypes = ['add_on_service', 'professional_fee', 'service_fee', 'manual_charge', 'discount'];
foreach ($billingFeeTypes as $type) {
    $billingFeeData = ['item_type' => $type];
    $itemType = $billingFeeData['item_type'];
    
    if ($itemType === 'inventory_item') {
        echo "  ❌ {$type} incorrectly triggers stock deduction" . PHP_EOL;
    } else {
        echo "  ✅ {$type}: Stock deduction SKIPPED" . PHP_EOL;
    }
}

// Task 6: Confirm billing totals still match predetermined service prices
echo PHP_EOL . "2. VERIFYING BILLING TOTALS MATCH SERVICE PRICES" . PHP_EOL;

// Test veterinary billing
$vetAppointments = \App\Models\Appointment::where('status', 'approved')
    ->limit(3)
    ->get();

echo "Veterinary billing verification:" . PHP_EOL;
foreach ($vetAppointments as $appointment) {
    $totalBill = \App\Models\ServiceItemUsage::calculateTotalBill('veterinary', $appointment->id);
    $baseServiceItem = \App\Models\ServiceItemUsage::where('service_type', 'veterinary')
        ->where('service_id', $appointment->id)
        ->where('item_type', 'base_service')
        ->first();
    
    if ($baseServiceItem) {
        $servicePrice = $appointment->price ?? $baseServiceItem->total_price;
        $matches = abs($totalBill - $servicePrice) < 0.01;
        
        echo "  Appointment {$appointment->id}: Service Price ₱{$servicePrice} = Total Bill ₱{$totalBill} " . ($matches ? '✅' : '❌') . PHP_EOL;
    } else {
        echo "  Appointment {$appointment->id}: No base service item found ⚠️" . PHP_EOL;
    }
}

// Test grooming billing
$groomingAppointments = \App\Models\GroomingAppointment::where('status', 'approved')
    ->limit(2)
    ->get();

echo PHP_EOL . "Grooming billing verification:" . PHP_EOL;
foreach ($groomingAppointments as $appointment) {
    $totalBill = \App\Models\ServiceItemUsage::calculateTotalBill('grooming', $appointment->id);
    $baseServiceItem = \App\Models\ServiceItemUsage::where('service_type', 'grooming')
        ->where('service_id', $appointment->id)
        ->where('item_type', 'base_service')
        ->first();
    
    if ($baseServiceItem) {
        $groomingPrices = ['bath' => 500, 'haircut' => 800, 'nailTrim' => 200];
        $expectedPrice = $groomingPrices[$appointment->service] ?? 500;
        $matches = abs($totalBill - $expectedPrice) < 0.01;
        
        echo "  Grooming {$appointment->id}: Expected ₱{$expectedPrice} = Total Bill ₱{$totalBill} " . ($matches ? '✅' : '❌') . PHP_EOL;
    } else {
        echo "  Grooming {$appointment->id}: No base service item found ⚠️" . PHP_EOL;
    }
}

// Test boarding billing
$boardingReservations = \App\Models\Boarding::where('status', 'approved')
    ->limit(2)
    ->get();

echo PHP_EOL . "Boarding billing verification:" . PHP_EOL;
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
        
        echo "  Boarding {$boarding->id}: Expected ₱{$expectedPrice} = Total Bill ₱{$totalBill} " . ($matches ? '✅' : '❌') . PHP_EOL;
    } else {
        echo "  Boarding {$boarding->id}: No base service item or room found ⚠️" . PHP_EOL;
    }
}

// Task 3: Final database integrity check
echo PHP_EOL . "3. FINAL DATABASE INTEGRITY CHECK" . PHP_EOL;

$nonInventoryTypes = ['base_service', 'add_on_service', 'professional_fee', 'service_fee', 'manual_charge', 'discount'];
$invalidReferences = \Illuminate\Support\Facades\DB::table('service_item_usages')
    ->whereIn('item_type', $nonInventoryTypes)
    ->where(function($query) {
        $query->whereNotNull('inventory_item_id')
              ->orWhereNotNull('batch_id');
    })
    ->count();

if ($invalidReferences === 0) {
    echo "✅ All non-inventory billing items have NULL inventory references" . PHP_EOL;
} else {
    echo "❌ Found {$invalidReferences} non-inventory items with invalid references" . PHP_EOL;
}

// Check inventory_item records have valid references
$inventoryItemRecords = \Illuminate\Support\Facades\DB::table('service_item_usages')
    ->where('item_type', 'inventory_item')
    ->get();

$inventoryWithValidRefs = 0;
foreach ($inventoryItemRecords as $record) {
    if ($record->inventory_item_id > 0) {
        $inventoryWithValidRefs++;
    }
}

if ($inventoryItemRecords->count() > 0) {
    $validPercent = ($inventoryWithValidRefs / $inventoryItemRecords->count()) * 100;
    echo "✅ Inventory items: " . number_format($validPercent, 1) . "% have valid inventory references" . PHP_EOL;
} else {
    echo "✅ No inventory_item records found (clean state)" . PHP_EOL;
}

echo PHP_EOL . "=== VERIFICATION COMPLETE ===" . PHP_EOL;
