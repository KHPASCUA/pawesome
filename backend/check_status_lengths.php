<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== STATUS COLUMN LENGTH CHECK ===\n\n";

// Check appointments table
$appointmentsColumns = Schema::getColumnListing('appointments');
if (in_array('status', $appointmentsColumns)) {
    $columnInfo = DB::select("SHOW COLUMNS FROM appointments WHERE Field = 'status'")[0];
    echo "Appointments.status: {$columnInfo->Type}\n";
}

// Check service_requests table
$serviceRequestsColumns = Schema::getColumnListing('service_requests');
if (in_array('status', $serviceRequestsColumns)) {
    $columnInfo = DB::select("SHOW COLUMNS FROM service_requests WHERE Field = 'status'")[0];
    echo "Service_Requests.status: {$columnInfo->Type}\n";
}

// Check boarding table
$boardingColumns = Schema::getColumnListing('boarding');
if (in_array('status', $boardingColumns)) {
    $columnInfo = DB::select("SHOW COLUMNS FROM boarding WHERE Field = 'status'")[0];
    echo "Boarding.status: {$columnInfo->Type}\n";
}

// Check service_item_usages table
$serviceUsageColumns = Schema::getColumnListing('service_item_usages');
if (in_array('status', $serviceUsageColumns)) {
    $columnInfo = DB::select("SHOW COLUMNS FROM service_item_usages WHERE Field = 'status'")[0];
    echo "Service_Item_Usages.status: {$columnInfo->Type}\n";
}

echo "\n=== CURRENT STATUS VALUES IN USE ===\n\n";

// Check current status values in appointments
$appointmentStatuses = DB::table('appointments')->distinct()->pluck('status')->toArray();
echo "Appointment statuses: " . implode(', ', $appointmentStatuses) . "\n";

// Check current status values in service_requests
$serviceRequestStatuses = DB::table('service_requests')->distinct()->pluck('status')->toArray();
echo "Service request statuses: " . implode(', ', $serviceRequestStatuses) . "\n";

// Check current status values in boarding
$boardingStatuses = DB::table('boarding')->distinct()->pluck('status')->toArray();
echo "Boarding statuses: " . implode(', ', $boardingStatuses) . "\n";

echo "\n=== LONGEST STATUS VALUES ===\n\n";

function findLongestStatus($tableName, $columnName) {
    $longest = DB::table($tableName)
        ->select($columnName)
        ->whereNotNull($columnName)
        ->where($columnName, '!=', '')
        ->orderByRaw('LENGTH(' . $columnName . ') DESC')
        ->limit(1)
        ->value($columnName);
    
    $length = $longest ? strlen($longest) : 0;
    echo "{$tableName}.{$columnName}: '{$longest}' ({$length} chars)\n";
    return $length;
}

$maxLengths = [
    'appointments' => findLongestStatus('appointments', 'status'),
    'service_requests' => findLongestStatus('service_requests', 'status'),
    'boarding' => findLongestStatus('boarding', 'status'),
];

echo "\n=== STATUS LENGTH VALIDATION ===\n";
foreach ($maxLengths as $table => $length) {
    if ($length > 20) {
        echo "⚠️  {$table} has status values longer than 20 chars\n";
    } else {
        echo "✅ {$table} status values are within safe limits\n";
    }
}

echo "\n";
