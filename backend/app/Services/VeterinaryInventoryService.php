<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\ServiceItemUsage;
use App\Models\InventoryBatch;
use App\Models\InventoryLog;
use App\Models\VetAppointment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class VeterinaryInventoryService
{
    /**
     * Record inventory usage for veterinary services
     */
    public function recordInventoryUsage(array $items, int $appointmentId, int $petId, string $notes = '', ?int $userId = null): array
    {
        $usages = [];
        $errors = [];
        
        DB::beginTransaction();
        
        try {
            foreach ($items as $item) {
                $validation = $this->validateUsageItem($item);
                if (!$validation['valid']) {
                    $errors[] = $validation['error'];
                    continue;
                }
                
                $inventoryItem = InventoryItem::findOrFail($item['inventory_item_id']);
                
                // Check if item is service consumable
                if (!$inventoryItem->is_service_consumable) {
                    $errors[] = "Item '{$inventoryItem->name}' is not marked as service consumable";
                    continue;
                }
                
                // Check stock availability
                if ($inventoryItem->stock < $item['quantity_used']) {
                    $errors[] = "Insufficient stock for '{$inventoryItem->name}'. Available: {$inventoryItem->stock}, Requested: {$item['quantity_used']}";
                    continue;
                }
                
                $stockBefore = $inventoryItem->stock;
                
                // Use InventoryService for stock deduction (supports FEFO/FIFO)
                $inventoryService = new InventoryService();
                $deductionResult = $inventoryService->deductStock(
                    $item['inventory_item_id'],
                    $item['quantity_used'],
                    'Veterinary service usage: ' . ($notes ?: 'Medical supplies'),
                    'vet_usage',
                    $appointmentId
                );
                
                // Get or create vet appointment record for foreign key constraint
                $vetAppointment = \DB::table('vet_appointments')
                    ->where('pet_id', $petId)
                    ->first();
                    
                $vetAppointmentId = $vetAppointment ? $vetAppointment->id : null;
                
                // Record service usage
                $usage = ServiceItemUsage::create([
                    'service_type' => ServiceItemUsage::SERVICE_VETERINARY,
                    'service_id' => $appointmentId,
                    'appointment_id' => $vetAppointmentId,
                    'pet_id' => $petId,
                    'inventory_item_id' => $item['inventory_item_id'],
                    'batch_id' => $this->getUsedBatchId($deductionResult),
                    'quantity_used' => $item['quantity_used'],
                    'unit' => $item['unit'] ?? $inventoryItem->unit ?? 'pcs',
                    'used_by' => $userId ?? Auth::id(),
                    'notes' => $item['notes'] ?? $notes,
                ]);
                
                $usages[] = [
                    'item' => $inventoryItem->name,
                    'quantity' => $item['quantity_used'],
                    'stock_before' => $stockBefore,
                    'stock_after' => $deductionResult['stock_after'],
                    'batch_deductions' => $deductionResult['batch_deductions'] ?? [],
                ];
            }
            
            DB::commit();
            
            // Check for low stock after deductions and create notifications
            $this->checkAndNotifyLowStock($usages);
            
            return [
                'success' => empty($errors),
                'message' => empty($errors) 
                    ? 'Inventory usage recorded successfully.' 
                    : 'Some items could not be processed.',
                'usages' => $usages,
                'errors' => $errors,
                'total_items' => count($items),
                'processed_items' => count($usages),
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Validate individual usage item
     */
    private function validateUsageItem(array $item): array
    {
        if (empty($item['inventory_item_id'])) {
            return ['valid' => false, 'error' => 'Inventory item ID is required'];
        }
        
        if (empty($item['quantity_used']) || $item['quantity_used'] <= 0) {
            return ['valid' => false, 'error' => 'Quantity used must be greater than 0'];
        }
        
        // Check if inventory item exists and is active
        $inventoryItem = InventoryItem::find($item['inventory_item_id']);
        if (!$inventoryItem) {
            return ['valid' => false, 'error' => 'Inventory item not found'];
        }
        
        if ($inventoryItem->status !== 'active') {
            return ['valid' => false, 'error' => 'Inventory item is not active'];
        }
        
        return ['valid' => true];
    }
    
    /**
     * Get the batch ID that was used from deduction result
     */
    private function getUsedBatchId(array $deductionResult): ?int
    {
        if (!empty($deductionResult['batch_deductions']) && count($deductionResult['batch_deductions']) > 0) {
            return $deductionResult['batch_deductions'][0]['batch_id'];
        }
        
        return null;
    }
    
    /**
     * Get available service consumable items for veterinary
     */
    public function getAvailableServiceItems(): array
    {
        return InventoryItem::where('is_service_consumable', true)
            ->where('status', 'active')
            ->where('stock', '>', 0)
            ->select('id', 'name', 'sku', 'stock', 'category', 'status')
            ->orderBy('name')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'sku' => $item->sku,
                    'stock' => $item->stock,
                    'quantity' => $item->stock,
                    'unit' => 'pcs',
                    'category' => $item->category,
                    'type' => $item->category,
                    'status' => $item->status,
                ];
            })
            ->toArray();
    }
    
    /**
     * Get usage history for an appointment
     */
    public function getAppointmentUsageHistory(int $appointmentId): array
    {
        return ServiceItemUsage::with(['inventoryItem', 'batch', 'user'])
            ->where('service_type', ServiceItemUsage::SERVICE_VETERINARY)
            ->where('appointment_id', $appointmentId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($usage) {
                return [
                    'id' => $usage->id,
                    'item_name' => $usage->inventoryItem->name ?? 'Unknown',
                    'quantity_used' => $usage->quantity_used,
                    'unit' => $usage->unit,
                    'notes' => $usage->notes,
                    'used_by' => $usage->user->name ?? 'Unknown',
                    'created_at' => $usage->created_at->toIso8601String(),
                    'batch_info' => $usage->batch ? [
                        'batch_no' => $usage->batch->batch_no,
                        'expiration_date' => $usage->batch->expiration_date,
                    ] : null,
                ];
            })
            ->toArray();
    }
    
    /**
     * Check for low stock after usage and create notifications
     */
    private function checkAndNotifyLowStock(array $usages): void
    {
        foreach ($usages as $usage) {
            // Only check items that were actually processed
            if (empty($usage['stock_after'])) continue;
            
            // Get the current inventory item to check reorder level
            $inventoryItem = InventoryItem::where('name', $usage['item'])->first();
            if (!$inventoryItem) continue;
            
            // Check if stock is at or below reorder level
            $reorderLevel = $inventoryItem->reorder_level ?? 0;
            $threshold = $inventoryItem->threshold ?? $reorderLevel;
            
            if ($usage['stock_after'] <= $threshold && $usage['stock_before'] > $threshold) {
                // Stock just reached low level - create notification
                $this->createLowStockNotification($inventoryItem, $usage);
            }
        }
    }
    
    /**
     * Create low stock notification for inventory/admin roles
     */
    private function createLowStockNotification(InventoryItem $item, array $usage): void
    {
        try {
            // Get admin and inventory role users
            $staffUsers = \App\Models\User::whereIn('role', ['admin', 'inventory', 'manager'])->get();
            
            foreach ($staffUsers as $user) {
                \App\Services\NotificationService::createNotification(
                    $user->id,
                    'Low Stock Alert',
                    "Item '{$item->name}' is running low on stock.\n" .
                    "Current stock: {$usage['stock_after']}\n" .
                    "Reorder level: " . ($item->reorder_level ?? 0) . "\n" .
                    "Used in veterinary service.",
                    'warning',
                    'inventory_item',
                    $item->id,
                    [
                        'item_name' => $item->name,
                        'current_stock' => $usage['stock_after'],
                        'reorder_level' => $item->reorder_level ?? 0,
                        'service_type' => 'veterinary',
                        'usage_quantity' => $usage['quantity']
                    ]
                );
            }
        } catch (\Exception $e) {
            // Log error but don't fail the inventory usage
            \Log::error('Failed to create low stock notification', [
                'item_id' => $item->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
