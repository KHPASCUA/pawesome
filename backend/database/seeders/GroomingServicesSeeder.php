<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;

class GroomingServicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $groomingServices = [
            [
                'name' => 'Basic Bath',
                'category' => 'Grooming',
                'price' => 500.00,
                'description' => 'Complete bath with shampoo and blow dry',
                'is_active' => true,
                'duration' => 45,
            ],
            [
                'name' => 'Full Grooming Package',
                'category' => 'Grooming',
                'price' => 1500.00,
                'description' => 'Bath, haircut, nail trim, and ear cleaning',
                'is_active' => true,
                'duration' => 90,
            ],
            [
                'name' => 'Haircut Only',
                'category' => 'Grooming',
                'price' => 800.00,
                'description' => 'Professional haircut and styling',
                'is_active' => true,
                'duration' => 60,
            ],
            [
                'name' => 'Nail Trim',
                'category' => 'Grooming',
                'price' => 200.00,
                'description' => 'Quick nail trimming and filing',
                'is_active' => true,
                'duration' => 15,
            ],
            [
                'name' => 'Teeth Cleaning',
                'category' => 'Grooming',
                'price' => 350.00,
                'description' => 'Professional teeth cleaning and polish',
                'is_active' => true,
                'duration' => 30,
            ],
        ];

        foreach ($groomingServices as $service) {
            Service::updateOrCreate(
                ['name' => $service['name']],
                $service
            );
        }

        $this->command->info('Grooming services seeded successfully.');
    }
}
