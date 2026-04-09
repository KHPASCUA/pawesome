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
            ['username' => 'admin', 'name' => 'Administrator', 'role' => 'admin', 'password' => 'admin123'],
            ['username' => 'payroll', 'name' => 'Payroll Manager', 'role' => 'payroll', 'password' => 'payroll123'],
            ['username' => 'customer', 'name' => 'Customer', 'role' => 'customer', 'password' => 'customer123'],
            ['username' => 'receptionist', 'name' => 'Receptionist', 'role' => 'receptionist', 'password' => 'reception123'],
            ['username' => 'vet', 'name' => 'Veterinarian', 'role' => 'vet', 'password' => 'vet123'],
            ['username' => 'inventory', 'name' => 'Inventory Manager', 'role' => 'inventory', 'password' => 'inventory123'],
            ['username' => 'cashier', 'name' => 'Cashier', 'role' => 'cashier', 'password' => 'cashier123'],
            ['username' => 'manager', 'name' => 'Manager', 'role' => 'manager', 'password' => 'manager123'],
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
