<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Carbon;

class AppointmentController extends Controller
{
    /**
     * List all appointments with filters
     */
    public function index(Request $request)
    {
        $query = Appointment::with(['customer', 'pet', 'service', 'veterinarian']);
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }
        
        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('scheduled_at', '>=', $request->input('from_date'));
        }
        if ($request->has('to_date')) {
            $query->whereDate('scheduled_at', '<=', $request->input('to_date'));
        }
        
        // Filter by veterinarian
        if ($request->has('veterinarian_id')) {
            $query->where('veterinarian_id', $request->input('veterinarian_id'));
        }
        
        // Filter by customer
        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }
        
        $appointments = $query->orderBy('scheduled_at')->get();
        
        return response()->json($appointments);
    }

    /**
     * Get single appointment details
     */
    public function show($id)
    {
        $appointment = Appointment::with(['customer', 'pet', 'service', 'veterinarian'])->find($id);
        
        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }
        
        return response()->json($appointment);
    }

    /**
     * Create new appointment
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|integer|exists:customers,id',
            'pet_id' => 'required|integer|exists:pets,id',
            'service_id' => 'required|integer|exists:services,id',
            'scheduled_at' => 'required|date|after:now',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $appointment = Appointment::create([
            'customer_id' => $request->customer_id,
            'pet_id' => $request->pet_id,
            'service_id' => $request->service_id,
            'status' => 'pending',
            'scheduled_at' => $request->scheduled_at,
            'notes' => $request->notes,
            'price' => \App\Models\Service::find($request->service_id)->price ?? 0,
        ]);

        return response()->json([
            'message' => 'Appointment created successfully',
            'appointment' => $appointment->load(['customer', 'pet', 'service'])
        ], 201);
    }

    /**
     * Approve appointment (receptionist/manager)
     */
    public function approve(Request $request, $id)
    {
        $appointment = Appointment::find($id);
        
        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        if ($appointment->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending appointments can be approved',
                'current_status' => $appointment->status
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'veterinarian_id' => 'required|integer|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verify the assigned user is a veterinarian
        $vet = User::find($request->veterinarian_id);
        if ($vet->role !== 'veterinary' && $vet->role !== 'vet') {
            return response()->json(['message' => 'Assigned user must be a veterinarian'], 422);
        }

        $appointment->update([
            'status' => 'approved',
            'veterinarian_id' => $request->veterinarian_id,
        ]);

        return response()->json([
            'message' => 'Appointment approved and veterinarian assigned',
            'appointment' => $appointment->load(['customer', 'pet', 'service', 'veterinarian'])
        ]);
    }

    /**
     * Reschedule appointment
     */
    public function reschedule(Request $request, $id)
    {
        $appointment = Appointment::find($id);
        
        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        if (!$appointment->canBeRescheduled()) {
            return response()->json([
                'message' => 'Cannot reschedule appointment with status: ' . $appointment->status,
                'allowed_statuses' => ['pending', 'approved']
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'scheduled_at' => 'required|date|after:now',
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oldDate = $appointment->scheduled_at;
        
        $appointment->update([
            'scheduled_at' => $request->scheduled_at,
            'notes' => $appointment->notes . "\n[Rescheduled from {$oldDate}]: " . ($request->reason ?: 'No reason provided'),
        ]);

        return response()->json([
            'message' => 'Appointment rescheduled successfully',
            'appointment' => $appointment->load(['customer', 'pet', 'service', 'veterinarian'])
        ]);
    }

    /**
     * Cancel appointment
     */
    public function cancel(Request $request, $id)
    {
        $appointment = Appointment::find($id);
        
        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        if (!$appointment->canBeCancelled()) {
            return response()->json([
                'message' => 'Cannot cancel appointment with status: ' . $appointment->status,
                'allowed_statuses' => ['pending', 'approved']
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oldStatus = $appointment->status;
        $appointment->status = 'cancelled';
        $appointment->cancellation_reason = $request->reason;
        $appointment->save();

        // Send notification
        NotificationService::notifyAppointmentStatusChange($appointment, $oldStatus);

        return response()->json([
            'message' => 'Appointment cancelled successfully',
            'appointment' => $appointment->load(['customer', 'pet', 'service', 'veterinarian']),
        ]);
    }

    /**
     * Complete appointment (veterinarian)
     */
    public function complete(Request $request, $id)
    {
        $appointment = Appointment::find($id);
        
        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        if (!$appointment->canBeCompleted()) {
            return response()->json([
                'message' => 'Only approved appointments can be completed',
                'current_status' => $appointment->status
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oldStatus = $appointment->status;
        $updateData = [
            'status' => 'completed',
            'completed_at' => Carbon::now(),
        ];

        if ($request->has('notes')) {
            $updateData['notes'] = $appointment->notes . "\n[Completion notes]: " . $request->notes;
        }

        $appointment->update($updateData);

        // Send notification
        NotificationService::notifyAppointmentStatusChange($appointment, $oldStatus);

        return response()->json([
            'message' => 'Appointment marked as completed',
            'appointment' => $appointment->load(['customer', 'pet', 'service', 'veterinarian'])
        ]);
    }

    /**
     * Update appointment (general update)
     */
    public function update(Request $request, $id)
    {
        $appointment = Appointment::find($id);
        
        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        // Only allow updates to pending or approved appointments
        if (!in_array($appointment->status, ['pending', 'approved'])) {
            return response()->json([
                'message' => 'Cannot update appointment with status: ' . $appointment->status
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'service_id' => 'sometimes|integer|exists:services,id',
            'scheduled_at' => 'sometimes|date|after:now',
            'notes' => 'sometimes|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $updateData = [];
        
        if ($request->has('service_id')) {
            $updateData['service_id'] = $request->service_id;
            $updateData['price'] = \App\Models\Service::find($request->service_id)->price ?? $appointment->price;
        }

        return response()->json($appointment);
    }

    public function availableVeterinarians()
    {
        $vets = User::whereIn('role', ['veterinary', 'vet'])
            ->where('is_active', true)
            ->select(['id', 'name', 'email'])
            ->get();
            
        return response()->json($vets);
    }

    /**
     * Get veterinarian schedule
     */
    public function veterinarianSchedule($vetId, Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        
        $appointments = Appointment::where('veterinarian_id', $vetId)
            ->whereDate('scheduled_at', $date)
            ->whereIn('status', ['pending', 'approved'])
            ->with(['customer', 'pet', 'service'])
            ->orderBy('scheduled_at')
            ->get();
            
        return response()->json([
            'date' => $date,
            'veterinarian_id' => $vetId,
            'appointments' => $appointments,
            'total_appointments' => $appointments->count(),
        ]);
    }
}
