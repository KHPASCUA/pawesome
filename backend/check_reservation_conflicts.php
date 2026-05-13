<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== RESERVATION CONFLICTS ANALYSIS ===\n\n";

// Check boarding_room_reservations table
echo "=== BOARDING_ROOM_RESERVATIONS TABLE ===\n";
if (Schema::hasTable('boarding_room_reservations')) {
    $reservations = DB::table('boarding_room_reservations')->get();
    echo "Total reservations: " . count($reservations) . "\n\n";
    
    if (count($reservations) > 0) {
        foreach ($reservations as $reservation) {
            echo "Reservation ID: {$reservation->id}\n";
            echo "  Room ID: {$reservation->room_id}\n";
            echo "  Source: {$reservation->source_type} #{$reservation->source_id}\n";
            echo "  Pet ID: {$reservation->pet_id}\n";
            echo "  Customer ID: " . ($reservation->customer_id ?? 'NULL') . "\n";
            echo "  Check-in: {$reservation->check_in_date}\n";
            echo "  Check-out: {$reservation->check_out_date}\n";
            echo "  Status: {$reservation->status}\n";
            echo "  Created: {$reservation->created_at}\n";
            echo "  ---\n";
        }
    } else {
        echo "No reservations found.\n";
    }
} else {
    echo "boarding_room_reservations table does not exist.\n";
}

echo "\n=== BOARDINGS TABLE (HOTEL_ROOM_ID) ===\n";
if (Schema::hasTable('boardings') && Schema::hasColumn('boardings', 'hotel_room_id')) {
    $boardings = DB::table('boardings')
        ->whereNotNull('hotel_room_id')
        ->get();
    
    echo "Total boardings with room_id: " . count($boardings) . "\n\n";
    
    if (count($boardings) > 0) {
        foreach ($boardings as $boarding) {
            echo "Boarding ID: {$boarding->id}\n";
            echo "  Room ID: {$boarding->hotel_room_id}\n";
            echo "  Pet ID: {$boarding->pet_id}\n";
            echo "  Check-in: {$boarding->check_in}\n";
            echo "  Check-out: {$boarding->check_out}\n";
            echo "  Status: {$boarding->status}\n";
            echo "  Created: {$boarding->created_at}\n";
            echo "  ---\n";
        }
    } else {
        echo "No boardings with hotel_room_id found.\n";
    }
} else {
    echo "boardings table or hotel_room_id column does not exist.\n";
}

echo "\n=== CONFLICTS FOR TEST DATES (2026-05-14 to 2026-05-15) ===\n";

// Check boarding_room_reservations conflicts
if (Schema::hasTable('boarding_room_reservations')) {
    $conflicts = DB::table('boarding_room_reservations')
        ->where('check_in_date', '<=', '2026-05-15')
        ->where('check_out_date', '>=', '2026-05-14')
        ->whereNotIn('status', ['rejected', 'cancelled', 'checked_out', 'completed'])
        ->get();
    
    echo "Reservation conflicts: " . count($conflicts) . "\n";
    foreach ($conflicts as $conflict) {
        echo "  - Room {$conflict->room_id} ({$conflict->status})\n";
    }
}

// Check boardings conflicts
if (Schema::hasTable('boardings') && Schema::hasColumn('boardings', 'hotel_room_id')) {
    $boardingConflicts = DB::table('boardings')
        ->whereNotNull('hotel_room_id')
        ->where('check_in', '<=', '2026-05-15')
        ->where('check_out', '>=', '2026-05-14')
        ->whereNotIn('status', ['rejected', 'cancelled', 'checked_out', 'completed'])
        ->get();
    
    echo "Boarding conflicts: " . count($boardingConflicts) . "\n";
    foreach ($boardingConflicts as $conflict) {
        echo "  - Room {$conflict->hotel_room_id} ({$conflict->status})\n";
    }
}

echo "\n=== ROOM AVAILABILITY SUMMARY ===\n";
$rooms = DB::table('boarding_rooms')->where('is_active', true)->get();

foreach ($rooms as $room) {
    $totalBlocked = 0;
    
    // Check reservation conflicts
    if (Schema::hasTable('boarding_room_reservations')) {
        $reservations = DB::table('boarding_room_reservations')
            ->where('room_id', $room->id)
            ->where('check_in_date', '<=', '2026-05-15')
            ->where('check_out_date', '>=', '2026-05-14')
            ->whereNotIn('status', ['rejected', 'cancelled', 'checked_out', 'completed'])
            ->count();
        $totalBlocked += $reservations;
    }
    
    // Check boarding conflicts
    if (Schema::hasTable('boardings') && Schema::hasColumn('boardings', 'hotel_room_id')) {
        $boardings = DB::table('boardings')
            ->where('hotel_room_id', $room->id)
            ->where('check_in', '<=', '2026-05-15')
            ->where('check_out', '>=', '2026-05-14')
            ->whereNotIn('status', ['rejected', 'cancelled', 'checked_out', 'completed'])
            ->count();
        $totalBlocked += $boardings;
    }
    
    $available = $room->total_rooms - $totalBlocked;
    echo "{$room->room_name} ({$room->room_type}): {$available}/{$room->total_rooms} available\n";
}
