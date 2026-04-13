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
}
