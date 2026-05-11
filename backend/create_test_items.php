<?php

require_once 'vendor/autoload.php';

use App\Models\InventoryItem;

echo "Creating test inventory items...\n";

// Create test items for boarding, grooming, veterinary, and POS
$food = InventoryItem::create([
    'name' => 'E2E Boarding Food',
    'category' => 'Food',
    'is_service_consumable' => true,
    'stock' => 20,
    'unit' => 'pcs',
    'status' => 'active'
]);

$shampoo = InventoryItem::create([
    'name' => 'E2E Grooming Shampoo',
    'category' => 'Grooming',
    'is_service_consumable' => true,
    'stock' => 15,
    'unit' => 'ml',
    'status' => 'active'
]);

$vaccine = InventoryItem::create([
    'name' => 'E2E Vaccine',
    'category' => 'Health',
    'is_service_consumable' => true,
    'stock' => 10,
    'unit' => 'vials',
    'status' => 'active'
]);

$pos_product = InventoryItem::create([
    'name' => 'E2E POS Product',
    'category' => 'Products',
    'is_sellable' => true,
    'stock' => 25,
    'unit' => 'pcs',
    'status' => 'active'
]);

echo "Test items created with IDs:\n";
echo "Food ID: " . $food->id . "\n";
echo "Shampoo ID: " . $shampoo->id . "\n";
echo "Vaccine ID: " . $vaccine->id . "\n";
echo "POS Product ID: " . $pos_product->id . "\n";
