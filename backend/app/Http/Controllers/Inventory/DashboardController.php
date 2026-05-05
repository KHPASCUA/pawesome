<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use App\Services\InventoryService;
use App\Services\WorkflowNotifier;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    private InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }
    public function overview()
    {
        $summary = $this->inventoryService->getSummary();
        $today = Carbon::today();
        
        return response()->json([
            'total_items' => $summary['total_items'],
            'low_stock_items' => $summary['low_stock_count'],
            'out_of_stock_items' => $summary['out_of_stock_count'],
            'expiring_soon' => $summary['expiring_soon_count'],
            'total_stock_value' => $summary['total_stock_value'],
            'recent_transactions' => InventoryLog::with('inventoryItem')
                ->latest()
                ->limit(10)
                ->get(),
            'critical_items' => InventoryItem::where('stock', '<=', 'reorder_level')
                ->orderBy('stock', 'asc')
                ->limit(5)
                ->get(),
            'inventory_changes_today' => InventoryLog::whereDate('created_at', $today)->count(),
        ]);
    }

    public function dashboardOverview()
    {
        $summary = $this->inventoryService->getSummary();

        return response()->json([
            'data' => [
                'total_items' => $summary['total_items'],
                'total_inventory_value' => $summary['total_stock_value'],
                'low_stock_count' => $summary['low_stock_count'],
                'out_of_stock_count' => $summary['out_of_stock_count'],
                'category_breakdown' => $summary['category_breakdown'],
                'recent_activity' => InventoryLog::with('item')
                    ->where(function ($query) {
                        $query->whereNull('reference_type')
                            ->orWhere('reference_type', '!=', 'initial');
                    })
                    ->latest()
                    ->limit(10)
                    ->get(),
            ],
        ]);
    }

    public function lowStockDashboard()
    {
        $items = InventoryItem::where('status', 'active')
            ->where('stock', '>', 0)
            ->whereColumn('stock', '<=', 'reorder_level')
            ->orderBy('stock')
            ->get();

        return response()->json(['data' => $items]);
    }

    public function recentActivity()
    {
        $logs = InventoryLog::with('item')
            ->where(function ($query) {
                $query->whereNull('reference_type')
                    ->orWhere('reference_type', '!=', 'initial');
            })
            ->latest()
            ->limit(10)
            ->get();

        return response()->json(['data' => $logs]);
    }

    public function items()
    {
        return response()->json([
            'items' => InventoryItem::orderBy('name')->get(),
        ]);
    }

    public function logs()
    {
        return response()->json([
            'logs' => InventoryLog::with('inventoryItem', 'user')
                ->latest()
                ->get()
                ->map(fn ($log) => $this->formatLog($log)),
        ]);
    }

    public function reports(Request $request)
    {
        $summary = $this->inventoryService->getSummary();
        $logs = InventoryLog::with('inventoryItem')
            ->when($request->startDate, fn ($query) => $query->whereDate('created_at', '>=', $request->startDate))
            ->when($request->endDate, fn ($query) => $query->whereDate('created_at', '<=', $request->endDate))
            ->latest()
            ->limit(100)
            ->get();

        return response()->json([
            'summary' => $summary,
            'items' => InventoryItem::orderBy('name')->get(),
            'logs' => $logs,
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    public function history(Request $request)
    {
        $query = InventoryLog::with('inventoryItem')->latest();

        if ($request->filled('itemId')) {
            $query->where('inventory_item_id', $request->itemId);
        }

        if ($request->filled('item_id')) {
            $query->where('inventory_item_id', $request->item_id);
        }

        if ($request->filled('action')) {
            $query->where('reference_type', $request->action);
        }

        if ($request->filled('startDate')) {
            $query->whereDate('created_at', '>=', $request->startDate);
        }

        if ($request->filled('endDate')) {
            $query->whereDate('created_at', '<=', $request->endDate);
        }

        $history = $query->paginate($request->integer('per_page', 50));
        $items = collect($history->items())->map(fn ($log) => $this->formatLog($log))->values();

        return response()->json([
            'history' => $items,
            'data' => $items,
            'meta' => [
                'current_page' => $history->currentPage(),
                'total' => $history->total(),
                'per_page' => $history->perPage(),
            ],
        ]);
    }

    public function lowStock()
    {
        return response()->json([
            'data' => $this->inventoryService->getLowStockItems(),
            'count' => count($this->inventoryService->getLowStockItems()),
        ]);
    }

    public function adjustStock(Request $request, $id)
    {
        $validated = $request->validate([
            'type' => 'required|in:add,remove,set',
            'quantity' => 'required|integer|min:0',
            'reason' => 'nullable|string|max:255',
        ]);

        $item = InventoryItem::findOrFail($id);
        $current = (int) $item->stock;
        $quantity = (int) $validated['quantity'];

        $newStock = match ($validated['type']) {
            'add' => $current + $quantity,
            'remove' => max(0, $current - $quantity),
            default => $quantity,
        };

        $item->update(['stock' => $newStock]);

        InventoryLog::create([
            'inventory_item_id' => $item->id,
            'delta' => $newStock - $current,
            'quantity' => abs($newStock - $current),
            'type' => $validated['type'],
            'movement_type' => 'manual_adjustment',
            'reason' => $validated['reason'] ?? 'Manual stock adjustment',
            'reference_type' => $validated['type'],
            'stock_before' => $current,
            'stock_after' => $newStock,
            'previous_stock' => $current,
            'new_stock' => $newStock,
            'performed_by' => $request->user()?->name,
            'role' => $request->user()?->role,
            'user_id' => $request->user()?->id,
        ]);

        WorkflowNotifier::notifyRole('inventory', 'Stock Adjustment Made', "{$item->name}: {$current} -> {$newStock}", 'info', 'inventory_item', $item->id);
        ActivityLog::log($request->user()?->id, 'inventory_adjusted', "Inventory adjusted {$item->name}", [
            'category' => 'inventory',
            'reference_type' => 'inventory_item',
            'reference_id' => $item->id,
            'metadata' => ['previous_stock' => $current, 'new_stock' => $newStock],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Stock adjusted successfully',
            'item' => $item->fresh(),
            'previous_stock' => $current,
            'new_stock' => $newStock,
            'adjustment' => $newStock - $current,
        ]);
    }

    private function formatLog(InventoryLog $log): array
    {
        return [
            'id' => $log->id,
            'inventory_item_id' => $log->inventory_item_id,
            'item_name' => $log->inventoryItem?->name,
            'item_sku' => $log->inventoryItem?->sku,
            'movement_type' => $log->movement_type ?? $log->reference_type ?? $log->type,
            'action' => $log->movement_type ?? $log->reference_type ?? $log->type,
            'quantity_change' => $log->delta ?? 0,
            'quantity' => $log->quantity ?? abs($log->delta ?? 0),
            'previous_stock' => $log->previous_stock ?? $log->stock_before,
            'new_stock' => $log->new_stock ?? $log->stock_after,
            'stock_before' => $log->stock_before ?? $log->previous_stock,
            'stock_after' => $log->stock_after ?? $log->new_stock,
            'reason' => $log->reason,
            'performed_by' => $log->performed_by ?? $log->user?->name,
            'user_name' => $log->performed_by ?? $log->user?->name,
            'role' => $log->role,
            'created_at' => $log->created_at,
        ];
    }

    public function reorderRequest(Request $request)
    {
        $payload = $request->validate([
            'item_id' => 'required|integer|exists:inventory_items,id',
            'item_name' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:255',
            'suggested_quantity' => 'nullable|integer|min:1',
            'current_stock' => 'nullable|integer|min:0',
            'reorder_level' => 'nullable|integer|min:0',
            'priority' => 'nullable|string|max:50',
            'status' => 'nullable|string|max:50',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reorder request recorded',
            'request' => array_merge($payload, [
                'id' => 'RR-' . now()->format('YmdHis'),
                'status' => $payload['status'] ?? 'pending',
                'created_at' => now()->toIso8601String(),
            ]),
        ], 201);
    }

    public function showItem($id)
    {
        $item = InventoryItem::findOrFail($id);
        return response()->json($item);
    }

    public function storeItem(Request $request)
    {
        try {
            $result = $this->inventoryService->createItem($request->all());
            return response()->json($result, 201);
        } catch (\Exception $e) {
            return response()->json(['errors' => [$e->getMessage()]], 422);
        }
    }

    public function updateItem(Request $request, $id)
    {
        try {
            $result = $this->inventoryService->updateItem($id, $request->all());
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['errors' => [$e->getMessage()]], 422);
        }
    }

    public function destroyItem($id)
    {
        try {
            $result = $this->inventoryService->deleteItem($id);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['errors' => [$e->getMessage()]], 422);
        }
    }

    /**
     * PUBLIC ENDPOINTS - Available to all authenticated users (customers, cashiers, etc.)
     * Read-only access for store browsing and POS
     */

    /**
     * Get all active inventory items for public view (Customer Store, POS)
     * Filters: category, search, in_stock_only
     */
    public function publicItems(Request $request)
    {
        $filters = [
            'category' => $request->category,
            'search' => $request->search,
            'in_stock_only' => $request->boolean('in_stock_only'),
        ];
        return response()->json($this->inventoryService->getPublicItems($filters));
    }

    /**
     * Get available categories for public browsing
     */
    public function categories()
    {
        $categories = InventoryItem::where('status', 'active')
            ->select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json([
            'categories' => $categories,
            'count' => $categories->count(),
        ]);
    }

    /**
     * Get single item details for public view
     */
    public function showPublicItem($id)
    {
        $item = InventoryItem::where('id', $id)
            ->where('status', 'active')
            ->firstOrFail();

        return response()->json([
            'item' => $item,
            'in_stock' => $item->stock > 0,
            'stock_status' => $item->stock > 0 ? 'available' : 'out_of_stock',
        ]);
    }

    /**
     * Search products for Cashier POS
     * Search by name or SKU
     */
    public function searchProducts(Request $request)
    {
        $query = $request->get('q', '');

        $products = InventoryItem::where('status', 'active')
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('sku', 'like', "%{$query}%");
            })
            ->limit(20)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'sku' => $item->sku,
                    'price' => $item->price,
                    'stock' => $item->stock,
                ];
            });

        return response()->json($products);
    }

    /**
     * Lookup product by barcode for Cashier POS
     */
    public function lookupBarcode($barcode)
    {
        $product = InventoryItem::where('barcode', $barcode)
            ->where('status', 'active')
            ->first();

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        return response()->json([
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'price' => $product->price,
                'stock' => $product->stock,
                'barcode' => $product->barcode,
            ],
        ]);
    }
}
