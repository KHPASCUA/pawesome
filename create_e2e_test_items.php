<?php

require_once 'backend/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CREATING E2E TEST ITEMS FOR RECEPTIONIST TESTING ===\n";

// Create E2E Boarding Food item
$boardingFood = DB::table('inventory_items')->where('name', 'E2E Boarding Food')->first();
if (!$boardingFood) {
    $boardingFoodId = DB::table('inventory_items')->insertGetId([
        'name' => 'E2E Boarding Food',
        'sku' => 'E2E-BOARDING-FOOD',
        'category' => 'Food',
        'stock' => 50,
        'price' => 25.00,
        'is_sellable' => 0,
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "Created E2E Boarding Food with ID: $boardingFoodId\n";
} else {
    echo "E2E Boarding Food already exists with ID: {$boardingFood->id}\n";
}

// Create E2E Grooming Shampoo item
$groomingShampoo = DB::table('inventory_items')->where('name', 'E2E Grooming Shampoo')->first();
if (!$groomingShampoo) {
    $groomingShampooId = DB::table('inventory_items')->insertGetId([
        'name' => 'E2E Grooming Shampoo',
        'sku' => 'E2E-GROOMING-SHAMPOO',
        'category' => 'Grooming',
        'stock' => 30,
        'price' => 15.00,
        'is_sellable' => 0,
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "Created E2E Grooming Shampoo with ID: $groomingShampooId\n";
} else {
    echo "E2E Grooming Shampoo already exists with ID: {$groomingShampoo->id}\n";
}

// Check existing service requests for testing
echo "\nChecking existing service requests for testing:\n";
$vetRequests = DB::table('service_requests')
    ->where('service_type', 'veterinary')
    ->where('status', 'pending')
    ->limit(3)
    ->get(['id', 'customer_id', 'pet_id', 'service_type', 'status']);

foreach ($vetRequests as $request) {
    echo "Vet Request ID: {$request->id}, Customer: {$request->customer_id}, Pet: {$request->pet_id}, Status: {$request->status}\n";
}

$groomingRequests = DB::table('service_requests')
    ->where('service_type', 'grooming')
    ->where('status', 'pending')
    ->limit(3)
    ->get(['id', 'customer_id', 'pet_id', 'service_type', 'status']);

foreach ($groomingRequests as $request) {
    echo "Grooming Request ID: {$request->id}, Customer: {$request->customer_id}, Pet: {$request->pet_id}, Status: {$request->status}\n";
}

$boardingRequests = DB::table('service_requests')
    ->where('service_type', 'boarding')
    ->where('status', 'pending')
    ->limit(3)
    ->get(['id', 'customer_id', 'pet_id', 'service_type', 'status']);

foreach ($boardingRequests as $request) {
    echo "Boarding Request ID: {$request->id}, Customer: {$request->customer_id}, Pet: {$request->pet_id}, Status: {$request->status}\n";
}

echo "\n=== E2E TEST ITEMS READY ===\n";
echo "Ready for Receptionist browser testing:\n";
echo "1. Login as receptionist@example.com\n";
echo "2. Test dashboard and workflows\n";
echo "3. Test inventory usage with E2E items\n";
