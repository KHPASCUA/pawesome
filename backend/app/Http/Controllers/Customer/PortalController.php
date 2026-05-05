<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Boarding;
use App\Models\Customer;
use App\Models\Pet;
use App\Models\Service;
use App\Models\Sale;
use App\Models\ChatbotLog;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;

class PortalController extends Controller
{
    private function currentCustomer(): ?Customer
    {
        // For API token authentication, get user from auth()->user()
        $user = auth()->user();
        if (!$user) return null;
        
        // Try to find customer by user_id first (more reliable)
        $customer = Customer::where('user_id', $user->id)->first();
        
        // Fallback to email matching if user_id not found
        if (!$customer) {
            $customer = Customer::where('email', $user->email)->first();
        }
        
        return $customer;
    }

    public function overview()
    {
        $cust = $this->currentCustomer();
        if (!$cust) {
            return response()->json([
                'active_bookings' => 0,
                'total_pets' => 0,
                'completed_services' => 0,
                'loyalty_points' => 0,
                'upcoming_appointments' => [],
                'recent_bookings' => [],
            ]);
        }
        $today = Carbon::today();
        $activeBookings = Appointment::where('customer_id', $cust->id)
            ->whereIn('status', ['scheduled','confirmed'])
            ->count();
        $completed = Appointment::where('customer_id', $cust->id)
            ->where('status', 'completed')
            ->whereMonth('scheduled_at', $today->month)
            ->count();
        
        // Enhanced data with relationships
        $upcoming = Appointment::where('customer_id', $cust->id)
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->where('scheduled_at', '>=', $today)
            ->with(['pet', 'service'])
            ->orderBy('scheduled_at')
            ->limit(3)
            ->get();
            
        $recent = Appointment::where('customer_id', $cust->id)
            ->with(['pet', 'service'])
            ->latest('scheduled_at')->limit(5)->get();

        return response()->json([
            'active_bookings' => $activeBookings,
            'total_pets' => Pet::where('customer_id', $cust->id)->count(),
            'completed_services' => $completed,
            'loyalty_points' => 850, // Static for now
            'upcoming_appointments' => $upcoming,
            'recent_bookings' => $recent,
        ]);
    }

    public function pets()
    {
        $cust = $this->currentCustomer();
        if (!$cust) return response()->json([]);
        return response()->json(Pet::where('customer_id', $cust->id)->get());
    }

    public function appointments()
    {
        $cust = $this->currentCustomer();
        if (!$cust) return response()->json([]);
        return response()->json(
            Appointment::where('customer_id', $cust->id)
                ->with(['pet', 'service'])
                ->latest('scheduled_at')
                ->get()
        );
    }

    public function bookings()
    {
        $cust = $this->currentCustomer();
        if (!$cust) return response()->json([]);

        $appointments = Appointment::where('customer_id', $cust->id)
            ->with(['pet', 'service'])
            ->latest('scheduled_at')
            ->get()
            ->map(fn ($appointment) => [
                'id' => 'appointment-' . $appointment->id,
                'service' => $appointment->service?->name ?? 'Veterinary Appointment',
                'type' => 'appointment',
                'pet' => $appointment->pet?->name,
                'date' => optional($appointment->scheduled_at)?->toDateString(),
                'status' => $appointment->status,
                'amount' => $appointment->price,
            ]);

        $boardingPetIds = Pet::where('customer_id', $cust->id)->pluck('id');
        $boardings = Boarding::whereIn('pet_id', $boardingPetIds)
            ->with('pet')
            ->latest('check_in')
            ->get()
            ->map(fn ($boarding) => [
                'id' => 'boarding-' . $boarding->id,
                'service' => 'Hotel Boarding',
                'type' => 'boarding',
                'pet' => $boarding->pet?->name,
                'date' => optional($boarding->check_in)?->toDateString(),
                'status' => $boarding->status,
                'amount' => $boarding->total_amount ?? $boarding->amount ?? 0,
            ]);

        return response()->json($appointments->concat($boardings)->values());
    }

    public function transactions()
    {
        $cust = $this->currentCustomer();
        if (!$cust) return response()->json([]);

        return response()->json(
            Sale::where('customer_id', $cust->id)
                ->latest()
                ->limit(50)
                ->get()
                ->map(fn ($sale) => [
                    'id' => $sale->id,
                    'date' => optional($sale->created_at)?->toDateString(),
                    'description' => ucfirst($sale->type ?? 'payment'),
                    'type' => $sale->type,
                    'amount' => $sale->amount,
                    'status' => $sale->status,
                ])
        );
    }

    public function purchases()
    {
        $cust = $this->currentCustomer();
        if (!$cust) return response()->json([]);

        return response()->json([
            'purchases' => Sale::with('items')
                ->where('customer_id', $cust->id)
                ->whereIn('type', ['product', 'mixed'])
                ->latest()
                ->limit(50)
                ->get(),
        ]);
    }

    public function boardings()
    {
        $cust = $this->currentCustomer();
        if (!$cust) return response()->json([]);
        return response()->json(Boarding::whereIn('pet_id', Pet::where('customer_id',$cust->id)->pluck('id'))->get());
    }

    public function addPet(Request $request)
    {
        $cust = $this->currentCustomer();
        if (!$cust) return response()->json(['message' => 'Customer not found'], 404);

        $data = $request->validate([
            'name' => 'required|string|max:100',
            'species' => 'nullable|string|max:100',
            'breed' => 'nullable|string|max:100',
            'age' => 'nullable|integer|min:0',
            'gender' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $pet = Pet::create(array_merge($data, ['customer_id' => $cust->id]));
        return response()->json($pet, 201);
    }

    public function services()
    {
        return response()->json(Service::where('is_active', true)->orderBy('name')->get());
    }

    public function bookAppointment(Request $request)
    {
        $cust = $this->currentCustomer();
        if (!$cust) return response()->json(['message' => 'Customer not found'], 404);

        $data = $request->validate([
            'pet_id' => 'required|integer|exists:pets,id',
            'service_id' => 'required|integer|exists:services,id',
            'scheduled_at' => 'required|date',
        ]);

        $appt = Appointment::create([
            'customer_id' => $cust->id,
            'pet_id' => $data['pet_id'],
            'service_id' => $data['service_id'],
            'status' => 'pending',
            'scheduled_at' => $data['scheduled_at'],
            'price' => Service::find($data['service_id'])->price ?? 0,
        ]);

        return response()->json($appt, 201);
    }

    public function bookBoarding(Request $request)
    {
        $cust = $this->currentCustomer();
        if (!$cust) return response()->json(['message' => 'Customer not found'], 404);

        $data = $request->validate([
            'pet_id' => 'required|integer|exists:pets,id',
            'check_in' => 'required|date',
            'check_out' => 'nullable|date',
        ]);

        $boarding = Boarding::create([
            'pet_id' => $data['pet_id'],
            'check_in' => $data['check_in'],
            'check_out' => $data['check_out'] ?? null,
            'status' => 'checked_in',
        ]);

        return response()->json($boarding, 201);
    }

    public function chatbot(Request $request)
    {
        $data = $request->validate([
            'message' => 'required|string',
            'type' => 'nullable|string',
        ]);
        $user = $request->user();

        $log = ChatbotLog::create([
            'user_id' => $user?->id,
            'role' => $user?->role,
            'channel' => 'web',
            'message' => $data['message'],
            'type' => $data['type'] ?? 'inquiry',
            'user_message' => $data['message'],
        ]);

        return response()->json($log, 201);
    }
}
