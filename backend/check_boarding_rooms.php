<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== BOARDING ROOMS INSPECTION ===\n\n";

// Check total count
$count = DB::table('boarding_rooms')->count();
echo "Total boarding rooms: {$count}\n\n";

// Get all rooms
$rooms = DB::table('boarding_rooms')->get();

echo "Existing rooms:\n";
foreach ($rooms as $room) {
    echo "ID: {$room->id}\n";
    echo "  Code: {$room->room_code}\n";
    echo "  Name: {$room->room_name}\n";
    echo "  Type: {$room->room_type}\n";
    echo "  Species: {$room->allowed_species}\n";
    echo "  Active: " . ($room->is_active ? 'Yes' : 'No') . "\n";
    echo "  Customer Selectable: " . ($room->customer_selectable ? 'Yes' : 'No') . "\n";
    echo "  Daily Rate: {$room->daily_rate}\n";
    echo "  Total Rooms: {$room->total_rooms}\n";
    echo "  Max Capacity: {$room->max_capacity}\n";
    echo "  ---\n";
}

echo "\n=== ROOM TYPE BREAKDOWN ===\n";
$roomTypes = DB::table('boarding_rooms')
    ->select('room_type', DB::raw('COUNT(*) as count'))
    ->groupBy('room_type')
    ->get();

foreach ($roomTypes as $type) {
    echo "{$type->room_type}: {$type->count} rooms\n";
}

echo "\n=== SPECIES COVERAGE ===\n";
$speciesCounts = [];
foreach ($rooms as $room) {
    $allowedSpecies = json_decode($room->allowed_species, true);
    if (is_array($allowedSpecies)) {
        foreach ($allowedSpecies as $species) {
            $speciesCounts[$species] = ($speciesCounts[$species] ?? 0) + 1;
        }
    }
}

foreach ($speciesCounts as $species => $count) {
    echo "{$species}: {$count} rooms available\n";
}

echo "\n=== ACTIVE ROOMS ===\n";
$activeCount = DB::table('boarding_rooms')->where('is_active', true)->count();
echo "Active rooms: {$activeCount}\n";

echo "\n=== CUSTOMER SELECTABLE ROOMS ===\n";
$selectableCount = DB::table('boarding_rooms')->where('customer_selectable', true)->count();
echo "Customer selectable rooms: {$selectableCount}\n";

echo "\n=== RESERVATION TABLE CHECK ===\n";
if (Schema::hasTable('boarding_room_reservations')) {
    echo "boarding_room_reservations table exists\n";
    $reservationCount = DB::table('boarding_room_reservations')->count();
    echo "Total reservations: {$reservationCount}\n";
    
    // Check for reservations on the test date
    $testReservations = DB::table('boarding_room_reservations')
        ->where('check_in_date', '<=', '2026-05-15')
        ->where('check_out_date', '>=', '2026-05-14')
        ->whereNotIn('status', ['rejected', 'cancelled', 'checked_out', 'completed'])
        ->count();
    echo "Active reservations for 2026-05-14 to 2026-05-15: {$testReservations}\n";
} else {
    echo "boarding_room_reservations table does not exist\n";
}

echo "\n=== BOARDINGS TABLE CHECK ===\n";
if (Schema::hasTable('boardings')) {
    echo "boardings table exists\n";
    if (Schema::hasColumn('boardings', 'hotel_room_id')) {
        echo "boardings.hotel_room_id column exists\n";
        
        $boardingCount = DB::table('boardings')
            ->where('check_in', '<=', '2026-05-15')
            ->where('check_out', '>=', '2026-05-14')
            ->whereNotIn('status', ['rejected', 'cancelled', 'checked_out', 'completed'])
            ->count();
        echo "Active boardings for 2026-05-14 to 2026-05-15: {$boardingCount}\n";
    } else {
        echo "boardings.hotel_room_id column does not exist\n";
    }
} else {
    echo "boardings table does not exist\n";
}
