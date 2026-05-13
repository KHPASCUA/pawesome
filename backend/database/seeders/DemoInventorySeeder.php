<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryItem;
use Illuminate\Support\Facades\DB;

class DemoInventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $demoItems = [
            [
                'sku' => 'BW001',
                'barcode' => '1234567890123',
                'name' => 'Bandage Wrap 4in',
                'category' => 'Health',
                'brand' => 'MediCare',
                'supplier' => 'Pet Medical Supply Co.',
                'description' => 'Self-adhesive bandage wrap for veterinary use. 4 inch width, sterile.',
                'stock' => 35,
                'reorder_level' => 10,
                'threshold' => 5,
                'price' => 15.99,
                'status' => 'active',
                'archived_at' => null,
            ],
            [
                'sku' => 'DS001',
                'barcode' => '1234567890124',
                'name' => 'Dog Shampoo',
                'category' => 'Grooming',
                'brand' => 'CleanPaws',
                'supplier' => 'Grooming Supplies Inc.',
                'description' => 'Gentle dog shampoo for all coat types. Hypoallergenic formula.',
                'stock' => 20,
                'reorder_level' => 8,
                'threshold' => 3,
                'price' => 12.50,
                'status' => 'active',
                'archived_at' => null,
            ],
            [
                'sku' => 'PF001',
                'barcode' => '1234567890125',
                'name' => 'Pet Food Pack',
                'category' => 'Food',
                'brand' => 'NutriPet',
                'supplier' => 'Premium Pet Foods',
                'description' => 'Premium dry dog food pack. Complete nutrition for adult dogs.',
                'stock' => 30,
                'reorder_level' => 15,
                'threshold' => 5,
                'price' => 45.00,
                'status' => 'active',
                'archived_at' => null,
            ],
            [
                'sku' => 'DT001',
                'barcode' => '1234567890126',
                'name' => 'Dog Treats',
                'category' => 'Food',
                'brand' => 'HappyBites',
                'supplier' => 'Treats & Snacks Co.',
                'description' => 'Natural dog treats with real meat. Training reward size.',
                'stock' => 25,
                'reorder_level' => 12,
                'threshold' => 5,
                'price' => 8.99,
                'status' => 'active',
                'archived_at' => null,
            ],
            [
                'sku' => 'LS001',
                'barcode' => '1234567890127',
                'name' => 'Low Stock Demo Item',
                'category' => 'Supplies',
                'brand' => 'DemoBrand',
                'supplier' => 'Demo Supplier',
                'description' => 'Demo item for low stock alert testing.',
                'stock' => 3,
                'reorder_level' => 10,
                'threshold' => 5,
                'price' => 25.00,
                'status' => 'active',
                'archived_at' => null,
            ],
        ];

        foreach ($demoItems as $itemData) {
            InventoryItem::updateOrCreate(
                ['sku' => $itemData['sku']],
                $itemData
            );
        }

        $this->command->info('Demo inventory items created/updated successfully.');
    }
}
