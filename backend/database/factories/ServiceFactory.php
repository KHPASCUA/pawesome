<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->words(2, true),
            'category' => $this->faker->randomElement(['Grooming', 'Consultation', 'Vaccination', 'Surgery', 'Dental', 'Boarding', 'Other']),
            'price' => $this->faker->randomFloat(2, 50, 500),
            'description' => $this->faker->sentence(),
            'duration' => $this->faker->numberBetween(15, 120),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
