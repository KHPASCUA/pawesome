<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\InventoryItem;
use App\Models\InventoryBatch;

echo "=== INVENTORY BATCH SYSTEM CHECK ===\n";

// Check if inventory_batches table exists
if (Schema::hasTable('inventory_batches')) {
    echo "✓ inventory_batches table exists\n";
    
    $batchColumns = Schema::getColumnListing('inventory_batches');
    echo "Batch table columns: " . implode(', ', $batchColumns) . "\n";
    
    // Check existing batches for test items
    $vaccineItem = InventoryItem::where('name', 'Real API Test Vaccine')->first();
    $groomingItem = InventoryItem::where('name', 'Real API Test Shampoo')->first();
    $boardingItem = InventoryItem::where('name', 'Real API Test Food')->first();
    
    if ($vaccineItem) {
        $vaccineBatches = InventoryBatch::where('inventory_item_id', $vaccineItem->id)->get();
        echo "Vaccine batches: " . $vaccineBatches->count() . "\n";
        foreach ($vaccineBatches as $batch) {
            echo "  - Batch {$batch->id}: {$batch->remaining_quantity} remaining\n";
        }
        
        // Create batch if none exists
        if ($vaccineBatches->count() === 0) {
            InventoryBatch::create([
                'inventory_item_id' => $vaccineItem->id,
                'batch_no' => 'TEST-VACCINE-' . time(),
                'quantity' => 100,
                'remaining_quantity' => 100,
                'expiration_date' => now()->addYears(2),
                'received_date' => now(),
                'notes' => 'Test batch for API testing'
            ]);
            echo "✓ Created vaccine batch\n";
        }
    }
    
    if ($groomingItem) {
        $groomingBatches = InventoryBatch::where('inventory_item_id', $groomingItem->id)->get();
        echo "Grooming batches: " . $groomingBatches->count() . "\n";
        foreach ($groomingBatches as $batch) {
            echo "  - Batch {$batch->id}: {$batch->remaining_quantity} remaining\n";
        }
        
        // Create batch if none exists
        if ($groomingBatches->count() === 0) {
            InventoryBatch::create([
                'inventory_item_id' => $groomingItem->id,
                'batch_no' => 'TEST-GROOMING-' . time(),
                'quantity' => 50,
                'remaining_quantity' => 50,
                'expiration_date' => now()->addYears(2),
                'received_date' => now(),
                'notes' => 'Test batch for API testing'
            ]);
            echo "✓ Created grooming batch\n";
        }
    }
    
    if ($boardingItem) {
        $boardingBatches = InventoryBatch::where('inventory_item_id', $boardingItem->id)->get();
        echo "Boarding batches: " . $boardingBatches->count() . "\n";
        foreach ($boardingBatches as $batch) {
            echo "  - Batch {$batch->id}: {$batch->remaining_quantity} remaining\n";
        }
        
        // Create batch if none exists
        if ($boardingBatches->count() === 0) {
            InventoryBatch::create([
                'inventory_item_id' => $boardingItem->id,
                'batch_no' => 'TEST-BOARDING-' . time(),
                'quantity' => 200,
                'remaining_quantity' => 200,
                'expiration_date' => now()->addYears(2),
                'received_date' => now(),
                'notes' => 'Test batch for API testing'
            ]);
            echo "✓ Created boarding batch\n";
        }
    }
    
} else {
    echo "❌ inventory_batches table does not exist\n";
    echo "This explains why the ServiceBillingService fails - it requires batch tracking\n";
}

echo "\n";
