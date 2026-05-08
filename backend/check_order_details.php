<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CHECKING ORDER DETAILS FOR MISSING LOGS ===\n\n";

// Get the specific orders that lack inventory logs
$problemOrders = [9, 10];

foreach ($problemOrders as $orderId) {
    echo "ORDER ID: {$orderId}\n";
    $order = DB::table('customer_orders')->where('id', $orderId)->first();
    
    if (!$order) {
        echo "  Order not found\n\n";
        continue;
    }
    
    echo "  Status: {$order->status}\n";
    echo "  Created: {$order->created_at}\n";
    echo "  Approved by: " . ($order->approved_by ?? 'NULL') . "\n";
    echo "  Approved at: " . ($order->approved_at ?? 'NULL') . "\n";
    
    // Check order items
    $orderItems = DB::table('customer_order_items')
        ->where('customer_order_id', $orderId)
        ->get();
    
    echo "  Order Items: " . $orderItems->count() . "\n";
    
    foreach ($orderItems as $item) {
        echo "    - Item ID: {$item->inventory_item_id}, Quantity: {$item->quantity}, Price: " . ($item->unit_price ?? $item->price ?? 'N/A') . "\n";
        
        // Check for inventory logs
        $logs = DB::table('inventory_logs')
            ->where('inventory_item_id', $item->inventory_item_id)
            ->where('reference_id', $orderId)
            ->where('reference_type', 'customer_order')
            ->get();
        
        echo "      Inventory Logs: " . $logs->count() . "\n";
        foreach ($logs as $log) {
            echo "        - Log ID: {$log->id}, Movement: {$log->movement_type}, Quantity: {$log->quantity}, Reason: {$log->reason}\n";
        }
    }
    echo "\n";
}

// Check if these orders were created before the inventory logging system
echo "=== LEGACY ANALYSIS ===\n";
$oldestInventoryLog = DB::table('inventory_logs')->min('created_at');
echo "Oldest inventory log: {$oldestInventoryLog}\n";

$oldestOrder = DB::table('customer_orders')->min('created_at');
echo "Oldest order: {$oldestOrder}\n";

echo "\n=== ANALYSIS COMPLETE ===\n";
