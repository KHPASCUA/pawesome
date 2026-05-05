<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryMonthlyAudit;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    /**
     * Fetch or create monthly audit rows for a real month
     * Gets all real inventory items and creates audit rows if needed
     */
    public function getMonthlyAudit(Request $request)
    {
        $month = $request->query('month', now()->format('Y-m'));

        // Fetch all real inventory items (only products, not services)
        $items = InventoryItem::where('item_type', 'product')->get();

        // Ensure an audit row exists for each item
        foreach ($items as $item) {
            InventoryMonthlyAudit::firstOrCreate(
                ['inventory_item_id' => $item->id, 'audit_month' => $month],
                [
                    'system_stock' => $item->quantity,
                    'actual_stock' => null,
                    'variance' => 0,
                    'status' => 'pending',
                    'reason' => null,
                ]
            );
        }

        // Return all audit rows with inventory relation
        $auditRows = InventoryMonthlyAudit::with('item')
            ->where('audit_month', $month)
            ->get();

        return response()->json(['success' => true, 'audits' => $auditRows]);
    }

    /**
     * Save monthly audit changes
     * Updates audit rows and inventory quantities
     */
    public function saveMonthlyAudit(Request $request)
    {
        $items = $request->input('items', []);

        foreach ($items as $item) {
            $audit = InventoryMonthlyAudit::find($item['id']);
            if (!$audit) continue;

            $variance = $item['actual_stock'] - $audit->system_stock;

            $audit->update([
                'actual_stock' => $item['actual_stock'],
                'variance' => $variance,
                'status' => $variance === 0 ? 'matched' : 'discrepancy',
                'reason' => $item['reason'] ?? null,
            ]);

            // Update actual inventory quantity
            $inventory = InventoryItem::find($audit->inventory_item_id);
            if ($inventory) {
                $inventory->quantity = $item['actual_stock'];
                $inventory->save();
            }
        }

        return response()->json(['success' => true]);
    }
}
