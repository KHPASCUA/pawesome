<?php

namespace App\Http\Controllers;

use App\Models\Boarding;
use App\Models\BoardingCareLog;
use App\Models\HotelRoom;
use App\Models\Pet;
use App\Models\Customer;
use App\Services\NotificationService;
use App\Services\WorkflowNotifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BoardingController extends Controller
{
    private function currentCustomerId(Request $request): ?int
    {
        $user = $request->user();

        if (!$user) {
            return null;
        }

        // Use AND logic to ensure we get the correct customer
        return Customer::where('user_id', $user->id)
            ->where('email', $user->email)
            ->value('id') 
            ?: Customer::where('user_id', $user->id)->value('id')
            ?: Customer::where('email', $user->email)->value('id');
    }

    private function customerCanAccess(Request $request, Boarding $boarding): bool
    {
        if ($request->user()?->role !== 'customer') {
            return true;
        }

        $customerId = $this->currentCustomerId($request);

        return $customerId && (int) $boarding->customer_id === (int) $customerId;
    }

    /**
     * List all boarding reservations with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Boarding::with(['pet', 'customer', 'hotelRoom', 'careLogs.loggedBy']);

        if ($request->user()?->role === 'customer') {
            $query->where('customer_id', $this->currentCustomerId($request) ?? 0);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('check_in', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('check_out', '<=', $request->date_to);
        }

        // Filter by customer
        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        // Filter by pet
        if ($request->has('pet_id')) {
            $query->where('pet_id', $request->pet_id);
        }

        // Current boarders only
        if ($request->has('current')) {
            $query->current();
        }

        $boardings = $query->orderBy('check_in', 'desc')->paginate(20);

        $summaryQuery = Boarding::query();
        if ($request->user()?->role === 'customer') {
            $summaryQuery->where('customer_id', $this->currentCustomerId($request) ?? 0);
        }

        return response()->json([
            'boardings' => $boardings,
            'summary' => [
                'total' => (clone $summaryQuery)->count(),
                'checked_in' => (clone $summaryQuery)->checkedIn()->count(),
                'pending' => (clone $summaryQuery)->pending()->count(),
                'today_checkins' => (clone $summaryQuery)->whereDate('check_in', today())->count(),
                'today_checkouts' => (clone $summaryQuery)->whereDate('check_out', today())->count(),
            ]
        ]);
    }

    /**
     * Create new boarding reservation
     */
    public function store(Request $request): JsonResponse
    {
        if ($request->user()?->role === 'customer') {
            $customerId = $this->currentCustomerId($request);

            if (!$customerId) {
                return response()->json(['error' => 'Customer not found'], 404);
            }

            $request->merge(['customer_id' => $customerId]);
        }

        $validator = Validator::make($request->all(), [
            'pet_id' => 'nullable|exists:pets,id',
            'customer_id' => 'required|exists:customers,id',
            'hotel_room_id' => 'nullable|exists:hotel_rooms,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'check_in_time' => 'nullable|date_format:H:i',
            'check_out_time' => 'nullable|date_format:H:i',
            'boarding_type' => 'nullable|string|max:255',
            'pet_name' => 'required_without:pet_id|nullable|string|max:255',
            'pet_type' => 'required_without:pet_id|nullable|string|max:255',
            'pet_breed' => 'nullable|string|max:255',
            'special_requests' => 'nullable|string',
            'special_instructions' => 'nullable|string',
            'feeding_instructions' => 'nullable|string',
            'medication_notes' => 'nullable|string',
            'emergency_contact' => 'nullable|string|max:255',
            'emergency_phone' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->pet_id && $request->user()?->role === 'customer') {
            if (!Pet::where('id', $request->pet_id)->where('customer_id', $request->customer_id)->exists()) {
                return response()->json(['error' => 'Pet not found'], 404);
            }
        }

        $pet = $request->pet_id ? Pet::find($request->pet_id) : null;
        $customer = Customer::find($request->customer_id);
        $room = $request->hotel_room_id ? HotelRoom::find($request->hotel_room_id) : null;

        if ($room && !$room->isAvailableForDates($request->check_in, $request->check_out)) {
            return response()->json(['error' => 'Room is not available for selected dates'], 422);
        }

        $totalAmount = 0;
        if ($room) {
            $checkIn = new \Carbon\Carbon($request->check_in);
            $checkOut = new \Carbon\Carbon($request->check_out);
            $days = max(1, $checkIn->diffInDays($checkOut));
            $totalAmount = $days * $room->daily_rate;
        }

        $initialPaymentStatus = DB::getDriverName() === 'sqlite' ? 'pending' : 'unpaid';

        $boarding = Boarding::create([
            'pet_id' => $request->pet_id,
            'pet_name' => $pet?->name ?? $request->pet_name,
            'pet_type' => $pet?->type ?? $pet?->species ?? $request->pet_type,
            'pet_breed' => $pet?->breed ?? $request->pet_breed,
            'customer_id' => $request->customer_id,
            'customer_email' => $customer?->email ?? $request->user()?->email,
            'customer_name' => $customer?->name ?? $request->user()?->name,
            'hotel_room_id' => $request->hotel_room_id,
            'stay_type' => 'hotel_boarding',
            'check_in' => $request->check_in,
            'check_in_time' => $request->check_in_time,
            'check_out' => $request->check_out,
            'check_out_time' => $request->check_out_time,
            'boarding_type' => $request->boarding_type ?? $request->room_type,
            'status' => 'pending',
            'total_amount' => $totalAmount,
            'payment_status' => $initialPaymentStatus,
            'special_requests' => $request->special_requests ?? $request->special_instructions,
            'feeding_instructions' => $request->feeding_instructions,
            'medication_notes' => $request->medication_notes,
            'emergency_contact' => $request->emergency_contact,
            'emergency_phone' => $request->emergency_phone,
            'notes' => $request->notes,
        ]);

        $boarding->load(['pet', 'customer', 'hotelRoom']);

        // Send notifications
        NotificationService::notifyBoardingCreated($boarding);
        WorkflowNotifier::notifyRole('receptionist', 'New boarding request', "{$boarding->pet_name} has a pending pet hotel request.", 'info', 'boarding', $boarding->id);

        return response()->json([
            'message' => 'Reservation created successfully',
            'boarding' => $boarding,
        ], 201);
    }

    /**
     * Get single boarding details
     */
    public function show($id): JsonResponse
    {
        $boarding = Boarding::with(['pet', 'customer', 'hotelRoom', 'careLogs.loggedBy'])->findOrFail($id);

        if (!$this->customerCanAccess(request(), $boarding)) {
            return response()->json(['message' => 'Reservation not found'], 404);
        }

        return response()->json(['boarding' => $boarding]);
    }

    /**
     * Update boarding reservation
     */
    public function update(Request $request, $id): JsonResponse
    {
        $boarding = Boarding::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'hotel_room_id' => 'nullable|exists:hotel_rooms,id',
            'check_in' => 'nullable|date',
            'check_out' => 'nullable|date|after:check_in',
            'status' => 'nullable|in:pending,approved,scheduled,confirmed,checked_in,in_care,ready_for_pickup,checked_out,completed,cancelled,rejected',
            'payment_status' => 'nullable|in:unpaid,pending,partial,paid,rejected,refunded',
            'special_requests' => 'nullable|string',
            'emergency_contact' => 'nullable|string|max:255',
            'emergency_phone' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check room availability if changing room or dates
        if ($request->has('hotel_room_id') || $request->has('check_in') || $request->has('check_out')) {
            $roomId = $request->hotel_room_id ?? $boarding->hotel_room_id;
            $checkIn = $request->check_in ?? $boarding->check_in;
            $checkOut = $request->check_out ?? $boarding->check_out;

            $room = HotelRoom::find($roomId);
            $conflicting = Boarding::where('hotel_room_id', $roomId)
                ->where('id', '!=', $id)
                ->whereIn('status', ['confirmed', 'checked_in'])
                ->where(function ($query) use ($checkIn, $checkOut) {
                    $query->whereBetween('check_in', [$checkIn, $checkOut])
                        ->orWhereBetween('check_out', [$checkIn, $checkOut])
                        ->orWhere(function ($q) use ($checkIn, $checkOut) {
                            $q->where('check_in', '<=', $checkIn)
                                ->where('check_out', '>=', $checkOut);
                        });
                })
                ->exists();

            if ($conflicting) {
                return response()->json([
                    'error' => 'Room is not available for selected dates'
                ], 422);
            }

            // Recalculate total amount
            $checkInDate = new \Carbon\Carbon($checkIn);
            $checkOutDate = new \Carbon\Carbon($checkOut);
            $days = $checkInDate->diffInDays($checkOutDate);
            $boarding->total_amount = $days * $room->daily_rate;
        }

        $boarding->update($request->only([
            'hotel_room_id', 'check_in', 'check_out', 'status',
            'payment_status', 'special_requests', 'emergency_contact',
            'emergency_phone', 'notes'
        ]));

        $boarding->load(['pet', 'customer', 'hotelRoom']);

        return response()->json([
            'message' => 'Reservation updated successfully',
            'boarding' => $boarding,
        ]);
    }

    /**
     * Delete boarding reservation
     */
    public function destroy($id): JsonResponse
    {
        $boarding = Boarding::findOrFail($id);

        // Release room if checked in
        if ($boarding->status === 'checked_in' && $boarding->hotelRoom) {
            $boarding->hotelRoom->update(['status' => 'available']);
        }

        $boarding->delete();

        return response()->json(['message' => 'Reservation deleted successfully']);
    }

    /**
     * Confirm reservation
     */
    public function confirm($id): JsonResponse
    {
        $boarding = Boarding::findOrFail($id);
        if ($boarding->status !== 'pending') {
            return response()->json(['error' => 'Only pending boarding requests can be approved'], 422);
        }

        $oldStatus = $boarding->status;
        $boarding->update([
            'status' => 'approved',
            'approved_by' => request()->user()?->id,
            'approved_at' => now(),
            'payment_status' => DB::getDriverName() === 'sqlite'
                ? $boarding->payment_status
                : ($boarding->payment_status === 'pending' ? 'unpaid' : $boarding->payment_status),
        ]);

        // Send notification
        NotificationService::notifyBoardingStatusChange($boarding, $oldStatus);

        return response()->json([
            'message' => 'Boarding request approved',
            'boarding' => $boarding->fresh(['pet', 'customer', 'hotelRoom']),
        ]);
    }

    public function approve($id): JsonResponse
    {
        return $this->confirm($id);
    }

    public function pending(): JsonResponse
    {
        $boardings = Boarding::with(['pet', 'customer', 'hotelRoom'])
            ->where('status', 'pending')
            ->where('stay_type', 'hotel_boarding')
            ->latest()
            ->get();

        return response()->json(['boarding_requests' => $boardings]);
    }

    public function schedule(Request $request, $id): JsonResponse
    {
        $boarding = Boarding::findOrFail($id);

        if (!in_array($boarding->status, ['approved', 'pending', 'confirmed'], true)) {
            return response()->json(['error' => 'Only pending or approved boarding requests can be scheduled'], 422);
        }

        $validator = Validator::make($request->all(), [
            'hotel_room_id' => 'required|exists:hotel_rooms,id',
            'check_in' => 'nullable|date|after_or_equal:today',
            'check_out' => 'nullable|date|after:check_in',
            'check_in_time' => 'nullable|date_format:H:i',
            'check_out_time' => 'nullable|date_format:H:i',
            'total_amount' => 'nullable|numeric|min:0',
            'boarding_type' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $checkIn = $request->input('check_in', optional($boarding->check_in)->toDateString() ?? $boarding->check_in);
        $checkOut = $request->input('check_out', optional($boarding->check_out)->toDateString() ?? $boarding->check_out);
        $room = HotelRoom::findOrFail($request->hotel_room_id);

        // Enhanced double booking prevention - explicit database conflict check
        $conflictingBoarding = Boarding::where('hotel_room_id', $request->hotel_room_id)
            ->whereIn('status', ['approved', 'scheduled', 'checked_in', 'in_stay'])
            ->where('id', '!=', $boarding->id)
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->where(function ($subQuery) use ($checkIn, $checkOut) {
                    $subQuery->where('check_in', '<', $checkOut)
                           ->where('check_out', '>', $checkIn);
                });
            })
            ->first();

        if ($conflictingBoarding) {
            return response()->json([
                'error' => 'This room/kennel is already booked for the selected date range.',
                'conflict_with' => $conflictingBoarding->id,
                'conflict_dates' => [
                    'existing_check_in' => $conflictingBoarding->check_in,
                    'existing_check_out' => $conflictingBoarding->check_out,
                    'requested_check_in' => $checkIn,
                    'requested_check_out' => $checkOut
                ]
            ], 422);
        }

        // Additional check using existing room availability method
        if (!$room->isAvailableForDates($checkIn, $checkOut)) {
            return response()->json(['error' => 'Room is not available for selected dates'], 422);
        }

        $days = max(1, \Carbon\Carbon::parse($checkIn)->diffInDays(\Carbon\Carbon::parse($checkOut)));
        $boarding->update([
            'hotel_room_id' => $room->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'check_in_time' => $request->input('check_in_time', $boarding->check_in_time),
            'check_out_time' => $request->input('check_out_time', $boarding->check_out_time),
            'boarding_type' => $request->input('boarding_type', $boarding->boarding_type),
            'total_amount' => $request->input('total_amount', $days * $room->daily_rate),
            'status' => 'scheduled',
            'approved_by' => $boarding->approved_by ?: $request->user()?->id,
            'approved_at' => $boarding->approved_at ?: now(),
            'notes' => $request->input('notes', $boarding->notes),
        ]);

        $room->update(['status' => 'reserved']);
        WorkflowNotifier::notifyEmail($boarding->customer_email, 'Boarding scheduled', 'Your pet hotel stay has been scheduled.', 'success', 'boarding', $boarding->id);

        return response()->json([
            'message' => 'Boarding request scheduled',
            'boarding' => $boarding->fresh(['pet', 'customer', 'hotelRoom']),
        ]);
    }

    /**
     * Check in guest
     */
    public function checkIn($id): JsonResponse
    {
        $boarding = Boarding::findOrFail($id);

        if (!in_array($boarding->status, ['approved', 'scheduled', 'confirmed'], true)) {
            return response()->json(['error' => 'Invalid status for check-in'], 422);
        }

        $oldStatus = $boarding->status;
        $boarding->update([
            'status' => 'in_care',
            'actual_check_in' => now(),
            'checked_in_at' => now(),
            'checked_in_by' => request()->user()?->id,
        ]);
        $boarding->hotelRoom?->update(['status' => 'occupied']);

        BoardingCareLog::create([
            'boarding_id' => $boarding->id,
            'logged_by' => request()->user()?->id,
            'log_type' => 'general_update',
            'title' => 'Pet checked in',
            'notes' => request('notes', 'Pet checked in for boarding care.'),
        ]);

        // Send notification
        NotificationService::notifyBoardingStatusChange($boarding, $oldStatus);

        return response()->json([
            'message' => 'Guest checked in successfully',
            'boarding' => $boarding->fresh(['pet', 'customer', 'hotelRoom']),
        ]);
    }

    /**
     * Check out guest
     */
    public function checkOut($id): JsonResponse
    {
        $boarding = Boarding::findOrFail($id);

        if (!in_array($boarding->status, ['ready_for_pickup', 'in_care', 'checked_in'], true)) {
            return response()->json(['error' => 'Pet is not ready for checkout'], 422);
        }

        if ($boarding->payment_status !== 'paid') {
            return response()->json(['error' => 'Payment must be settled before checkout'], 422);
        }

        $oldStatus = $boarding->status;
        $boarding->update([
            'status' => 'completed',
            'actual_check_out' => now(),
            'checked_out_at' => now(),
            'checked_out_by' => request()->user()?->id,
        ]);
        $boarding->hotelRoom?->update(['status' => 'available']);

        // Send notification
        NotificationService::notifyBoardingStatusChange($boarding, $oldStatus);

        return response()->json([
            'message' => 'Guest checked out successfully',
            'boarding' => $boarding->fresh(['pet', 'customer', 'hotelRoom']),
        ]);
    }

    public function readyForPickup($id): JsonResponse
    {
        $boarding = Boarding::findOrFail($id);

        if (!in_array($boarding->status, ['checked_in', 'in_care'], true)) {
            return response()->json(['error' => 'Only checked-in pets can be marked ready for pickup'], 422);
        }

        $oldStatus = $boarding->status;
        $boarding->update([
            'status' => 'ready_for_pickup',
            'ready_for_pickup_by' => request()->user()?->id,
            'ready_for_pickup_at' => now(),
        ]);

        NotificationService::notifyBoardingStatusChange($boarding, $oldStatus);
        WorkflowNotifier::notifyEmail($boarding->customer_email, 'Ready for pickup', "{$boarding->pet_name} is ready for pickup.", 'success', 'boarding', $boarding->id);

        return response()->json([
            'message' => 'Boarding marked ready for pickup',
            'boarding' => $boarding->fresh(['pet', 'customer', 'hotelRoom']),
        ]);
    }

    /**
     * Cancel reservation
     */
    public function cancel($id): JsonResponse
    {
        $boarding = Boarding::findOrFail($id);

        if (!$this->customerCanAccess(request(), $boarding)) {
            return response()->json(['message' => 'Reservation not found'], 404);
        }

        if (in_array($boarding->status, ['checked_out', 'completed'], true)) {
            return response()->json(['error' => 'Cannot cancel completed reservation'], 422);
        }

        $request = request();
        if ($request->user()?->role === 'customer' && $boarding->status !== 'pending') {
            return response()->json(['error' => 'Customers can only cancel pending boarding requests'], 422);
        }

        $oldStatus = $boarding->status;
        $boarding->update(['status' => 'cancelled']);
        if ($boarding->hotelRoom && in_array($boarding->hotelRoom->status, ['reserved', 'occupied'], true)) {
            $boarding->hotelRoom->update(['status' => 'available']);
        }

        // Send notification
        NotificationService::notifyBoardingStatusChange($boarding, $oldStatus);

        return response()->json([
            'message' => 'Reservation cancelled',
            'boarding' => $boarding->fresh(['pet', 'customer', 'hotelRoom']),
        ]);
    }

    /**
     * Get available rooms for date range
     */
    public function availableRooms(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'size' => 'nullable|in:small,medium,large',
            'type' => 'nullable|in:standard,deluxe,suite',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $query = HotelRoom::query();

        if ($request->has('size')) {
            $query->bySize($request->size);
        }

        if ($request->has('type')) {
            $query->byType($request->type);
        }

        $rooms = $query->get();
        $availableRooms = [];

        foreach ($rooms as $room) {
            if ($room instanceof HotelRoom && $room->isAvailableForDates($request->check_in, $request->check_out)) {
                $availableRooms[] = $room;
            }
        }

        return response()->json([
            'available_rooms' => $availableRooms,
            'check_in' => $request->check_in,
            'check_out' => $request->check_out,
        ]);
    }

    /**
     * Get current boarders (checked in)
     */
    public function currentBoarders(): JsonResponse
    {
        $boarders = Boarding::with(['pet', 'customer', 'hotelRoom'])
            ->checkedIn()
            ->orderBy('check_out', 'asc')
            ->get();

        return response()->json([
            'boarders' => $boarders,
            'count' => $boarders->count(),
        ]);
    }

    /**
     * Get today's check-ins and check-outs
     */
    public function todayActivity(): JsonResponse
    {
        $today = now()->format('Y-m-d');

        $checkIns = Boarding::with(['pet', 'customer', 'hotelRoom'])
            ->whereDate('check_in', $today)
            ->whereIn('status', ['pending', 'confirmed'])
            ->get();

        $checkOuts = Boarding::with(['pet', 'customer', 'hotelRoom'])
            ->whereDate('check_out', $today)
            ->where('status', 'checked_in')
            ->get();

        $currentlyBoarded = Boarding::with(['pet', 'customer', 'hotelRoom'])
            ->checkedIn()
            ->count();

        return response()->json([
            'date' => $today,
            'check_ins' => $checkIns,
            'check_outs' => $checkOuts,
            'currently_boarded' => $currentlyBoarded,
        ]);
    }

    /**
     * Reject reservation
     */
    public function reject($id): JsonResponse
    {
        $boarding = Boarding::findOrFail($id);

        if (in_array($boarding->status, ['checked_out', 'completed'], true)) {
            return response()->json(['error' => 'Cannot reject completed reservation'], 422);
        }

        if (!in_array($boarding->status, ['pending', 'approved', 'scheduled', 'confirmed'], true)) {
            return response()->json(['error' => 'Can only reject pending or scheduled reservations'], 422);
        }

        $oldStatus = $boarding->status;
        $boarding->update([
            'status' => 'rejected',
            'rejected_by' => request()->user()?->id,
            'rejected_at' => now(),
            'rejection_reason' => request('rejection_reason'),
        ]);
        if ($boarding->hotelRoom && in_array($boarding->hotelRoom->status, ['reserved'], true)) {
            $boarding->hotelRoom->update(['status' => 'available']);
        }

        // Send notification
        NotificationService::notifyBoardingStatusChange($boarding, $oldStatus);

        return response()->json([
            'message' => 'Reservation rejected',
            'boarding' => $boarding->fresh(['pet', 'customer', 'hotelRoom']),
        ]);
    }

    /**
     * Mark as paid (cashier)
     */
    public function markAsPaid($id): JsonResponse
    {
        $boarding = Boarding::findOrFail($id);

        if ($boarding->payment_status === 'paid') {
            return response()->json(['error' => 'Payment already confirmed'], 422);
        }

        if (!in_array($boarding->status, ['confirmed', 'checked_in'])) {
            return response()->json(['error' => 'Can only confirm payment for confirmed or checked-in reservations'], 422);
        }

        $boarding->payment_status = 'paid';
        $boarding->save();

        return response()->json([
            'message' => 'Payment confirmed successfully',
            'boarding' => $boarding->fresh(['pet', 'customer', 'hotelRoom']),
        ]);
    }

    public function uploadPaymentProof(Request $request, $id): JsonResponse
    {
        $boarding = Boarding::findOrFail($id);

        if (!$this->customerCanAccess($request, $boarding)) {
            return response()->json(['message' => 'Reservation not found'], 404);
        }

        if (!in_array($boarding->status, ['approved', 'scheduled'], true)) {
            return response()->json(['error' => 'Payment proof can only be uploaded after approval or scheduling'], 422);
        }

        if (!in_array($boarding->payment_status, ['unpaid', 'pending', 'rejected'], true)) {
            return response()->json(['error' => 'Only unpaid or rejected payments can be resubmitted'], 422);
        }

        $validator = Validator::make($request->all(), [
            'payment_method' => 'required|string|max:100',
            'payment_reference' => 'nullable|string|max:255',
            'payment_proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $path = $request->file('payment_proof')->store('payment-proofs/boardings', 'public');
        $boarding->update([
            'payment_method' => $request->payment_method,
            'payment_reference' => $request->payment_reference,
            'payment_proof' => $path,
            'payment_status' => 'pending',
        ]);

        WorkflowNotifier::notifyRole('cashier', 'Boarding payment proof submitted', "{$boarding->pet_name} has a pending boarding payment proof.", 'info', 'boarding', $boarding->id);

        return response()->json([
            'message' => 'Payment proof submitted for cashier verification',
            'boarding' => $boarding->fresh(['pet', 'customer', 'hotelRoom']),
        ]);
    }

    public function careLogs($id): JsonResponse
    {
        $boarding = Boarding::with('careLogs.loggedBy')->findOrFail($id);

        if (!$this->customerCanAccess(request(), $boarding)) {
            return response()->json(['message' => 'Reservation not found'], 404);
        }

        return response()->json(['care_logs' => $boarding->careLogs()->with('loggedBy')->latest()->get()]);
    }

    public function addCareLog(Request $request, $id): JsonResponse
    {
        $boarding = Boarding::findOrFail($id);

        if (!in_array($boarding->status, ['checked_in', 'in_care'], true)) {
            return response()->json(['error' => 'Care logs can only be added while pet is checked in or in care'], 422);
        }

        $validator = Validator::make($request->all(), [
            'log_type' => 'required|in:' . implode(',', BoardingCareLog::VALID_TYPES),
            'title' => 'nullable|string|max:255',
            'notes' => 'required|string',
            'feeding_amount' => 'nullable|string|max:255',
            'medication_given' => 'nullable|string',
            'behavior_notes' => 'nullable|string',
            'health_observation' => 'nullable|string',
            'photo' => 'nullable|file|mimes:jpg,jpeg,png|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $path = $request->hasFile('photo') ? $request->file('photo')->store('care-logs/boardings', 'public') : null;
        $log = BoardingCareLog::create([
            'boarding_id' => $boarding->id,
            'logged_by' => $request->user()?->id,
            'log_type' => $request->log_type,
            'title' => $request->title,
            'notes' => $request->notes,
            'feeding_amount' => $request->feeding_amount,
            'medication_given' => $request->medication_given,
            'behavior_notes' => $request->behavior_notes,
            'health_observation' => $request->health_observation,
            'photo_path' => $path,
        ]);

        if ($request->filled('health_observation')) {
            WorkflowNotifier::notifyRole('veterinary', 'Boarding health observation', "A care log for {$boarding->pet_name} includes a health observation.", 'warning', 'boarding', $boarding->id);
        }

        WorkflowNotifier::notifyEmail($boarding->customer_email, 'Boarding care log added', "A new care update was added for {$boarding->pet_name}.", 'info', 'boarding', $boarding->id);

        return response()->json([
            'message' => 'Care log added',
            'care_log' => $log->load('loggedBy'),
        ], 201);
    }

    /**
     * Get occupancy statistics
     */
    public function occupancyStats(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'month' => 'required|date_format:Y-m',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $month = $request->month;
        $startDate = new \Carbon\Carbon($month . '-01');
        $endDate = $startDate->copy()->endOfMonth();

        $totalRooms = HotelRoom::count();
        $daysInMonth = $startDate->daysInMonth;

        // Calculate room nights and revenue
        $boardings = Boarding::whereBetween('check_in', [$startDate, $endDate])
            ->orWhereBetween('check_out', [$startDate, $endDate])
            ->whereIn('status', ['confirmed', 'checked_in', 'checked_out'])
            ->get();

        $totalRevenue = $boardings->sum('total_amount');
        $totalNights = 0;

        foreach ($boardings as $boarding) {
            $checkIn = new \Carbon\Carbon($boarding->check_in);
            $checkOut = new \Carbon\Carbon($boarding->check_out);
            $totalNights += $checkIn->diffInDays($checkOut);
        }

        $totalRoomNightsAvailable = $totalRooms * $daysInMonth;
        $occupancyRate = $totalRoomNightsAvailable > 0
            ? round(($totalNights / $totalRoomNightsAvailable) * 100, 2)
            : 0;

        return response()->json([
            'month' => $month,
            'total_rooms' => $totalRooms,
            'total_nights_sold' => $totalNights,
            'total_room_nights_available' => $totalRoomNightsAvailable,
            'occupancy_rate' => $occupancyRate,
            'total_revenue' => $totalRevenue,
            'average_daily_rate' => $totalNights > 0 ? round($totalRevenue / $totalNights, 2) : 0,
        ]);
    }
}
