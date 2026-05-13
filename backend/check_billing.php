<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== BILLING VERIFICATION ===" . PHP_EOL;

// Check existing billing items
$billingItems = \App\Models\ServiceItemUsage::orderBy('created_at', 'desc')
    ->limit(10)
    ->get();

echo "Total ServiceItemUsages: " . \App\Models\ServiceItemUsage::count() . PHP_EOL;
echo PHP_EOL;

foreach ($billingItems as $item) {
    echo "ID: {$item->id}" . PHP_EOL;
    echo "Service Type: {$item->service_type}" . PHP_EOL;
    echo "Service ID: {$item->service_id}" . PHP_EOL;
    echo "Item Type: {$item->item_type}" . PHP_EOL;
    echo "Description: {$item->description}" . PHP_EOL;
    echo "Unit Price: ₱{$item->unit_price}" . PHP_EOL;
    echo "Total Price: ₱{$item->total_price}" . PHP_EOL;
    echo "Is Paid: " . ($item->is_paid ? 'Yes' : 'No') . PHP_EOL;
    echo "Created: {$item->created_at}" . PHP_EOL;
    echo "---" . PHP_EOL;
}

// Check approved services
echo PHP_EOL . "=== APPROVED SERVICES ===" . PHP_EOL;

$vetAppointments = \App\Models\Appointment::where('status', 'approved')->limit(3)->get();
echo "Approved Vet Appointments: " . $vetAppointments->count() . PHP_EOL;

foreach ($vetAppointments as $apt) {
    $billingItems = \App\Models\ServiceItemUsage::where('service_type', 'veterinary')
        ->where('service_id', $apt->id)
        ->get();
    $baseServiceCount = $billingItems->where('item_type', 'base_service')->count();
    $totalBill = \App\Models\ServiceItemUsage::calculateTotalBill('veterinary', $apt->id);
    echo "Appointment ID: {$apt->id}, Total Bill: ₱{$totalBill}, Base Service Items: {$baseServiceCount}" . PHP_EOL;
}

$groomingAppointments = \App\Models\GroomingAppointment::where('status', 'approved')->limit(3)->get();
echo "Approved Grooming Appointments: " . $groomingAppointments->count() . PHP_EOL;

foreach ($groomingAppointments as $apt) {
    $billingItems = \App\Models\ServiceItemUsage::where('service_type', 'grooming')
        ->where('service_id', $apt->id)
        ->get();
    $baseServiceCount = $billingItems->where('item_type', 'base_service')->count();
    $totalBill = \App\Models\ServiceItemUsage::calculateTotalBill('grooming', $apt->id);
    echo "Grooming ID: {$apt->id}, Total Bill: ₱{$totalBill}, Base Service Items: {$baseServiceCount}" . PHP_EOL;
}

$boarding = \App\Models\Boarding::where('status', 'approved')->limit(3)->get();
echo "Approved Boarding: " . $boarding->count() . PHP_EOL;

foreach ($boarding as $board) {
    $billingItems = \App\Models\ServiceItemUsage::where('service_type', 'boarding')
        ->where('service_id', $board->id)
        ->get();
    $baseServiceCount = $billingItems->where('item_type', 'base_service')->count();
    $totalBill = \App\Models\ServiceItemUsage::calculateTotalBill('boarding', $board->id);
    echo "Boarding ID: {$board->id}, Total Bill: ₱{$totalBill}, Base Service Items: {$baseServiceCount}" . PHP_EOL;
}

echo PHP_EOL . "=== VERIFICATION COMPLETE ===" . PHP_EOL;
