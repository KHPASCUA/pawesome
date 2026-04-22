<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Boarding;
use App\Models\ChatbotLog;
use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use App\Models\Pet;
use App\Models\Sale;
use App\Models\Service;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // services
        $groom = Service::updateOrCreate(['name' => 'Grooming'], ['price' => 50]);
        $vet = Service::updateOrCreate(['name' => 'Vet Check'], ['price' => 80]);

        // customers + pets
        $cust = Customer::updateOrCreate(['email' => 'customer@example.com'], [
            'name' => 'Demo Customer',
            'phone' => '09171234567',
            'address' => '123 Demo St'
        ]);
        $pet = Pet::updateOrCreate(['name' => 'Buddy', 'customer_id' => $cust->id], [
            'species' => 'Dog', 'breed' => 'Labrador'
        ]);

        // appointments
        Appointment::create([
            'customer_id' => $cust->id,
            'pet_id' => $pet->id,
            'service_id' => $groom->id,
            'status' => 'pending',
            'scheduled_at' => now()->addHours(2),
            'price' => 50,
        ]);

        // boarding
        Boarding::create([
            'pet_id' => $pet->id,
            'check_in' => now()->subDay(),
            'check_out' => null,
            'status' => 'checked_in',
        ]);

        // sales
        Sale::create([
            'amount' => 120, 
            'type' => 'appointment',
            'transaction_number' => 'TXN-' . strtoupper(Str::random(8)),
            'status' => 'completed',
            'total_amount' => 120
        ]);
        Sale::create([
            'amount' => 200, 
            'type' => 'boarding',
            'transaction_number' => 'TXN-' . strtoupper(Str::random(8)),
            'status' => 'completed',
            'total_amount' => 200
        ]);

        // inventory
        $item = InventoryItem::updateOrCreate(['sku' => 'FOOD-001'], [
            'name' => 'Dog Food Bag',
            'stock' => 3,
            'reorder_level' => 5,
            'price' => 25,
            'expiry_date' => now()->addMonths(2),
        ]);
        InventoryLog::create(['inventory_item_id' => $item->id, 'delta' => -2, 'reason' => 'Sample use']);

        // chatbot logs
        ChatbotLog::create(['type' => 'inquiry', 'message' => 'What is your grooming price?']);
        ChatbotLog::create(['type' => 'booking', 'message' => 'Book grooming tomorrow']);
    }
}
