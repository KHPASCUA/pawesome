<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DemoAccountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $demoAccounts = [
            [
                'name' => 'Demo Admin',
                'email' => 'admin@demo.com',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Demo Customer',
                'email' => 'customer@demo.com',
                'password' => Hash::make('password123'),
                'role' => 'customer',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Demo Receptionist',
                'email' => 'reception@demo.com',
                'password' => Hash::make('password123'),
                'role' => 'receptionist',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Demo Cashier',
                'email' => 'cashier@demo.com',
                'password' => Hash::make('password123'),
                'role' => 'cashier',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Demo Inventory Staff',
                'email' => 'inventory@demo.com',
                'password' => Hash::make('password123'),
                'role' => 'inventory',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Demo Veterinarian',
                'email' => 'vet@demo.com',
                'password' => Hash::make('password123'),
                'role' => 'veterinary', // Check if system uses 'veterinary' or 'vet'
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Demo Manager',
                'email' => 'manager@demo.com',
                'password' => Hash::make('password123'),
                'role' => 'manager',
                'email_verified_at' => now(),
            ],
        ];

        foreach ($demoAccounts as $account) {
            User::updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => $account['password'],
                    'role' => $account['role'],
                    'email_verified_at' => $account['email_verified_at'],
                ]
            );
        }

        $this->command->info('Demo accounts created/updated successfully.');
    }
}
