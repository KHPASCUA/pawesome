<?php

namespace App\Http\Controllers;

use App\Models\Boarding;
use App\Models\HotelRoom;
use App\Models\Pet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BoardingController extends Controller
{
    /**
     * List all boarding reservations with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Boarding::with(['pet', 'customer', 'hotelRoom']);

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

        return response()->json([
            'boardings' => $boardings,
            'summary' => [
                'total' => Boarding::count(),
                'checked_in' => Boarding::checkedIn()->count(),
                'pending' => Boarding::pending()->count(),
                'today_checkins' => Boarding::whereDate('check_in', today())->count(),
                'today_checkouts' => Boarding::whereDate('check_out', today())->count(),
            ]
        ]);
    }

    /**
     * Create new boarding reservation
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'pet_id' => 'required|exists:pets,id',
            'customer_id' => 'required|exists:customers,id',
            'hotel_room_id' => 'required|exists:hotel_rooms,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'special_requests' => 'nullable|string',
            'emergency_contact' => 'nullable|string|max:255',
            'emergency_phone' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check room availability
        $room = HotelRoom::find($request->hotel_room_id);
        if (!$room->isAvailableForDates($request->check_in, $request->check_out)) {
            return response()->json([
                'error' => 'Room is not available for selected dates'
            ], 422);
        }

        // Calculate total amount
        $checkIn = new \Carbon\Carbon($request->check_in);
        $checkOut = new \Carbon\Carbon($request->check_out);
        $days = $checkIn->diffInDays($checkOut);
        $totalAmount = $days * $room->daily_rate;

        $boarding = Boarding::create([
            'pet_id' => $request->pet_id,
            'customer_id' => $request->customer_id,
            'hotel_room_id' => $request->hotel_room_id,
            'check_in' => $request->check_in,
            'check_out' => $request->check_out,
            'status' => 'pending',
            'total_amount' => $totalAmount,
            'payment_status' => 'pending',
            'special_requests' => $request->special_requests,
            'emergency_contact' => $request->emergency_contact,
            'emergency_phone' => $request->emergency_phone,
            'notes' => $request->notes,
        ]);

        $boarding->load(['pet', 'customer', 'hotelRoom']);

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
        $boarding = Boarding::with(['pet', 'customer', 'hotelRoom'])->findOrFail($id);
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
            'status' => 'nullable|in:pending,confirmed,checked_in,checked_out,cancelled',
            'payment_status' => 'nullable|in:pending,partial,paid',
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
        $boarding->confirm();

        return response()->json([
            'message' => 'Reservation confirmed',
            'boarding' => $boarding->fresh(['pet', 'customer', 'hotelRoom']),
        ]);
    }

    /**
     * Check in guest
     */
    public function checkIn($id): JsonResponse
    {
        $boarding = Boarding::findOrFail($id);

        if ($boarding->status !== 'confirmed' && $boarding->status !== 'pending') {
            return response()->json(['error' => 'Invalid status for check-in'], 422);
        }

        $boarding->checkIn();

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

        if ($boarding->status !== 'checked_in') {
            return response()->json(['error' => 'Guest is not checked in'], 422);
        }

        $boarding->checkOut();

        return response()->json([
            'message' => 'Guest checked out successfully',
            'boarding' => $boarding->fresh(['pet', 'customer', 'hotelRoom']),
        ]);
    }

    /**
     * Cancel reservation
     */
    public function cancel($id): JsonResponse
    {
        $boarding = Boarding::findOrFail($id);

        if ($boarding->status === 'checked_out') {
            return response()->json(['error' => 'Cannot cancel completed reservation'], 422);
        }

        // Release room if checked in
        if ($boarding->status === 'checked_in' && $boarding->hotelRoom) {
            $boarding->hotelRoom->update(['status' => 'available']);
        }

        $boarding->update(['status' => 'cancelled']);

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
            if ($room->isAvailableForDates($request->check_in, $request->check_out)) {
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
