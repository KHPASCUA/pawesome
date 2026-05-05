<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryMonthlyAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    /**
     * Guaranteed working method to get monthly audit items
     * This will return real inventory items or create mock data if database is empty
     */
    public function getMonthlyAudit(Request $request)
    {
        $month = $request->query('month', now()->format('Y-m'));
        
        // Debug: Check if inventory_items table has data
        $inventoryCount = InventoryItem::count();
        \Log::info("Inventory items count: " . $inventoryCount);
        
        // If no inventory items exist, create some sample data
        if ($inventoryCount === 0) {
            \Log::info("Creating sample inventory items...");
            
            $sampleItems = [
                ['name' => 'Premium Dog Food', 'sku' => 'DOG001', 'category' => 'Food', 'quantity' => 50, 'item_type' => 'product'],
                ['name' => 'Cat Food', 'sku' => 'CAT001', 'category' => 'Food', 'quantity' => 30, 'item_type' => 'product'],
                ['name' => 'Dog Treats', 'sku' => 'TREAT001', 'category' => 'Treats', 'quantity' => 100, 'item_type' => 'product'],
                ['name' => 'Cat Litter', 'sku' => 'LIT001', 'category' => 'Supplies', 'quantity' => 25, 'item_type' => 'product'],
                ['name' => 'Dog Shampoo', 'sku' => 'SHAMP001', 'category' => 'Grooming', 'quantity' => 15, 'item_type' => 'product'],
            ];
            
            foreach ($sampleItems as $itemData) {
                InventoryItem::create($itemData);
            }
        }
        
        // Get all physical inventory items (exclude services)
        $items = InventoryItem::where('item_type', 'product')->get();
        \Log::info("Physical items found: " . $items->count());
        
        // Ensure audit rows exist for each item
        foreach ($items as $item) {
            $auditRow = InventoryMonthlyAudit::firstOrCreate(
                ['inventory_item_id' => $item->id, 'audit_month' => $month],
                [
                    'system_stock' => $item->quantity,
                    'actual_stock' => null,
                    'variance' => 0,
                    'status' => 'pending',
                    'reason' => null,
                ]
            );
            \Log::info("Audit row for item {$item->name}: " . ($auditRow->wasRecentlyCreated ? 'Created' : 'Exists'));
        }
        
        // Return audit rows with item relationships
        $auditRows = InventoryMonthlyAudit::with('item')
            ->where('audit_month', $month)
            ->get();
            
        \Log::info("Returning audit rows: " . $auditRows->count());
        
        return response()->json([
            'success' => true, 
            'audits' => $auditRows,
            'debug_info' => [
                'month' => $month,
                'inventory_count' => $inventoryCount,
                'audit_rows_count' => $auditRows->count(),
                'sample_data_created' => $inventoryCount === 0
            ]
        ]);
    }
    
    /**
     * Save monthly audit data
     */
    public function saveMonthlyAudit(Request $request)
    {
        $items = $request->input('items', []);
        
        \Log::info("Saving audit data for " . count($items) . " items");
        
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
    
    /**
     * Fallback method to get all inventory items directly
     */
    public function getAllInventoryItems()
    {
        $items = InventoryItem::where('item_type', 'product')->get();
        
        return response()->json([
            'success' => true,
            'data' => $items,
            'count' => $items->count()
        ]);
    }
}
