<?php

namespace App\Http\Controllers;

use App\Models\HotelRoom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HotelRoomController extends Controller
{
    /**
     * List all hotel rooms
     */
    public function index(Request $request): JsonResponse
    {
        $query = HotelRoom::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by size
        if ($request->has('size')) {
            $query->bySize($request->size);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        $rooms = $query->orderBy('room_number')->get();

        return response()->json([
            'rooms' => $rooms,
            'summary' => [
                'total' => HotelRoom::count(),
                'available' => HotelRoom::where('status', 'available')->count(),
                'occupied' => HotelRoom::where('status', 'occupied')->count(),
                'maintenance' => HotelRoom::where('status', 'maintenance')->count(),
            ]
        ]);
    }

    /**
     * Create new hotel room
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'room_number' => 'required|string|unique:hotel_rooms',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:standard,deluxe,suite',
            'size' => 'required|in:small,medium,large',
            'capacity' => 'required|integer|min:1',
            'daily_rate' => 'required|numeric|min:0',
            'amenities' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $room = HotelRoom::create($request->all());

        return response()->json([
            'message' => 'Room created successfully',
            'room' => $room,
        ], 201);
    }

    /**
     * Get single room details
     */
    public function show($id): JsonResponse
    {
        $room = HotelRoom::with(['boardings' => function ($query) {
            $query->current()->orderBy('check_out', 'asc');
        }])->findOrFail($id);

        return response()->json(['room' => $room]);
    }

    /**
     * Update hotel room
     */
    public function update(Request $request, $id): JsonResponse
    {
        $room = HotelRoom::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'room_number' => 'nullable|string|unique:hotel_rooms,room_number,' . $id,
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'type' => 'nullable|in:standard,deluxe,suite',
            'size' => 'nullable|in:small,medium,large',
            'capacity' => 'nullable|integer|min:1',
            'daily_rate' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:available,occupied,maintenance,reserved',
            'amenities' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $room->update($request->all());

        return response()->json([
            'message' => 'Room updated successfully',
            'room' => $room,
        ]);
    }

    /**
     * Delete hotel room
     */
    public function destroy($id): JsonResponse
    {
        $room = HotelRoom::findOrFail($id);

        // Check if room has active boardings
        if ($room->boardings()->current()->exists()) {
            return response()->json([
                'error' => 'Cannot delete room with active reservations'
            ], 422);
        }

        $room->delete();

        return response()->json(['message' => 'Room deleted successfully']);
    }

    /**
     * Set room status
     */
    public function setStatus(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:available,occupied,maintenance,reserved',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $room = HotelRoom::findOrFail($id);
        $room->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Room status updated',
            'room' => $room,
        ]);
    }
}
