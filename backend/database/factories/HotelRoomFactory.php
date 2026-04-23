<?php

namespace Database\Factories;

use App\Models\HotelRoom;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HotelRoom>
 */
class HotelRoomFactory extends Factory
{
    protected $model = HotelRoom::class;

    public function definition(): array
    {
        $types = ['standard', 'deluxe', 'suite'];
        $sizes = ['small', 'medium', 'large'];
        
        return [
            'room_number' => $this->faker->unique()->numberBetween(100, 999),
            'name' => $this->faker->words(2, true),
            'type' => $this->faker->randomElement($types),
            'size' => $this->faker->randomElement($sizes),
            'capacity' => $this->faker->numberBetween(1, 5),
            'daily_rate' => $this->faker->randomFloat(2, 500, 3000),
            'status' => 'available',
            'description' => $this->faker->sentence(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    public function occupied(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'occupied',
        ]);
    }

    public function maintenance(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'maintenance',
        ]);
    }
}
