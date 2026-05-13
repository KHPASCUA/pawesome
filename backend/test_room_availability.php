<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TESTING ROOM AVAILABILITY ===\n\n";

use App\Http\Controllers\BoardingRoomController;
use Illuminate\Http\Request;

// Create controller instance
$controller = new BoardingRoomController(app(App\Services\BoardingRoomService::class));

// Test cases
$testCases = [
    [
        'name' => 'Cat Booking Test',
        'params' => [
            'pet_id' => '24',
            'species' => 'cat',
            'check_in_date' => '2026-05-14',
            'check_out_date' => '2026-05-15'
        ]
    ],
    [
        'name' => 'Dog Booking Test',
        'params' => [
            'pet_id' => '1',
            'species' => 'dog',
            'check_in_date' => '2026-05-14',
            'check_out_date' => '2026-05-15'
        ]
    ],
    [
        'name' => 'Bird Booking Test',
        'params' => [
            'pet_id' => '50',
            'species' => 'bird',
            'check_in_date' => '2026-05-14',
            'check_out_date' => '2026-05-15'
        ]
    ],
    [
        'name' => 'Fish Booking Test (should be blocked)',
        'params' => [
            'pet_id' => '100',
            'species' => 'fish',
            'check_in_date' => '2026-05-14',
            'check_out_date' => '2026-05-15'
        ]
    ]
];

foreach ($testCases as $testCase) {
    echo "--- {$testCase['name']} ---\n";
    
    $request = Request::create('/api/boarding/rooms/available', 'GET', $testCase['params']);
    
    try {
        $response = $controller->getAvailableRooms($request);
        $data = $response->getData(true);
        
        echo "Success: " . ($data['success'] ? 'Yes' : 'No') . "\n";
        if (isset($data['message'])) {
            echo "Message: {$data['message']}\n";
        }
        
        if (isset($data['rooms']) && is_array($data['rooms'])) {
            echo "Available rooms: " . count($data['rooms']) . "\n";
            foreach ($data['rooms'] as $room) {
                echo "  - {$room['room_name']} ({$room['room_type']}) - ₱{$room['daily_rate']}/day\n";
                if (isset($room['available'])) {
                    echo "    Available: " . ($room['available'] ? 'Yes' : 'No') . "\n";
                }
                if (isset($room['available_rooms'])) {
                    echo "    Available count: {$room['available_rooms']}\n";
                }
            }
        }
        
        echo "\n";
    } catch (Exception $e) {
        echo "ERROR: " . $e->getMessage() . "\n\n";
    }
}

echo "=== TESTING SIZE FILTERING ===\n\n";

$sizeTestCases = [
    [
        'name' => 'Small Dog',
        'params' => [
            'pet_id' => '1',
            'species' => 'dog',
            'size' => 'small',
            'check_in_date' => '2026-05-14',
            'check_out_date' => '2026-05-15'
        ]
    ],
    [
        'name' => 'Large Dog',
        'params' => [
            'pet_id' => '2',
            'species' => 'dog',
            'size' => 'large',
            'check_in_date' => '2026-05-14',
            'check_out_date' => '2026-05-15'
        ]
    ],
    [
        'name' => 'Small Cat',
        'params' => [
            'pet_id' => '24',
            'species' => 'cat',
            'size' => 'small',
            'check_in_date' => '2026-05-14',
            'check_out_date' => '2026-05-15'
        ]
    ],
    [
        'name' => 'Large Cat',
        'params' => [
            'pet_id' => '25',
            'species' => 'cat',
            'size' => 'large',
            'check_in_date' => '2026-05-14',
            'check_out_date' => '2026-05-15'
        ]
    ]
];

foreach ($sizeTestCases as $testCase) {
    echo "--- {$testCase['name']} ---\n";
    
    $request = Request::create('/api/boarding/rooms/available', 'GET', $testCase['params']);
    
    try {
        $response = $controller->getAvailableRooms($request);
        $data = $response->getData(true);
        
        echo "Success: " . ($data['success'] ? 'Yes' : 'No') . "\n";
        if (isset($data['rooms']) && is_array($data['rooms'])) {
            echo "Available rooms: " . count($data['rooms']) . "\n";
            foreach ($data['rooms'] as $room) {
                echo "  - {$room['room_name']} ({$room['room_type']}) - ₱{$room['daily_rate']}/day\n";
            }
        }
        
        echo "\n";
    } catch (Exception $e) {
        echo "ERROR: " . $e->getMessage() . "\n\n";
    }
}
