<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\InventoryItem;

class CreateTestInventoryItem extends Command
{
    protected $signature = 'inventory:create-test-item';
    protected $description = 'Create Anti-Rabies Vaccine test item';

    public function handle()
    {
        $item = InventoryItem::firstOrCreate([
            'name' => 'Anti-Rabies Vaccine'
        ], [
            'description' => 'Vaccine for rabies prevention',
            'category' => 'Vaccines',
            'stock' => 50,
            'unit' => 'vials',
            'status' => 'active',
            'is_service_consumable' => true,
            'issue_method' => 'FEFO',
            'reorder_level' => 10,
            'cost' => 150.00,
            'price' => 200.00
        ]);

        $this->info("Item ID: {$item->id}, Stock: {$item->stock}, Status: {$item->status}");
        return 0;
    }
}
