<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Simple Veterinary Inventory Usage Test ===\n\n";

// Step 1: Check Anti-Rabies Vaccine item
$item = \App\Models\InventoryItem::where('name', 'Anti-Rabies Vaccine')->first();
if (!$item) {
    echo "❌ Anti-Rabies Vaccine not found!\n";
    exit(1);
}

echo "✅ Step 1: Anti-Rabies Vaccine found\n";
echo "   - ID: {$item->id}\n";
echo "   - Stock: {$item->stock}\n";
echo "   - Status: {$item->status}\n";
echo "   - Service Consumable: " . ($item->is_service_consumable ? 'Yes' : 'No') . "\n";
echo "   - Issue Method: {$item->issue_method}\n\n";

// Step 2: Find or create a simple appointment
$appointment = \App\Models\Appointment::first();
if (!$appointment) {
    echo "⚠️  No appointments found. Creating minimal test appointment...\n";
    
    $pet = \App\Models\Pet::first();
    if (!$pet) {
        echo "❌ No pets found! Creating minimal pet...\n";
        $pet = new \App\Models\Pet();
        $pet->name = 'Test Pet';
        $pet->customer_id = 1;
        $pet->species = 'Dog';
        $pet->breed = 'Test';
        $pet->age = 3;
        $pet->save();
        echo "✅ Test pet created - ID: {$pet->id}\n";
    }
    
    $appointment = new \App\Models\Appointment();
    $appointment->pet_id = $pet->id;
    $appointment->customer_id = $pet->customer_id ?? 1;
    $appointment->scheduled_at = now()->addHours(2);
    $appointment->status = 'scheduled';
    $appointment->price = 200.00;
    $appointment->save();
    
    echo "✅ Test appointment created - ID: {$appointment->id}\n\n";
} else {
    echo "✅ Step 2: Found appointment - ID: {$appointment->id}\n";
    echo "   - Status: {$appointment->status}\n\n";
}

$appointmentId = $appointment->id;

// Step 2.5: Create corresponding vet_appointments record for foreign key constraint
echo "=== Creating Vet Appointment Record ===\n";
$vetAppointment = \DB::table('vet_appointments')->where('pet_id', $appointment->pet_id)->first();
if (!$vetAppointment) {
    \DB::table('vet_appointments')->insert([
        'pet_id' => $appointment->pet_id,
        'pet_name' => $appointment->pet->name ?? 'Test Pet',
        'service' => 'Vaccination',
        'appointment_date' => $appointment->scheduled_at->format('Y-m-d'),
        'concern' => 'Test appointment for inventory usage',
        'status' => 'pending',
        'created_at' => now(),
        'updated_at' => now()
    ]);
    $vetAppointmentId = \DB::getPdo()->lastInsertId();
    echo "✅ Vet appointment record created - ID: {$vetAppointmentId}\n\n";
} else {
    $vetAppointmentId = $vetAppointment->id;
    echo "✅ Using existing vet appointment - ID: {$vetAppointmentId}\n\n";
}

// Step 3: Test the inventory service directly
echo "=== Testing Inventory Service ===\n";
try {
    $inventoryService = app(\App\Services\VeterinaryInventoryService::class);
    
    $usageData = [
        'items' => [
            [
                'inventory_item_id' => $item->id,
                'quantity_used' => 1,
                'notes' => 'Used during appointment testing'
            ]
        ]
    ];
    
    echo "📝 Recording inventory usage via service...\n";
    $result = $inventoryService->recordInventoryUsage($usageData['items'], $appointmentId, $appointment->pet_id, 'Used during appointment testing', 1);
    
    if ($result['success']) {
        echo "✅ Step 3: Inventory usage recorded successfully\n";
        echo "   - Message: {$result['message']}\n\n";
        
        // Step 4: Verify stock decreased
        $item->refresh();
        echo "=== Stock Verification ===\n";
        echo "📊 Stock after usage: {$item->stock}\n";
        if ($item->stock == 49) {
            echo "✅ Step 4: Stock decreased correctly (50 → 49)\n\n";
        } else {
            echo "❌ Step 4: Stock not decreased as expected\n\n";
        }
        
        // Step 5: Check movement log
        echo "=== Movement Log Verification ===\n";
        $movement = \App\Models\InventoryLog::where('inventory_item_id', $item->id)
            ->where('movement_type', 'vet_usage')
            ->orderBy('created_at', 'desc')
            ->first();
            
        if ($movement) {
            echo "✅ Step 5: Movement log found\n";
            echo "   - Movement Type: {$movement->movement_type}\n";
            echo "   - Quantity: {$movement->quantity}\n";
            echo "   - Reference ID: {$movement->reference_id}\n";
            echo "   - Notes: {$movement->notes}\n\n";
        } else {
            echo "❌ Step 5: No movement log found\n\n";
        }
        
        // Step 6: Check usage history
        echo "=== Usage History Verification ===\n";
        $usageHistory = \App\Models\ServiceItemUsage::where('service_type', 'veterinary')
            ->where('service_id', $appointmentId)
            ->where('inventory_item_id', $item->id)
            ->first();
            
        if ($usageHistory) {
            echo "✅ Step 6: Usage history record found\n";
            echo "   - Service Type: {$usageHistory->service_type}\n";
            echo "   - Quantity Used: {$usageHistory->quantity_used}\n";
            echo "   - Notes: {$usageHistory->notes}\n\n";
        } else {
            echo "❌ Step 6: No usage history record found\n\n";
        }
        
        // Step 7: Test over-usage prevention
        echo "=== Over-Usage Prevention Test ===\n";
        try {
            $overUsageData = [
                [
                    'inventory_item_id' => $item->id,
                    'quantity_used' => 100, // More than available
                    'notes' => 'Testing over-usage prevention'
                ]
            ];
            
            $result2 = $inventoryService->recordInventoryUsage($overUsageData, $appointmentId, $appointment->pet_id, 'Testing over-usage prevention', 1);
            
            if (!$result2['success']) {
                echo "✅ Step 7: Over-usage correctly blocked\n";
                echo "   - Error: {$result2['message']}\n\n";
            } else {
                echo "❌ Step 7: Over-usage not blocked\n\n";
            }
        } catch (\Exception $e) {
            if (strpos($e->getMessage(), 'Insufficient stock') !== false) {
                echo "✅ Step 7: Over-usage correctly blocked with exception\n";
                echo "   - Exception: " . $e->getMessage() . "\n\n";
            } else {
                echo "❌ Step 7: Unexpected exception: " . $e->getMessage() . "\n\n";
            }
        }
        
    } else {
        echo "❌ Step 3: Inventory usage failed\n";
        echo "   Error: {$result['message']}\n\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Error testing inventory service: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . ":" . $e->getLine() . "\n\n";
}

echo "=== Test Complete ===\n";
