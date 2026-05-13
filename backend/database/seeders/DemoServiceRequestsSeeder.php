<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceRequest;
use App\Models\Customer;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DemoServiceRequestsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get demo customer and pets
        $customer = Customer::where('email', 'customer@demo.com')->first();
        $vetUser = User::where('email', 'vet@demo.com')->first();
        
        if (!$customer || !$vetUser) {
            $this->command->error('Demo customer or vet not found. Please run other seeders first.');
            return;
        }

        $pets = Pet::where('customer_id', $customer->id)->get();
        $buddy = $pets->where('name', 'Buddy')->first();
        $luna = $pets->where('name', 'Luna')->first();

        // 1. Pending veterinary request for Buddy
        ServiceRequest::updateOrCreate(
            [
                'customer_id' => $customer->id,
                'pet_id' => $buddy->id,
                'request_type' => 'veterinary',
                'preferred_date' => Carbon::tomorrow()->format('Y-m-d'),
                'preferred_time' => '10:00',
            ],
            [
                'customer_name' => $customer->name,
                'pet_name' => $buddy->name,
                'service_name' => 'General Consultation',
                'request_date' => Carbon::today()->format('Y-m-d'),
                'request_time' => Carbon::now()->format('H:i'),
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'customer_email' => $customer->email,
            ]
        );

        // 2. Pending grooming request for Luna
        ServiceRequest::updateOrCreate(
            [
                'customer_id' => $customer->id,
                'pet_id' => $luna->id,
                'request_type' => 'grooming',
                'preferred_date' => Carbon::tomorrow()->format('Y-m-d'),
                'preferred_time' => '14:00',
            ],
            [
                'customer_name' => $customer->name,
                'pet_name' => $luna->name,
                'service_name' => 'Full Grooming Package',
                'request_date' => Carbon::today()->format('Y-m-d'),
                'request_time' => Carbon::now()->format('H:i'),
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'customer_email' => $customer->email,
            ]
        );

        // 3. Pending boarding request for Buddy
        ServiceRequest::updateOrCreate(
            [
                'customer_id' => $customer->id,
                'pet_id' => $buddy->id,
                'request_type' => 'boarding',
                'preferred_date' => Carbon::tomorrow()->format('Y-m-d'),
                'preferred_time' => '09:00',
            ],
            [
                'customer_name' => $customer->name,
                'pet_name' => $buddy->name,
                'service_name' => 'Standard Boarding',
                'request_date' => Carbon::today()->format('Y-m-d'),
                'request_time' => Carbon::now()->format('H:i'),
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'customer_email' => $customer->email,
                'notes' => 'Check-in: ' . Carbon::tomorrow()->format('Y-m-d') . ', Check-out: ' . Carbon::tomorrow()->addDays(3)->format('Y-m-d'),
            ]
        );

        // 4. Approved veterinary appointment for Buddy
        ServiceRequest::updateOrCreate(
            [
                'customer_id' => $customer->id,
                'pet_id' => $buddy->id,
                'request_type' => 'veterinary',
                'preferred_date' => Carbon::today()->addDays(2)->format('Y-m-d'),
                'preferred_time' => '11:00',
            ],
            [
                'customer_name' => $customer->name,
                'pet_name' => $buddy->name,
                'service_name' => 'Vaccination & Check-up',
                'request_date' => Carbon::yesterday()->format('Y-m-d'),
                'request_time' => '15:30',
                'status' => 'approved',
                'payment_status' => 'paid',
                'customer_email' => $customer->email,
                'approved_by' => $vetUser->id,
                'approved_at' => Carbon::yesterday()->setTime(16, 0),
                'receipt_number' => 'VET-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
                'paid_at' => Carbon::yesterday()->setTime(16, 30),
                'verified_by' => 1, // Assuming cashier ID 1
            ]
        );

        // 5. Approved grooming appointment
        ServiceRequest::updateOrCreate(
            [
                'customer_id' => $customer->id,
                'pet_id' => $luna->id,
                'request_type' => 'grooming',
                'preferred_date' => Carbon::today()->addDays(1)->format('Y-m-d'),
                'preferred_time' => '13:00',
            ],
            [
                'customer_name' => $customer->name,
                'pet_name' => $luna->name,
                'service_name' => 'Basic Grooming',
                'request_date' => Carbon::yesterday()->format('Y-m-d'),
                'request_time' => '10:15',
                'status' => 'approved',
                'payment_status' => 'unpaid',
                'customer_email' => $customer->email,
                'approved_by' => $vetUser->id,
                'approved_at' => Carbon::yesterday()->setTime(11, 0),
            ]
        );

        // 6. Approved boarding request
        ServiceRequest::updateOrCreate(
            [
                'customer_id' => $customer->id,
                'pet_id' => $buddy->id,
                'request_type' => 'boarding',
                'preferred_date' => Carbon::today()->addDays(3)->format('Y-m-d'),
                'preferred_time' => '10:00',
            ],
            [
                'customer_name' => $customer->name,
                'pet_name' => $buddy->name,
                'service_name' => 'Deluxe Boarding',
                'request_date' => Carbon::now()->subDays(2)->format('Y-m-d'),
                'request_time' => '09:00',
                'status' => 'approved',
                'payment_status' => 'unpaid',
                'customer_email' => $customer->email,
                'approved_by' => $vetUser->id,
                'approved_at' => Carbon::yesterday()->setTime(14, 0),
                'notes' => 'Check-in: ' . Carbon::today()->addDays(3)->format('Y-m-d') . ', Check-out: ' . Carbon::today()->addDays(6)->format('Y-m-d'),
            ]
        );

        // 7. Unpaid approved request ready for payment proof upload
        ServiceRequest::updateOrCreate(
            [
                'customer_id' => $customer->id,
                'pet_id' => $luna->id,
                'request_type' => 'veterinary',
                'preferred_date' => Carbon::today()->addDays(4)->format('Y-m-d'),
                'preferred_time' => '15:00',
            ],
            [
                'customer_name' => $customer->name,
                'pet_name' => $luna->name,
                'service_name' => 'Dental Check-up',
                'request_date' => Carbon::today()->format('Y-m-d'),
                'request_time' => '08:00',
                'status' => 'approved',
                'payment_status' => 'unpaid',
                'customer_email' => $customer->email,
                'approved_by' => $vetUser->id,
                'approved_at' => Carbon::now()->subHours(2),
            ]
        );

        // 8. Pending payment proof ready for cashier verification
        ServiceRequest::updateOrCreate(
            [
                'customer_id' => $customer->id,
                'pet_id' => $buddy->id,
                'request_type' => 'grooming',
                'preferred_date' => Carbon::today()->addDays(2)->format('Y-m-d'),
                'preferred_time' => '10:00',
            ],
            [
                'customer_name' => $customer->name,
                'pet_name' => $buddy->name,
                'service_name' => 'Premium Grooming',
                'request_date' => Carbon::yesterday()->format('Y-m-d'),
                'request_time' => '11:00',
                'status' => 'approved',
                'payment_status' => 'pending',
                'customer_email' => $customer->email,
                'approved_by' => $vetUser->id,
                'approved_at' => Carbon::yesterday()->setTime(12, 0),
                'payment_proof' => 'demo_payment_proof.jpg',
            ]
        );

        $this->command->info('Demo service requests created/updated successfully.');
    }
}
