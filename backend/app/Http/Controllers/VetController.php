<?php

namespace App\Http\Controllers;

use App\Models\VetAppointment;
use App\Models\Customer;
use App\Models\Pet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VetController extends Controller
{
    private function currentCustomerId(): ?int
    {
        $user = auth()->user();

        if (!$user) {
            return null;
        }

        return Customer::where('user_id', $user->id)
            ->orWhere('email', $user->email)
            ->value('id');
    }

    private function customerOwnsAppointment(VetAppointment $appointment): bool
    {
        $customerId = $this->currentCustomerId();

        return $customerId && $appointment->pet_id
            && Pet::where('id', $appointment->pet_id)->where('customer_id', $customerId)->exists();
    }

    public function index(Request $request): JsonResponse
    {
        $query = VetAppointment::query();

        if (auth()->check() && auth()->user()->role === 'customer') {
            $customerId = $this->currentCustomerId();
            $query->whereHas('pet', function ($q) use ($customerId) {
                $q->where('customer_id', $customerId ?? 0);
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            $query->whereDate('appointment_date', $request->date);
        }

        $appointments = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'appointments' => $appointments,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'petId' => 'nullable|exists:pets,id',
            'petName' => 'required|string|max:100',
            'service' => 'required|string|in:checkup,vaccination,surgery',
            'date' => 'required|date|after_or_equal:today',
            'concern' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (auth()->user()?->role === 'customer' && $request->petId) {
            $customerId = $this->currentCustomerId();

            if (!Pet::where('id', $request->petId)->where('customer_id', $customerId ?? 0)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pet not found',
                ], 404);
            }
        }

        $appointment = VetAppointment::create([
            'pet_id' => $request->petId,
            'pet_name' => $request->petName,
            'service' => $request->service,
            'appointment_date' => $request->date,
            'concern' => $request->concern,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Vet appointment submitted successfully',
            'appointment' => $appointment,
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $appointment = VetAppointment::find($id);

        if (!$appointment) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found'
            ], 404);
        }

        if (auth()->user()?->role === 'customer' && !$this->customerOwnsAppointment($appointment)) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'appointment' => $appointment
        ]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,approved,rejected,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid status',
                'errors' => $validator->errors()
            ], 422);
        }

        $appointment = VetAppointment::find($id);

        if (!$appointment) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found'
            ], 404);
        }

        $appointment->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Appointment status updated successfully',
            'appointment' => $appointment
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $appointment = VetAppointment::find($id);

        if (!$appointment) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found'
            ], 404);
        }

        $appointment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Appointment deleted successfully'
        ]);
    }
}
