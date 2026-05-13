<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Customer;
use App\Models\Pet;
use Illuminate\Support\Facades\DB;

class DemoPetsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get the demo customer
        $demoUser = User::where('email', 'customer@demo.com')->first();
        $customer = Customer::where('user_id', $demoUser->id)->first();
        
        if (!$customer) {
            $this->command->error('Demo customer not found. Please run DemoAccountsSeeder first.');
            return;
        }

        $demoPets = [
            [
                'customer_id' => $customer->id,
                'name' => 'Buddy',
                'species' => 'Dog',
                'breed' => 'Golden Retriever',
                'age' => 3,
                'gender' => 'Male',
                'notes' => 'Friendly and active dog. Loves to play fetch.',
                'status' => 'active',
                'archived_at' => null,
            ],
            [
                'customer_id' => $customer->id,
                'name' => 'Luna',
                'species' => 'Cat',
                'breed' => 'Persian',
                'age' => 2,
                'gender' => 'Female',
                'notes' => 'Calm indoor cat. Requires regular grooming.',
                'status' => 'active',
                'archived_at' => null,
            ],
            [
                'customer_id' => $customer->id,
                'name' => 'Bubbles',
                'species' => 'Fish',
                'breed' => 'Goldfish',
                'age' => 1,
                'gender' => 'Unknown',
                'notes' => 'Aquatic fish. Requires aquarium care.',
                'status' => 'active',
                'archived_at' => null,
            ],
            [
                'customer_id' => $customer->id,
                'name' => 'Spike',
                'species' => 'Reptile',
                'breed' => 'Bearded Dragon',
                'age' => 4,
                'gender' => 'Male',
                'notes' => 'Exotic reptile. Requires temperature-controlled environment.',
                'status' => 'active',
                'archived_at' => null,
            ],
            [
                'customer_id' => $customer->id,
                'name' => 'Coco',
                'species' => 'Rabbit',
                'breed' => 'Holland Lop',
                'age' => 2,
                'gender' => 'Female',
                'notes' => 'Small animal. Requires special handling and cage.',
                'status' => 'active',
                'archived_at' => null,
            ],
        ];

        foreach ($demoPets as $petData) {
            Pet::updateOrCreate(
                [
                    'customer_id' => $petData['customer_id'],
                    'name' => $petData['name'],
                    'species' => $petData['species'],
                ],
                $petData
            );
        }

        $this->command->info('Demo pets created/updated successfully.');
    }
}
