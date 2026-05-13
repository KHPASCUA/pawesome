<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== TABLE NAMES CHECK ===\n\n";

$tables = Schema::getTableListing();
foreach ($tables as $table) {
    if (strpos(strtolower($table), 'board') !== false) {
        echo "Found boarding-related table: {$table}\n";
    }
}

echo "\n=== STATUS COLUMN CHECK ===\n";

// Check appointments status
$appointmentStatusInfo = DB::select("SHOW COLUMNS FROM appointments WHERE Field = 'status'")[0];
echo "Appointments.status: {$appointmentStatusInfo->Type}\n";

// Check service_requests status  
$serviceRequestStatusInfo = DB::select("SHOW COLUMNS FROM service_requests WHERE Field = 'status'")[0];
echo "Service_Requests.status: {$serviceRequestStatusInfo->Type}\n";

echo "\n=== LONGEST STATUS VALUES ===\n";

$longestAppointment = DB::table('appointments')
    ->select('status')
    ->whereNotNull('status')
    ->orderByRaw('LENGTH(status) DESC')
    ->limit(1)
    ->value('status');

$longestServiceRequest = DB::table('service_requests')
    ->select('status')
    ->whereNotNull('status')
    ->orderByRaw('LENGTH(status) DESC')
    ->limit(1)
    ->value('status');

echo "Longest appointment status: '{$longestAppointment}' (" . strlen($longestAppointment) . " chars)\n";
echo "Longest service request status: '{$longestServiceRequest}' (" . strlen($longestServiceRequest) . " chars)\n";

echo "\n";
