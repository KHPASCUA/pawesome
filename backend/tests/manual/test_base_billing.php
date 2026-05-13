<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TESTING BASE SERVICE BILLING CREATION ===" . PHP_EOL;

// Find an existing appointment that doesn't have base service billing
$appointment = \App\Models\Appointment::where('status', 'approved')
    ->whereNotIn('id', function($query) {
        $query->select('service_id')
            ->from('service_item_usages')
            ->where('service_type', 'veterinary')
            ->where('item_type', 'base_service');
    })
    ->first();

if (!$appointment) {
    echo "No approved appointments found without base service billing items." . PHP_EOL;
    echo "Creating a test appointment..." . PHP_EOL;
    
    // Create a test appointment
    $service = \App\Models\Service::first();
    $pet = \App\Models\Pet::first();
    $customer = $pet ? $pet->customer : \App\Models\Customer::first();
    $vet = \App\Models\User::where('role', 'veterinary')->first();
    
    if (!$service || !$pet || !$customer || !$vet) {
        echo "Missing required data for test appointment." . PHP_EOL;
        exit(1);
    }
    
    $appointment = \App\Models\Appointment::create([
        'customer_id' => $customer->id,
        'pet_id' => $pet->id,
        'service_id' => $service->id,
        'veterinarian_id' => $vet->id,
        'scheduled_at' => now()->addHour(),
        'status' => 'approved',
        'price' => $service->price ?? 500,
        'notes' => 'Test appointment for billing verification'
    ]);
    
    echo "Created test appointment ID: {$appointment->id}" . PHP_EOL;
}

echo "Testing with Appointment ID: {$appointment->id}" . PHP_EOL;
echo "Service: {$appointment->service->name}" . PHP_EOL;
echo "Price: ₱{$appointment->price}" . PHP_EOL;

// Check if base service billing item exists
$existingBaseItem = \App\Models\ServiceItemUsage::where('service_type', 'veterinary')
    ->where('service_id', $appointment->id)
    ->where('item_type', 'base_service')
    ->first();

if ($existingBaseItem) {
    echo "Base service billing item already exists:" . PHP_EOL;
    echo "  ID: {$existingBaseItem->id}" . PHP_EOL;
    echo "  Description: {$existingBaseItem->description}" . PHP_EOL;
    echo "  Price: ₱{$existingBaseItem->total_price}" . PHP_EOL;
} else {
    echo "No base service billing item found. Creating one..." . PHP_EOL;
    
    // Create base service billing item using the service
    try {
        $baseItem = \App\Services\ServiceBillingService::createBaseServiceItem(
            'veterinary',
            $appointment->id,
            $appointment->service->name ?? 'Veterinary Consultation',
            $appointment->price ?? 500,
            $appointment->pet_id
        );
        
        echo "Created base service billing item:" . PHP_EOL;
        echo "  ID: {$baseItem->id}" . PHP_EOL;
        echo "  Description: {$baseItem->description}" . PHP_EOL;
        echo "  Unit Price: ₱{$baseItem->unit_price}" . PHP_EOL;
        echo "  Total Price: ₱{$baseItem->total_price}" . PHP_EOL;
        echo "  Item Type: {$baseItem->item_type}" . PHP_EOL;
        
    } catch (Exception $e) {
        echo "Error creating base service billing item: " . $e->getMessage() . PHP_EOL;
    }
}

// Verify the billing totals
$totalBill = \App\Models\ServiceItemUsage::calculateTotalBill('veterinary', $appointment->id);
$totalPaid = \App\Models\ServiceItemUsage::calculateTotalPaid('veterinary', $appointment->id);
$balanceDue = $totalBill - $totalPaid;

echo PHP_EOL . "Billing Summary for Appointment {$appointment->id}:" . PHP_EOL;
echo "  Total Bill: ₱{$totalBill}" . PHP_EOL;
echo "  Total Paid: ₱{$totalPaid}" . PHP_EOL;
echo "  Balance Due: ₱{$balanceDue}" . PHP_EOL;

// Get itemized billing
$items = \App\Models\ServiceItemUsage::getItemizedBilling('veterinary', $appointment->id);
echo "  Billing Items: " . $items->count() . PHP_EOL;

foreach ($items as $item) {
    echo "    - {$item->description}: ₱{$item->total_price} ({$item->item_type})" . PHP_EOL;
}

echo PHP_EOL . "=== TEST COMPLETE ===" . PHP_EOL;
