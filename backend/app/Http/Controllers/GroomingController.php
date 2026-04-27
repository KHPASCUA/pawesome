<?php

namespace App\Http\Controllers;

use App\Models\GroomingAppointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GroomingController extends Controller
{
    /**
     * List all grooming appointments with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = GroomingAppointment::query();

        // Filter by customer (for customer view)
        if (auth()->check() && auth()->user()->role === 'customer') {
            $query->whereHas('pet', function ($q) {
                $q->where('customer_id', auth()->id());
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->has('date')) {
            $query->whereDate('appointment_date', $request->date);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('appointment_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('appointment_date', '<=', $request->date_to);
        }

        $appointments = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'appointments' => $appointments,
            'summary' => [
                'total' => GroomingAppointment::count(),
                'pending' => GroomingAppointment::pending()->count(),
                'approved' => GroomingAppointment::approved()->count(),
                'completed' => GroomingAppointment::completed()->count(),
            ]
        ]);
    }

    /**
     * Create new grooming appointment
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'petId' => 'nullable|exists:pets,id',
            'petName' => 'required|string|max:100',
            'service' => 'required|string|in:bath,haircut,nailTrim',
            'date' => 'required|date|after_or_equal:today',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $appointment = GroomingAppointment::create([
            'pet_id' => $request->petId,
            'pet_name' => $request->petName,
            'service' => $request->service,
            'appointment_date' => $request->date,
            'notes' => $request->notes,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Grooming appointment submitted successfully',
            'appointment' => $appointment,
        ], 201);
    }

    /**
     * Get single grooming appointment
     */
    public function show($id): JsonResponse
    {
        $appointment = GroomingAppointment::find($id);

        if (!$appointment) {
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

    /**
     * Update grooming appointment status
     */
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

        $appointment = GroomingAppointment::find($id);

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

    /**
     * Delete grooming appointment
     */
    public function destroy($id): JsonResponse
    {
        $appointment = GroomingAppointment::find($id);

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
