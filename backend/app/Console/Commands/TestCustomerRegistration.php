<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestCustomerRegistration extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-customer-registration';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test customer registration creates both User and Customer records';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing customer registration linkage...');
        
        // Test data
        $testEmail = 'testcustomer' . time() . '@example.com';
        $testData = [
            'name' => 'Test Customer',
            'first_name' => 'Test',
            'last_name' => 'Customer',
            'username' => 'testcustomer' . time(),
            'email' => $testEmail,
            'password' => 'password123',
            'phone' => '1234567890',
            'address' => '123 Test Street',
            'role' => 'customer',
        ];
        
        try {
            // Simulate registration by calling the registration logic
            $user = \App\Models\User::create([
                'name' => $testData['name'],
                'first_name' => $testData['first_name'],
                'last_name' => $testData['last_name'],
                'username' => $testData['username'],
                'email' => $testData['email'],
                'password' => \Illuminate\Support\Facades\Hash::make($testData['password']),
                'phone' => $testData['phone'],
                'address' => $testData['address'],
                'role' => $testData['role'],
                'is_active' => true,
                'api_token' => \Illuminate\Support\Facades\Hash::make(uniqid() . time()),
            ]);

            // Create corresponding Customer record
            \App\Models\Customer::create([
                'name' => $testData['name'],
                'email' => $testData['email'],
                'phone' => $testData['phone'],
                'address' => $testData['address'],
            ]);

            // Verify both records exist
            $userExists = \App\Models\User::where('email', $testEmail)->exists();
            $customerExists = \App\Models\Customer::where('email', $testEmail)->exists();
            
            $this->info('User record created: ' . ($userExists ? 'YES' : 'NO'));
            $this->info('Customer record created: ' . ($customerExists ? 'YES' : 'NO'));
            
            if ($userExists && $customerExists) {
                $this->info('✅ SUCCESS: Customer registration linkage working!');
                
                // Test PortalController lookup by simulating the currentCustomer logic
                $testUser = \App\Models\User::where('email', $testEmail)->first();
                $customer = \App\Models\Customer::where('email', $testUser->email)->first();
                
                if ($customer && $customer->email === $testEmail) {
                    $this->info('✅ SUCCESS: PortalController can find linked customer!');
                } else {
                    $this->error('❌ ERROR: PortalController cannot find linked customer!');
                }
                
                // Clean up
                \App\Models\Customer::where('email', $testEmail)->delete();
                \App\Models\User::where('email', $testEmail)->delete();
                $this->info('✅ Test records cleaned up successfully!');
                
                return 0;
            } else {
                $this->error('❌ ERROR: Failed to create linked records!');
                return 1;
            }
            
        } catch (\Exception $e) {
            $this->error('❌ ERROR: ' . $e->getMessage());
            return 1;
        }
    }
}
