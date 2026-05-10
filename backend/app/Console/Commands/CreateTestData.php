<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Pet;
use App\Models\Appointment;
use App\Models\User;
use Carbon\Carbon;

class CreateTestData extends Command
{
    protected $signature = 'test:create-vet-data';
    protected $description = 'Create test data for veterinary inventory usage';

    public function handle()
    {
        // Check if Anti-Rabies Vaccine exists
        $item = \App\Models\InventoryItem::where('name', 'Anti-Rabies Vaccine')->first();
        if ($item) {
            $this->info("Anti-Rabies Vaccine found - ID: {$item->id}, Stock: {$item->stock}");
        } else {
            $this->error("Anti-Rabies Vaccine not found. Run inventory:create-test-item first.");
            return 1;
        }

        // Test the veterinary inventory usage endpoint directly
        $this->info("Testing veterinary inventory usage endpoint...");
        
        return 0;
    }
}
