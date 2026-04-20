<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Customer;
use App\Models\Appointment;
use App\Models\InventoryItem;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function overview()
    {
        $today = Carbon::today();
        
        return response()->json([
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'total_customers' => Customer::count(),
            'total_appointments' => Appointment::count(),
            'today_appointments' => Appointment::whereDate('scheduled_at', $today)->count(),
            'completed_appointments' => Appointment::where('status', 'completed')->count(),
            'total_revenue' => Sale::sum('amount'),
            'today_revenue' => Sale::whereDate('created_at', $today)->sum('amount'),
            'low_stock_items' => InventoryItem::whereColumn('stock', '<=', 'reorder_level')->count(),
            'appointments_by_status' => Appointment::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get(),
            'users_by_role' => User::selectRaw('role, COUNT(*) as count')
                ->groupBy('role')
                ->get(),
            'recent_users' => User::latest()->take(5)->get(),
            'recent_appointments' => Appointment::with(['customer', 'pet', 'service'])->latest()->take(5)->get(),
        ]);
    }

    public function stats()
    {
        return response()->json([
            'users_by_role' => User::selectRaw('role, count(*) as count')
                ->groupBy('role')
                ->get(),
            'appointments_by_status' => Appointment::selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->get(),
            'monthly_revenue' => Sale::selectRaw('MONTH(created_at) as month, SUM(amount) as total')
                ->whereYear('created_at', Carbon::now()->year)
                ->groupBy('month')
                ->get(),
        ]);
    }
}
