<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== INSPECTING DATA INTEGRITY ISSUES ===\n\n";

// 1. Approved orders missing approval info
echo "1. APPROVED ORDERS MISSING APPROVAL INFO:\n";
$approvedOrdersMissingInfo = DB::table('customer_orders')
    ->where('status', 'approved')
    ->where(function($query) {
        $query->whereNull('approved_by')
              ->orWhereNull('approved_at');
    })
    ->get();

echo "Count: " . $approvedOrdersMissingInfo->count() . "\n";
foreach ($approvedOrdersMissingInfo as $order) {
    echo "ID: {$order->id}, Order #: {$order->order_number}, Created: {$order->created_at}, Approved_by: " . ($order->approved_by ?? 'NULL') . ", Approved_at: " . ($order->approved_at ?? 'NULL') . "\n";
}
echo "\n";

// 2. Rejected orders missing rejection reason
echo "2. REJECTED ORDERS MISSING REJECTION REASON:\n";
$rejectedOrdersMissingReason = DB::table('customer_orders')
    ->where('status', 'rejected')
    ->whereNull('rejection_reason')
    ->get();

echo "Count: " . $rejectedOrdersMissingReason->count() . "\n";
foreach ($rejectedOrdersMissingReason as $order) {
    echo "ID: {$order->id}, Order #: {$order->order_number}, Created: {$order->created_at}, Rejected_by: {$order->rejected_by}, Rejection_reason: NULL\n";
}
echo "\n";

// 3. Stock changes without inventory logs
echo "3. STOCK CHANGES WITHOUT INVENTORY LOGS:\n";
$stockChangesWithoutLogs = DB::table('inventory_items')
    ->whereRaw('(stock != 0) AND id NOT IN (SELECT DISTINCT inventory_item_id FROM inventory_logs)')
    ->get();

echo "Count: " . $stockChangesWithoutLogs->count() . "\n";
foreach ($stockChangesWithoutLogs as $item) {
    echo "Item ID: {$item->id}, Name: {$item->name}, Stock: {$item->stock}, Created: {$item->created_at}\n";
}
echo "\n";

// 4. Approved orders lacking inventory log trails
echo "4. APPROVED ORDERS LACKING INVENTORY LOG TRAILS:\n";
$approvedOrders = DB::table('customer_orders')->where('status', 'approved')->get();
$ordersWithoutLogs = [];

foreach ($approvedOrders as $order) {
    $orderItems = DB::table('customer_order_items')
        ->where('customer_order_id', $order->id)
        ->get();
    
    $hasLogs = false;
    foreach ($orderItems as $item) {
        $logCount = DB::table('inventory_logs')
            ->where('inventory_item_id', $item->inventory_item_id)
            ->where('reference_id', $order->id)
            ->where('reference_type', 'customer_order')
            ->count();
        
        if ($logCount > 0) {
            $hasLogs = true;
            break;
        }
    }
    
    if (!$hasLogs && $orderItems->count() > 0) {
        $ordersWithoutLogs[] = $order;
    }
}

echo "Count: " . count($ordersWithoutLogs) . "\n";
foreach ($ordersWithoutLogs as $order) {
    echo "Order ID: {$order->id}, Order #: {$order->order_number}, Created: {$order->created_at}\n";
}
echo "\n";

// 5. Check if these are legacy records (created before workflow fields existed)
echo "5. LEGACY ANALYSIS:\n";
echo "Checking creation dates vs migration dates...\n";

// Get the oldest problematic record dates
$oldestApprovedIssue = $approvedOrdersMissingInfo->min('created_at');
$oldestRejectedIssue = $rejectedOrdersMissingReason->min('created_at');

echo "Oldest approved order with missing info: " . ($oldestApprovedIssue ?? 'None') . "\n";
echo "Oldest rejected order without reason: " . ($oldestRejectedIssue ?? 'None') . "\n";

// Check when workflow fields were added (from migration dates)
echo "\nMigration dates for workflow fields:\n";
echo "- 2026_05_05_010000_add_workflow_fields_to_customer_orders.php (added approved_by, approved_at, rejected_by, rejected_at, rejection_reason)\n";
echo "- This was added on May 5, 2026\n";

if ($oldestApprovedIssue && $oldestApprovedIssue < '2026-05-05') {
    echo "✅ Approved orders with missing info are LEGACY (created before workflow fields existed)\n";
} else {
    echo "❌ Approved orders with missing info are CURRENT workflow issues\n";
}

if ($oldestRejectedIssue && $oldestRejectedIssue < '2026-05-05') {
    echo "✅ Rejected orders without reason are LEGACY (created before workflow fields existed)\n";
} else {
    echo "❌ Rejected orders without reason are CURRENT workflow issues\n";
}

echo "\n=== INSPECTION COMPLETE ===\n";
