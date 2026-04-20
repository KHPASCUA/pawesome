<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\Sale;
use App\Models\Service;
use App\Models\User;
use App\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportsController extends Controller
{
    public function summary()
    {
        $today = Carbon::today();
        $year = Carbon::now()->year;

        $monthlyRevenue = Sale::selectRaw('MONTH(created_at) as month, SUM(amount) as total')
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->orderByRaw('month')
            ->get();

        $topServices = Appointment::selectRaw('service_id, COUNT(*) as count')
            ->with('service')
            ->groupBy('service_id')
            ->orderByDesc('count')
            ->limit(3)
            ->get()
            ->map(function ($item) {
                return [
                    'service' => $item->service?->name ?? 'Unknown Service',
                    'count' => $item->count,
                ];
            });

        $topCustomers = Appointment::selectRaw('customer_id, COUNT(*) as count')
            ->with('customer')
            ->groupBy('customer_id')
            ->orderByDesc('count')
            ->limit(3)
            ->get()
            ->map(function ($item) {
                return [
                    'customer' => $item->customer?->name ?? 'Unknown Customer',
                    'visits' => $item->count,
                ];
            });

        return response()->json([
            'total_revenue' => Sale::sum('amount'),
            'today_revenue' => Sale::whereDate('created_at', $today)->sum('amount'),
            'total_transactions' => Sale::count(),
            'today_transactions' => Sale::whereDate('created_at', $today)->count(),
            'total_customers' => Customer::count(),
            'new_customers' => Customer::where('created_at', '>=', Carbon::now()->subMonth())->count(),
            'total_users' => User::count(),
            'total_appointments' => Appointment::count(),
            'completed_appointments' => Appointment::where('status', 'completed')->count(),
            'total_pets' => Pet::count(),
            'total_inventory_items' => InventoryItem::count(),
            'low_stock_items' => InventoryItem::whereColumn('stock', '<=', 'reorder_level')->count(),
            'out_of_stock_items' => InventoryItem::where('stock', 0)->count(),
            'monthly_revenue' => $monthlyRevenue,
            'top_services' => $topServices,
            'top_customers' => $topCustomers,
        ]);
    }
}
