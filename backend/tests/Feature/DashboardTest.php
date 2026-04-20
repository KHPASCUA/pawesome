<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Pet;
use App\Models\InventoryItem;
use App\Models\Sale;
use App\Models\Customer;
use Illuminate\Support\Carbon;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function createUserWithRole(string $role): User
    {
        return User::create([
            'name' => ucfirst($role) . ' User',
            'first_name' => 'Test',
            'last_name' => 'User',
            'username' => $role . '_test_' . uniqid(),
            'email' => $role . '_test_' . uniqid() . '@example.com',
            'password' => bcrypt('password'),
            'role' => $role,
            'is_active' => true,
            'api_token' => bcrypt(uniqid()),
        ]);
    }

    protected function authHeader(User $user): array
    {
        return ['Authorization' => 'Bearer ' . $user->api_token];
    }

    /** @test */
    public function veterinary_dashboard_returns_expected_data_structure(): void
    {
        $vet = $this->createUserWithRole('veterinary');
        
        // Create test data
        $today = Carbon::today();
        Appointment::factory()->count(3)->create([
            'scheduled_at' => $today,
            'status' => 'scheduled'
        ]);
        Pet::factory()->count(5)->create();

        $response = $this->withHeaders($this->authHeader($vet))
            ->getJson('/api/veterinary/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'today_appointments',
                'pending_appointments',
                'completed_appointments',
                'total_patients',
                'new_patients_this_month',
                'upcoming_appointments',
                'recent_patients',
                'appointments_by_type'
            ]);
    }

    /** @test */
    public function receptionist_dashboard_returns_expected_data_structure(): void
    {
        $receptionist = $this->createUserWithRole('receptionist');
        
        $today = Carbon::today();
        Appointment::factory()->count(2)->create([
            'scheduled_at' => $today,
            'status' => 'confirmed'
        ]);
        Customer::factory()->count(3)->create();
        Pet::factory()->count(4)->create();

        $response = $this->withHeaders($this->authHeader($receptionist))
            ->getJson('/api/receptionist/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'today_appointments',
                'pending_appointments',
                'confirmed_appointments',
                'completed_appointments',
                'total_customers',
                'total_pets',
                'check_ins_today',
                'upcoming_appointments',
                'recent_customers'
            ]);
    }

    /** @test */
    public function inventory_dashboard_returns_expected_data_structure(): void
    {
        $inventory = $this->createUserWithRole('inventory');
        
        InventoryItem::factory()->count(10)->create(['stock' => 50]);
        InventoryItem::factory()->count(3)->create(['stock' => 0]);
        InventoryItem::factory()->count(2)->create(['stock' => 5, 'reorder_level' => 10]);

        $response = $this->withHeaders($this->authHeader($inventory))
            ->getJson('/api/inventory/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_items',
                'low_stock_items',
                'out_of_stock_items',
                'expiring_soon',
                'total_stock_value',
                'recent_transactions',
                'critical_items',
                'inventory_changes_today'
            ]);
    }

    /** @test */
    public function cashier_dashboard_returns_expected_data_structure(): void
    {
        $cashier = $this->createUserWithRole('cashier');
        
        Sale::factory()->count(5)->create(['created_at' => Carbon::today()]);
        Sale::factory()->count(3)->create(['created_at' => Carbon::now()->subDays(5)]);

        $response = $this->withHeaders($this->authHeader($cashier))
            ->getJson('/api/cashier/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'today_sales',
                'today_transactions',
                'monthly_sales',
                'monthly_transactions',
                'pending_payments',
                'completed_payments',
                'recent_sales',
                'sales_by_type'
            ]);
    }

    /** @test */
    public function manager_dashboard_returns_expected_data_structure(): void
    {
        $manager = $this->createUserWithRole('manager');
        
        User::factory()->count(5)->create(['role' => 'staff']);
        Appointment::factory()->count(3)->create();

        $response = $this->withHeaders($this->authHeader($manager))
            ->getJson('/api/manager/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_staff',
                'active_staff',
                'today_appointments',
                'pending_appointments',
                'completed_appointments',
                'today_revenue',
                'monthly_revenue',
                'staff_performance'
            ]);
    }

    /** @test */
    public function customer_dashboard_returns_expected_data_structure(): void
    {
        $user = $this->createUserWithRole('customer');
        $customer = Customer::factory()->create(['email' => $user->email]);
        
        Appointment::factory()->count(2)->create([
            'customer_id' => $customer->id,
            'status' => 'scheduled'
        ]);
        Pet::factory()->count(2)->create(['customer_id' => $customer->id]);

        $response = $this->withHeaders($this->authHeader($user))
            ->getJson('/api/customer/overview');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'active_bookings',
                'total_pets',
                'completed_services',
                'loyalty_points',
                'upcoming_appointments',
                'recent_bookings'
            ]);
    }

    /** @test */
    public function admin_can_access_chatbot_logs(): void
    {
        $admin = $this->createUserWithRole('admin');

        $response = $this->withHeaders($this->authHeader($admin))
            ->getJson('/api/admin/chatbot/logs');

        $response->assertStatus(200);
    }

    /** @test */
    public function unauthorized_users_cannot_access_dashboards(): void
    {
        $customer = $this->createUserWithRole('customer');

        $response = $this->withHeaders($this->authHeader($customer))
            ->getJson('/api/admin/dashboard');

        $response->assertStatus(403);
    }
}
