<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryMonthlyAudit;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    /**
     * Get or create monthly audit rows
     * Auto-populates audit rows for all physical inventory items if none exist
     */
    public function getOrCreateMonthlyAudit(Request $request)
    {
        $month = $request->query('month', now()->format('Y-m'));
        
        // Check if audit rows exist for this month
        $existing = InventoryMonthlyAudit::where('audit_month', $month)->count();
        
        if ($existing === 0) {
            // Get only physical inventory items (exclude services)
            $items = InventoryItem::where('item_type', 'product')->get();
            
            foreach ($items as $item) {
                InventoryMonthlyAudit::create([
                    'inventory_item_id' => $item->id,
                    'audit_month' => $month,
                    'system_stock' => $item->quantity,
                    'actual_stock' => null,
                    'variance' => 0,
                    'status' => 'pending',
                    'reason' => null,
                ]);
            }
        }
        
        // Return all audit rows for the month with item relationships
        $auditRows = InventoryMonthlyAudit::with('item')
            ->where('audit_month', $month)
            ->get();
            
        return response()->json([
            'success' => true, 
            'audits' => $auditRows
        ]);
    }
    
    /**
     * Save monthly audit data
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
            
            // Optional: update master inventory
            $inventory = InventoryItem::find($audit->inventory_item_id);
            if ($inventory) {
                $inventory->quantity = $item['actual_stock'];
                $inventory->save();
            }
        }
        
        return response()->json(['success' => true]);
    }
}
