<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DemoUsersSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            ['username' => 'admin', 'name' => 'Administrator', 'role' => 'admin', 'password' => 'password'],
            ['username' => 'payroll', 'name' => 'Payroll Manager', 'role' => 'payroll', 'password' => 'password'],
            ['username' => 'customer', 'name' => 'Customer', 'role' => 'customer', 'password' => 'password'],
            ['username' => 'receptionist', 'name' => 'Receptionist', 'role' => 'receptionist', 'password' => 'password'],
            ['username' => 'vet', 'name' => 'Veterinarian', 'role' => 'veterinary', 'password' => 'password'],
            ['username' => 'inventory', 'name' => 'Inventory Manager', 'role' => 'inventory', 'password' => 'password'],
            ['username' => 'cashier', 'name' => 'Cashier', 'role' => 'cashier', 'password' => 'password'],
            ['username' => 'manager', 'name' => 'Manager', 'role' => 'manager', 'password' => 'password'],
        ];

        foreach ($accounts as $account) {
            User::updateOrCreate(
                ['username' => $account['username']],
                [
                    'first_name' => $account['name'],
                    'last_name' => '',
                    'name' => $account['name'],
                    'email' => $account['username'].'@example.com',
                    'password' => Hash::make($account['password']),
                    'role' => $account['role'],
                    'is_active' => true,
                ]
            );
        }
    }
}
