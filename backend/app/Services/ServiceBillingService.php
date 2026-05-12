<?php

namespace App\Services;

use App\Models\ServiceItemUsage;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use App\Models\InventoryBatch;
use App\Models\User;
use App\Models\Appointment;
use App\Models\GroomingAppointment;
use App\Models\Boarding;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ServiceBillingService
{
    /**
     * Add a billing item to a service with optional inventory deduction
     */
    public static function addBillingItem(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $serviceType = $data['service_type'];
            $serviceId = $data['service_id'];
            $itemType = $data['item_type'];
            $description = $data['description'];
            $quantity = $data['quantity'] ?? 1;
            $unitPrice = $data['unit_price'];
            $totalPrice = $data['total_price'] ?? ($quantity * $unitPrice);
            $inventoryItemId = $data['inventory_item_id'] ?? null;
            $notes = $data['notes'] ?? '';
            $addedBy = Auth::id();

            // Validate service ownership and permissions
            if (!self::canAddBillingItem($serviceType, $serviceId)) {
                throw new \Exception('You are not authorized to add billing items to this service');
            }

            // Apply critical billing integrity fix
            if ($itemType === 'inventory_usage') {
                // Only inventory_usage type should use actual inventory references
                $inventoryItemId = !empty($data['inventory_item_id']) ? (int) $data['inventory_item_id'] : null;
                $batchId = !empty($data['batch_id']) ? (int) $data['batch_id'] : null;
                
                // This is actual inventory usage - validate stock and deduct
                if (!$inventoryItemId) {
                    throw new \Exception('Inventory item ID is required for inventory usage');
                }

                $inventoryItem = InventoryItem::find($inventoryItemId);
                if (!$inventoryItem) {
                    throw new \Exception('Inventory item not found');
                }

                if ($inventoryItem->stock < $quantity) {
                    throw new \Exception("Insufficient stock for {$inventoryItem->name}. Available: {$inventoryItem->stock}, Required: {$quantity}");
                }

                // Find appropriate batch (FIFO)
                $batch = InventoryBatch::where('inventory_item_id', $inventoryItemId)
                    ->where('remaining_quantity', '>', 0)
                    ->orderBy('created_at', 'asc')
                    ->first();

                if (!$batch || $batch->remaining_quantity < $quantity) {
                    throw new \Exception("Insufficient stock in available batches for {$inventoryItem->name}");
                }

                $batchId = $batch->id;

                // Deduct from batch
                $batch->remaining_quantity -= $quantity;
                $batch->save();

                // Update inventory item stock
                $inventoryItem->stock -= $quantity;
                $inventoryItem->save();

                // Create inventory log
                $movementType = self::getInventoryMovementType($serviceType);
                InventoryLog::create([
                    'inventory_item_id' => $inventoryItemId,
                    'delta' => -$quantity,
                    'reason' => "Used for {$serviceType} service #{$serviceId}: {$description}",
                    'reference_type' => 'service_item_usage',
                    'movement_type' => $movementType,
                    'quantity' => $quantity,
                    'stock_before' => $inventoryItem->stock + $quantity,
                    'stock_after' => $inventoryItem->stock,
                    'performed_by' => $addedBy,
                    'role' => Auth::user()?->role ?? 'unknown',
                    'user_id' => $addedBy,
                    'details' => json_encode([
                        'service_type' => $serviceType,
                        'service_id' => $serviceId,
                        'batch_id' => $batch->id,
                        'description' => $description
                    ])
                ]);
            } else {
                // For all billing fee types (base_service, add_on_service, professional_fee, service_fee)
                // Force inventory_item_id and batch_id to NULL - no fake inventory references
                $inventoryItemId = null;
                $batchId = null;
            }

            // Create service billing item
            $billingItem = ServiceItemUsage::create([
                'service_type' => $serviceType,
                'service_id' => $serviceId,
                'pet_id' => $data['pet_id'] ?? null,
                'inventory_item_id' => $inventoryItemId,
                'batch_id' => $batchId,
                'quantity_used' => $quantity,
                'unit' => $data['unit'] ?? 'pcs',
                'used_by' => $addedBy,
                'notes' => $notes,
                // Billing fields
                'item_type' => $itemType,
                'description' => $description,
                'unit_price' => $unitPrice,
                'total_price' => $totalPrice,
                'is_billable' => $itemType !== ServiceItemUsage::ITEM_DISCOUNT,
                'is_paid' => false,
            ]);

            return [
                'success' => true,
                'billing_item' => $billingItem,
                'message' => 'Billing item added successfully'
            ];
        });
    }

    /**
     * Get itemized billing for a service
     */
    public static function getItemizedBilling(string $serviceType, int $serviceId): array
    {
        $items = ServiceItemUsage::getItemizedBilling($serviceType, $serviceId);
        $totalBill = ServiceItemUsage::calculateTotalBill($serviceType, $serviceId);
        $totalPaid = ServiceItemUsage::calculateTotalPaid($serviceType, $serviceId);
        $balanceDue = $totalBill - $totalPaid;

        return [
            'items' => $items,
            'total_bill' => $totalBill,
            'total_paid' => $totalPaid,
            'balance_due' => $balanceDue,
            'has_unpaid_balance' => $balanceDue > 0
        ];
    }

    /**
     * Mark billing items as paid
     */
    public static function markItemsAsPaid(array $itemIds, int $verifiedBy): array
    {
        return DB::transaction(function () use ($itemIds, $verifiedBy) {
            $updated = ServiceItemUsage::whereIn('id', $itemIds)
                ->where('is_billable', true)
                ->where('is_paid', false)
                ->update(['is_paid' => true]);

            return [
                'success' => true,
                'items_updated' => $updated,
                'message' => "Marked {$updated} items as paid"
            ];
        });
    }

    /**
     * Check if user can add billing items to service
     */
    private static function canAddBillingItem(string $serviceType, int $serviceId): bool
    {
        $user = Auth::user();
        if (!$user) return false;

        // Admin can add to any service
        if ($user->role === 'admin') return true;

        // Check role-based permissions
        switch ($serviceType) {
            case ServiceItemUsage::SERVICE_VETERINARY:
                return in_array($user->role, ['veterinary', 'admin']);
            case ServiceItemUsage::SERVICE_GROOMING:
                return in_array($user->role, ['grooming', 'admin']);
            case ServiceItemUsage::SERVICE_BOARDING:
                return in_array($user->role, ['receptionist', 'admin']);
            default:
                return false;
        }
    }

    /**
     * Get inventory movement type for service
     */
    private static function getInventoryMovementType(string $serviceType): string
    {
        return match ($serviceType) {
            ServiceItemUsage::SERVICE_VETERINARY => 'vet_usage',
            ServiceItemUsage::SERVICE_GROOMING => 'grooming_usage',
            ServiceItemUsage::SERVICE_BOARDING => 'boarding_food_usage',
            default => 'service_usage'
        };
    }

    /**
     * Create base service billing item when service is created
     */
    public static function createBaseServiceItem(string $serviceType, int $serviceId, string $description, float $price, int $petId = null): ServiceItemUsage
    {
        return ServiceItemUsage::create([
            'service_type' => $serviceType,
            'service_id' => $serviceId,
            'pet_id' => $petId,
            'inventory_item_id' => null, // Base service has no inventory item
            'batch_id' => null, // Base service has no batch
            'quantity_used' => 1,
            'unit' => 'service',
            'used_by' => 0, // System created (0 = system)
            'notes' => 'Base service charge',
            // Billing fields
            'item_type' => ServiceItemUsage::ITEM_BASE_SERVICE,
            'description' => $description,
            'unit_price' => $price,
            'total_price' => $price,
            'is_billable' => true,
            'is_paid' => false,
        ]);
    }

    /**
     * Check if service can be completed based on payment status
     */
    public static function canCompleteService(string $serviceType, int $serviceId): array
    {
        $balanceDue = ServiceItemUsage::calculateBalanceDue($serviceType, $serviceId);
        
        return [
            'can_complete' => $balanceDue <= 0,
            'balance_due' => $balanceDue,
            'message' => $balanceDue > 0 
                ? "Service cannot be completed. Balance due: ₱" . number_format($balanceDue, 2)
                : "Service can be completed. All payments settled."
        ];
    }

    /**
     * Get services with unpaid balances for cashier dashboard
     */
    public static function getServicesWithUnpaidBalances(): array
    {
        $unpaidItems = ServiceItemUsage::unpaid()
            ->with(['pet', 'user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(['service_type', 'service_id']);

        $services = [];
        foreach ($unpaidItems as $key => $items) {
            [$serviceType, $serviceId] = explode('.', $key);
            $serviceId = (int) $serviceId;
            
            $billing = self::getItemizedBilling($serviceType, $serviceId);
            $service = self::getServiceDetails($serviceType, $serviceId);
            
            if ($service && $billing['balance_due'] > 0) {
                $services[] = [
                    'service_type' => $serviceType,
                    'service_id' => $serviceId,
                    'service' => $service,
                    'billing' => $billing,
                    'created_at' => $items->first()->created_at
                ];
            }
        }

        return $services;
    }

    /**
     * Get service details for display
     */
    private static function getServiceDetails(string $serviceType, int $serviceId): ?array
    {
        return match ($serviceType) {
            ServiceItemUsage::SERVICE_VETERINARY => self::getVetServiceDetails($serviceId),
            ServiceItemUsage::SERVICE_GROOMING => self::getGroomingServiceDetails($serviceId),
            ServiceItemUsage::SERVICE_BOARDING => self::getBoardingServiceDetails($serviceId),
            default => null
        };
    }

    /**
     * Get veterinary service details
     */
    private static function getVetServiceDetails(int $serviceId): ?array
    {
        $appointment = Appointment::find($serviceId);
        if (!$appointment) return null;

        return [
            'id' => $appointment->id,
            'type' => 'Veterinary Consultation',
            'pet_name' => $appointment->pet?->name,
            'customer_name' => $appointment->customer?->name,
            'scheduled_at' => $appointment->scheduled_at,
            'status' => $appointment->status
        ];
    }

    /**
     * Get grooming service details
     */
    private static function getGroomingServiceDetails(int $serviceId): ?array
    {
        $appointment = GroomingAppointment::find($serviceId);
        if (!$appointment) return null;

        return [
            'id' => $appointment->id,
            'type' => 'Grooming Appointment',
            'pet_name' => $appointment->pet_name,
            'service' => $appointment->service,
            'appointment_date' => $appointment->appointment_date,
            'status' => $appointment->status
        ];
    }

    /**
     * Get boarding service details
     */
    private static function getBoardingServiceDetails(int $serviceId): ?array
    {
        $boarding = Boarding::find($serviceId);
        if (!$boarding) return null;

        return [
            'id' => $boarding->id,
            'type' => 'Pet Hotel Boarding',
            'pet_name' => $boarding->pet_name,
            'stay_type' => $boarding->stay_type,
            'check_in' => $boarding->check_in,
            'check_out' => $boarding->check_out,
            'status' => $boarding->status
        ];
    }
}
