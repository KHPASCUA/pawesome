<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;

class TestBrandSupplierColumns extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-brand-supplier-columns';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test if brand and supplier columns exist in inventory_items table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing brand and supplier columns in inventory_items table...');
        
        // Check if columns exist
        $hasBrand = \Schema::hasColumn('inventory_items', 'brand');
        $hasSupplier = \Schema::hasColumn('inventory_items', 'supplier');
        
        $this->info('Brand column exists: ' . ($hasBrand ? 'YES' : 'NO'));
        $this->info('Supplier column exists: ' . ($hasSupplier ? 'YES' : 'NO'));
        
        if ($hasBrand && $hasSupplier) {
            $this->info('✅ SUCCESS: Both brand and supplier columns exist!');
            
            // Test creating a record with new columns
            try {
                $testItem = \App\Models\InventoryItem::create([
                    'name' => 'Test Item',
                    'description' => 'Test Description',
                    'category' => 'Test Category',
                    'brand' => 'Test Brand',
                    'supplier' => 'Test Supplier',
                    'quantity' => 10,
                    'unit_price' => 100.00,
                    'status' => 'active'
                ]);
                
                $this->info('✅ SUCCESS: Test record created with brand and supplier!');
                $this->info('Brand: ' . $testItem->brand);
                $this->info('Supplier: ' . $testItem->supplier);
                
                // Clean up
                $testItem->delete();
                $this->info('✅ Test record cleaned up successfully!');
                
            } catch (\Exception $e) {
                $this->error('❌ ERROR: Failed to create test record: ' . $e->getMessage());
                return 1;
            }
            
            return 0;
        } else {
            $this->error('❌ ERROR: Missing columns detected!');
            return 1;
        }
    }
}
