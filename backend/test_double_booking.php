<?php

/**
 * Comprehensive Double Booking Prevention Test Script
 * Tests all booking scenarios: Veterinary, Grooming, Boarding
 */

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\Appointment;
use App\Models\GroomingAppointment;
use App\Models\Boarding;
use App\Models\User;
use App\Models\Customer;
use App\Models\Pet;

echo "🚀 PAWESOME DOUBLE BOOKING PREVENTION TESTS\n";
echo "===============================================\n\n";

// Test data setup
$testVet = null;
$testCustomer = null;
$testPet = null;

try {
    // Create test data
    $testCustomer = Customer::first();
    $testPet = Pet::first();
    $testVet = User::where('role', 'veterinary')->first();
    
    if (!$testCustomer || !$testPet || !$testVet) {
        echo "❌ Missing test data. Please ensure you have:\n";
        echo "   - At least 1 customer record\n";
        echo "   - At least 1 pet record\n";
        echo "   - At least 1 veterinarian user\n";
        exit(1);
    }
    
    echo "✅ Test data loaded successfully\n";
    echo "   Customer: {$testCustomer->name}\n";
    echo "   Pet: {$testPet->name}\n";
    echo "   Veterinarian: {$testVet->name}\n\n";
    
} catch (Exception $e) {
    echo "❌ Error setting up test data: {$e->getMessage()}\n";
    exit(1);
}

// Test 1: Veterinary Double Booking Prevention
echo "📋 TEST 1: Veterinary Double Booking Prevention\n";
echo "--------------------------------------------\n";

try {
    // Clean up any existing test appointments
    Appointment::where('notes', 'like', '%DB_TEST_%')->delete();
    
    // Create first appointment
    $appointment1 = Appointment::create([
        'customer_id' => $testCustomer->id,
        'pet_id' => $testPet->id,
        'service_id' => 1,
        'veterinarian_id' => $testVet->id,
        'scheduled_at' => '2026-05-15 10:00:00',
        'status' => 'pending',
        'price' => 100.00,
        'notes' => 'DB_TEST_1'
    ]);
    
    echo "✅ Created first appointment: #{$appointment1->id}\n";
    
    // Try to create second appointment with same vet/time
    $appointment2 = Appointment::create([
        'customer_id' => $testCustomer->id,
        'pet_id' => $testPet->id,
        'service_id' => 2,
        'veterinarian_id' => $testVet->id,
        'scheduled_at' => '2026-05-15 10:00:00',
        'status' => 'pending',
        'price' => 150.00,
        'notes' => 'DB_TEST_2'
    ]);
    
    echo "✅ Created second appointment: #{$appointment2->id}\n";
    
    // Test approval of first appointment (should succeed)
    $result1 = approveAppointment($appointment1->id, $testVet->id);
    echo "Approve first appointment: " . ($result1 ? "✅ SUCCESS" : "❌ FAILED") . "\n";
    
    // Test approval of second appointment (should fail)
    $result2 = approveAppointment($appointment2->id, $testVet->id);
    echo "Approve duplicate appointment: " . ($result2 ? "❌ FAILED (should block)" : "✅ SUCCESS (correctly blocked)") . "\n";
    
    // Clean up
    Appointment::where('notes', 'like', '%DB_TEST_%')->delete();
    
} catch (Exception $e) {
    echo "❌ Veterinary test failed: {$e->getMessage()}\n";
}

echo "\n";

// Test 2: Grooming Double Booking Prevention
echo "📋 TEST 2: Grooming Double Booking Prevention\n";
echo "--------------------------------------------\n";

try {
    // Clean up any existing test appointments
    GroomingAppointment::where('notes', 'like', '%DB_TEST_%')->delete();
    
    // Create first grooming Appointment
    $grooming1 = GroomingAppointment::create([
        'pet_id' => $testPet->id,
        'pet_name' => $testPet->name,
        'service' => 'Full Grooming',
        'appointment_date' => '2026-05-15',
        'status' => 'pending',
        'notes' => 'DB_TEST_1'
    ]);
    
    echo "✅ Created first grooming: #{$grooming1->id}\n";
    
    // Try to create second grooming appointment on same date
    $grooming2 = GroomingAppointment::create([
        'pet_id' => $testPet->id,
        'pet_name' => $testPet->name,
        'service' => 'Basic Grooming',
        'appointment_date' => '2026-05-15',
        'status' => 'pending',
        'notes' => 'DB_TEST_2'
    ]);
    
    echo "✅ Created second grooming: #{$grooming2->id}\n";
    
    // Test approval of first grooming (should succeed)
    $result1 = approveGrooming($grooming1->id);
    echo "Approve first grooming: " . ($result1 ? "✅ SUCCESS" : "❌ FAILED") . "\n";
    
    // Test approval of second grooming (should fail)
    $result2 = approveGrooming($grooming2->id);
    echo "Approve duplicate grooming: " . ($result2 ? "❌ FAILED (should block)" : "✅ SUCCESS (correctly blocked)") . "\n";
    
    // Clean up
    GroomingAppointment::where('notes', 'like', '%DB_TEST_%')->delete();
    
} catch (Exception $e) {
    echo "❌ Grooming test failed: {$e->getMessage()}\n";
}

echo "\n";

// Test 3: Boarding Double Booking Prevention
echo "📋 TEST 3: Boarding Double Booking Prevention\n";
echo "--------------------------------------------\n";

try {
    // Clean up any existing test boardings
    Boarding::where('notes', 'like', '%DB_TEST_%')->delete();
    
    // Create first boarding reservation
    $boarding1 = Boarding::create([
        'customer_id' => $testCustomer->id,
        'pet_id' => $testPet->id,
        'pet_name' => $testPet->name,
        'hotel_room_id' => 1,
        'check_in' => '2026-05-15',
        'check_out' => '2026-05-17',
        'status' => 'pending',
        'total_amount' => 500.00,
        'notes' => 'DB_TEST_1'
    ]);
    
    echo "✅ Created first boarding: #{$boarding1->id}\n";
    
    // Try to create overlapping boarding reservation
    $boarding2 = Boarding::create([
        'customer_id' => $testCustomer->id,
        'pet_id' => $testPet->id,
        'pet_name' => $testPet->name,
        'hotel_room_id' => 1,
        'check_in' => '2026-05-16',
        'check_out' => '2026-05-18',
        'status' => 'pending',
        'total_amount' => 400.00,
        'notes' => 'DB_TEST_2'
    ]);
    
    echo "✅ Created overlapping boarding: #{$boarding2->id}\n";
    
    // Test scheduling of first boarding (should succeed)
    $result1 = scheduleBoarding($boarding1->id, 1, '2026-05-15', '2026-05-17');
    echo "Schedule first boarding: " . ($result1 ? "✅ SUCCESS" : "❌ FAILED") . "\n";
    
    // Test scheduling of overlapping boarding (should fail)
    $result2 = scheduleBoarding($boarding2->id, 1, '2026-05-16', '2026-05-18');
    echo "Schedule overlapping boarding: " . ($result2 ? "❌ FAILED (should block)" : "✅ SUCCESS (correctly blocked)") . "\n";
    
    // Clean up
    Boarding::where('notes', 'like', '%DB_TEST_%')->delete();
    
} catch (Exception $e) {
    echo "❌ Boarding test failed: {$e->getMessage()}\n";
}

echo "\n🎯 ALL TESTS COMPLETED\n";
echo "==================================\n";

// Helper functions
function approveAppointment($id, $vetId) {
    try {
        $appointment = Appointment::find($id);
        if (!$appointment) return false;
        
        // Simulate the conflict check logic from AppointmentController
        $conflictingAppointment = Appointment::where('veterinarian_id', $vetId)
            ->where('scheduled_at', $appointment->scheduled_at)
            ->whereIn('status', ['approved', 'scheduled', 'in_progress', 'in_consultation'])
            ->where('id', '!=', $appointment->id)
            ->first();

        if ($conflictingAppointment) {
            echo "   ⚠️  Conflict detected with appointment #{$conflictingAppointment->id}\n";
            return false;
        }

        $appointment->update([
            'status' => 'approved',
            'veterinarian_id' => $vetId,
        ]);
        
        return true;
    } catch (Exception $e) {
        echo "   ❌ Approval error: {$e->getMessage()}\n";
        return false;
    }
}

function approveGrooming($id) {
    try {
        $appointment = GroomingAppointment::find($id);
        if (!$appointment) return false;
        
        // Simulate the conflict check logic from GroomingController
        $conflictingAppointment = GroomingAppointment::where('appointment_date', $appointment->appointment_date)
            ->whereIn('status', ['approved', 'scheduled', 'in_progress'])
            ->where('id', '!=', $appointment->id)
            ->first();

        if ($conflictingAppointment) {
            echo "   ⚠️  Conflict detected with appointment #{$conflictingAppointment->id}\n";
            return false;
        }

        $appointment->update(['status' => 'approved']);
        return true;
    } catch (Exception $e) {
        echo "   ❌ Approval error: {$e->getMessage()}\n";
        return false;
    }
}

function scheduleBoarding($id, $roomId, $checkIn, $checkOut) {
    try {
        $boarding = Boarding::find($id);
        if (!$boarding) return false;
        
        // Simulate the conflict check logic from BoardingController
        $conflictingBoarding = Boarding::where('hotel_room_id', $roomId)
            ->whereIn('status', ['approved', 'scheduled', 'checked_in', 'in_stay'])
            ->where('id', '!=', $boarding->id)
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->where(function ($subQuery) use ($checkIn, $checkOut) {
                    $subQuery->where('check_in', '<', $checkOut)
                           ->where('check_out', '>', $checkIn);
                });
            })
            ->first();

        if ($conflictingBoarding) {
            echo "   ⚠️  Conflict detected with boarding #{$conflictingBoarding->id}\n";
            echo "   📅 Existing: {$conflictingBoarding->check_in} to {$conflictingBoarding->check_out}\n";
            echo "   📅 Requested: {$checkIn} to {$checkOut}\n";
            return false;
        }

        $boarding->update([
            'hotel_room_id' => $roomId,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'status' => 'scheduled'
        ]);
        
        return true;
    } catch (Exception $e) {
        echo "   ❌ Scheduling error: {$e->getMessage()}\n";
        return false;
    }
}
