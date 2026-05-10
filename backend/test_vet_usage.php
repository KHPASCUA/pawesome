<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Veterinary Inventory Usage Manual Test ===\n\n";

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


// Step 3: Test inventory usage endpoint
echo "=== Testing Inventory Usage ===\n";

$usageData = [
    'items' => [
        [
            'inventory_item_id' => $item->id,
            'quantity_used' => 1,
            'notes' => 'Used during appointment testing'
        ]
    ]
];

// Simulate API call
try {
    $controller = new \App\Http\Controllers\Veterinary\MedicalRecordController();
    $request = new \Illuminate\Http\Request($usageData);
    $request->setRouteResolver(function() use ($appointmentId) {
        $route = new \Illuminate\Routing\Route('POST', 'test', []);
        $route->bind('id', $appointmentId);
        return $route;
    });
    
    echo "📝 Recording inventory usage...\n";
    $response = $controller->recordInventoryUsage($request, $appointmentId);
    
    if ($response->getStatusCode() === 200) {
        echo "✅ Step 3: Inventory usage recorded successfully\n\n";
        
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
        $movement = \App\Models\InventoryMovement::where('inventory_item_id', $item->id)
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
        $overUsageData = [
            'items' => [
                [
                    'inventory_item_id' => $item->id,
                    'quantity_used' => 100, // More than available
                    'notes' => 'Testing over-usage prevention'
                ]
            ]
        ];
        
        try {
            $request2 = new \Illuminate\Http\Request($overUsageData);
            $request2->setRouteResolver(function() use ($appointmentId) {
                $route = new \Illuminate\Routing\Route('POST', 'test', []);
                $route->bind('id', $appointmentId);
                return $route;
            });
            
            $response2 = $controller->recordInventoryUsage($request2, $appointmentId);
            
            if ($response2->getStatusCode() === 422) {
                echo "✅ Step 7: Over-usage correctly blocked\n\n";
            } else {
                echo "❌ Step 7: Over-usage not blocked\n\n";
            }
        } catch (\Exception $e) {
            if (strpos($e->getMessage(), 'Insufficient stock') !== false) {
                echo "✅ Step 7: Over-usage correctly blocked with exception\n\n";
            } else {
                echo "❌ Step 7: Unexpected exception: " . $e->getMessage() . "\n\n";
            }
        }
        
    } else {
        echo "❌ Step 3: Inventory usage failed\n";
        echo "   Status: " . $response->getStatusCode() . "\n\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Error testing inventory usage: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . ":" . $e->getLine() . "\n\n";
}

echo "=== Test Complete ===\n";
