<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use App\Services\InventoryService;
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

    public function items()
    {
        return response()->json(
            InventoryItem::orderBy('name')->get()
        );
    }

    public function logs()
    {
        return response()->json(
            InventoryLog::with('inventoryItem')
                ->latest()
                ->get()
        );
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
}
