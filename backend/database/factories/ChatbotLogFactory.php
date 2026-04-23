<?php

namespace Database\Factories;

use App\Models\ChatbotLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ChatbotLog>
 */
class ChatbotLogFactory extends Factory
{
    protected $model = ChatbotLog::class;

    public function definition(): array
    {
        $intents = ['greeting', 'inquiry', 'booking', 'support', 'general'];
        $scopes = ['services', 'inventory', 'appointments', 'hotel', 'general'];
        $channels = ['web', 'telegram', 'facebook'];
        
        return [
            'user_id' => User::factory(),
            'role' => $this->faker->randomElement(['admin', 'cashier', 'customer', 'veterinary', 'receptionist']),
            'channel' => $this->faker->randomElement($channels),
            'type' => 'text',
            'intent' => $this->faker->randomElement($intents),
            'scope' => $this->faker->randomElement($scopes),
            'message' => $this->faker->sentence(),
            'response' => $this->faker->sentence(10),
            'user_message' => $this->faker->sentence(),
            'bot_response' => $this->faker->sentence(10),
            'metadata' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
            'role' => $user->role,
        ]);
    }

    public function withIntent(string $intent, string $scope = 'general'): static
    {
        return $this->state(fn (array $attributes) => [
            'intent' => $intent,
            'scope' => $scope,
        ]);
    }
}
