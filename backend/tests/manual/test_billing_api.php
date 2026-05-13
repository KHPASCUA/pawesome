<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== BILLING API ENDPOINT TESTING ===" . PHP_EOL;

// Test the billing summary endpoint that ServiceBillingPanel uses
$testAppointments = [11, 14]; // Appointments with base service billing items

foreach ($testAppointments as $appointmentId) {
    echo PHP_EOL . "Testing Appointment ID: {$appointmentId}" . PHP_EOL;
    
    try {
        // Simulate the API call: /billing/veterinary/{serviceId}/summary
        $billing = \App\Services\ServiceBillingService::getItemizedBilling('veterinary', $appointmentId);
        $completionStatus = \App\Services\ServiceBillingService::canCompleteService('veterinary', $appointmentId);
        
        echo "  Billing Summary:" . PHP_EOL;
        echo "    Total Bill: ₱{$billing['total_bill']}" . PHP_EOL;
        echo "    Total Paid: ₱{$billing['total_paid']}" . PHP_EOL;
        echo "    Balance Due: ₱{$billing['balance_due']}" . PHP_EOL;
        echo "    Has Unpaid Balance: " . ($billing['has_unpaid_balance'] ? 'Yes' : 'No') . PHP_EOL;
        echo "    Billing Items Count: " . count($billing['items']) . PHP_EOL;
        
        echo "  Completion Status:" . PHP_EOL;
        echo "    Can Complete: " . ($completionStatus['can_complete'] ? 'Yes' : 'No') . PHP_EOL;
        echo "    Balance Due: ₱{$completionStatus['balance_due']}" . PHP_EOL;
        echo "    Message: {$completionStatus['message']}" . PHP_EOL;
        
        echo "  Itemized Billing:" . PHP_EOL;
        foreach ($billing['items'] as $item) {
            echo "    - {$item->description}: ₱{$item->total_price} ({$item->item_type})" . PHP_EOL;
            echo "      Unit Price: ₱{$item->unit_price}, Quantity: {$item->quantity_used}" . PHP_EOL;
            echo "      Is Paid: " . ($item->is_paid ? 'Yes' : 'No') . PHP_EOL;
            echo "      Is Billable: " . ($item->is_billable ? 'Yes' : 'No') . PHP_EOL;
        }
        
    } catch (Exception $e) {
        echo "  Error: " . $e->getMessage() . PHP_EOL;
    }
}

echo PHP_EOL . "=== TESTING GROOMING BILLING ===" . PHP_EOL;

// Test grooming billing
$groomingAppointments = \App\Models\GroomingAppointment::limit(2)->get();
foreach ($groomingAppointments as $apt) {
    echo PHP_EOL . "Testing Grooming Appointment ID: {$apt->id}" . PHP_EOL;
    
    try {
        $billing = \App\Services\ServiceBillingService::getItemizedBilling('grooming', $apt->id);
        $completionStatus = \App\Services\ServiceBillingService::canCompleteService('grooming', $apt->id);
        
        echo "  Total Bill: ₱{$billing['total_bill']}" . PHP_EOL;
        echo "  Billing Items: " . count($billing['items']) . PHP_EOL;
        
        foreach ($billing['items'] as $item) {
            echo "    - {$item->description}: ₱{$item->total_price} ({$item->item_type})" . PHP_EOL;
        }
        
    } catch (Exception $e) {
        echo "  Error: " . $e->getMessage() . PHP_EOL;
    }
}

echo PHP_EOL . "=== TESTING BOARDING BILLING ===" . PHP_EOL;

// Test boarding billing
$boarding = \App\Models\Boarding::limit(2)->get();
foreach ($boarding as $board) {
    echo PHP_EOL . "Testing Boarding ID: {$board->id}" . PHP_EOL;
    
    try {
        $billing = \App\Services\ServiceBillingService::getItemizedBilling('boarding', $board->id);
        $completionStatus = \App\Services\ServiceBillingService::canCompleteService('boarding', $board->id);
        
        echo "  Total Bill: ₱{$billing['total_bill']}" . PHP_EOL;
        echo "  Billing Items: " . count($billing['items']) . PHP_EOL;
        
        foreach ($billing['items'] as $item) {
            echo "    - {$item->description}: ₱{$item->total_price} ({$item->item_type})" . PHP_EOL;
        }
        
    } catch (Exception $e) {
        echo "  Error: " . $e->getMessage() . PHP_EOL;
    }
}

echo PHP_EOL . "=== API TESTING COMPLETE ===" . PHP_EOL;
