<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function overview()
    {
        $today = Carbon::today();
        $staffRoles = ['receptionist', 'veterinary', 'inventory', 'cashier'];
        
        return response()->json([
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
