<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AddOnsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('add_ons')->delete();
        
        $addOns = [
            // Food Add-ons
            [
                'name' => 'Premium Dog Food',
                'description' => 'High-quality premium dog food for all breeds',
                'add_on_type' => 'inventory_item',
                'charge_type' => 'per_day',
                'unit_price' => 120.00,
                'species_allowed' => json_encode(['dog']),
                'quantity_per_unit' => 1,
                'status' => true,
            ],
            [
                'name' => 'Premium Cat Food',
                'description' => 'Nutritious premium cat food for all breeds',
                'add_on_type' => 'inventory_item',
                'charge_type' => 'per_day',
                'unit_price' => 100.00,
                'species_allowed' => json_encode(['cat']),
                'quantity_per_unit' => 1,
                'status' => true,
            ],
            
            // Service Add-ons
            [
                'name' => 'Extra Walk',
                'description' => 'Additional 15-minute walk with staff',
                'add_on_type' => 'service',
                'charge_type' => 'one_time',
                'unit_price' => 150.00,
                'species_allowed' => json_encode(['dog', 'cat']),
                'status' => true,
            ],
            [
                'name' => 'Playtime',
                'description' => '30 minutes of supervised playtime',
                'add_on_type' => 'service',
                'charge_type' => 'one_time',
                'unit_price' => 100.00,
                'species_allowed' => json_encode(['dog', 'cat']),
                'status' => true,
            ],
            [
                'name' => 'Bath Before Checkout',
                'description' => 'Full bath and grooming before checkout',
                'add_on_type' => 'service',
                'charge_type' => 'one_time',
                'unit_price' => 250.00,
                'species_allowed' => json_encode(['dog', 'cat']),
                'status' => true,
            ],
            [
                'name' => 'Daily Photo Update',
                'description' => 'Daily photo update sent to owner',
                'add_on_type' => 'service',
                'charge_type' => 'per_day',
                'unit_price' => 50.00,
                'species_allowed' => json_encode(['dog', 'cat', 'bird']),
                'status' => true,
            ],
            
            // Supplies
            [
                'name' => 'Pee Pad Pack',
                'description' => 'Pack of 10 pee pads',
                'add_on_type' => 'inventory_item',
                'charge_type' => 'one_time',
                'unit_price' => 80.00,
                'species_allowed' => json_encode(['dog']),
                'status' => true,
            ],
            [
                'name' => 'Treats Pack',
                'description' => 'Assorted treats for pets',
                'add_on_type' => 'inventory_item',
                'charge_type' => 'one_time',
                'unit_price' => 60.00,
                'species_allowed' => json_encode(['dog', 'cat']),
                'status' => true,
            ],
            
            // Additional Add-ons for complete coverage
            [
                'name' => 'Medication Assistance',
                'description' => 'Administration of prescribed medication during stay',
                'add_on_type' => 'service',
                'charge_type' => 'per_day',
                'unit_price' => 100.00,
                'species_allowed' => json_encode(['dog', 'cat', 'bird', 'small_pet']),
                'status' => true,
            ],
            [
                'name' => 'Cat Litter Care',
                'description' => 'Daily litter cleaning and maintenance for cats',
                'add_on_type' => 'service',
                'charge_type' => 'per_day',
                'unit_price' => 80.00,
                'species_allowed' => json_encode(['cat']),
                'status' => true,
            ],
            [
                'name' => 'Bird Seed Mix',
                'description' => 'Premium bird seed mix for daily feeding',
                'add_on_type' => 'inventory_item',
                'charge_type' => 'per_day',
                'unit_price' => 90.00,
                'species_allowed' => json_encode(['bird']),
                'quantity_per_unit' => 1,
                'status' => true,
            ],
            [
                'name' => 'Cage Liner Pack',
                'description' => 'Clean cage liner replacement pack',
                'add_on_type' => 'inventory_item',
                'charge_type' => 'one_time',
                'unit_price' => 70.00,
                'species_allowed' => json_encode(['bird', 'small_pet']),
                'quantity_per_unit' => 1,
                'status' => true,
            ],
            [
                'name' => 'Small Pet Food',
                'description' => 'Food option for small accommodated pets',
                'add_on_type' => 'inventory_item',
                'charge_type' => 'per_day',
                'unit_price' => 100.00,
                'species_allowed' => json_encode(['bird', 'small_pet']),
                'quantity_per_unit' => 1,
                'status' => true,
            ],
        ];

        foreach ($addOns as $addOn) {
            $insertData = [
                'name' => $addOn['name'],
                'description' => $addOn['description'],
                'add_on_type' => $addOn['add_on_type'],
                'charge_type' => $addOn['charge_type'],
                'unit_price' => $addOn['unit_price'],
                'species_allowed' => $addOn['species_allowed'],
                'status' => $addOn['status'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
            
            // Only add quantity_per_unit if it exists in the add-on data
            if (isset($addOn['quantity_per_unit'])) {
                $insertData['quantity_per_unit'] = $addOn['quantity_per_unit'];
            }
            
            DB::table('add_ons')->insert($insertData);
        }
    }
}
