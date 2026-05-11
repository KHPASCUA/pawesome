<?php

require_once 'backend/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CREATING E2E POS PRODUCT ===\n";

// Create E2E POS Product
$e2eProduct = DB::table('inventory_items')->where('name', 'E2E POS Product')->first();
if (!$e2eProduct) {
    $e2eProductId = DB::table('inventory_items')->insertGetId([
        'name' => 'E2E POS Product',
        'sku' => 'E2E-POS-ITEM',
        'category' => 'Accessories',
        'stock' => 25,
        'price' => 150.00,
        'is_sellable' => 1,
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "Created E2E POS Product with ID: $e2eProductId, Stock: 25, Price: 150.00\n";
} else {
    echo "E2E POS Product already exists with ID: {$e2eProduct->id}, Stock: {$e2eProduct->stock}\n";
}

// Verify creation
$verifyProduct = DB::table('inventory_items')->where('name', 'E2E POS Product')->first();
echo "Verification: E2E POS Product - ID: {$verifyProduct->id}, Stock: {$verifyProduct->stock}, Price: {$verifyProduct->price}, Sellable: " . ($verifyProduct->is_sellable ? 'Yes' : 'No') . "\n";

echo "=== E2E POS PRODUCT SETUP COMPLETE ===\n";
