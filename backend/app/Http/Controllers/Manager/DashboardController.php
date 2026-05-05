<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Sale;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function overview()
    {
        $today = Carbon::today();
        $staffRoles = ['receptionist', 'veterinary', 'inventory', 'cashier'];
        
        return response()->json([
            'total_orders' => DB::table('customer_orders')->count(),
            'approved_orders' => DB::table('customer_orders')->where('status', 'approved')->count(),
            'paid_orders' => DB::table('customer_orders')->where('payment_status', 'paid')->count(),
            'pending_payments' => DB::table('customer_orders')->where('payment_status', 'pending')->count(),
            'rejected_orders' => DB::table('customer_orders')->whereIn('status', ['rejected', 'cancelled'])->count(),
            'sales_total' => Sale::where('status', 'completed')->sum('amount')
                + DB::table('customer_orders')->where('payment_status', 'paid')->sum('total_amount'),
            'low_stock_count' => InventoryItem::whereColumn('stock', '<=', 'reorder_level')->count(),
            'completed_services' => Appointment::where('status', 'completed')->count()
                + DB::table('service_requests')->where('status', 'completed')->count(),
            'total_staff' => User::whereIn('role', $staffRoles)->count(),
            'active_staff' => User::whereIn('role', $staffRoles)
                ->where('is_active', true)->count(),
            'today_appointments' => Appointment::whereDate('scheduled_at', $today)->count(),
            'pending_appointments' => Appointment::where('status', 'scheduled')->count(),
            'completed_appointments' => Appointment::where('status', 'completed')->count(),
            'today_revenue' => Sale::whereDate('created_at', $today)->sum('amount'),
            'monthly_revenue' => Sale::whereMonth('created_at', $today->month)->sum('amount'),
            'staff_performance' => User::whereIn('role', $staffRoles)
                ->select('id', 'name', 'role', 'is_active', 'created_at')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function staff()
    {
        return response()->json([
            'staff' => User::whereIn('role', ['receptionist', 'veterinary', 'inventory', 'cashier'])->get(),
            'attendance_today' => User::whereIn('role', ['receptionist', 'veterinary', 'inventory', 'cashier'])
                ->where('is_active', true)->count(),
        ]);
    }
}
