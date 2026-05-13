<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== BOARDING STATUS CHECK ===\n";

// Check boardings table status
$boardingStatusInfo = DB::select("SHOW COLUMNS FROM boardings WHERE Field = 'status'")[0];
echo "Boardings.status: {$boardingStatusInfo->Type}\n";

$longestBoarding = DB::table('boardings')
    ->select('status')
    ->whereNotNull('status')
    ->orderByRaw('LENGTH(status) DESC')
    ->limit(1)
    ->value('status');

echo "Longest boarding status: '{$longestBoarding}' (" . strlen($longestBoarding) . " chars)\n";

echo "\n=== ALL STATUS VALUES ===\n";

$boardingStatuses = DB::table('boardings')->distinct()->pluck('status')->toArray();
echo "Boarding statuses: " . implode(', ', $boardingStatuses) . "\n";

echo "\n";
