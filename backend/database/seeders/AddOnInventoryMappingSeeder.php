<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AddOnInventoryMappingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Maps inventory-backed add-ons to their corresponding inventory items.
     */
    public function run(): void
    {
        // Define the mapping between add-ons and inventory items
        $mappings = [
            'Premium Dog Food' => 'FOOD-DOG-001',      // Premium Dog Food 5kg
            'Premium Cat Food' => 'FOOD-CAT-001',      // Premium Cat Kibble 2kg
            'Bird Seed Mix' => 'FOOD-BIRD-001',       // Parrot Seed Mix 1kg
            'Cage Liner Pack' => 'ACC-PAD-001',       // Training Pads 100ct (as cage liner alternative)
            'Pee Pad Pack' => 'ACC-PAD-001',          // Training Pads 100ct
            'Treats Pack' => 'FOOD-TREAT-001',        // Dental Chews Pack
        ];

        foreach ($mappings as $addOnName => $sku) {
            // Get the inventory item ID
            $inventoryItem = DB::table('inventory_items')
                ->where('sku', $sku)
                ->first();

            if ($inventoryItem) {
                // Update the add-on with the inventory_item_id
                DB::table('add_ons')
                    ->where('name', $addOnName)
                    ->update([
                        'inventory_item_id' => $inventoryItem->id,
                        'updated_at' => now(),
                    ]);

                $this->command->info("✅ Mapped '{$addOnName}' to inventory item '{$sku}' (ID: {$inventoryItem->id})");
            } else {
                $this->command->warn("⚠️  Inventory item with SKU '{$sku}' not found for add-on '{$addOnName}'");
            }
        }

        $this->command->info("✅ Add-on inventory mapping completed!");
    }
}
