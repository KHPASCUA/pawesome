<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\GiftCard;
use App\Models\InventoryItem;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CashierTestDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create sample customers with loyalty points
        $customers = [
            [
                'name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'phone' => '09123456789',
                'address' => '123 Main St',
                'loyalty_points' => 500,
                'is_active' => true,
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane.smith@example.com',
                'phone' => '09876543210',
                'address' => '456 Oak Ave',
                'loyalty_points' => 300,
                'is_active' => true,
            ],
            [
                'name' => 'Bob Johnson',
                'email' => 'bob.johnson@example.com',
                'phone' => '09112223344',
                'address' => '789 Pine Rd',
                'loyalty_points' => 150,
                'is_active' => true,
            ],
        ];

        foreach ($customers as $customerData) {
            Customer::firstOrCreate(
                ['email' => $customerData['email']],
                $customerData
            );
        }

        // Create sample gift cards
        $giftCards = [
            [
                'number' => 'GC123456789',
                'balance' => 500.00,
                'is_active' => true,
                'issued_at' => now(),
                'expires_at' => now()->addYear(),
            ],
            [
                'number' => 'GC987654321',
                'balance' => 1000.00,
                'is_active' => true,
                'issued_at' => now(),
                'expires_at' => now()->addYear(),
            ],
            [
                'number' => 'GC555555555',
                'balance' => 250.00,
                'is_active' => true,
                'issued_at' => now(),
                'expires_at' => now()->addYear(),
            ],
        ];

        foreach ($giftCards as $giftCardData) {
            GiftCard::firstOrCreate(
                ['number' => $giftCardData['number']],
                $giftCardData
            );
        }

        // Create sample sales transactions
        $cashier = User::where('role', 'cashier')->first();
        $customer1 = Customer::where('email', 'john.doe@example.com')->first();
        $customer2 = Customer::where('email', 'jane.smith@example.com')->first();
        $product1 = InventoryItem::first();
        $product2 = InventoryItem::skip(1)->first();

        if ($cashier && $product1) {
            // Add barcode to products for testing
            if ($product1 && !$product1->barcode) {
                $product1->barcode = '1234567890123';
                $product1->save();
            }
            if ($product2 && !$product2->barcode) {
                $product2->barcode = '9876543210987';
                $product2->save();
            }

            $sales = [
                [
                    'customer_id' => $customer1?->id,
                    'cashier_id' => $cashier->id,
                    'product_id' => $product1->id,
                    'transaction_number' => 'TRX-' . strtoupper(uniqid()),
                    'type' => 'product',
                    'status' => 'completed',
                    'payment_type' => 'cash',
                    'amount' => 500.00,
                    'total_amount' => 500.00,
                    'notes' => 'Sample transaction',
                    'created_at' => now()->subDays(1),
                ],
                [
                    'customer_id' => $customer2?->id,
                    'cashier_id' => $cashier->id,
                    'product_id' => $product2?->id,
                    'transaction_number' => 'TRX-' . strtoupper(uniqid()),
                    'type' => 'product',
                    'status' => 'completed',
                    'payment_type' => 'card',
                    'amount' => 750.00,
                    'total_amount' => 750.00,
                    'notes' => 'Sample transaction',
                    'created_at' => now()->subDays(2),
                ],
                [
                    'customer_id' => null,
                    'cashier_id' => $cashier->id,
                    'product_id' => $product1->id,
                    'transaction_number' => 'TRX-' . strtoupper(uniqid()),
                    'type' => 'product',
                    'status' => 'completed',
                    'payment_type' => 'gcash',
                    'amount' => 300.00,
                    'total_amount' => 300.00,
                    'notes' => 'Guest transaction',
                    'created_at' => now()->subHours(5),
                ],
            ];

            foreach ($sales as $saleData) {
                Sale::create($saleData);
            }
        }

        $this->command->info('Cashier test data seeded successfully.');
    }
}
