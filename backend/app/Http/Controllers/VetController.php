<?php

namespace App\Http\Controllers;

use App\Models\VetAppointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = VetAppointment::query();

        if (auth()->check() && auth()->user()->role === 'customer') {
            $query->whereHas('pet', function ($q) {
                $q->where('customer_id', auth()->id());
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
