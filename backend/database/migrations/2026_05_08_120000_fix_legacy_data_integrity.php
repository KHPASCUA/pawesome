<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        echo "=== FIXING LEGACY DATA INTEGRITY ISSUES ===\n\n";

        // 1. Create inventory logs for initial stock setup (legacy items)
        echo "1. Creating inventory logs for initial stock setup...\n";
        $legacyItems = DB::table('inventory_items')
            ->whereRaw('(stock != 0) AND id NOT IN (SELECT DISTINCT inventory_item_id FROM inventory_logs)')
            ->get();

        foreach ($legacyItems as $item) {
            DB::table('inventory_logs')->insert([
                'inventory_item_id' => $item->id,
                'delta' => $item->stock,
                'reason' => 'Legacy record: Initial stock setup before logging system',
                'created_at' => $item->created_at,
                'updated_at' => $item->created_at,
            ]);
            echo "  - Created log for item {$item->id}: {$item->name}\n";
        }
        echo "  Created " . $legacyItems->count() . " initial stock logs\n\n";

        // 2. Create inventory logs for approved orders that lack logs
        echo "2. Creating inventory logs for approved orders...\n";
        $approvedOrdersWithoutLogs = DB::table('customer_orders')
            ->where('status', 'approved')
            ->whereNotIn('id', function($query) {
                $query->select('reference_id')
                    ->from('inventory_logs')
                    ->where('reference_type', 'customer_order');
            })
            ->get();

        foreach ($approvedOrdersWithoutLogs as $order) {
            $orderItems = DB::table('customer_order_items')
                ->where('customer_order_id', $order->id)
                ->get();

            foreach ($orderItems as $item) {
                $inventoryItem = DB::table('inventory_items')
                    ->where('id', $item->inventory_item_id)
                    ->first();

                if ($inventoryItem) {
                    // Calculate what the stock should have been before this order
                    $previousStock = $inventoryItem->stock + $item->quantity;
                    
                    DB::table('inventory_logs')->insert([
                        'inventory_item_id' => $item->inventory_item_id,
                        'delta' => -$item->quantity, // Negative for deduction
                        'reason' => 'Legacy record: Stock deduction for order ' . $order->id . ' before logging system',
                        'created_at' => $order->approved_at ?? $order->created_at,
                        'updated_at' => $order->approved_at ?? $order->created_at,
                    ]);
                    echo "  - Created log for order {$order->id}, item {$item->inventory_item_id}\n";
                }
            }
        }
        echo "  Created inventory logs for " . $approvedOrdersWithoutLogs->count() . " approved orders\n\n";

        // 3. Ensure all approved orders have proper metadata
        echo "3. Ensuring approved orders have proper metadata...\n";
        $approvedOrdersMissingInfo = DB::table('customer_orders')
            ->where('status', 'approved')
            ->where(function($query) {
                $query->whereNull('approved_by')
                      ->orWhereNull('approved_at');
            })
            ->get();

        foreach ($approvedOrdersMissingInfo as $order) {
            DB::table('customer_orders')
                ->where('id', $order->id)
                ->update([
                    'approved_by' => $order->approved_by ?? 1, // Default to admin if missing
                    'approved_at' => $order->approved_at ?? $order->updated_at, // Use update time if missing
                    'updated_at' => now(),
                ]);
            echo "  - Fixed approval metadata for order {$order->id}\n";
        }
        echo "  Fixed " . $approvedOrdersMissingInfo->count() . " approved orders\n\n";

        // 4. Ensure all rejected orders have rejection reasons
        echo "4. Ensuring rejected orders have rejection reasons...\n";
        $rejectedOrdersMissingReason = DB::table('customer_orders')
            ->where('status', 'rejected')
            ->whereNull('rejection_reason')
            ->get();

        foreach ($rejectedOrdersMissingReason as $order) {
            DB::table('customer_orders')
                ->where('id', $order->id)
                ->update([
                    'rejection_reason' => 'Legacy record: Rejection reason not documented in original system',
                    'updated_at' => now(),
                ]);
            echo "  - Added rejection reason for order {$order->id}\n";
        }
        echo "  Fixed " . $rejectedOrdersMissingReason->count() . " rejected orders\n\n";

        echo "=== LEGACY DATA CLEANUP COMPLETE ===\n";
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Remove legacy inventory logs (be careful not to remove current logs)
        DB::table('inventory_logs')
            ->where('reason', 'like', 'Legacy record: %')
            ->delete();

        // Reset legacy rejection reasons
        DB::table('customer_orders')
            ->where('rejection_reason', 'Legacy record: Rejection reason not documented in original system')
            ->update(['rejection_reason' => null]);

        echo "Legacy data cleanup reverted.\n";
    }
};
