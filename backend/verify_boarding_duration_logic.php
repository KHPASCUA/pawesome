<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== VERIFYING BOARDING DURATION LOGIC ===" . PHP_EOL;

// Test the exact same logic used in BoardingController
echo PHP_EOL . "1. TESTING BOARDING CONTROLLER DURATION CALCULATION" . PHP_EOL;

// Test case 1: Same as reservation 32 (the one that had issues)
echo "Test Case 1: Reservation 32 scenario" . PHP_EOL;
$checkIn32 = new \Carbon\Carbon('2026-05-13 02:22:34');
$checkOut32 = new \Carbon\Carbon('2026-05-15 02:22:34');
$days32 = max(1, $checkIn32->diffInDays($checkOut32));
echo "  Check-in: {$checkIn32->format('Y-m-d H:i:s')}" . PHP_EOL;
echo "  Check-out: {$checkOut32->format('Y-m-d H:i:s')}" . PHP_EOL;
echo "  diffInDays(): {$checkIn32->diffInDays($checkOut32)}" . PHP_EOL;
echo "  max(1, diffInDays()): {$days32}" . PHP_EOL;
echo "  Expected: 2 days" . PHP_EOL;
echo "  Result: " . ($days32 == 2 ? '✅ CORRECT' : '❌ INCORRECT') . PHP_EOL;

// Test case 2: Same as reservation 33
echo PHP_EOL . "Test Case 2: Reservation 33 scenario" . PHP_EOL;
$checkIn33 = new \Carbon\Carbon('2026-05-13 02:24:47');
$checkOut33 = new \Carbon\Carbon('2026-05-14 02:24:47');
$days33 = max(1, $checkIn33->diffInDays($checkOut33));
echo "  Check-in: {$checkIn33->format('Y-m-d H:i:s')}" . PHP_EOL;
echo "  Check-out: {$checkOut33->format('Y-m-d H:i:s')}" . PHP_EOL;
echo "  diffInDays(): {$checkIn33->diffInDays($checkOut33)}" . PHP_EOL;
echo "  max(1, diffInDays()): {$days33}" . PHP_EOL;
echo "  Expected: 1 day" . PHP_EOL;
echo "  Result: " . ($days33 == 1 ? '✅ CORRECT' : '❌ INCORRECT') . PHP_EOL;

// Test case 3: Edge cases
echo PHP_EOL . "Test Case 3: Edge cases" . PHP_EOL;

// Same day check-in and check-out
$sameDayIn = new \Carbon\Carbon('2026-05-13 10:00:00');
$sameDayOut = new \Carbon\Carbon('2026-05-13 18:00:00');
$sameDayDays = max(1, $sameDayIn->diffInDays($sameDayOut));
echo "  Same day (10:00 to 18:00): {$sameDayDays} days" . PHP_EOL;
echo "  Expected: 1 day" . PHP_EOL;
echo "  Result: " . ($sameDayDays == 1 ? '✅ CORRECT' : '❌ INCORRECT') . PHP_EOL;

// One night stay
$oneNightIn = new \Carbon\Carbon('2026-05-13 15:00:00');
$oneNightOut = new \Carbon\Carbon('2026-05-14 11:00:00');
$oneNightDays = max(1, $oneNightIn->diffInDays($oneNightOut));
echo "  One night (15:00 to 11:00 next day): {$oneNightDays} days" . PHP_EOL;
echo "  Expected: 1 day" . PHP_EOL;
echo "  Result: " . ($oneNightDays == 1 ? '✅ CORRECT' : '❌ INCORRECT') . PHP_EOL;

// Three night stay
$threeNightIn = new \Carbon\Carbon('2026-05-13 15:00:00');
$threeNightOut = new \Carbon\Carbon('2026-05-16 11:00:00');
$threeNightDays = max(1, $threeNightIn->diffInDays($threeNightOut));
echo "  Three nights (15:00 to 11:00 three days later): {$threeNightDays} days" . PHP_EOL;
echo "  Expected: 3 days" . PHP_EOL;
echo "  Result: " . ($threeNightDays == 3 ? '✅ CORRECT' : '❌ INCORRECT') . PHP_EOL;

// Test case 4: Verify the old incorrect calculation (if it existed)
echo PHP_EOL . "Test Case 4: Testing if +1 was ever added" . PHP_EOL;
$testIn = new \Carbon\Carbon('2026-05-13 02:22:34');
$testOut = new \Carbon\Carbon('2026-05-15 02:22:34');
$correctDays = max(1, $testIn->diffInDays($testOut));
$incorrectDays = max(1, $testIn->diffInDays($testOut) + 1); // This would be wrong
echo "  Correct calculation: {$correctDays} days" . PHP_EOL;
echo "  Incorrect (+1): {$incorrectDays} days" . PHP_EOL;
echo "  Reservation 32 was billed for: 3 days (the incorrect way)" . PHP_EOL;
echo "  Current logic produces: {$correctDays} days (correct)" . PHP_EOL;

echo PHP_EOL . "2. VERIFYING BOARDING CONTROLLER LOGIC" . PHP_EOL;

// Check the actual BoardingController code
$controllerFile = file_get_contents('app/Http/Controllers/BoardingController.php');
if (strpos($controllerFile, '$days = max(1, $checkIn->diffInDays($checkOut));') !== false) {
    echo "✅ BoardingController uses correct duration calculation" . PHP_EOL;
} else {
    echo "❌ BoardingController duration calculation not found or incorrect" . PHP_EOL;
}

if (strpos($controllerFile, '$totalAmount = $days * $boarding->hotelRoom->daily_rate;') !== false) {
    echo "✅ BoardingController uses correct total amount calculation" . PHP_EOL;
} else {
    echo "❌ BoardingController total amount calculation not found or incorrect" . PHP_EOL;
}

if (strpos($controllerFile, '$boarding->hotelRoom->name . \' - \' . $days . \' day(s)\'') !== false) {
    echo "✅ BoardingController uses correct description format" . PHP_EOL;
} else {
    echo "❌ BoardingController description format not found or incorrect" . PHP_EOL;
}

echo PHP_EOL . "=== DURATION LOGIC VERIFICATION COMPLETE ===" . PHP_EOL;
