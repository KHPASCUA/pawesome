<?php

namespace Database\Factories;

use App\Models\Pet;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pet>
 */
class PetFactory extends Factory
{
    protected $model = Pet::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'name' => $this->faker->firstName(),
            'species' => $this->faker->randomElement(['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish']),
            'breed' => $this->faker->word(),
            'birth_date' => $this->faker->dateTimeBetween('-15 years', '-1 year')->format('Y-m-d'),
            'notes' => $this->faker->sentence(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
