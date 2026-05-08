<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== DATABASE INTEGRITY CHECKS (CONTINUED) ===\n\n";

// Check inventory_logs table structure first
echo "Inventory logs table structure:\n";
$columns = DB::getSchemaBuilder()->getColumnListing('inventory_logs');
echo "Columns: " . implode(', ', $columns) . "\n\n";

// Check 8: Duplicate stock deduction per order item (fixed query)
echo "8. Duplicate stock deduction per order item:\n";
$duplicateDeductions = DB::table('inventory_logs')
    ->where('reason', 'like', '%order%')
    ->orWhere('reason', 'like', '%deduction%')
    ->groupBy(['inventory_item_id'])
    ->havingRaw('COUNT(*) > 1')
    ->get();
echo "Count: " . $duplicateDeductions->count() . "\n";
if ($duplicateDeductions->count() > 0) {
    echo "Sample records:\n";
    echo $duplicateDeductions->take(3)->toJson(JSON_PRETTY_PRINT) . "\n";
}
echo "\n";

// Check 9: Completed orders that are unpaid (already done)
echo "9. Completed orders that are unpaid:\n";
$completedUnpaidOrders = DB::table('customer_orders')
    ->where('status', 'completed')
    ->where('payment_status', '!=', 'paid')
    ->get();
echo "Count: " . $completedUnpaidOrders->count() . "\n";
if ($completedUnpaidOrders->count() > 0) {
    echo "Sample records:\n";
    echo $completedUnpaidOrders->take(3)->toJson(JSON_PRETTY_PRINT) . "\n";
}
echo "\n";

// Check 10: Completed services without medical records (already done)
echo "10. Completed services without medical records:\n";
$completedServicesNoRecords = DB::table('service_requests')
    ->where('status', 'completed')
    ->whereNotIn('id', function($query) {
        $query->select('service_request_id')
              ->from('medical_records')
              ->whereNotNull('service_request_id');
    })
    ->get();
echo "Count: " . $completedServicesNoRecords->count() . "\n";
if ($completedServicesNoRecords->count() > 0) {
    echo "Sample records:\n";
    echo $completedServicesNoRecords->take(3)->toJson(JSON_PRETTY_PRINT) . "\n";
}
echo "\n";

// Additional checks
echo "=== ADDITIONAL INTEGRITY CHECKS ===\n\n";

// Check 11: Orders with payment proof but no payment status
echo "11. Orders with payment proof but pending payment status:\n";
$proofPendingOrders = DB::table('customer_orders')
    ->whereNotNull('payment_proof')
    ->where('payment_status', 'pending')
    ->get();
echo "Count: " . $proofPendingOrders->count() . "\n";
if ($proofPendingOrders->count() > 0) {
    echo "Sample records:\n";
    echo $proofPendingOrders->take(3)->toJson(JSON_PRETTY_PRINT) . "\n";
}
echo "\n";

// Check 12: Service requests with missing customer_id
echo "12. Service requests with missing customer_id:\n";
$missingCustomerId = DB::table('service_requests')
    ->whereNull('customer_id')
    ->get();
echo "Count: " . $missingCustomerId->count() . "\n";
if ($missingCustomerId->count() > 0) {
    echo "Sample records:\n";
    echo $missingCustomerId->take(3)->toJson(JSON_PRETTY_PRINT) . "\n";
}
echo "\n";

// Check 13: Inventory items with zero or negative reorder level
echo "13. Inventory items with zero or negative reorder level:\n";
$invalidReorder = DB::table('inventory_items')
    ->where('reorder_level', '<=', 0)
    ->get();
echo "Count: " . $invalidReorder->count() . "\n";
if ($invalidReorder->count() > 0) {
    echo "Sample records:\n";
    echo $invalidReorder->take(3)->toJson(JSON_PRETTY_PRINT) . "\n";
}
echo "\n";

echo "=== DATABASE INTEGRITY CHECK COMPLETE ===\n";
