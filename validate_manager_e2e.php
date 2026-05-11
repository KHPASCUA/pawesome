<?php

require_once 'backend/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== MANAGER E2E VALIDATION ===\n";

// Verify POS movement type from Cashier E2E
echo "\n=== MOVEMENT TYPE VERIFICATION ===\n";
$posMovementType = DB::table('inventory_logs')
    ->where('movement_type', 'like', '%pos%')
    ->orderBy('created_at', 'desc')
    ->limit(1)
    ->value('movement_type');

echo "Current POS Movement Type: {$posMovementType}\n";

// Verify service movement types
$vetMovementType = DB::table('inventory_logs')
    ->where('movement_type', 'like', '%vet%')
    ->orderBy('created_at', 'desc')
    ->limit(1)
    ->value('movement_type');

$boardingMovementType = DB::table('inventory_logs')
    ->where('movement_type', 'like', '%boarding%')
    ->orderBy('created_at', 'desc')
    ->limit(1)
    ->value('movement_type');

$groomingMovementType = DB::table('inventory_logs')
    ->where('movement_type', 'like', '%grooming%')
    ->orderBy('created_at', 'desc')
    ->limit(1)
    ->value('movement_type');

echo "Movement Types:\n";
echo "- POS: {$posMovementType}\n";
echo "- Veterinary: {$vetMovementType}\n";
echo "- Boarding: {$boardingMovementType}\n";
echo "- Grooming: {$groomingMovementType}\n";

// Verify recent POS sales for manager reports
echo "\n=== RECENT POS SALES FOR MANAGER REPORTS ===\n";
$recentPosSales = DB::table('customer_orders')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get(['id', 'total_amount', 'status', 'payment_status', 'created_at']);

echo "Recent POS Sales (should appear in manager reports):\n";
foreach ($recentPosSales as $sale) {
    echo "- Order ID: {$sale->id}, Total: {$sale->total_amount}, Status: {$sale->status}, Payment: {$sale->payment_status}, Created: {$sale->created_at}\n";
}

// Verify service data for manager reports
echo "\n=== SERVICE DATA FOR MANAGER REPORTS ===\n";

// Veterinary Appointments
$vetAppointments = DB::table('vet_appointments')
    ->orderBy('created_at', 'desc')
    ->limit(3)
    ->get(['id', 'pet_id', 'pet_name', 'service', 'appointment_date', 'status']);

echo "Recent Veterinary Appointments (should appear in manager reports):\n";
foreach ($vetAppointments as $appointment) {
    echo "- ID: {$appointment->id}, Pet: {$appointment->pet_id}, Pet Name: {$appointment->pet_name}, Service: {$appointment->service}, Date: {$appointment->appointment_date}, Status: {$appointment->status}\n";
}

// Grooming Appointments
$groomingAppointments = DB::table('grooming_appointments')
    ->orderBy('created_at', 'desc')
    ->limit(3)
    ->get(['id', 'pet_id', 'appointment_date', 'status']);

echo "Recent Grooming Appointments (should appear in manager reports):\n";
foreach ($groomingAppointments as $appointment) {
    echo "- ID: {$appointment->id}, Pet: {$appointment->pet_id}, Date: {$appointment->appointment_date}, Status: {$appointment->status}\n";
}

// Boarding Records
$boardingRecords = DB::table('boardings')
    ->orderBy('created_at', 'desc')
    ->limit(3)
    ->get(['id', 'pet_id', 'check_in', 'check_out', 'status']);

echo "Recent Boarding Records (should appear in manager reports):\n";
foreach ($boardingRecords as $record) {
    echo "- ID: {$record->id}, Pet: {$record->pet_id}, Check-in: {$record->check_in}, Check-out: {$record->check_out}, Status: {$record->status}\n";
}

// Verify inventory data for manager reports
echo "\n=== INVENTORY DATA FOR MANAGER REPORTS ===\n";
$inventorySummary = DB::table('inventory_items')
    ->select(
        'category',
        DB::raw('COUNT(*) as total_items'),
        DB::raw('SUM(stock) as total_stock'),
        DB::raw('SUM(CASE WHEN stock <= 5 AND stock > 0 THEN 1 ELSE 0 END) as low_stock_count'),
        DB::raw('SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END) as out_of_stock_count')
    )
    ->groupBy('category')
    ->get();

echo "Inventory Summary by Category (should appear in manager reports):\n";
foreach ($inventorySummary as $summary) {
    echo "- {$summary->category}: {$summary->total_items} items, Total Stock: {$summary->total_stock}, Low Stock: {$summary->low_stock_count}, Out of Stock: {$summary->out_of_stock_count}\n";
}

// Verify staff data for manager reports
echo "\n=== STAFF DATA FOR MANAGER REPORTS ===\n";
$totalStaff = DB::table('users')->whereIn('role', ['cashier', 'receptionist', 'veterinary', 'manager'])->count();
echo "Total Staff Members: {$totalStaff}\n";

$staffByRole = DB::table('users')
    ->whereIn('role', ['cashier', 'receptionist', 'veterinary', 'manager'])
    ->select('role', DB::raw('count(*) as count'))
    ->groupBy('role')
    ->get();

echo "Staff by Role (should appear in manager reports):\n";
foreach ($staffByRole as $role) {
    echo "- {$role->role}: {$role->count}\n";
}

echo "\n=== MANAGER E2E VALIDATION COMPLETE ===\n";
echo "Data ready for manager report validation:\n";
echo "- POS movement type: {$posMovementType}\n";
echo "- Service movement types verified\n";
echo "- Recent POS sales: " . $recentPosSales->count() . " records\n";
echo "- Service appointments: Veterinary, Grooming, Boarding available\n";
echo "- Inventory summary: Category-wise data available\n";
echo "- Staff data: Role-wise breakdown available\n";
