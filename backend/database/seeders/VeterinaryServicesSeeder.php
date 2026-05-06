<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;

class VeterinaryServicesSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'name' => 'General Consultation',
                'category' => 'Consultation',
                'description' => 'General health check-up and consultation',
                'price' => 50.00,
                'duration' => 30,
                'is_active' => true,
            ],
            [
                'name' => 'Vaccination',
                'category' => 'Preventive Care',
                'description' => 'Core and optional vaccinations',
                'price' => 35.00,
                'duration' => 20,
                'is_active' => true,
            ],
            [
                'name' => 'Dental Cleaning',
                'category' => 'Dental Care',
                'description' => 'Professional dental cleaning and polishing',
                'price' => 120.00,
                'duration' => 60,
                'is_active' => true,
            ],
            [
                'name' => 'Spay/Neuter',
                'category' => 'Surgery',
                'description' => 'Spaying or neutering procedure',
                'price' => 200.00,
                'duration' => 90,
                'is_active' => true,
            ],
            [
                'name' => 'X-Ray',
                'category' => 'Diagnostics',
                'description' => 'Digital radiography services',
                'price' => 80.00,
                'duration' => 30,
                'is_active' => true,
            ],
            [
                'name' => 'Blood Work',
                'category' => 'Diagnostics',
                'description' => 'Complete blood count and chemistry panel',
                'price' => 65.00,
                'duration' => 15,
                'is_active' => true,
            ],
            [
                'name' => 'Emergency Visit',
                'category' => 'Emergency',
                'description' => 'Emergency medical care',
                'price' => 150.00,
                'duration' => 45,
                'is_active' => true,
            ],
            [
                'name' => 'Grooming',
                'category' => 'Grooming',
                'description' => 'Full grooming service including bath and haircut',
                'price' => 60.00,
                'duration' => 120,
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
