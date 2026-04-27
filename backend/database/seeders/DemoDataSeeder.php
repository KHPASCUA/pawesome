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
        // Boarding
        Service::updateOrCreate(['name' => 'Standard Boarding'], [
            'category' => 'Boarding',
            'price' => 279.67,
            'description' => 'Comprehensive daily boarding with basic care and feeding.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Premium Boarding'], [
            'category' => 'Boarding',
            'price' => 322.79,
            'description' => 'Enhanced boarding service with extra attention and playtime.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Luxury Suite'], [
            'category' => 'Boarding',
            'price' => 423.95,
            'description' => 'Premium suite with amenities and personalized care.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Extended Stay'], [
            'category' => 'Boarding',
            'price' => 218.97,
            'description' => 'Long-term boarding with special discounted rates.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Weekend Package'], [
            'category' => 'Boarding',
            'price' => 168.53,
            'description' => 'Weekend boarding package with all meals included.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Day Care'], [
            'category' => 'Boarding',
            'price' => 83.83,
            'description' => 'Daytime care and supervision for your pets.',
            'is_active' => true,
        ]);

        // Consultation
        Service::updateOrCreate(['name' => 'General Checkup'], [
            'category' => 'Consultation',
            'price' => 284.62,
            'description' => 'Comprehensive health examination and assessment.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Sick Visit'], [
            'category' => 'Consultation',
            'price' => 150.19,
            'description' => 'Examination for sick pets with treatment plan.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Follow-up Visit'], [
            'category' => 'Consultation',
            'price' => 195.30,
            'description' => 'Post-treatment checkup and progress monitoring.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Emergency Consult'], [
            'category' => 'Consultation',
            'price' => 488.81,
            'description' => 'Urgent care consultation for emergencies.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Vaccination Consult'], [
            'category' => 'Consultation',
            'price' => 115.00,
            'description' => 'Pre-vaccination health check and advice.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Specialist Referral'], [
            'category' => 'Consultation',
            'price' => 307.41,
            'description' => 'Referral to veterinary specialist when needed.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Telemedicine'], [
            'category' => 'Consultation',
            'price' => 105.70,
            'description' => 'Remote consultation via video call.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Nutrition Consult'], [
            'category' => 'Consultation',
            'price' => 187.45,
            'description' => 'Diet and nutrition advice for optimal health.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Behavioral Consult'], [
            'category' => 'Consultation',
            'price' => 199.21,
            'description' => 'Pet behavior assessment and training advice.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Senior Pet Checkup'], [
            'category' => 'Consultation',
            'price' => 202.61,
            'description' => 'Specialized care and health check for elderly pets.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Pre-surgery Exam'], [
            'category' => 'Consultation',
            'price' => 354.24,
            'description' => 'Complete health assessment before surgical procedures.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Post-surgery Check'], [
            'category' => 'Consultation',
            'price' => 160.83,
            'description' => 'Recovery monitoring after surgical procedures.',
            'is_active' => true,
        ]);

        // Dental
        Service::updateOrCreate(['name' => 'Teeth Cleaning'], [
            'category' => 'Dental',
            'price' => 167.42,
            'description' => 'Professional dental cleaning and polishing.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Dental Exam'], [
            'category' => 'Dental',
            'price' => 209.62,
            'description' => 'Complete oral health assessment and diagnosis.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Tooth Extraction'], [
            'category' => 'Dental',
            'price' => 305.26,
            'description' => 'Surgical tooth removal when necessary.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Dental X-ray'], [
            'category' => 'Dental',
            'price' => 375.70,
            'description' => 'Digital dental imaging for diagnosis.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Periodontal Treatment'], [
            'category' => 'Dental',
            'price' => 437.44,
            'description' => 'Advanced gum disease treatment and care.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Polishing'], [
            'category' => 'Dental',
            'price' => 222.04,
            'description' => 'Teeth polishing after cleaning procedures.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Oral Hygiene Consult'], [
            'category' => 'Dental',
            'price' => 404.07,
            'description' => 'Dental care education and home care advice.',
            'is_active' => true,
        ]);

        // Grooming
        $groom = Service::updateOrCreate(['name' => 'Full Grooming'], [
            'category' => 'Grooming',
            'price' => 334.86,
            'description' => 'Complete grooming service including bath and styling.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Bath & Dry'], [
            'category' => 'Grooming',
            'price' => 305.58,
            'description' => 'Bathing and professional blow-dry service.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Basic Trim'], [
            'category' => 'Grooming',
            'price' => 176.21,
            'description' => 'Simple coat trimming and maintenance.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Nail Trimming'], [
            'category' => 'Grooming',
            'price' => 179.15,
            'description' => 'Professional nail care and filing.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Ear Cleaning'], [
            'category' => 'Grooming',
            'price' => 290.78,
            'description' => 'Ear cleaning and treatment for healthy ears.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Flea Treatment'], [
            'category' => 'Grooming',
            'price' => 332.52,
            'description' => 'Flea prevention and removal treatment.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'De-shedding'], [
            'category' => 'Grooming',
            'price' => 239.13,
            'description' => 'Specialized shedding control and treatment.',
            'is_active' => true,
        ]);

        // Other
        Service::updateOrCreate(['name' => 'Grooming'], [
            'category' => 'Other',
            'price' => 50.00,
            'description' => 'Basic grooming service for quick maintenance.',
            'is_active' => true,
        ]);
        $vet = Service::updateOrCreate(['name' => 'Vet Check'], [
            'category' => 'Other',
            'price' => 80.00,
            'description' => 'Quick health check and wellness assessment.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Pet Transport'], [
            'category' => 'Other',
            'price' => 349.28,
            'description' => 'Safe and comfortable pet transportation service.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Pet Sitting'], [
            'category' => 'Other',
            'price' => 158.67,
            'description' => 'In-home pet care and supervision.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Pet Training'], [
            'category' => 'Other',
            'price' => 450.17,
            'description' => 'Basic obedience training and behavior modification.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Microchipping'], [
            'category' => 'Other',
            'price' => 214.40,
            'description' => 'Pet identification implant for safety.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Pet Photography'], [
            'category' => 'Other',
            'price' => 197.60,
            'description' => 'Professional pet photos and portraits.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Pet Spa Day'], [
            'category' => 'Other',
            'price' => 385.71,
            'description' => 'Full pampering experience for your pet.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Pet Taxi'], [
            'category' => 'Other',
            'price' => 57.10,
            'description' => 'Local pet transportation service.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Pet Boarding'], [
            'category' => 'Other',
            'price' => 208.53,
            'description' => 'Short-term pet accommodation and care.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Pet Walking'], [
            'category' => 'Other',
            'price' => 329.59,
            'description' => 'Daily exercise and walking service.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Overnight Pet Sitting'], [
            'category' => 'Other',
            'price' => 193.55,
            'description' => 'Overnight in-home pet care service.',
            'is_active' => true,
        ]);

        // Surgery
        Service::updateOrCreate(['name' => 'Minor Surgery'], [
            'category' => 'Surgery',
            'price' => 279.46,
            'description' => 'Minor surgical procedures with proper care.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Major Surgery'], [
            'category' => 'Surgery',
            'price' => 482.71,
            'description' => 'Complex surgical operations with full support.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Spay/Neuter'], [
            'category' => 'Surgery',
            'price' => 63.36,
            'description' => 'Sterilization procedure for population control.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Soft Tissue Surgery'], [
            'category' => 'Surgery',
            'price' => 228.25,
            'description' => 'Internal organ procedures and treatment.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Orthopedic Surgery'], [
            'category' => 'Surgery',
            'price' => 249.60,
            'description' => 'Bone and joint surgery and rehabilitation.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Dental Surgery'], [
            'category' => 'Surgery',
            'price' => 222.41,
            'description' => 'Oral surgical procedures and treatment.',
            'is_active' => true,
        ]);

        // Vaccination
        Service::updateOrCreate(['name' => 'Full Vaccine Package'], [
            'category' => 'Vaccination',
            'price' => 464.23,
            'description' => 'Complete vaccination series for full protection.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Single Vaccine'], [
            'category' => 'Vaccination',
            'price' => 184.78,
            'description' => 'Individual vaccination shot for specific protection.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Booster Shot'], [
            'category' => 'Vaccination',
            'price' => 288.70,
            'description' => 'Vaccination booster for continued immunity.',
            'is_active' => true,
        ]);
        Service::updateOrCreate(['name' => 'Rabies Vaccine'], [
            'category' => 'Vaccination',
            'price' => 248.55,
            'description' => 'Rabies prevention vaccine for safety.',
            'is_active' => true,
        ]);

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
