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
            'pending_appointments' => 0,
            'approved_appointments' => Appointment::whereIn('status', ['approved', 'scheduled'])->count(),
            'completed_appointments' => Appointment::where('status', 'completed')->count(),
            'total_patients' => Pet::count(),
            'new_patients_this_month' => Pet::whereMonth('created_at', $today->month)->count(),
            'upcoming_appointments' => Appointment::with(['customer', 'pet', 'service', 'veterinarian'])
                ->where('scheduled_at', '>=', $today)
                ->whereIn('status', ['approved', 'scheduled', 'in_progress', 'treated'])
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
            Appointment::with(['customer', 'pet', 'service', 'veterinarian'])
                ->whereIn('status', ['approved', 'scheduled', 'in_progress', 'treated', 'completed', 'cancelled', 'no_show'])
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

    public function appointment($id)
    {
        return response()->json([
            'appointment' => Appointment::with(['customer', 'pet', 'service', 'veterinarian'])->findOrFail($id),
        ]);
    }

    public function history(Request $request)
    {
        $statuses = $request->input('status', 'completed,cancelled');
        $statusArray = explode(',', $statuses);
        
        $appointments = Appointment::with(['customer', 'pet', 'service', 'veterinarian'])
            ->whereIn('status', $statusArray)
            ->orderBy('scheduled_at', 'desc')
            ->get();
            
        return response()->json($appointments);
    }

    public function reports()
    {
        $today = Carbon::today();
        $monthStart = $today->copy()->startOfMonth();
        
        $completedAppointments = Appointment::where('status', 'completed')
            ->whereMonth('scheduled_at', $today->month)
            ->count();
            
        $totalRevenue = Appointment::where('status', 'completed')
            ->whereMonth('scheduled_at', $today->month)
            ->sum('price');
            
        $serviceBreakdown = Appointment::with('service')
            ->where('status', 'completed')
            ->whereMonth('scheduled_at', $today->month)
            ->selectRaw('service_id, COUNT(*) as count, SUM(price) as revenue')
            ->groupBy('service_id')
            ->get();
            
        return response()->json([
            'monthly_completed' => $completedAppointments,
            'monthly_revenue' => $totalRevenue,
            'service_breakdown' => $serviceBreakdown,
            'period' => $today->format('F Y'),
        ]);
    }

    public function receipt($id)
    {
        $appointment = Appointment::with(['customer', 'pet', 'service', 'veterinarian'])->findOrFail($id);
        
        return response()->json([
            'receipt' => [
                'id' => $appointment->id,
                'date' => $appointment->scheduled_at,
                'customer_name' => $appointment->customer?->name,
                'pet_name' => $appointment->pet?->name,
                'service_name' => $appointment->service?->name,
                'service_category' => $appointment->service?->category,
                'vet_name' => $appointment->veterinarian?->name ?? 'Unassigned',
                'amount' => $appointment->price,
                'status' => $appointment->payment_status ?? 'pending',
                'notes' => $appointment->notes,
            ],
        ]);
    }
}
