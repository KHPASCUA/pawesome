<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function overview()
    {
        $today = Carbon::today();
        
        return response()->json([
            'today_sales' => Sale::whereDate('created_at', $today)->sum('amount'),
            'today_transactions' => Sale::whereDate('created_at', $today)->count(),
            'monthly_sales' => Sale::whereMonth('created_at', $today->month)->sum('amount'),
            'monthly_transactions' => Sale::whereMonth('created_at', $today->month)->count(),
            'pending_payments' => Appointment::where('status', 'confirmed')->count(),
            'completed_payments' => Sale::where('type', 'appointment')->count(),
            'recent_sales' => Sale::latest()->limit(10)->get(),
            'sales_by_type' => Sale::selectRaw('type, COUNT(*) as count, SUM(amount) as total')
                ->whereMonth('created_at', $today->month)
                ->groupBy('type')
                ->get(),
        ]);
    }

    public function sales()
    {
        return response()->json(
            Sale::latest()->get()
        );
    }

    public function transactions()
    {
        return response()->json(
            Sale::latest()->limit(50)->get()
        );
    }
}
