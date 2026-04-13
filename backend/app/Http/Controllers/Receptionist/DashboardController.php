<?php

namespace App\Http\Controllers\Receptionist;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function overview()
    {
        $today = Carbon::today();
        
        return response()->json([
            'today_appointments' => Appointment::whereDate('scheduled_at', $today)->count(),
            'pending_appointments' => Appointment::where('status', 'scheduled')->count(),
            'confirmed_appointments' => Appointment::where('status', 'confirmed')->count(),
            'completed_appointments' => Appointment::where('status', 'completed')->count(),
            'total_customers' => Customer::count(),
            'total_pets' => Pet::count(),
            'check_ins_today' => Appointment::whereDate('scheduled_at', $today)
                ->where('status', 'confirmed')->count(),
            'upcoming_appointments' => Appointment::with(['customer', 'pet', 'service'])
                ->where('scheduled_at', '>=', $today)
                ->whereIn('status', ['scheduled', 'confirmed'])
                ->orderBy('scheduled_at')
                ->limit(5)
                ->get(),
            'recent_customers' => Customer::latest()->take(5)->get(),
        ]);
    }

    public function appointments()
    {
        return response()->json(
            Appointment::with(['customer', 'pet', 'service'])
                ->orderBy('scheduled_at')
                ->get()
        );
    }

    public function customers()
    {
        return response()->json(
            Customer::with('pets')->get()
        );
    }
}
