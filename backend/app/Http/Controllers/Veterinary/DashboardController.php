<?php

namespace App\Http\Controllers\Veterinary;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
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
            'completed_appointments' => Appointment::where('status', 'completed')->count(),
            'total_patients' => Pet::count(),
            'new_patients_this_month' => Pet::whereMonth('created_at', $today->month)->count(),
            'upcoming_appointments' => Appointment::with(['customer', 'pet', 'service'])
                ->where('scheduled_at', '>=', $today)
                ->whereIn('status', ['scheduled', 'confirmed'])
                ->orderBy('scheduled_at')
                ->limit(5)
                ->get(),
            'recent_patients' => Pet::with('customer')->latest()->take(5)->get(),
            'appointments_by_type' => Appointment::with('service')
                ->selectRaw('service_id, count(*) as count')
                ->whereMonth('scheduled_at', $today->month)
                ->groupBy('service_id')
                ->get(),
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

    public function patients()
    {
        return response()->json(
            Pet::with(['customer', 'appointments' => function($query) {
                $query->latest()->take(3);
            }])->get()
        );
    }
}
