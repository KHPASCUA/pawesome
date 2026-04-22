<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function overview()
    {
        $today = Carbon::today();
        
        return response()->json([
            'total_items' => InventoryItem::count(),
            'low_stock_items' => InventoryItem::where('stock', '<=', 'reorder_level')->count(),
            'out_of_stock_items' => InventoryItem::where('stock', 0)->count(),
            'expiring_soon' => InventoryItem::where('expiry_date', '<=', $today->addDays(30))->count(),
            'total_stock_value' => InventoryItem::selectRaw('SUM(stock * price) as total')->first()->total,
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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:inventory_items,sku',
            'category' => 'required|string|max:100',
            'brand' => 'nullable|string|max:100',
            'supplier' => 'nullable|string|max:100',
            'quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'reorder_level' => 'nullable|integer|min:0',
            'expiry_date' => 'nullable|date',
            'status' => 'nullable|string|in:In stock,Low stock,Out of stock',
        ]);

        // Map quantity to stock for database
        $validated['stock'] = $validated['quantity'];
        $validated['reorder_level'] = $validated['reorder_level'] ?? 10;

        // Determine status based on quantity
        if (!isset($validated['status'])) {
            if ($validated['stock'] == 0) {
                $validated['status'] = 'Out of stock';
            } elseif ($validated['stock'] <= $validated['reorder_level']) {
                $validated['status'] = 'Low stock';
            } else {
                $validated['status'] = 'In stock';
            }
        }

        $item = InventoryItem::create($validated);

        // Log the creation
        InventoryLog::create([
            'inventory_item_id' => $item->id,
            'type' => 'addition',
            'quantity' => $item->stock,
            'notes' => 'Item created via inventory management',
        ]);

        return response()->json(['message' => 'Item created successfully', 'item' => $item], 201);
    }

    public function updateItem(Request $request, $id)
    {
        $item = InventoryItem::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'sku' => 'sometimes|string|unique:inventory_items,sku,' . $id,
            'category' => 'sometimes|string|max:100',
            'brand' => 'nullable|string|max:100',
            'supplier' => 'nullable|string|max:100',
            'quantity' => 'sometimes|integer|min:0',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'reorder_level' => 'nullable|integer|min:0',
            'expiry_date' => 'nullable|date',
            'status' => 'nullable|string|in:In stock,Low stock,Out of stock',
        ]);

        // Map quantity to stock if provided
        if (isset($validated['quantity'])) {
            $validated['stock'] = $validated['quantity'];
        }

        $oldStock = $item->stock;
        $item->update($validated);

        // Log stock change if quantity changed
        if (isset($validated['stock']) && $validated['stock'] != $oldStock) {
            $difference = $validated['stock'] - $oldStock;
            InventoryLog::create([
                'inventory_item_id' => $item->id,
                'type' => $difference > 0 ? 'addition' : 'reduction',
                'quantity' => abs($difference),
                'notes' => 'Stock adjusted via inventory management',
            ]);
        }

        return response()->json(['message' => 'Item updated successfully', 'item' => $item]);
    }

    public function destroyItem($id)
    {
        $item = InventoryItem::findOrFail($id);

        // Log the deletion
        InventoryLog::create([
            'inventory_item_id' => $item->id,
            'type' => 'reduction',
            'quantity' => $item->stock,
            'notes' => 'Item deleted via inventory management',
        ]);

        $item->delete();

        return response()->json(['message' => 'Item deleted successfully']);
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
        $query = InventoryItem::where('status', 'active');

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by search term (name or SKU)
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter for in-stock items only
        if ($request->boolean('in_stock_only')) {
            $query->where('stock', '>', 0);
        }

        $items = $query->orderBy('name')->get();

        return response()->json([
            'items' => $items,
            'count' => $items->count(),
            'timestamp' => now()->toIso8601String(),
        ]);
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
