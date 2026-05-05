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

    public function executiveSummary()
    {
        $today = Carbon::today();
        $monthStart = $today->copy()->startOfMonth();
        
        return response()->json([
            'business_overview' => [
                'total_customers' => DB::table('customers')->count(),
                'active_customers' => DB::table('customers')->where('is_active', true)->count(),
                'total_pets' => DB::table('pets')->count(),
                'total_services' => DB::table('services')->count(),
            ],
            'financial_metrics' => [
                'today_revenue' => Sale::whereDate('created_at', $today)->sum('amount'),
                'monthly_revenue' => Sale::whereMonth('created_at', $today->month)->sum('amount'),
                'yearly_revenue' => Sale::whereYear('created_at', $today->year)->sum('amount'),
                'pending_payments' => DB::table('customer_orders')->where('payment_status', 'pending')->count(),
                'overdue_invoices' => DB::table('customer_orders')
                    ->where('payment_status', 'pending')
                    ->where('due_date', '<', $today)
                    ->count(),
            ],
            'operational_metrics' => [
                'today_appointments' => Appointment::whereDate('scheduled_at', $today)->count(),
                'completed_appointments' => Appointment::whereMonth('scheduled_at', $today->month)->count(),
                'pending_orders' => DB::table('customer_orders')->where('status', 'pending')->count(),
                'low_stock_items' => InventoryItem::whereColumn('stock', '<=', 'reorder_level')->count(),
                'occupancy_rate' => DB::table('hotel_rooms')->count() > 0 
                    ? round(DB::table('boardings')->where('status', 'checked_in')->count() / DB::table('hotel_rooms')->count() * 100, 2)
                    : 0,
            ],
            'staff_performance' => [
                'total_staff' => User::whereIn('role', ['receptionist', 'veterinary', 'inventory', 'cashier'])->count(),
                'active_staff' => User::whereIn('role', ['receptionist', 'veterinary', 'inventory', 'cashier'])
                    ->where('is_active', true)->count(),
                'staff_on_leave' => User::whereIn('role', ['receptionist', 'veterinary', 'inventory', 'cashier'])
                    ->where('is_active', false)->count(),
            ],
            'monthly_trends' => [
                'revenue_growth' => $this->calculateRevenueGrowth($today),
                'customer_growth' => $this->calculateCustomerGrowth($today),
                'appointment_completion_rate' => $this->calculateAppointmentCompletionRate($today),
            ],
        ]);
    }

    private function calculateRevenueGrowth($today)
    {
        $currentMonth = Sale::whereMonth('created_at', $today->month)->sum('amount');
        $previousMonth = Sale::whereMonth('created_at', $today->copy()->subMonth()->month)->sum('amount');
        
        return $previousMonth > 0 ? round((($currentMonth - $previousMonth) / $previousMonth) * 100, 2) : 0;
    }

    private function calculateCustomerGrowth($today)
    {
        $currentMonth = DB::table('customers')->whereMonth('created_at', $today->month)->count();
        $previousMonth = DB::table('customers')->whereMonth('created_at', $today->copy()->subMonth()->month)->count();
        
        return $previousMonth > 0 ? round((($currentMonth - $previousMonth) / $previousMonth) * 100, 2) : 0;
    }

    private function calculateAppointmentCompletionRate($today)
    {
        $total = Appointment::whereMonth('scheduled_at', $today->month)->count();
        $completed = Appointment::whereMonth('scheduled_at', $today->month)->where('status', 'completed')->count();
        
        return $total > 0 ? round(($completed / $total) * 100, 2) : 0;
    }
}
