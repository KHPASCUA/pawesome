<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Customer;
use App\Models\Pet;
use App\Models\Boarding;
use App\Models\InventoryItem;
use App\Models\Appointment;

class E2ESeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create role users for E2E tests - fixed accounts for stable testing
        $roles = [
            ['email' => 'admin@test.com', 'name' => 'E2E Admin', 'role' => 'admin'],
            ['email' => 'manager@test.com', 'name' => 'E2E Manager', 'role' => 'manager'],
            ['email' => 'veterinary@test.com', 'name' => 'E2E Vet', 'role' => 'veterinary'],
            ['email' => 'cashier@test.com', 'name' => 'E2E Cashier', 'role' => 'cashier'],
            ['email' => 'inventory@test.com', 'name' => 'E2E Inventory', 'role' => 'inventory'],
            ['email' => 'receptionist@test.com', 'name' => 'E2E Receptionist', 'role' => 'receptionist'],
            ['email' => 'payroll@test.com', 'name' => 'E2E Payroll', 'role' => 'payroll'],
            ['email' => 'customer@test.com', 'name' => 'E2E Customer', 'role' => 'customer'],
        ];

        foreach ($roles as $r) {
            User::updateOrCreate(
                ['email' => $r['email']],
                [
                    'name' => $r['name'],
                    'email' => $r['email'],
                    'password' => Hash::make('password123'),
                    'role' => $r['role'],
                    'is_active' => true,
                ]
            );
        }

        // Create a sample customer and pet
        $customer = Customer::updateOrCreate(
            ['email' => 'e2e-customer-profile@example.com'],
            ['name' => 'E2E Customer Profile', 'phone' => '0900000000']
        );

        $pet = Pet::updateOrCreate(
            ['name' => 'E2E Pet', 'customer_id' => $customer->id],
            ['species' => 'Dog', 'breed' => 'Mixed', 'age' => 3]
        );

        // Create a boarding (current boarder)
        Boarding::create([
            'pet_id' => $pet->id,
            'customer_id' => $customer->id,
            'hotel_room_id' => null,
            'check_in' => now()->subDay(),
            'check_out' => now()->addDays(2),
            'status' => 'confirmed',
            'total_amount' => 100.00,
            'payment_status' => 'paid',
        ]);

        // Create inventory item
        InventoryItem::updateOrCreate(
            ['name' => 'E2E Test Item'],
            ['category' => 'Accessories', 'stock' => 10, 'reorder_level' => 5, 'price' => 9.99]
        );

        // Create an appointment
        Appointment::create([
            'customer_id' => $customer->id,
            'pet_id' => $pet->id,
            'service_id' => null,
            'veterinarian_id' => User::where('role', 'veterinary')->value('id'),
            'status' => 'approved',
            'scheduled_at' => now()->addDay(),
            'price' => 50.00,
        ]);
    }
}
