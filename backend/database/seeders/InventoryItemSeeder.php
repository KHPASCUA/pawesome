<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\InventoryItem;

class InventoryItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            // Food items
            [
                'name' => 'Premium Dog Food',
                'category' => 'Food',
                'description' => 'High-quality nutrition for adult dogs',
                'stock' => 50,
                'reorder_level' => 10,
                'price' => 850.00,
                'status' => 'In Stock',
                'is_sellable' => true,
            ],
            [
                'name' => 'Cat Treats Salmon',
                'category' => 'Food',
                'description' => 'Delicious salmon-flavored treats',
                'stock' => 30,
                'reorder_level' => 5,
                'price' => 120.00,
                'status' => 'In Stock',
                'is_sellable' => true,
            ],
            [
                'name' => 'Puppy Starter Kit',
                'category' => 'Food',
                'description' => 'Complete nutrition for puppies',
                'stock' => 3,
                'reorder_level' => 5,
                'price' => 450.00,
                'status' => 'Low Stock',
                'is_sellable' => true,
            ],
            // Accessories
            [
                'name' => 'Dog Collar - Large',
                'category' => 'Accessories',
                'description' => 'Adjustable nylon collar',
                'stock' => 25,
                'reorder_level' => 8,
                'price' => 350.00,
                'status' => 'In Stock',
                'is_sellable' => true,
            ],
            [
                'name' => 'Pet Carrier Bag',
                'category' => 'Accessories',
                'description' => 'Comfortable travel carrier',
                'stock' => 0,
                'reorder_level' => 5,
                'price' => 1200.00,
                'status' => 'Out of Stock',
                'is_sellable' => true,
            ],
            // Grooming
            [
                'name' => 'Pet Shampoo',
                'category' => 'Grooming',
                'description' => 'Gentle cleansing formula',
                'stock' => 20,
                'reorder_level' => 5,
                'price' => 280.00,
                'status' => 'In Stock',
                'is_sellable' => true,
            ],
            [
                'name' => 'Nail Clippers',
                'category' => 'Grooming',
                'description' => 'Professional grade clippers',
                'stock' => 8,
                'reorder_level' => 5,
                'price' => 180.00,
                'status' => 'In Stock',
                'is_sellable' => true,
            ],
            // Toys
            [
                'name' => 'Squeaky Ball',
                'category' => 'Toys',
                'description' => 'Interactive toy for dogs',
                'stock' => 40,
                'reorder_level' => 10,
                'price' => 150.00,
                'status' => 'In Stock',
                'is_sellable' => true,
            ],
            [
                'name' => 'Cat Scratching Post',
                'category' => 'Toys',
                'description' => 'Durable sisal scratching post',
                'stock' => 2,
                'reorder_level' => 5,
                'price' => 650.00,
                'status' => 'Low Stock',
                'is_sellable' => true,
            ],
            // Health
            [
                'name' => 'Deworming Tablets',
                'category' => 'Health',
                'description' => 'Effective deworming medication',
                'stock' => 15,
                'reorder_level' => 5,
                'price' => 95.00,
                'status' => 'In Stock',
                'is_sellable' => true,
            ],
        ];

        foreach ($items as $item) {
            InventoryItem::create($item);
        }
    }
}
