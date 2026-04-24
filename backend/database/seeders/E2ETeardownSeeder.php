<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Customer;
use App\Models\Pet;
use App\Models\InventoryItem;

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
            'e2e-admin@example.com',
            'e2e-manager@example.com',
            'e2e-vet@example.com',
            'e2e-cashier@example.com',
            'e2e-inventory@example.com',
            'e2e-receptionist@example.com',
            'e2e-customer@example.com',
        ];

        User::whereIn('email', $e2eEmails)->delete();

        // Remove created sample customer/pet and inventory item
        Customer::where('email', 'e2e-customer-profile@example.com')->delete();
        Pet::where('name', 'E2E Pet')->delete();
        InventoryItem::where('name', 'E2E Test Item')->delete();
    }
}
