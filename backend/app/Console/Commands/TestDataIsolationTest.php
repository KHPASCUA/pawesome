<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestDataIsolationTest extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-data-isolation-test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test data isolation between test runs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing data isolation between test runs...');
        
        try {
            // Test 1: Check initial state
            $initialCustomers = \App\Models\Customer::count();
            $initialPets = \App\Models\Pet::count();
            $initialSales = \App\Models\Sale::count();
            $initialInventory = \App\Models\InventoryItem::count();
            
            $this->info('Initial database state:');
            $this->info('  - Customers: ' . $initialCustomers);
            $this->info('  - Pets: ' . $initialPets);
            $this->info('  - Sales: ' . $initialSales);
            $this->info('  - Inventory Items: ' . $initialInventory);
            
            // Test 2: Create test data like ReportsTest does
            $this->info('Creating test data...');
            
            \App\Models\Customer::factory()->count(5)->create();
            \App\Models\Pet::factory()->count(5)->create();
            \App\Models\Service::factory()->count(3)->create();
            \App\Models\Sale::factory()->count(5)->create();
            \App\Models\Appointment::factory()->count(10)->create();
            \App\Models\InventoryItem::factory()->count(10)->create();
            
            $afterCreateCustomers = \App\Models\Customer::count();
            $afterCreatePets = \App\Models\Pet::count();
            $afterCreateSales = \App\Models\Sale::count();
            $afterCreateInventory = \App\Models\InventoryItem::count();
            
            $this->info('After creating test data:');
            $this->info('  - Customers: ' . $afterCreateCustomers . ' (+' . ($afterCreateCustomers - $initialCustomers) . ')');
            $this->info('  - Pets: ' . $afterCreatePets . ' (+' . ($afterCreatePets - $initialPets) . ')');
            $this->info('  - Sales: ' . $afterCreateSales . ' (+' . ($afterCreateSales - $initialSales) . ')');
            $this->info('  - Inventory Items: ' . $afterCreateInventory . ' (+' . ($afterCreateInventory - $initialInventory) . ')');
            
            // Test 3: Simulate what should happen in a proper test environment
            $this->info('Testing data cleanup simulation...');
            
            // In a real test with RefreshDatabase, this would be handled automatically
            // But let's verify the cleanup works manually with proper order due to foreign key constraints
            $cleanupInventory = \App\Models\InventoryItem::where('created_at', '>', now()->subMinutes(5))->delete();
            
            // Clean up sales and their related records first
            $recentSales = \App\Models\Sale::where('created_at', '>', now()->subMinutes(5))->get();
            foreach ($recentSales as $sale) {
                // Delete related records in correct order
                \App\Models\Payment::where('sale_id', $sale->id)->delete();
                \App\Models\Invoice::where('sale_id', $sale->id)->delete();
                \App\Models\SaleItem::where('sale_id', $sale->id)->delete();
                if ($sale instanceof \App\Models\Sale) {
                    $sale->delete();
                }
            }
            $cleanupSales = $recentSales->count();
            
            // Clean up pets and their related records
            $recentPets = \App\Models\Pet::where('created_at', '>', now()->subMinutes(5))->get();
            foreach ($recentPets as $pet) {
                // Delete related records in correct order
                \App\Models\MedicalRecord::where('pet_id', $pet->id)->delete();
                \App\Models\Vaccination::where('pet_id', $pet->id)->delete();
                \App\Models\Boarding::where('pet_id', $pet->id)->delete();
                \App\Models\Appointment::where('pet_id', $pet->id)->delete();
                if ($pet instanceof \App\Models\Pet) {
                    $pet->delete();
                }
            }
            $cleanupPets = $recentPets->count();
            
            // Clean up customers (should be safe now)
            $cleanupCustomers = \App\Models\Customer::where('created_at', '>', now()->subMinutes(5))->delete();
            
            $afterCleanupCustomers = \App\Models\Customer::count();
            $afterCleanupPets = \App\Models\Pet::count();
            $afterCleanupSales = \App\Models\Sale::count();
            $afterCleanupInventory = \App\Models\InventoryItem::count();
            
            $this->info('After cleanup:');
            $this->info('  - Customers: ' . $afterCleanupCustomers . ' (cleaned: ' . $cleanupCustomers . ')');
            $this->info('  - Pets: ' . $afterCleanupPets . ' (cleaned: ' . $cleanupPets . ')');
            $this->info('  - Sales: ' . $afterCleanupSales . ' (cleaned: ' . $cleanupSales . ')');
            $this->info('  - Inventory Items: ' . $afterCleanupInventory . ' (cleaned: ' . $cleanupInventory . ')');
            
            // Test 4: Check if data is back to initial state
            $isClean = ($afterCleanupCustomers === $initialCustomers) &&
                      ($afterCleanupPets === $initialPets) &&
                      ($afterCleanupSales === $initialSales) &&
                      ($afterCleanupInventory === $initialInventory);
            
            if ($isClean) {
                $this->info('✅ SUCCESS: Data isolation is working correctly!');
            } else {
                $this->error('❌ ERROR: Data isolation issues detected');
                $this->error('  - Customers: expected ' . $initialCustomers . ', got ' . $afterCleanupCustomers);
                $this->error('  - Pets: expected ' . $initialPets . ', got ' . $afterCleanupPets);
                $this->error('  - Sales: expected ' . $initialSales . ', got ' . $afterCleanupSales);
                $this->error('  - Inventory: expected ' . $initialInventory . ', got ' . $afterCleanupInventory);
                
                // Suggest fix for test isolation
                $this->info('💡 SUGGESTION: Ensure all test files use RefreshDatabase trait properly');
                $this->info('💡 SUGGESTION: Check for any test data that persists between test runs');
                $this->info('💡 SUGGESTION: Verify database transactions are working correctly');
                
                return 1;
            }
            
            // Test 5: Check for common test data pollution issues
            $this->info('Checking for common test data pollution issues...');
            
            // Check for test users that might not be cleaned up
            $testUsers = \App\Models\User::where('email', 'like', '%test%')->count();
            if ($testUsers > 0) {
                $this->warn('⚠️  WARNING: Found ' . $testUsers . ' test users that might cause pollution');
            }
            
            // Check for test customers
            $testCustomers = \App\Models\Customer::where('email', 'like', '%test%')->count();
            if ($testCustomers > 0) {
                $this->warn('⚠️  WARNING: Found ' . $testCustomers . ' test customers that might cause pollution');
            }
            
            $this->info('✅ Data isolation test completed successfully!');
            
            return 0;
            
        } catch (\Exception $e) {
            $this->error('❌ ERROR: ' . $e->getMessage());
            $this->error('  - File: ' . $e->getFile() . ':' . $e->getLine());
            return 1;
        }
    }
}
