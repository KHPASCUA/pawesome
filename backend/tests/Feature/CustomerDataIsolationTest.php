<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Pet;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerDataIsolationTest extends TestCase
{
    use RefreshDatabase;

    private function customerUser(string $email): User
    {
        $user = User::factory()->create([
            'role' => 'customer',
            'email' => $email,
            'is_active' => true,
        ]);

        $user->plain_text_token = $user->createToken('test-token')->plainTextToken;

        return $user;
    }

    private function authHeader(User $user): array
    {
        return ['Authorization' => 'Bearer ' . $user->plain_text_token];
    }

    public function test_customer_cannot_read_or_update_another_customers_pet(): void
    {
        $userOne = $this->customerUser('one@example.com');
        $userTwo = $this->customerUser('two@example.com');

        $customerOne = Customer::factory()->create([
            'user_id' => $userOne->id,
            'email' => $userOne->email,
        ]);
        $customerTwo = Customer::factory()->create([
            'user_id' => $userTwo->id,
            'email' => $userTwo->email,
        ]);

        $ownPet = Pet::factory()->create(['customer_id' => $customerOne->id]);
        $otherPet = Pet::factory()->create(['customer_id' => $customerTwo->id]);

        $this->withHeaders($this->authHeader($userOne))
            ->getJson('/api/pets')
            ->assertOk()
            ->assertJsonFragment(['id' => $ownPet->id])
            ->assertJsonMissing(['id' => $otherPet->id]);

        $this->withHeaders($this->authHeader($userOne))
            ->getJson("/api/pets/{$otherPet->id}")
            ->assertNotFound();

        $this->withHeaders($this->authHeader($userOne))
            ->putJson("/api/pets/{$otherPet->id}", [
                'name' => 'Changed Name',
                'species' => 'Dog',
            ])
            ->assertNotFound();
    }

    public function test_customer_requests_are_scoped_to_authenticated_user_not_query_email(): void
    {
        $userOne = $this->customerUser('one@example.com');
        $userTwo = $this->customerUser('two@example.com');

        ServiceRequest::create([
            'customer_id' => $userOne->id,
            'customer_email' => $userOne->email,
            'customer_name' => 'User One',
            'pet_name' => 'Buddy',
            'request_type' => 'grooming',
            'service_name' => 'Grooming',
            'request_date' => now()->addDay()->toDateString(),
            'request_time' => '10:00',
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ]);
        $otherRequest = ServiceRequest::create([
            'customer_id' => $userTwo->id,
            'customer_email' => $userTwo->email,
            'customer_name' => 'User Two',
            'pet_name' => 'Max',
            'request_type' => 'vet',
            'service_name' => 'Vet',
            'request_date' => now()->addDay()->toDateString(),
            'request_time' => '11:00',
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ]);

        $this->withHeaders($this->authHeader($userOne))
            ->getJson('/api/customer/my-requests?email=' . urlencode($userTwo->email))
            ->assertOk()
            ->assertJsonMissing(['id' => $otherRequest->id]);
    }

    public function test_customer_cannot_use_staff_appointment_aliases(): void
    {
        $user = $this->customerUser('customer@example.com');

        $this->withHeaders($this->authHeader($user))
            ->getJson('/api/appointments')
            ->assertForbidden();

        $this->withHeaders($this->authHeader($user))
            ->postJson('/api/appointments', [])
            ->assertForbidden();
    }

    public function test_receptionist_request_alias_requires_authentication(): void
    {
        $this->getJson('/api/receptionist/requests')
            ->assertUnauthorized();
    }
}
