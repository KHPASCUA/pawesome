<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class InventoryController extends Controller
{
    /**
     * Display a listing of inventory items with optional filtering
     */
    public function index(Request $request)
    {
        $query = InventoryItem::query();

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by stock level
        if ($request->has('stock_level')) {
            switch ($request->stock_level) {
                case 'low':
                    $query->whereRaw('stock <= reorder_level')->where('stock', '>', 0);
                    break;
                case 'out':
                    $query->where('stock', 0);
                    break;
                case 'in_stock':
                    $query->where('stock', '>', 0);
                    break;
            }
        }

        // Search by name or SKU
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $items = $query->orderBy('name')->paginate($request->per_page ?? 20);

        return response()->json($items);
    }

    /**
     * Store a newly created inventory item
     * 
     * Supports add_stock parameter for API consistency with update method.
     * For new items, add_stock=true acts same as setting initial stock.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:50|unique:inventory_items,sku',
            'category' => 'required|string|max:50',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'quantity' => 'nullable|integer|min:0', // Alternative field name for frontend compatibility
            'add_stock' => 'nullable|boolean', // For API consistency with update method
            'reorder_level' => 'required|integer|min:0',
            'expiry_date' => 'nullable|date',
            'status' => 'nullable|in:active,inactive,discontinued',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Auto-generate SKU if not provided
        $sku = $request->sku;
        if (empty($sku)) {
            $sku = $this->generateSKU($request->category);
        }

        // Use quantity if stock is not provided (frontend compatibility)
        $stock = $request->has('stock') ? $request->stock : ($request->quantity ?? 0);

        $item = InventoryItem::create([
            'name' => $request->name,
            'sku' => $sku,
            'category' => $request->category,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $stock,
            'reorder_level' => $request->reorder_level,
            'expiry_date' => $request->expiry_date,
            'status' => $request->status ?? 'active',
        ]);

        // Log initial stock
        if ($stock > 0) {
            InventoryLog::create([
                'inventory_item_id' => $item->id,
                'delta' => $stock,
                'reason' => 'Initial stock',
                'reference_type' => 'initial',
            ]);
        }

        return response()->json([
            'message' => 'Item created successfully',
            'item' => $item,
            'stock_action' => 'initial', // For consistency with update method
            'new_stock' => $stock,
        ], 201);
    }

    /**
     * Display the specified inventory item
     */
    public function show($id)
    {
        $item = InventoryItem::with(['logs' => function ($query) {
            $query->latest()->limit(20);
        }])->findOrFail($id);

        return response()->json(['item' => $item]);
    }

    /**
     * Update the specified inventory item
     * 
     * STOCK UPDATE BEHAVIOR:
     * - If item HAS expiry date AND is expired: Replace stock (clear expired inventory)
     * - If item has NO expiry date: Always add stock (50 + 25 = 75) when add_stock=true
     * - If item NOT expired: Add stock (50 + 25 = 75) when add_stock=true
     * - If add_stock=false or not set: Replace stock to specified value
     */
    public function update(Request $request, $id)
    {
        $item = InventoryItem::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'sku' => 'sometimes|string|max:50|unique:inventory_items,sku,' . $id,
            'category' => 'sometimes|string|max:50',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'quantity' => 'nullable|integer|min:0', // Alternative field name for frontend compatibility
            'add_stock' => 'nullable|boolean', // If true, adds to existing stock (unless expired)
            'reorder_level' => 'sometimes|integer|min:0',
            'expiry_date' => 'nullable|date',
            'status' => 'sometimes|in:active,inactive,discontinued',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Track stock change for logging
        $oldStock = $item->stock;
        $inputStock = $request->has('stock') ? $request->stock : ($request->has('quantity') ? $request->quantity : null);
        $addStock = $request->boolean('add_stock', false);

        // Check if item has expiry date and is expired
        $hasExpiry = $item->expiry_date !== null;
        $isExpired = $hasExpiry && $item->expiry_date < now();

        // Determine new stock value
        if ($inputStock !== null) {
            if ($hasExpiry && $isExpired) {
                // Item HAS expiry AND IS expired: Replace stock (discard old expired stock)
                $newStock = $inputStock;
                $adjustmentReason = 'Stock replacement (expired inventory cleared)';
            } elseif ($addStock) {
                // Item has NO expiry (or not expired) + add_stock=true: Add to existing stock (e.g., 50 + 25 = 75)
                $newStock = $oldStock + $inputStock;
                $adjustmentReason = "Stock addition (+{$inputStock})";
            } else {
                // No add_stock flag: Replace stock
                $newStock = $inputStock;
                $adjustmentReason = 'Manual stock adjustment';
            }
        } else {
            $newStock = $oldStock;
            $adjustmentReason = null;
        }

        $updateData = $request->only([
            'name', 'sku', 'category', 'description', 'price',
            'reorder_level', 'expiry_date', 'status'
        ]);
        $updateData['stock'] = $newStock;

        // If we replaced expired stock, also update expiry date if new one provided
        if ($isExpired && !$request->has('expiry_date')) {
            // Keep the item expired unless new expiry is provided
        }

        $item->update($updateData);

        // Log stock adjustment if changed
        if ($oldStock !== $newStock && $adjustmentReason) {
            $delta = $newStock - $oldStock;
            InventoryLog::create([
                'inventory_item_id' => $item->id,
                'delta' => $delta,
                'reason' => $adjustmentReason,
                'reference_type' => $isExpired ? 'expired_replacement' : ($addStock ? 'addition' : 'adjustment'),
            ]);
        }

        return response()->json([
            'message' => $isExpired ? 'Item updated (expired stock replaced)' : 'Item updated successfully',
            'item' => $item->fresh(),
            'stock_action' => $isExpired ? 'replaced_expired' : ($addStock ? 'added' : 'replaced'),
            'previous_stock' => $oldStock,
            'new_stock' => $newStock,
        ]);
    }

    /**
     * Remove the specified inventory item
     */
    public function destroy($id)
    {
        $item = InventoryItem::findOrFail($id);

        // Check if item has been used in sales
        $saleItemsCount = DB::table('sale_items')
            ->where('product_id', $id)
            ->count();

        if ($saleItemsCount > 0) {
            // Soft delete by marking as discontinued
            $item->update(['status' => 'discontinued']);
            return response()->json([
                'message' => 'Item marked as discontinued (has sales history)',
                'item' => $item,
            ]);
        }

        $item->delete();
        return response()->json(['message' => 'Item deleted successfully']);
    }

    /**
     * Adjust stock for an item
     */
    public function adjustStock(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer',
            'reason' => 'required|string|max:255',
            'reference_type' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $item = InventoryItem::findOrFail($id);
        $quantity = $request->quantity;

        // Check if adjustment would result in negative stock
        if ($item->stock + $quantity < 0) {
            return response()->json([
                'errors' => ['quantity' => ['Adjustment would result in negative stock']],
            ], 422);
        }

        $item->increment('stock', $quantity);

        // Log the adjustment
        InventoryLog::create([
            'inventory_item_id' => $item->id,
            'delta' => $quantity,
            'reason' => $request->reason,
            'reference_type' => $request->reference_type ?? 'adjustment',
        ]);

        return response()->json([
            'message' => 'Stock adjusted successfully',
            'item' => $item->fresh(),
        ]);
    }

    /**
     * Get low stock items (reorder alerts)
     */
    public function lowStock()
    {
        $items = InventoryItem::whereRaw('stock <= reorder_level')
            ->where('stock', '>', 0)
            ->where('status', 'active')
            ->orderByRaw('stock / reorder_level asc')
            ->get();

        return response()->json([
            'count' => $items->count(),
            'items' => $items,
        ]);
    }

    /**
     * Get out of stock items
     */
    public function outOfStock()
    {
        $items = InventoryItem::where('stock', 0)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        return response()->json([
            'count' => $items->count(),
            'items' => $items,
        ]);
    }

    /**
     * Get stock movement history for a specific item
     */
    public function stockHistory($id)
    {
        $item = InventoryItem::findOrFail($id);
        $logs = InventoryLog::where('inventory_item_id', $id)
            ->with('inventoryItem')
            ->latest()
            ->paginate(50);

        return response()->json([
            'item' => $item,
            'history' => $logs,
        ]);
    }

    /**
     * Get all stock history (for history page)
     */
    public function getHistory(Request $request)
    {
        $query = InventoryLog::with('inventoryItem')->latest();

        // Filter by item
        if ($request->has('item_id')) {
            $query->where('inventory_item_id', $request->item_id);
        }

        // Filter by action type
        if ($request->has('action')) {
            $query->where('reference_type', $request->action);
        }

        // Filter by date range
        if ($request->has('startDate')) {
            $query->whereDate('created_at', '>=', $request->startDate);
        }
        if ($request->has('endDate')) {
            $query->whereDate('created_at', '<=', $request->endDate);
        }

        $history = $query->paginate($request->per_page ?? 50);

        return response()->json([
            'history' => $history->items(),
            'meta' => [
                'current_page' => $history->currentPage(),
                'total' => $history->total(),
                'per_page' => $history->perPage(),
            ],
        ]);
    }

    /**
     * Get inventory summary/stats
     */
    public function summary()
    {
        $totalItems = InventoryItem::count();
        $totalValue = InventoryItem::where('status', 'active')
            ->sum(DB::raw('stock * price'));
        $lowStockCount = InventoryItem::whereRaw('stock <= reorder_level')
            ->where('stock', '>', 0)
            ->count();
        $outOfStockCount = InventoryItem::where('stock', 0)->count();
        $expiringSoon = InventoryItem::where('expiry_date', '<=', now()->addDays(30))
            ->where('expiry_date', '>=', now())
            ->count();

        $categoryBreakdown = InventoryItem::where('status', 'active')
            ->selectRaw('category, COUNT(*) as count, SUM(stock) as total_stock, SUM(stock * price) as total_value')
            ->groupBy('category')
            ->get();

        return response()->json([
            'total_items' => $totalItems,
            'total_stock_value' => $totalValue,
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
            'expiring_soon_count' => $expiringSoon,
            'category_breakdown' => $categoryBreakdown,
        ]);
    }

    /**
     * Generate unique SKU
     */
    private function generateSKU(string $category): string
    {
        $prefix = strtoupper(substr($category, 0, 3));
        $random = strtoupper(Str::random(4));
        $timestamp = date('ym');
        return "{$prefix}-{$random}{$timestamp}";
    }
}
