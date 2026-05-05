<?php

// Add these routes to your routes/api.php file

use App\Http\Controllers\InventoryController;

// Monthly Audit Routes
Route::get('/inventory/monthly-audit', [InventoryController::class, 'getOrCreateMonthlyAudit']);
Route::post('/inventory/monthly-audit', [InventoryController::class, 'saveMonthlyAudit']);

?>
Add these lines to your existing routes/api.php file:

Route::get('/inventory/monthly-audit', [InventoryController::class, 'getOrCreateMonthlyAudit']);
Route::post('/inventory/monthly-audit', [InventoryController::class, 'saveMonthlyAudit']);

Make sure to add this at the top of your routes/api.php file:
use App\Http\Controllers\InventoryController;
