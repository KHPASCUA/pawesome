<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TABLE COLUMN INSPECTION ===\n\n";

// Check boarding_room_reservations columns
echo "=== BOARDING_ROOM_RESERVATIONS COLUMNS ===\n";
if (Schema::hasTable('boarding_room_reservations')) {
    $columns = Schema::getColumnListing('boarding_room_reservations');
    foreach ($columns as $column) {
        echo "- {$column}\n";
    }
} else {
    echo "Table does not exist\n";
}

echo "\n=== BOARDINGS COLUMNS ===\n";
if (Schema::hasTable('boardings')) {
    $columns = Schema::getColumnListing('boardings');
    foreach ($columns as $column) {
        echo "- {$column}\n";
    }
} else {
    echo "Table does not exist\n";
}

echo "\n=== BOARDING_ROOMS COLUMNS ===\n";
if (Schema::hasTable('boarding_rooms')) {
    $columns = Schema::getColumnListing('boarding_rooms');
    foreach ($columns as $column) {
        echo "- {$column}\n";
    }
} else {
    echo "Table does not exist\n";
}
