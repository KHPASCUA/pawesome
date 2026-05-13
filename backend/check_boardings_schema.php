<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CHECKING BOARDINGS TABLE SCHEMA ===" . PHP_EOL;

// Get table columns
$columns = \Illuminate\Support\Facades\Schema::getColumnListing('boardings');
echo "Boardings table columns:" . PHP_EOL;
foreach ($columns as $column) {
    echo "  {$column}" . PHP_EOL;
}

// Check if room_id column exists
if (in_array('room_id', $columns)) {
    echo "✅ room_id column exists" . PHP_EOL;
} else {
    echo "❌ room_id column does not exist" . PHP_EOL;
}

// Check if hotel_room_id column exists (alternative name)
if (in_array('hotel_room_id', $columns)) {
    echo "✅ hotel_room_id column exists" . PHP_EOL;
} else {
    echo "❌ hotel_room_id column does not exist" . PHP_EOL;
}

// Check the actual structure
echo PHP_EOL . "Detailed column information:" . PHP_EOL;
try {
    $columnInfo = \Illuminate\Support\Facades\DB::select("SHOW COLUMNS FROM boardings");
    foreach ($columnInfo as $col) {
        echo "  {$col->Field}: {$col->Type} (Null: {$col->Null}, Default: " . ($col->Default ?? 'NULL') . ")" . PHP_EOL;
    }
} catch (Exception $e) {
    echo "Error getting column info: " . $e->getMessage() . PHP_EOL;
}

// Check recent boarding records
echo PHP_EOL . "Recent boarding records:" . PHP_EOL;
$recentBoardings = \App\Models\Boarding::orderBy('id', 'desc')->limit(3)->get();
foreach ($recentBoardings as $boarding) {
    echo "  ID: {$boarding->id}, room_id: " . ($boarding->room_id ?? 'NULL') . ", hotel_room_id: " . ($boarding->hotel_room_id ?? 'NULL') . PHP_EOL;
}

echo PHP_EOL . "=== SCHEMA CHECK COMPLETE ===" . PHP_EOL;
