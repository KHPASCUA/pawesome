<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Testing Archived Item Exclusion ===\n\n";

// Step 1: Archive the Anti-Rabies Vaccine
$item = \App\Models\InventoryItem::where('name', 'Anti-Rabies Vaccine')->first();
if ($item) {
    $item->update(['status' => 'archived']);
    echo "✅ Anti-Rabies Vaccine archived\n";
    echo "   - Status: {$item->status}\n\n";
} else {
    echo "❌ Anti-Rabies Vaccine not found\n";
    exit(1);
}

// Step 2: Test inventory usage with archived item
echo "=== Testing Usage with Archived Item ===\n";
try {
    $inventoryService = app(\App\Services\VeterinaryInventoryService::class);
    
    $usageData = [
        [
            'inventory_item_id' => $item->id,
            'quantity_used' => 1,
            'notes' => 'Testing archived item exclusion'
        ]
    ];
    
    $result = $inventoryService->recordInventoryUsage($usageData, 1, 1, 'Testing archived item', 1);
    
    if (!$result['success']) {
        echo "✅ Archived item correctly blocked\n";
        echo "   - Error: {$result['message']}\n\n";
        if (isset($result['errors'])) {
            foreach ($result['errors'] as $error) {
                echo "   - Error Detail: {$error}\n";
            }
        }
    } else {
        echo "❌ Archived item was not blocked\n\n";
    }
    
} catch (\Exception $e) {
    echo "✅ Archived item blocked with exception\n";
    echo "   - Exception: " . $e->getMessage() . "\n\n";
}

// Step 3: Reactivate the item for cleanup
$item->update(['status' => 'active']);
echo "✅ Item reactivated for cleanup\n";
echo "   - Status: {$item->status}\n\n";

echo "=== Archived Item Test Complete ===\n";
