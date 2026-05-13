<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\InventoryLog;
use App\Models\BookingAddOn;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class InventoryDeductionService
{
    /**
     * Deduct inventory for inventory-backed add-ons when booking is approved
     */
    public function deductAddOnsForBooking(int $bookingId): array
    {
        $bookingAddOns = BookingAddOn::where('booking_id', $bookingId)
            ->whereHas('addOn', function ($query) {
                $query->where('add_on_type', 'inventory_item');
            })
            ->with(['addOn.inventoryItem'])
            ->get();

        $deductionResults = [];
        
        DB::transaction(function () use ($bookingAddOns, $bookingId, &$deductionResults) {
            foreach ($bookingAddOns as $bookingAddOn) {
                if (!$bookingAddOn->inventoryItem) {
                    $deductionResults[] = [
                        'add_on_id' => $bookingAddOn->add_on_id,
                        'name' => $bookingAddOn->name,
                        'status' => 'skipped',
                        'reason' => 'No inventory item linked',
                    ];
                    continue;
                }

                $inventoryItem = $bookingAddOn->inventoryItem;
                $currentStock = $inventoryItem->quantity ?? 0;
                $requiredQuantity = $bookingAddOn->quantity * ($bookingAddOn->number_of_days ?? 1);

                if ($currentStock < $requiredQuantity) {
                    $deductionResults[] = [
                        'add_on_id' => $bookingAddOn->add_on_id,
                        'name' => $bookingAddOn->name,
                        'status' => 'failed',
                        'reason' => "Insufficient stock. Required: {$requiredQuantity}, Available: {$currentStock}",
                    ];
                    continue;
                }

                // Deduct the inventory
                $newStock = $currentStock - $requiredQuantity;
                $inventoryItem->update(['quantity' => $newStock]);

                // Create inventory log
                InventoryLog::create([
                    'inventory_item_id' => $inventoryItem->id,
                    'booking_id' => $bookingId,
                    'movement_type' => 'boarding_addon_usage',
                    'quantity' => $requiredQuantity,
                    'previous_stock' => $currentStock,
                    'new_stock' => $newStock,
                    'reason' => "Add-on usage for booking #{$bookingId}",
                    'performed_by' => Auth::id(),
                    'role' => Auth::user()?->role ?? 'system',
                ]);

                $deductionResults[] = [
                    'add_on_id' => $bookingAddOn->add_on_id,
                    'name' => $bookingAddOn->name,
                    'status' => 'success',
                    'reason' => "Deducted {$requiredQuantity} units",
                    'previous_stock' => $currentStock,
                    'new_stock' => $newStock,
                ];
            }
        });

        return $deductionResults;
    }

    /**
     * Restore inventory for cancelled bookings with inventory-backed add-ons
     */
    public function restoreAddOnsForBooking(int $bookingId): array
    {
        $bookingAddOns = BookingAddOn::where('booking_id', $bookingId)
            ->whereHas('addOn', function ($query) {
                $query->where('add_on_type', 'inventory_item');
            })
            ->with(['addOn.inventoryItem'])
            ->get();

        $restorationResults = [];
        
        DB::transaction(function () use ($bookingAddOns, $bookingId, &$restorationResults) {
            foreach ($bookingAddOns as $bookingAddOn) {
                if (!$bookingAddOn->inventoryItem) {
                    $restorationResults[] = [
                        'add_on_id' => $bookingAddOn->add_on_id,
                        'name' => $bookingAddOn->name,
                        'status' => 'skipped',
                        'reason' => 'No inventory item linked',
                    ];
                    continue;
                }

                $inventoryItem = $bookingAddOn->inventoryItem;
                $currentStock = $inventoryItem->quantity ?? 0;
                $restoredQuantity = $bookingAddOn->quantity * ($bookingAddOn->number_of_days ?? 1);

                // Restore the inventory
                $newStock = $currentStock + $restoredQuantity;
                $inventoryItem->update(['quantity' => $newStock]);

                // Create inventory log
                InventoryLog::create([
                    'inventory_item_id' => $inventoryItem->id,
                    'booking_id' => $bookingId,
                    'movement_type' => 'boarding_addon_restore',
                    'quantity' => $restoredQuantity,
                    'previous_stock' => $currentStock,
                    'new_stock' => $newStock,
                    'reason' => "Add-on restoration for cancelled booking #{$bookingId}",
                    'performed_by' => Auth::id(),
                    'role' => Auth::user()?->role ?? 'system',
                ]);

                $restorationResults[] = [
                    'add_on_id' => $bookingAddOn->add_on_id,
                    'name' => $bookingAddOn->name,
                    'status' => 'success',
                    'reason' => "Restored {$restoredQuantity} units",
                    'previous_stock' => $currentStock,
                    'new_stock' => $newStock,
                ];
            }
        });

        return $restorationResults;
    }

    /**
     * Check if add-ons have sufficient inventory stock
     */
    public function checkAddOnInventory(array $addOnIds): array
    {
        $addOns = BookingAddOn::whereIn('add_on_id', $addOnIds)
            ->whereHas('addOn', function ($query) {
                $query->where('add_on_type', 'inventory_item');
            })
            ->with(['addOn.inventoryItem'])
            ->get();

        $inventoryStatus = [];
        
        foreach ($addOns as $addOn) {
            if (!$addOn->inventoryItem) {
                $inventoryStatus[$addOn->add_on_id] = [
                    'name' => $addOn->name,
                    'available' => false,
                    'reason' => 'No inventory item linked',
                ];
                continue;
            }

            $inventoryItem = $addOn->inventoryItem;
            $currentStock = $inventoryItem->quantity ?? 0;
            $requiredQuantity = $addOn->quantity * ($addOn->number_of_days ?? 1);

            $inventoryStatus[$addOn->add_on_id] = [
                'name' => $addOn->name,
                'available' => $currentStock >= $requiredQuantity,
                'current_stock' => $currentStock,
                'required_quantity' => $requiredQuantity,
                'shortage' => max(0, $requiredQuantity - $currentStock),
            ];
        }

        return $inventoryStatus;
    }
}
