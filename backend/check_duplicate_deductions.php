<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CHECKING DUPLICATE STOCK DEDUCTIONS ===\n\n";

// Check for duplicate stock deductions per order item
$duplicateDeductions = DB::table('inventory_logs')
    ->select('inventory_item_id', 'reference_id', DB::raw('COUNT(*) as deduction_count'))
    ->where(function($query) {
        $query->where('reason', 'like', '%order%')
              ->orWhere('reason', 'like', '%deduction%')
              ->orWhere('delta', '<', 0); // Negative deltas are deductions
    })
    ->whereNotNull('reference_id')
    ->groupBy(['inventory_item_id', 'reference_id'])
    ->havingRaw('COUNT(*) > 1')
    ->get();

echo "Duplicate deductions found: " . $duplicateDeductions->count() . "\n\n";

foreach ($duplicateDeductions as $duplicate) {
    echo "Item ID: {$duplicate->inventory_item_id}, Reference ID: {$duplicate->reference_id}, Count: {$duplicate->deduction_count}\n";
    
    // Show the actual duplicate logs
    $logs = DB::table('inventory_logs')
        ->where('inventory_item_id', $duplicate->inventory_item_id)
        ->where('reference_id', $duplicate->reference_id)
        ->where(function($query) {
            $query->where('reason', 'like', '%order%')
                  ->orWhere('reason', 'like', '%deduction%')
                  ->orWhere('delta', '<', 0);
        })
        ->get();
    
    foreach ($logs as $log) {
        echo "  - Log ID: {$log->id}, Delta: {$log->delta}, Reason: {$log->reason}, Created: {$log->created_at}\n";
    }
    echo "\n";
}

// Let's also check if there are any duplicate logs with the same reference but different reasons
echo "\n=== CHECKING ALL DUPLICATE LOGS BY REFERENCE ===\n";
$allDuplicates = DB::table('inventory_logs')
    ->select('reference_id', 'reference_type', DB::raw('COUNT(*) as log_count'))
    ->whereNotNull('reference_id')
    ->groupBy(['reference_id', 'reference_type'])
    ->havingRaw('COUNT(*) > 1')
    ->get();

echo "Total duplicate reference logs: " . $allDuplicates->count() . "\n\n";

foreach ($allDuplicates as $dup) {
    echo "Reference ID: {$dup->reference_id}, Type: {$dup->reference_type}, Count: {$dup->log_count}\n";
    
    $logs = DB::table('inventory_logs')
        ->where('reference_id', $dup->reference_id)
        ->where('reference_type', $dup->reference_type)
        ->get();
    
    foreach ($logs as $log) {
        echo "  - Log ID: {$log->id}, Item ID: {$log->inventory_item_id}, Delta: {$log->delta}, Reason: {$log->reason}\n";
    }
    echo "\n";
}

echo "=== DUPLICATE CHECK COMPLETE ===\n";
