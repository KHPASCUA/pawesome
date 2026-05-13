<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== DATABASE CONSTRAINTS CHECK ===" . PHP_EOL;

// Check if inventory_item_id and batch_id can be NULL
try {
    $columns = \Illuminate\Support\Facades\DB::select("DESCRIBE service_item_usages");
    
    foreach ($columns as $column) {
        if (in_array($column->Field, ['inventory_item_id', 'batch_id'])) {
            echo "Column: {$column->Field}" . PHP_EOL;
            echo "  Type: {$column->Type}" . PHP_EOL;
            echo "  Null: {$column->Null}" . PHP_EOL;
            echo "  Default: " . ($column->Default ?? 'NULL') . PHP_EOL;
            
            if ($column->Null === 'NO') {
                echo "  ❌ CANNOT BE NULL - Need to modify schema" . PHP_EOL;
            } else {
                echo "  ✅ Can be NULL" . PHP_EOL;
            }
            echo PHP_EOL;
        }
    }
    
} catch (Exception $e) {
    echo "Error checking constraints: " . $e->getMessage() . PHP_EOL;
}

// Check foreign key constraints
echo "=== FOREIGN KEY CONSTRAINTS ===" . PHP_EOL;
try {
    $constraints = \Illuminate\Support\Facades\DB::select("
        SELECT 
            CONSTRAINT_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'service_item_usages' 
        AND COLUMN_NAME IN ('inventory_item_id', 'batch_id')
    ");
    
    foreach ($constraints as $constraint) {
        echo "Constraint: {$constraint->CONSTRAINT_NAME}" . PHP_EOL;
        echo "  Column: {$constraint->COLUMN_NAME}" . PHP_EOL;
        echo "  References: {$constraint->REFERENCED_TABLE_NAME}.{$constraint->REFERENCED_COLUMN_NAME}" . PHP_EOL;
        echo PHP_EOL;
    }
    
} catch (Exception $e) {
    echo "Error checking foreign keys: " . $e->getMessage() . PHP_EOL;
}

echo "=== TESTING NULL VALUES ===" . PHP_EOL;

// Test if we can insert NULL values
try {
    echo "Testing insert with NULL inventory_item_id and batch_id..." . PHP_EOL;
    
    // First, let's try to create a migration to allow NULL if needed
    $tableHasNullable = \Illuminate\Support\Facades\Schema::getConnection()
        ->getSchemaBuilder()
        ->getColumn('service_item_usages', 'inventory_item_id')
        ->getNotnull();
    
    echo "inventory_item_id is NOT NULL: " . ($tableHasNullable ? 'YES' : 'NO') . PHP_EOL;
    
    $batchHasNullable = \Illuminate\Support\Facades\Schema::getConnection()
        ->getSchemaBuilder()
        ->getColumn('service_item_usages', 'batch_id')
        ->getNotnull();
    
    echo "batch_id is NOT NULL: " . ($batchHasNullable ? 'YES' : 'NO') . PHP_EOL;
    
} catch (Exception $e) {
    echo "Error testing NULL values: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== CONSTRAINTS CHECK COMPLETE ===" . PHP_EOL;
