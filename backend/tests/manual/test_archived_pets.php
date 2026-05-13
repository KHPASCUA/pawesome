<?php

// Test script to verify archived pets endpoint fix
require_once 'backend/vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\PetController;

// Simulate a customer request
$request = new Request();
$request->setUserResolver(function() {
    return (object) [
        'id' => 1,
        'email' => 'customer@example.com',
        'role' => 'customer'
    ];
});

// Test the archived method
$petController = new PetController();
echo "Testing PetController@archived with customer role...\n";

try {
    $response = $petController->archived($request);
    echo "✅ SUCCESS: Archived pets endpoint works\n";
    echo "Response status: " . $response->getStatusCode() . "\n";
    echo "Response content: " . $response->getContent() . "\n";
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\nTesting route registration...\n";
$routes = app('router')->getRoutes();
$archivedRouteFound = false;
$customerArchivedRouteFound = false;

foreach ($routes as $route) {
    if ($route->uri() === 'api/pets/archived') {
        $archivedRouteFound = true;
        echo "✅ Found: /api/pets/archived\n";
    }
    if ($route->uri() === 'api/customer/pets/archived') {
        $customerArchivedRouteFound = true;
        echo "✅ Found: /api/customer/pets/archived\n";
    }
}

if (!$archivedRouteFound) {
    echo "❌ Missing: /api/pets/archived\n";
}
if (!$customerArchivedRouteFound) {
    echo "❌ Missing: /api/customer/pets/archived\n";
}

echo "\nTest completed.\n";
