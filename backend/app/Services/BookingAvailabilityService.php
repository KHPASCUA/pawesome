<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\GroomingAppointment;
use App\Models\Boarding;
use App\Models\HotelRoom;
use Carbon\Carbon;

class BookingAvailabilityService
{
    /**
     * Blocking statuses that prevent double booking
     * These statuses mean the slot/resource is reserved and unavailable
     */
    public const BLOCKING_BOOKING_STATUSES = [
        'pending',
        'pending_review', // Future status - maps to pending for now
        'approved',
        'scheduled',
        'confirmed',
        'in_progress',
        'in_consultation',
        'checked_in',
        'in_stay',
        'in_care',
        'needs_confinement',
        'treated',
    ];

    /**
     * Non-blocking statuses that release the slot/resource
     * These statuses mean the slot/resource is available for new bookings
     */
    public const NON_BLOCKING_BOOKING_STATUSES = [
        'rejected',
        'cancelled',
        'completed',
        'no_show',
        'checked_out',
    ];

    /**
     * Blocking payment statuses that indicate payment is being processed
     */
    public const BLOCKING_PAYMENT_STATUSES = [
        'pending',
        'pending_verification', // Future status - maps to pending for now
        'partial',
    ];

    /**
     * Non-blocking payment statuses that indicate payment is complete or cancelled
     */
    public const NON_BLOCKING_PAYMENT_STATUSES = [
        'unpaid',
        'paid',
        'rejected',
        'refunded',
    ];

    /**
     * Check if a booking status blocks availability
     */
    public static function isBookingStatusBlocking(string $status): bool
    {
        return in_array($status, self::BLOCKING_BOOKING_STATUSES);
    }

    /**
     * Check if a payment status blocks availability
     */
    public static function isPaymentStatusBlocking(string $status): bool
    {
        return in_array($status, self::BLOCKING_PAYMENT_STATUSES);
    }

    /**
     * Get available veterinary time slots for a specific date
     */
    public static function getVeterinaryAvailability(?string $date = null, ?int $serviceId = null): array
    {
        if (!$date) {
            $date = now()->format('Y-m-d');
        }

        $query = Appointment::with(['veterinarian', 'service'])
            ->whereDate('scheduled_at', $date)
            ->whereIn('status', self::BLOCKING_BOOKING_STATUSES);

        // Apply service filter if provided
        if ($serviceId) {
            $query->where('service_id', $serviceId);
        }

        $blockedSlots = $query->get()
            ->groupBy(function ($appointment) {
                // Group by veterinarian and time slot
                return $appointment->veterinarian_id . '_' . 
                       Carbon::parse($appointment->scheduled_at)->format('H:i');
            })
            ->map(function ($group) {
                $first = $group->first();
                return [
                    'veterinarian_id' => $first->veterinarian_id,
                    'veterinarian_name' => $first->veterinarian?->name ?? 'Assigned Veterinarian',
                    'time' => Carbon::parse($first->scheduled_at)->format('H:i'),
                    'status' => $first->status,
                    'reason' => 'Already booked',
                ];
            })
            ->values();

        // Generate all possible time slots (9:00 AM - 6:00 PM, 30-minute intervals)
        $allSlots = [];
        $startHour = 9;
        $endHour = 18;
        $interval = 30;

        for ($hour = $startHour; $hour < $endHour; $hour++) {
            for ($minute = 0; $minute < 60; $minute += $interval) {
                if ($minute >= 60) break;
                
                $time = sprintf('%02d:%02d', $hour, $minute);
                $timeLabel = Carbon::createFromTime($hour, $minute)->format('g:i A');
                
                $isBlocked = $blockedSlots->contains(function ($blocked) use ($time) {
                    return $blocked['time'] === $time;
                });

                $allSlots[] = [
                    'time' => $time,
                    'label' => $timeLabel,
                    'available' => !$isBlocked,
                    'veterinarian_id' => null,
                    'veterinarian_name' => 'Available',
                    'status' => $isBlocked ? 'blocked' : 'available',
                    'reason' => $isBlocked ? 'Time slot already booked' : 'Available',
                ];
            }
        }

        return [
            'success' => true,
            'date' => $date,
            'slots' => $allSlots,
            'blocked_slots' => $blockedSlots->toArray(),
        ];
    }

    /**
     * Check grooming availability for a specific date
     */
    public static function getGroomingAvailability(?string $date = null): array
    {
        if (!$date) {
            $date = now()->format('Y-m-d');
        }

        // Check if there's any existing grooming appointment on this date with blocking status
        $existingAppointment = GroomingAppointment::whereDate('appointment_date', $date)
            ->whereIn('status', self::BLOCKING_BOOKING_STATUSES)
            ->first();

        $isAvailable = !$existingAppointment;

        return [
            'success' => true,
            'date' => $date,
            'available' => $isAvailable,
            'message' => $isAvailable 
                ? 'Grooming slot available for this date' 
                : 'This grooming date is already reserved',
            'existing_appointment' => $existingAppointment ? [
                'id' => $existingAppointment->id,
                'pet_name' => $existingAppointment->pet_name,
                'service' => $existingAppointment->service,
                'status' => $existingAppointment->status,
            ] : null,
        ];
    }

    /**
     * Get available boarding rooms for date range
     */
    public static function getBoardingAvailability(?string $checkIn = null, ?string $checkOut = null): array
    {
        if (!$checkIn) {
            $checkIn = now()->format('Y-m-d');
        }
        if (!$checkOut) {
            $checkOut = now()->addDays(1)->format('Y-m-d');
        }

        $checkInDate = Carbon::parse($checkIn);
        $checkOutDate = Carbon::parse($checkOut);

        // Validate date range
        if ($checkOutDate->lessThanOrEqualTo($checkInDate)) {
            return [
                'success' => false,
                'message' => 'Check-out date must be after check-in date',
            ];
        }

        // Get all rooms that are potentially available
        $allRooms = HotelRoom::where('status', 'available')->get();

        $availableRooms = [];

        foreach ($allRooms as $room) {
            // Check for overlapping boarding reservations with blocking statuses
            $hasConflict = Boarding::where('hotel_room_id', $room->id)
                ->whereIn('status', self::BLOCKING_BOOKING_STATUSES)
                ->where(function ($query) use ($checkInDate, $checkOutDate) {
                    $query->where(function ($q) use ($checkInDate, $checkOutDate) {
                        // Overlap condition: existing check-in < new check-out AND existing check-out > new check-in
                        $q->where('check_in', '<', $checkOutDate)
                           ->where('check_out', '>', $checkInDate);
                    });
                })
                ->exists();

            $availableRooms[] = [
                'id' => $room->id,
                'name' => $room->name,
                'type' => $room->type,
                'size' => $room->size,
                'capacity' => $room->capacity,
                'daily_rate' => $room->daily_rate,
                'available' => !$hasConflict,
                'status' => $hasConflict ? 'unavailable' : 'available',
                'reason' => $hasConflict ? 'Room already booked for selected dates' : 'Available',
            ];
        }

        return [
            'success' => true,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'rooms' => $availableRooms,
        ];
    }

    /**
     * Check if a specific veterinary slot is available
     */
    public static function isVeterinarySlotAvailable(string $date, string $time, ?int $veterinarianId = null): bool
    {
        $scheduledAt = Carbon::parse($date . ' ' . $time);

        $query = Appointment::where('scheduled_at', $scheduledAt)
            ->whereIn('status', self::BLOCKING_BOOKING_STATUSES);

        if ($veterinarianId) {
            $query->where('veterinarian_id', $veterinarianId);
        }

        return !$query->exists();
    }

    /**
     * Check if a grooming date is available
     */
    public static function isGroomingDateAvailable(string $date): bool
    {
        return !GroomingAppointment::whereDate('appointment_date', $date)
            ->whereIn('status', self::BLOCKING_BOOKING_STATUSES)
            ->exists();
    }

    /**
     * Check if a boarding room is available for date range
     */
    public static function isBoardingRoomAvailable(int $roomId, string $checkIn, string $checkOut): bool
    {
        $checkInDate = Carbon::parse($checkIn);
        $checkOutDate = Carbon::parse($checkOut);

        return !Boarding::where('hotel_room_id', $roomId)
            ->whereIn('status', self::BLOCKING_BOOKING_STATUSES)
            ->where(function ($query) use ($checkInDate, $checkOutDate) {
                $query->where('check_in', '<', $checkOutDate)
                   ->where('check_out', '>', $checkInDate);
            })
            ->exists();
    }
}
