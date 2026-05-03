<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class InventoryController extends Controller
{
    private InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }
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

        return response()->json(array_merge($items->toArray(), [
            'items' => $items->items(),
        ]));
    }

    /**
     * Store a newly created inventory item
     */
    public function store(Request $request)
    {
        try {
            $result = $this->inventoryService->createItem($request->all());
            return response()->json($result, 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['errors' => [$e->getMessage()]], 422);
        }
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
     */
    public function update(Request $request, $id)
    {
        try {
            $result = $this->inventoryService->updateItem($id, $request->all());
            return response()->json($result);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['errors' => [$e->getMessage()]], 422);
        }
    }

    /**
     * Remove the specified inventory item
     */
    public function destroy($id)
    {
        try {
            $result = $this->inventoryService->deleteItem($id);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['errors' => [$e->getMessage()]], 422);
        }
    }

    /**
     * Adjust stock for an item
     */
    public function adjustStock(Request $request, $id)
    {
        try {
            $result = $this->inventoryService->adjustStock(
                $id,
                $request->quantity,
                $request->reason,
                [
                    'type' => $request->type,
                    'previous' => $request->previous,
                    'new' => $request->new,
                    'performed_by' => $request->performed_by,
                    'role' => $request->role,
                    'user_id' => $request->user_id,
                ]
            );
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['errors' => [$e->getMessage()]], 422);
        }
    }

    /**
     * Get low stock items (reorder alerts)
     */
    public function lowStock()
    {
        return response()->json($this->inventoryService->getLowStockItems());
    }

    /**
     * Get out of stock items
     */
    public function outOfStock()
    {
        return response()->json($this->inventoryService->getOutOfStockItems());
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
            'logs' => $logs->items(),
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
        return response()->json($this->inventoryService->getSummary());
    }

    /**
     * Get sellable products for POS and Customer Store
     * Only returns items that are sellable and have stock > 0
     */
    public function sellable()
    {
        $items = InventoryItem::where('is_sellable', true)
            ->where('stock', '>', 0)
            ->orderBy('name')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'category' => $item->category,
                    'description' => $item->description,
                    'price' => (float) $item->price,
                    'stock' => $item->stock,
                    'reorder_level' => $item->reorder_level,
                    'status' => $item->status,
                    'is_sellable' => $item->is_sellable,
                ];
            });

        return response()->json([
            'success' => true,
            'products' => $items,
            'count' => $items->count(),
        ]);
    }
}
