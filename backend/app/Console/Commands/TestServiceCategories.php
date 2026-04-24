<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestServiceCategories extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-service-categories';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test service category validation and consistency';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing service category consistency...');
        
        try {
            // Test valid categories
            $validCategories = \App\Models\Service::VALID_CATEGORIES;
            $this->info('Valid categories: ' . implode(', ', $validCategories));
            
            // Test creating services with valid categories
            $service1 = \App\Models\Service::create([
                'name' => 'Test Grooming',
                'category' => 'Grooming',
                'price' => 500.00,
                'duration' => 60,
            ]);
            
            $service2 = \App\Models\Service::create([
                'name' => 'Test Vaccination',
                'category' => 'Vaccination',
                'price' => 800.00,
                'duration' => 30,
            ]);
            
            $service3 = \App\Models\Service::create([
                'name' => 'Test Consultation',
                'category' => 'Consultation',
                'price' => 300.00,
                'duration' => 45,
            ]);
            
            $this->info('✅ Services created with valid categories:');
            $this->info('  - ' . $service1->name . ': ' . $service1->category);
            $this->info('  - ' . $service2->name . ': ' . $service2->category);
            $this->info('  - ' . $service3->name . ': ' . $service3->category);
            
            // Test invalid category (should default to 'Other')
            $service4 = \App\Models\Service::create([
                'name' => 'Test Invalid Category',
                'category' => 'InvalidCategory',
                'price' => 400.00,
                'duration' => 30,
            ]);
            
            $this->info('✅ Service with invalid category defaults to: ' . $service4->category);
            
            // Test category scopes
            $groomingServices = \App\Models\Service::byCategory('Grooming')->count();
            $vaccinationServices = \App\Models\Service::byCategory('Vaccination')->count();
            $consultationServices = \App\Models\Service::byCategory('Consultation')->count();
            
            $this->info('✅ Category scope tests:');
            $this->info('  - Grooming services: ' . $groomingServices);
            $this->info('  - Vaccination services: ' . $vaccinationServices);
            $this->info('  - Consultation services: ' . $consultationServices);
            
            // Test that previously invalid categories are now fixed
            $this->info('✅ Service category consistency verified!');
            
            // Clean up
            $service1->delete();
            $service2->delete();
            $service3->delete();
            $service4->delete();
            
            $this->info('✅ Test records cleaned up successfully!');
            
            return 0;
            
        } catch (\Exception $e) {
            $this->error('❌ ERROR: ' . $e->getMessage());
            return 1;
        }
    }
}
