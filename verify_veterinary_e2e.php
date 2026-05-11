<?php

require_once 'backend/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== VETERINARY E2E TEST RESULTS VERIFICATION ===\n";

// Check veterinarian users
echo "\n1. Veterinarian Users:\n";
$vetUsers = DB::table('users')->where('role', 'veterinarian')->get(['id', 'email', 'name']);
if ($vetUsers->isEmpty()) {
    echo "No veterinarian users found. Creating test veterinarian user...\n";
    $vetUserId = DB::table('users')->insertGetId([
        'name' => 'Test Veterinarian',
        'email' => 'vet-test@example.com',
        'password' => bcrypt('password123'),
        'role' => 'veterinarian',
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "Created test veterinarian user with ID: $vetUserId\n";
} else {
    foreach ($vetUsers as $user) {
        echo "ID: {$user->id}, Email: {$user->email}, Name: {$user->name}\n";
    }
}

// Check E2E Vaccine
echo "\n2. E2E Vaccine Status:\n";
$e2eVaccine = DB::table('inventory_items')->where('name', 'E2E Vaccine')->first();
if ($e2eVaccine) {
    echo "E2E Vaccine - ID: {$e2eVaccine->id}, Stock: {$e2eVaccine->stock}\n";
} else {
    echo "E2E Vaccine not found\n";
}

// Check recent veterinary inventory usage
echo "\n3. Recent Veterinary Inventory Usage:\n";
$recentVetUsage = DB::table('service_item_usages')
    ->where('service_type', 'veterinary')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['id', 'service_id', 'inventory_item_id', 'quantity_used', 'notes', 'created_at']);

foreach ($recentVetUsage as $usage) {
    echo "ID: {$usage->id}, Service ID: {$usage->service_id}, Item ID: {$usage->inventory_item_id}, Quantity: {$usage->quantity_used}, Notes: {$usage->notes}, Created: {$usage->created_at}\n";
}

// Check recent veterinary inventory logs
echo "\n4. Recent Veterinary Inventory Logs:\n";
$recentVetLogs = DB::table('inventory_logs')
    ->where('movement_type', 'vet_usage')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['id', 'inventory_item_id', 'quantity', 'stock_after', 'reference_id', 'reference_type', 'created_at']);

foreach ($recentVetLogs as $log) {
    $movementType = $log->movement_type ?? 'unknown';
    echo "ID: {$log->id}, Item ID: {$log->inventory_item_id}, Movement: {$movementType}, Quantity: {$log->quantity}, Stock After: {$log->stock_after}, Ref: {$log->reference_type}:{$log->reference_id}, Created: {$log->created_at}\n";
}

// Check medical records
echo "\n5. Recent Medical Records:\n";
$recentMedicalRecords = DB::table('medical_records')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['id', 'pet_id', 'appointment_id', 'veterinarian_id', 'diagnosis', 'treatment_plan', 'created_at']);

foreach ($recentMedicalRecords as $record) {
    echo "ID: {$record->id}, Pet: {$record->pet_id}, Appointment: {$record->appointment_id}, Vet: {$record->veterinarian_id}, Diagnosis: " . substr($record->diagnosis, 0, 50) . "..., Created: {$record->created_at}\n";
}

// Movement Type Verification
echo "\n6. MOVEMENT TYPE VERIFICATION:\n";
echo "Source | Expected | Actual | Result\n";
echo "-------|----------|--------|-------\n";

// Check veterinary usage
$vetUsage = DB::table('inventory_logs')
    ->where('movement_type', 'vet_usage')
    ->orderBy('created_at', 'desc')
    ->first();

if ($vetUsage) {
    echo "Veterinary | vet_usage | vet_usage | PASS\n";
} else {
    echo "Veterinary | vet_usage | None | FAIL\n";
}

// Check other movement types
$boardingUsage = DB::table('inventory_logs')
    ->where('movement_type', 'boarding_food_usage')
    ->orderBy('created_at', 'desc')
    ->first();

$groomingUsage = DB::table('inventory_logs')
    ->where('movement_type', 'grooming_usage')
    ->orderBy('created_at', 'desc')
    ->first();

$posUsage = DB::table('inventory_logs')
    ->where('movement_type', 'pos_sale_deduction')
    ->orderBy('created_at', 'desc')
    ->first();

echo "Boarding | boarding_food_usage | " . ($boardingUsage ? "boarding_food_usage" : "None") . " | " . ($boardingUsage ? "PASS" : "FAIL") . "\n";
echo "Grooming | grooming_usage | " . ($groomingUsage ? "grooming_usage" : "None") . " | " . ($groomingUsage ? "PASS" : "FAIL") . "\n";
echo "POS | pos_sale_deduction | " . ($posUsage ? "pos_sale_deduction" : "None") . " | " . ($posUsage ? "PASS" : "FAIL") . "\n";

echo "\n=== VETERINARY E2E VERIFICATION COMPLETE ===\n";
