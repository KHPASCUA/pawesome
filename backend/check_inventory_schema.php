<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== INVENTORY ITEMS SCHEMA CHECK ===\n";

$columns = Schema::getColumnListing('inventory_items');
echo "Available columns: " . implode(', ', $columns) . "\n";

// Find stock-related columns
$stockColumns = array_filter($columns, function($col) {
    return strpos(strtolower($col), 'stock') !== false;
});

echo "Stock-related columns: " . implode(', ', $stockColumns) . "\n";

// Check current stock values
if (in_array('stock', $columns)) {
    $vaccineStock = DB::table('inventory_items')->where('name', 'Real API Test Vaccine')->value('stock');
    $groomingStock = DB::table('inventory_items')->where('name', 'Real API Test Shampoo')->value('stock');
    $boardingStock = DB::table('inventory_items')->where('name', 'Real API Test Food')->value('stock');
    
    echo "Current stock levels:\n";
    echo "- Vaccine: {$vaccineStock}\n";
    echo "- Shampoo: {$groomingStock}\n";
    echo "- Food: {$boardingStock}\n";
} elseif (in_array('quantity', $columns)) {
    $vaccineStock = DB::table('inventory_items')->where('name', 'Real API Test Vaccine')->value('quantity');
    $groomingStock = DB::table('inventory_items')->where('name', 'Real API Test Shampoo')->value('quantity');
    $boardingStock = DB::table('inventory_items')->where('name', 'Real API Test Food')->value('quantity');
    
    echo "Current quantity levels:\n";
    echo "- Vaccine: {$vaccineStock}\n";
    echo "- Shampoo: {$groomingStock}\n";
    echo "- Food: {$boardingStock}\n";
}

echo "\n";
