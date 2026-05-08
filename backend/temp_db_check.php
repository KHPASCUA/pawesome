<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Check 1: Orphan order items
echo "=== DATABASE INTEGRITY CHECKS ===\n\n";

echo "1. Orphan order items:\n";
$orphanOrderItems = DB::table('customer_order_items as oi')
    ->leftJoin('customer_orders as o', 'oi.customer_order_id', '=', 'o.id')
    ->whereNull('o.id')
    ->get();
echo "Count: " . $orphanOrderItems->count() . "\n";
if ($orphanOrderItems->count() > 0) {
    echo "Sample records:\n";
    echo $orphanOrderItems->take(3)->toJson(JSON_PRETTY_PRINT) . "\n";
}
echo "\n";

// Check 2: Orphan inventory logs
echo "2. Orphan inventory logs:\n";
$orphanInventoryLogs = DB::table('inventory_logs as il')
    ->leftJoin('inventory_items as ii', 'il.inventory_item_id', '=', 'ii.id')
    ->whereNull('ii.id')
    ->get();
echo "Count: " . $orphanInventoryLogs->count() . "\n";
if ($orphanInventoryLogs->count() > 0) {
    echo "Sample records:\n";
    echo $orphanInventoryLogs->take(3)->toJson(JSON_PRETTY_PRINT) . "\n";
}
echo "\n";

// Check 3: Negative stock
echo "3. Negative stock:\n";
$negativeStock = DB::table('inventory_items')
    ->where('stock', '<', 0)
    ->get();
echo "Count: " . $negativeStock->count() . "\n";
if ($negativeStock->count() > 0) {
    echo "Sample records:\n";
    echo $negativeStock->take(3)->toJson(JSON_PRETTY_PRINT) . "\n";
}
echo "\n";

// Check 4: Paid orders without verification
echo "4. Paid orders without verification:\n";
$paidOrdersNoVerification = DB::table('customer_orders')
    ->where('payment_status', 'paid')
    ->where(function($query) {
        $query->whereNull('paid_at')
              ->orWhereNull('verified_by');
    })
    ->get();
echo "Count: " . $paidOrdersNoVerification->count() . "\n";
if ($paidOrdersNoVerification->count() > 0) {
    echo "Sample records:\n";
    echo $paidOrdersNoVerification->take(3)->toJson(JSON_PRETTY_PRINT) . "\n";
}
echo "\n";

// Check 5: Paid service requests without verification
echo "5. Paid service requests without verification:\n";
$paidRequestsNoVerification = DB::table('service_requests')
    ->where('payment_status', 'paid')
    ->where(function($query) {
        $query->whereNull('paid_at')
              ->orWhereNull('verified_by');
    })
    ->get();
echo "Count: " . $paidRequestsNoVerification->count() . "\n";
if ($paidRequestsNoVerification->count() > 0) {
    echo "Sample records:\n";
    echo $paidRequestsNoVerification->take(3)->toJson(JSON_PRETTY_PRINT) . "\n";
}
echo "\n";

// Check 6: Approved orders without approval info
echo "6. Approved orders without approval info:\n";
$approvedOrdersNoInfo = DB::table('customer_orders')
    ->where('status', 'approved')
    ->where(function($query) {
        $query->whereNull('approved_by')
              ->orWhereNull('approved_at');
    })
    ->get();
echo "Count: " . $approvedOrdersNoInfo->count() . "\n";
if ($approvedOrdersNoInfo->count() > 0) {
    echo "Sample records:\n";
    echo $approvedOrdersNoInfo->take(3)->toJson(JSON_PRETTY_PRINT) . "\n";
}
echo "\n";

// Check 7: Rejected orders without rejection reason
echo "7. Rejected orders without rejection reason:\n";
$rejectedOrdersNoReason = DB::table('customer_orders')
    ->where('status', 'rejected')
    ->whereNull('rejection_reason')
    ->get();
echo "Count: " . $rejectedOrdersNoReason->count() . "\n";
if ($rejectedOrdersNoReason->count() > 0) {
    echo "Sample records:\n";
    echo $rejectedOrdersNoReason->take(3)->toJson(JSON_PRETTY_PRINT) . "\n";
}
echo "\n";

// Check 8: Duplicate stock deduction per order item
echo "8. Duplicate stock deduction per order item:\n";
$duplicateDeductions = DB::table('inventory_logs')
    ->where('movement_type', 'deduction')
    ->whereNotNull('order_id')
    ->groupBy(['order_id', 'inventory_item_id'])
    ->havingRaw('COUNT(*) > 1')
    ->get();
echo "Count: " . $duplicateDeductions->count() . "\n";
if ($duplicateDeductions->count() > 0) {
    echo "Sample records:\n";
    echo $duplicateDeductions->take(3)->toJson(JSON_PRETTY_PRINT) . "\n";
}
echo "\n";

// Check 9: Completed orders that are unpaid
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

// Check 10: Completed services without medical records
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

echo "=== DATABASE INTEGRITY CHECK COMPLETE ===\n";
