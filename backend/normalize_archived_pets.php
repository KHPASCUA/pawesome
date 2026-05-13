<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== Normalizing Archived Pets Records ===\n\n";

// Check if archive columns exist
if (!Schema::hasColumn('pets', 'status') || !Schema::hasColumn('pets', 'archived_at')) {
    echo "ERROR: Required archive columns (status, archived_at) not found in pets table.\n";
    exit(1);
}

// Check current state of archived records
echo "Checking current archived records...\n";

$archivedByStatus = DB::table('pets')->where('status', 'archived')->count();
$archivedByDate = DB::table('pets')->whereNotNull('archived_at')->count();
$bothConditions = DB::table('pets')
    ->where('status', 'archived')
    ->whereNotNull('archived_at')
    ->count();

echo "Records with status='archived': $archivedByStatus\n";
echo "Records with archived_at NOT NULL: $archivedByDate\n";
echo "Records with both conditions: $bothConditions\n\n";

// Normalize records that have archived_at but wrong status
$toNormalizeStatus = DB::table('pets')
    ->whereNotNull('archived_at')
    ->where(function ($query) {
        $query->whereNull('status')
              ->orWhere('status', '!=', 'archived');
    })
    ->count();

echo "Records needing status normalization: $toNormalizeStatus\n";

if ($toNormalizeStatus > 0) {
    echo "Normalizing records with archived_at but wrong status...\n";
    
    $updated = DB::table('pets')
        ->whereNotNull('archived_at')
        ->where(function ($query) {
            $query->whereNull('status')
                  ->orWhere('status', '!=', 'archived');
        })
        ->update([
            'status' => 'archived',
            'updated_at' => now()
        ]);
    
    echo "✅ Updated $updated records to status='archived'\n";
}

// Normalize records that have status='archived' but no archived_at
$toNormalizeDate = DB::table('pets')
    ->where('status', 'archived')
    ->whereNull('archived_at')
    ->count();

echo "Records needing archived_at normalization: $toNormalizeDate\n";

if ($toNormalizeDate > 0) {
    echo "Normalizing records with status='archived' but no archived_at...\n";
    
    $updated = DB::table('pets')
        ->where('status', 'archived')
        ->whereNull('archived_at')
        ->update([
            'archived_at' => DB::raw('COALESCE(updated_at, created_at, NOW())'),
            'updated_at' => now()
        ]);
    
    echo "✅ Updated $updated records with archived_at timestamp\n";
}

// Final verification
echo "\n=== Final Verification ===\n";

$finalArchivedByStatus = DB::table('pets')->where('status', 'archived')->count();
$finalArchivedByDate = DB::table('pets')->whereNotNull('archived_at')->count();
$finalBothConditions = DB::table('pets')
    ->where('status', 'archived')
    ->whereNotNull('archived_at')
    ->count();

echo "Records with status='archived': $finalArchivedByStatus\n";
echo "Records with archived_at NOT NULL: $finalArchivedByDate\n";
echo "Records with both conditions: $finalBothConditions\n";

if ($finalArchivedByStatus === $finalArchivedByDate && $finalArchivedByStatus === $finalBothConditions) {
    echo "✅ All archived records are now properly normalized!\n";
} else {
    echo "⚠️  Some records may still need attention.\n";
}

echo "\n=== Normalization Complete ===\n";
