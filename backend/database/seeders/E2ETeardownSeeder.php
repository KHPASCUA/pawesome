<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Customer;
use App\Models\Pet;
use App\Models\InventoryItem;
use App\Models\Service;

class E2ETeardownSeeder extends Seeder
{
    /**
     * Run the teardown to remove E2E test data.
     *
     * @return void
     */
    public function run()
    {
        $e2eEmails = [
            'admin@test.com',
            'manager@test.com',
            'veterinary@test.com',
            'cashier@test.com',
            'inventory@test.com',
            'receptionist@test.com',
            'payroll@test.com',
            'customer@test.com',
        ];

        User::whereIn('email', $e2eEmails)->delete();

        // Remove created sample customer/pet and inventory item
        Customer::where('email', 'e2e-customer-profile@example.com')->delete();
        Pet::where('name', 'E2E Pet')->delete();
        InventoryItem::where('name', 'E2E Test Item')->delete();
        Service::where('name', 'E2E Checkup')->delete();
    }
}
