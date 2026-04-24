<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestHotelBookingPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-hotel-booking-permissions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test hotel booking permissions for receptionists';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing hotel booking permissions for receptionists...');
        
        try {
            // Create test receptionist user
            $receptionist = \App\Models\User::create([
                'name' => 'Test Receptionist',
                'username' => 'testreceptionist' . time(),
                'email' => 'receptionist' . time() . '@test.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'role' => 'receptionist',
                'is_active' => true,
                'api_token' => \Illuminate\Support\Facades\Hash::make(uniqid() . time()),
            ]);

            // Create test customer and pet
            $customer = \App\Models\Customer::create([
                'name' => 'Test Customer',
                'email' => 'customer' . time() . '@test.com',
                'phone' => '1234567890',
            ]);

            $pet = \App\Models\Pet::create([
                'customer_id' => $customer->id,
                'name' => 'Test Pet',
                'species' => 'dog',
                'breed' => 'Test Breed',
            ]);

            // Create test hotel room
            $room = \App\Models\HotelRoom::create([
                'room_number' => 'TEST-' . time(),
                'name' => 'Test Room',
                'type' => 'standard',
                'size' => 'medium',
                'capacity' => 2,
                'daily_rate' => 100.00,
                'status' => 'available',
            ]);

            $this->info('Created test data:');
            $this->info('  - Receptionist: ' . $receptionist->name . ' (role: ' . $receptionist->role . ')');
            $this->info('  - Customer: ' . $customer->name);
            $this->info('  - Pet: ' . $pet->name);
            $this->info('  - Room: ' . $room->room_number);

            // Test boarding creation with receptionist token
            $boardingData = [
                'pet_id' => $pet->id,
                'customer_id' => $customer->id,
                'hotel_room_id' => $room->id,
                'check_in' => now()->addDay()->format('Y-m-d'),
                'check_out' => now()->addDays(3)->format('Y-m-d'),
                'notes' => 'Test booking by receptionist',
            ];

            // Simulate API call with receptionist token
            $request = new \Illuminate\Http\Request();
            $request->merge($boardingData);
            $request->headers->set('Authorization', 'Bearer ' . $receptionist->api_token);

            // Set the user on the request
            app()->instance('request', $request);
            $request->setUserResolver(function () use ($receptionist) {
                return $receptionist;
            });

            // Test BoardingController store method
            $controller = new \App\Http\Controllers\BoardingController();
            $response = $controller->store($request);

            if ($response->getStatusCode() === 201) {
                $this->info('✅ SUCCESS: Receptionist can create hotel bookings!');
                $data = json_decode($response->getContent(), true);
                $this->info('  - Booking ID: ' . $data['boarding']['id']);
                $this->info('  - Status: ' . $data['boarding']['status']);
            } else {
                $this->error('❌ ERROR: Receptionist cannot create hotel bookings');
                $this->error('  - Status Code: ' . $response->getStatusCode());
                $this->error('  - Response: ' . $response->getContent());
                return 1;
            }

            // Test other boarding routes
            $this->info('Testing other boarding routes...');

            // Test available rooms
            $roomsRequest = new \Illuminate\Http\Request();
            $roomsRequest->merge([
                'check_in' => now()->addDay()->format('Y-m-d'),
                'check_out' => now()->addDays(3)->format('Y-m-d'),
            ]);
            $roomsRequest->headers->set('Authorization', 'Bearer ' . $receptionist->api_token);
            $roomsRequest->setUserResolver(function () use ($receptionist) {
                return $receptionist;
            });

            $roomsResponse = $controller->availableRooms($roomsRequest);
            if ($roomsResponse->getStatusCode() === 200) {
                $this->info('✅ SUCCESS: Receptionist can access available rooms!');
            } else {
                $this->error('❌ ERROR: Receptionist cannot access available rooms');
            }

            // Clean up
            if (isset($data['boarding']['id'])) {
                \App\Models\Boarding::find($data['boarding']['id'])?->delete();
            }
            $pet->delete();
            $customer->delete();
            $room->delete();
            $receptionist->delete();

            $this->info('✅ Test records cleaned up successfully!');
            $this->info('✅ Hotel booking permissions verified for receptionists!');

            return 0;

        } catch (\Exception $e) {
            $this->error('❌ ERROR: ' . $e->getMessage());
            $this->error('  - File: ' . $e->getFile() . ':' . $e->getLine());
            return 1;
        }
    }
}
