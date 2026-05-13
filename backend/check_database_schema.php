<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CHECKING ACTUAL DATABASE SCHEMA ===" . PHP_EOL;

// Task 1: Verify actual database enum/schema for item_type
echo PHP_EOL . "1. CHECKING service_item_usages.item_type COLUMN" . PHP_EOL;

try {
    $columnInfo = \Illuminate\Support\Facades\DB::select("
        SHOW COLUMNS FROM service_item_usages LIKE 'item_type'
    ");
    
    if (!empty($columnInfo)) {
        $column = $columnInfo[0];
        echo "Column information:" . PHP_EOL;
        echo "  Field: {$column->Field}" . PHP_EOL;
        echo "  Type: {$column->Type}" . PHP_EOL;
        echo "  Null: {$column->Null}" . PHP_EOL;
        echo "  Key: {$column->Key}" . PHP_EOL;
        echo "  Default: " . ($column->Default ?? 'NULL') . PHP_EOL;
        echo "  Extra: {$column->Extra}" . PHP_EOL;
        
        // Check if it's an ENUM type
        if (strpos($column->Type, 'enum') === 0) {
            echo "  ✅ Column is ENUM type" . PHP_EOL;
            
            // Extract enum values
            preg_match("/enum\((.*)\)/", $column->Type, $matches);
            if (isset($matches[1])) {
                $enumValues = str_getcsv($matches[1], ',', "'");
                echo "  Enum values: " . implode(', ', $enumValues) . PHP_EOL;
                
                // Check for inventory_usage vs inventory_item
                $hasInventoryUsage = in_array('inventory_usage', $enumValues);
                $hasInventoryItem = in_array('inventory_item', $enumValues);
                
                echo "  Has 'inventory_usage': " . ($hasInventoryUsage ? '✅' : '❌') . PHP_EOL;
                echo "  Has 'inventory_item': " . ($hasInventoryItem ? '✅' : '❌') . PHP_EOL;
                
                if ($hasInventoryUsage && !$hasInventoryItem) {
                    echo "  ✅ Database uses 'inventory_usage'" . PHP_EOL;
                } elseif (!$hasInventoryUsage && $hasInventoryItem) {
                    echo "  ✅ Database uses 'inventory_item'" . PHP_EOL;
                } elseif ($hasInventoryUsage && $hasInventoryItem) {
                    echo "  ⚠️ Database has both 'inventory_usage' and 'inventory_item'" . PHP_EOL;
                } else {
                    echo "  ❌ Database has neither 'inventory_usage' nor 'inventory_item'" . PHP_EOL;
                }
            }
        } else {
            echo "  ❌ Column is not ENUM type: {$column->Type}" . PHP_EOL;
        }
    } else {
        echo "  ❌ item_type column not found in service_item_usages table" . PHP_EOL;
    }
} catch (Exception $e) {
    echo "  ❌ Error checking service_item_usages.item_type: " . $e->getMessage() . PHP_EOL;
}

// Check if service_billing_items table exists
echo PHP_EOL . "2. CHECKING service_billing_items TABLE" . PHP_EOL;

try {
    $tableExists = \Illuminate\Support\Facades\Schema::hasTable('service_billing_items');
    echo "service_billing_items table exists: " . ($tableExists ? '✅' : '❌') . PHP_EOL;
    
    if ($tableExists) {
        $columnInfo = \Illuminate\Support\Facades\DB::select("
            SHOW COLUMNS FROM service_billing_items LIKE 'item_type'
        ");
        
        if (!empty($columnInfo)) {
            $column = $columnInfo[0];
            echo "service_billing_items.item_type:" . PHP_EOL;
            echo "  Type: {$column->Type}" . PHP_EOL;
            
            if (strpos($column->Type, 'enum') === 0) {
                preg_match("/enum\((.*)\)/", $column->Type, $matches);
                if (isset($matches[1])) {
                    $enumValues = str_getcsv($matches[1], ',', "'");
                    echo "  Enum values: " . implode(', ', $enumValues) . PHP_EOL;
                }
            }
        } else {
            echo "  ❌ item_type column not found in service_billing_items table" . PHP_EOL;
        }
    }
} catch (Exception $e) {
    echo "  ❌ Error checking service_billing_items table: " . $e->getMessage() . PHP_EOL;
}

// Task 4: Check current data in database
echo PHP_EOL . "3. CHECKING CURRENT item_type VALUES IN DATABASE" . PHP_EOL;

try {
    $currentItemTypes = \Illuminate\Support\Facades\DB::table('service_item_usages')
        ->selectRaw('item_type, COUNT(*) as count')
        ->groupBy('item_type')
        ->orderBy('count', 'desc')
        ->get();
    
    echo "Current item_type values in service_item_usages:" . PHP_EOL;
    foreach ($currentItemTypes as $type) {
        echo "  {$type->item_type}: {$type->count} records" . PHP_EOL;
    }
} catch (Exception $e) {
    echo "  ❌ Error checking current item_type values: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== DATABASE SCHEMA CHECK COMPLETE ===" . PHP_EOL;
