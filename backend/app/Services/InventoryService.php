<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\InventoryBatch;
use App\Models\InventoryLog;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InventoryService
{
    /**
     * Standardized status values
     */
    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_DISCONTINUED = 'discontinued';

    /**
     * Valid status values
     */
    public const VALID_STATUSES = [
        self::STATUS_ACTIVE,
        self::STATUS_INACTIVE,
        self::STATUS_DISCONTINUED,
    ];

    /**
     * Valid category values
     */
    public const VALID_CATEGORIES = ['Food', 'Accessories', 'Grooming', 'Toys', 'Health', 'Services'];

    /**
     * Create a new inventory item
     */
    public function createItem(array $data): array
    {
        $validated = $this->validateItemData($data, true);

        // Auto-generate SKU if not provided
        if (empty($validated['sku'])) {
            $validated['sku'] = $this->generateSKU($validated['category']);
        }

        // Use quantity or stock_quantity if stock is not provided (frontend compatibility)
        $stock = $validated['stock'] ?? $validated['stock_quantity'] ?? ($validated['quantity'] ?? 0);
        $validated['stock'] = (int) $stock;

        // Remove extra fields that don't exist in database
        unset($validated['stock_quantity'], $validated['quantity']);

        // Handle batch data if provided (for FEFO items)
        $batchData = $data['batchData'] ?? null;
        if ($batchData) {
            // Use batch quantity as the stock quantity
            $validated['stock'] = (int) ($batchData['quantity'] ?? $stock);
        }

        // Set default status
        $validated['status'] = $validated['status'] ?? self::STATUS_ACTIVE;

        $item = InventoryItem::create($validated);

        // Create initial batch if batch data provided
        if ($batchData && $validated['stock'] > 0) {
            $item->addBatchStock(
                $batchData['quantity'],
                $batchData['batch_no'] ?? null,
                $batchData['expiration_date'] ?? null,
                $batchData['notes'] ?? 'Initial stock batch'
            );
        } elseif ($validated['stock'] > 0) {
            // Create default batch for non-FEFO items with stock
            $item->addBatchStock(
                $validated['stock'],
                'INITIAL-' . strtoupper(uniqid()),
                null,
                'Initial stock'
            );
        }

        return [
            'message' => 'Item created successfully',
            'item' => $item->fresh()->load('batches'),
            'stock_action' => 'initial',
            'new_stock' => $item->stock,
            'has_batch' => $batchData !== null,
        ];
    }

    /**
     * Update an existing inventory item
     */
    public function updateItem(int $id, array $data): array
    {
        $item = InventoryItem::findOrFail($id);
        $validated = $this->validateItemData($data, false);

        // Track stock change for logging
        $oldStock = $item->stock;
        $inputStock = $validated['stock'] ?? $validated['stock_quantity'] ?? ($validated['quantity'] ?? null);
        $addStock = $validated['add_stock'] ?? false;

        // Determine new stock value
        $stockAction = $this->getStockAction($item, $inputStock, $addStock);
        $newStock = $this->calculateNewStock($item, $inputStock, $addStock);
        $validated['stock'] = $newStock;

        // Remove fields that don't exist in database
        unset($validated['quantity'], $validated['stock_quantity'], $validated['add_stock']);

        $item->update($validated);

        // Log stock adjustment if changed
        if ($oldStock !== $newStock) {
            $delta = $newStock - $oldStock;
            $reason = $this->getStockAdjustmentReason($item, $addStock, $delta);
            $referenceType = $this->getStockReferenceType($item, $addStock);
            $this->logStockChange($item->id, $delta, $reason, $referenceType);

            // Check for low/out of stock and create notifications
            $this->checkAndCreateStockNotifications($item->fresh());
        }

        return [
            'message' => 'Item updated successfully',
            'item' => $item->fresh(),
            'stock_action' => $stockAction,
            'previous_stock' => $oldStock,
            'new_stock' => $newStock,
        ];
    }

    /**
     * Delete an inventory item
     */
    public function deleteItem(int $id): array
    {
        $item = InventoryItem::findOrFail($id);

        // Check if item has been used in sales
        $saleItemsCount = DB::table('sale_items')
            ->where('product_id', $id)
            ->count();

        if ($saleItemsCount > 0) {
            // Soft delete by marking as discontinued
            $item->update(['status' => self::STATUS_DISCONTINUED]);
            return [
                'message' => 'Item marked as discontinued (has sales history)',
                'item' => $item,
            ];
        }

        // Log the deletion
        $this->logStockChange($item->id, -$item->stock, 'Item deleted', 'deletion');

        $item->delete();

        return ['message' => 'Item deleted successfully'];
    }

    /**
     * Adjust stock for an item
     */
    public function adjustStock(int $id, int $quantity, string $reason, ?array $auditData = null): array
    {
        $item = InventoryItem::findOrFail($id);

        // Check if adjustment would result in negative stock
        if ($item->stock + $quantity < 0) {
            throw new \Exception('Adjustment would result in negative stock');
        }

        $previousStock = $item->stock;
        $item->increment('stock', $quantity);
        $newStock = $item->fresh()->stock;

        // Log the adjustment with audit data
        InventoryLog::create([
            'inventory_item_id' => $item->id,
            'delta' => $quantity,
            'reason' => $reason,
            'reference_type' => $auditData['type'] ?? 'adjustment',
            'previous_stock' => $auditData['previous'] ?? $previousStock,
            'new_stock' => $auditData['new'] ?? $newStock,
            'performed_by' => $auditData['performed_by'] ?? null,
            'role' => $auditData['role'] ?? null,
            'user_id' => $auditData['user_id'] ?? null,
        ]);

        // Check for low/out of stock and create notifications
        $this->checkAndCreateStockNotifications($item->fresh());

        return [
            'message' => 'Stock adjusted successfully',
            'item' => $item->fresh(),
            'previous_stock' => $previousStock,
            'new_stock' => $newStock,
            'adjustment' => $quantity,
        ];
    }

    /**
     * Deduct stock for sales/orders with FEFO batch tracking
     * Centralized method used by POS and Customer Order systems
     * Blocks sale of expired items
     */
    public function deductStock(int $itemId, int $quantity, string $reason = 'Sale', string $referenceType = 'sale', ?int $referenceId = null): array
    {
        $item = InventoryItem::findOrFail($itemId);

        // Check if item has expired batches - BLOCK SALE
        if ($item->hasExpiredBatches()) {
            throw new \Exception("Cannot sell {$item->name}: Item has expired stock. Please dispose of expired batches first.");
        }

        // Check stock availability
        if ($item->stock < $quantity) {
            throw new \Exception("Insufficient stock for {$item->name}. Available: {$item->stock}, Requested: {$quantity}");
        }

        $stockBefore = $item->stock;

        // Use FEFO batch deduction for items that need expiration tracking
        // OR if item has active batches
        if ($item->needsFefo() || $item->batches()->exists()) {
            $batchDeductions = $item->deductStockFefo($quantity, $reason);

            // Refresh item to get updated stock
            $item = $item->fresh();

            // Check for low/out of stock and create notifications
            $this->checkAndCreateStockNotifications($item);

            return [
                'message' => 'Stock deducted successfully (FEFO)',
                'item' => $item,
                'deducted' => $quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $item->stock,
                'batch_deductions' => $batchDeductions,
                'fefo_applied' => true,
            ];
        }

        // Fallback: Simple stock deduction for non-batch items
        $item->decrement('stock', $quantity);
        $item = $item->fresh();

        // Log the stock deduction
        InventoryLog::create([
            'inventory_item_id' => $itemId,
            'delta' => -$quantity,
            'reason' => $reason,
            'reference_type' => $referenceType,
        ]);

        // Check for low/out of stock and create notifications
        $this->checkAndCreateStockNotifications($item);

        return [
            'message' => 'Stock deducted successfully',
            'item' => $item,
            'deducted' => $quantity,
            'stock_before' => $stockBefore,
            'stock_after' => $item->stock,
            'fefo_applied' => false,
        ];
    }

    /**
     * Add stock (restock) with batch tracking support
     * Centralized method for inventory restocking
     */
    public function addStock(int $itemId, int $quantity, string $reason = 'Restock', string $referenceType = 'restock', ?int $referenceId = null, ?array $batchData = null): array
    {
        $item = InventoryItem::findOrFail($itemId);

        $stockBefore = $item->stock;

        // If item needs FEFO or batch data provided, create batch
        if ($item->needsFefo() || $batchData) {
            $batch = $item->addBatchStock(
                $quantity,
                $batchData['batch_no'] ?? null,
                $batchData['expiration_date'] ?? null,
                $batchData['notes'] ?? $reason
            );

            $item = $item->fresh();

            return [
                'message' => 'Stock added successfully with batch tracking',
                'item' => $item,
                'added' => $quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $item->stock,
                'batch' => $batch,
                'batch_tracking' => true,
            ];
        }

        // Fallback: Simple stock addition for non-batch items
        $item->increment('stock', $quantity);
        $item = $item->fresh();

        // Log the stock addition
        InventoryLog::create([
            'inventory_item_id' => $itemId,
            'delta' => $quantity,
            'reason' => $reason,
            'reference_type' => $referenceType,
        ]);

        return [
            'message' => 'Stock added successfully',
            'item' => $item,
            'added' => $quantity,
            'stock_before' => $stockBefore,
            'stock_after' => $item->stock,
            'batch_tracking' => false,
        ];
    }

    /**
     * Get low stock items
     */
    public function getLowStockItems(): array
    {
        $items = InventoryItem::whereRaw('stock <= reorder_level')
            ->where('stock', '>', 0)
            ->where('status', self::STATUS_ACTIVE)
            ->orderByRaw('stock / reorder_level asc')
            ->get();

        return [
            'count' => $items->count(),
            'items' => $items,
        ];
    }

    /**
     * Get out of stock items
     */
    public function getOutOfStockItems(): array
    {
        $items = InventoryItem::where('stock', 0)
            ->where('status', self::STATUS_ACTIVE)
            ->orderBy('name')
            ->get();

        return [
            'count' => $items->count(),
            'items' => $items,
        ];
    }

    /**
     * Get inventory summary/stats
     */
    public function getSummary(): array
    {
        $totalItems = InventoryItem::count();
        $totalValue = InventoryItem::where('status', self::STATUS_ACTIVE)
            ->sum(DB::raw('stock * price'));
        $lowStockCount = InventoryItem::whereRaw('stock <= reorder_level')
            ->where('stock', '>', 0)
            ->count();
        $outOfStockCount = InventoryItem::where('stock', 0)->count();
        $expiringSoon = InventoryItem::where('expiry_date', '<=', now()->addDays(30))
            ->where('expiry_date', '>=', now())
            ->count();

        $categoryBreakdown = InventoryItem::where('status', self::STATUS_ACTIVE)
            ->selectRaw('category, COUNT(*) as count, SUM(stock) as total_stock, SUM(stock * price) as total_value')
            ->groupBy('category')
            ->get();

        return [
            'total_items' => $totalItems,
            'total_stock_value' => $totalValue,
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
            'expiring_soon_count' => $expiringSoon,
            'category_breakdown' => $categoryBreakdown,
        ];
    }

    /**
     * Get public items (read-only for store/pos)
     */
    public function getPublicItems(array $filters = []): array
    {
        $query = InventoryItem::where('status', self::STATUS_ACTIVE);

        // Filter by category
        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        // Filter by search term
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter for in-stock items only
        if (!empty($filters['in_stock_only'])) {
            $query->where('stock', '>', 0);
        }

        $items = $query->orderBy('name')->get();

        return [
            'items' => $items,
            'count' => $items->count(),
            'timestamp' => now()->toIso8601String(),
        ];
    }

    /**
     * Validate item data
     */
    private function validateItemData(array $data, bool $isCreate): array
    {
        $rules = [
            'name' => $isCreate ? 'required|string|max:255' : 'sometimes|string|max:255',
            'sku' => $isCreate ? 'present|nullable|string|max:50|unique:inventory_items,sku' : 'sometimes|string|max:50|unique:inventory_items,sku,' . ($data['id'] ?? null),
            'category' => $isCreate ? 'required|string|max:50' : 'sometimes|string|max:50',
            'description' => 'nullable|string',
            'price' => $isCreate ? 'required|numeric|min:0' : 'sometimes|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'quantity' => 'nullable|integer|min:0',
            'stock_quantity' => 'nullable|integer|min:0',
            'add_stock' => 'nullable|boolean',
            'reorder_level' => $isCreate ? 'required|integer|min:0' : 'sometimes|integer|min:0',
            'expiry_date' => 'nullable|date',
            'status' => 'nullable|in:' . implode(',', self::VALID_STATUSES),
        ];

        $validator = \Illuminate\Support\Facades\Validator::make($data, $rules);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        $validated = $validator->validated();

        // Validate category
        if (isset($validated['category']) && !in_array($validated['category'], self::VALID_CATEGORIES)) {
            $validated['category'] = 'Accessories';
        }

        return $validated;
    }

    /**
     * Calculate new stock value based on add_stock flag and expiry
     */
    private function calculateNewStock(InventoryItem $item, ?int $inputStock, bool $addStock): int
    {
        if ($inputStock === null) {
            return $item->stock;
        }

        $hasExpiry = $item->expiry_date !== null;
        $isExpired = $hasExpiry && $item->expiry_date < now();

        if ($hasExpiry && $isExpired) {
            // Item HAS expiry AND IS expired: Replace stock
            return $inputStock;
        } elseif ($addStock) {
            // Item has NO expiry (or not expired) + add_stock=true: Add to existing stock
            return $item->stock + $inputStock;
        } else {
            // No add_stock flag: Replace stock
            return $inputStock;
        }
    }

    private function getStockAction(InventoryItem $item, ?int $inputStock, bool $addStock): string
    {
        if ($inputStock === null) {
            return 'unchanged';
        }

        $isExpired = $item->expiry_date !== null && $item->expiry_date < now();

        if ($isExpired) {
            return 'replaced_expired';
        }

        return $addStock ? 'added' : 'replaced';
    }

    /**
     * Get stock adjustment reason
     */
    private function getStockAdjustmentReason(InventoryItem $item, bool $addStock, int $delta): string
    {
        $hasExpiry = $item->expiry_date !== null;
        $isExpired = $hasExpiry && $item->expiry_date < now();

        if ($isExpired) {
            return 'Stock replacement (expired inventory cleared)';
        } elseif ($addStock) {
            return "Stock addition (+{$delta})";
        } else {
            return 'Stock update';
        }
    }

    /**
     * Get stock reference type
     */
    private function getStockReferenceType(InventoryItem $item, bool $addStock): string
    {
        $hasExpiry = $item->expiry_date !== null;
        $isExpired = $hasExpiry && $item->expiry_date < now();

        if ($isExpired) {
            return 'expired_replacement';
        } elseif ($addStock) {
            return 'addition';
        } else {
            return 'adjustment';
        }
    }

    /**
     * Log stock change
     */
    private function logStockChange(int $itemId, int $delta, string $reason, string $referenceType): void
    {
        InventoryLog::create([
            'inventory_item_id' => $itemId,
            'delta' => $delta,
            'reason' => $reason,
            'reference_type' => $referenceType,
        ]);
    }

    /**
     * Dispose expired or damaged batch
     */
    public function disposeBatch(int $batchId, string $reason = 'Expired'): array
    {
        $batch = InventoryBatch::findOrFail($batchId);
        $item = $batch->inventoryItem;

        $disposedQuantity = $batch->remaining_quantity;

        // Mark batch as disposed
        $batch->update([
            'status' => 'disposed',
            'remaining_quantity' => 0,
            'notes' => $batch->notes . "\nDisposed: {$reason} on " . now()->toDateTimeString(),
        ]);

        // Update main stock
        $item->decrement('stock', $disposedQuantity);

        // Log disposal
        InventoryLog::create([
            'inventory_item_id' => $item->id,
            'delta' => -$disposedQuantity,
            'reason' => "Batch disposed: {$reason}",
            'reference_type' => 'disposal',
            'details' => json_encode([
                'batch_id' => $batch->id,
                'batch_no' => $batch->batch_no,
                'disposed_quantity' => $disposedQuantity,
                'disposal_reason' => $reason,
            ]),
        ]);

        return [
            'message' => 'Batch disposed successfully',
            'batch' => $batch->fresh(),
            'item' => $item->fresh(),
            'disposed_quantity' => $disposedQuantity,
        ];
    }

    /**
     * Get all batches for an item with expiration info
     */
    public function getItemBatches(int $itemId): array
    {
        $item = InventoryItem::findOrFail($itemId);
        $batches = $item->batches()->orderBy('expiration_date', 'asc')->get();

        return [
            'item' => $item,
            'batches' => $batches,
            'total_batches' => $batches->count(),
            'active_batches' => $batches->where('status', 'active')->count(),
            'expired_batches' => $batches->where('status', 'expired')->count(),
            'has_expired' => $item->hasExpiredBatches(),
            'expiring_soon' => $item->hasExpiringBatches(),
        ];
    }

    /**
     * Generate unique SKU
     */
    private function generateSKU(string $category): string
    {
        $prefix = strtoupper(substr($category, 0, 3));
        $random = strtoupper(Str::random(4));
        $timestamp = date('ym');
        return "{$prefix}-{$random}{$timestamp}";
    }

    /**
     * Check stock levels and create notifications for admin/inventory users
     */
    private function checkAndCreateStockNotifications(InventoryItem $item): void
    {
        $newStock = $item->stock;
        $reorderLevel = $item->reorder_level ?? 10;

        // Only notify if stock is low or out
        if ($newStock > $reorderLevel) {
            return;
        }

        // Get all admins and inventory managers
        $users = User::whereIn('role', ['admin', 'inventory'])->get();

        foreach ($users as $user) {
            // OUT OF STOCK
            if ($newStock <= 0) {
                Notification::create([
                    'user_id' => $user->id,
                    'title' => 'Out of Stock Alert',
                    'message' => "{$item->name} is now OUT OF STOCK.",
                    'type' => 'error',
                    'related_type' => 'inventory',
                    'related_id' => $item->id,
                ]);
            }
            // LOW STOCK
            else {
                Notification::create([
                    'user_id' => $user->id,
                    'title' => 'Low Stock Alert',
                    'message' => "{$item->name} is running low ({$newStock} left, reorder at {$reorderLevel}).",
                    'type' => 'warning',
                    'related_type' => 'inventory',
                    'related_id' => $item->id,
                ]);
            }
        }
    }
}
