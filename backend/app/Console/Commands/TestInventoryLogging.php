<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestInventoryLogging extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-inventory-logging';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test inventory logging functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing inventory logging functionality...');
        
        try {
            // Create test inventory item
            $item = \App\Models\InventoryItem::create([
                'sku' => 'TEST-LOG-' . time(),
                'name' => 'Test Logging Item',
                'category' => 'Food',
                'price' => 100.00,
                'stock' => 50,
                'reorder_level' => 10,
                'status' => 'active',
            ]);
            
            $this->info('Created test item with stock: ' . $item->stock);
            
            // Test decrementStock logging
            $initialLogCount = \App\Models\InventoryLog::where('inventory_item_id', $item->id)->count();
            $this->info('Initial log count: ' . $initialLogCount);
            
            $item->decrementStock(5, 'Test Sale', 'sale');
            $this->info('Decremented stock by 5, new stock: ' . $item->fresh()->stock);
            
            $logCountAfterDecrement = \App\Models\InventoryLog::where('inventory_item_id', $item->id)->count();
            $this->info('Log count after decrement: ' . $logCountAfterDecrement);
            
            // Test incrementStock logging
            $item->incrementStock(3, 'Test Restock', 'restock');
            $this->info('Incremented stock by 3, new stock: ' . $item->fresh()->stock);
            
            $logCountAfterIncrement = \App\Models\InventoryLog::where('inventory_item_id', $item->id)->count();
            $this->info('Log count after increment: ' . $logCountAfterIncrement);
            
            // Verify log entries
            $logs = \App\Models\InventoryLog::where('inventory_item_id', $item->id)->get();
            $this->info('Log entries created:');
            foreach ($logs as $log) {
                $this->info('  - Delta: ' . $log->delta . ', Reason: ' . $log->reason . ', Type: ' . $log->reference_type);
            }
            
            // Verify expected log count
            $expectedLogCount = $initialLogCount + 2; // decrement + increment
            if ($logCountAfterIncrement === $expectedLogCount) {
                $this->info('✅ SUCCESS: Inventory logging is working correctly!');
            } else {
                $this->error('❌ ERROR: Expected ' . $expectedLogCount . ' logs, got ' . $logCountAfterIncrement);
                return 1;
            }
            
            // Clean up
            \App\Models\InventoryLog::where('inventory_item_id', $item->id)->delete();
            $item->delete();
            
            $this->info('✅ Test records cleaned up successfully!');
            
            return 0;
            
        } catch (\Exception $e) {
            $this->error('❌ ERROR: ' . $e->getMessage());
            return 1;
        }
    }
}
