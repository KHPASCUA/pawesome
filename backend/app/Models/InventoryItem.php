<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku',
        'name',
        'category',
        'brand',
        'supplier',
        'description',
        'stock',
        'reorder_level',
        'price',
        'expiry_date',
        'status',
        'is_sellable',
        'barcode',
        'threshold',
    ];

    /**
     * Category to SKU prefix mapping
     */
    private const SKU_PREFIXES = [
        'Food' => 'FOO',
        'Accessories' => 'ACC',
        'Grooming' => 'GRM',
        'Toys' => 'TOY',
        'Health' => 'HLT',
        'Services' => 'SRV',
    ];

    protected static function booted(): void
    {
        static::creating(function ($item) {
            // Auto-generate SKU if empty
            if (empty($item->sku)) {
                $prefix = self::SKU_PREFIXES[$item->category] ?? 'ITM';
                $item->sku = $prefix . '-' . strtoupper(uniqid());
            }

            // Validate and correct category
            $validCategories = ['Food', 'Accessories', 'Grooming', 'Toys', 'Health', 'Services'];
            if (!in_array($item->category, $validCategories)) {
                $item->category = 'Accessories';
            }

            // Validate and correct status
            $validStatuses = ['active', 'inactive', 'discontinued'];
            if (!in_array($item->status, $validStatuses)) {
                $item->status = 'active';
            }

            // Ensure non-negative values
            $item->stock = max(0, $item->stock ?? 0);
            $item->price = max(0, $item->price ?? 0);
            $item->reorder_level = max(0, $item->reorder_level ?? 0);
        });

        static::created(function ($item) {
            if ($item->stock > 0) {
                InventoryLog::create([
                    'inventory_item_id' => $item->id,
                    'delta' => $item->stock,
                    'reason' => 'Initial stock',
                    'reference_type' => 'initial',
                ]);
            }
        });

        static::updating(function ($item) {
            // Ensure non-negative values on update
            if ($item->stock < 0) {
                $item->stock = 0;
            }
            if ($item->price < 0) {
                $item->price = 0;
            }
            if ($item->reorder_level < 0) {
                $item->reorder_level = 0;
            }
        });
    }

    public function logs()
    {
        return $this->hasMany(InventoryLog::class);
    }

    /**
     * Check if item is low on stock
     */
    public function isLowStock(): bool
    {
        return $this->stock > 0 && $this->stock <= $this->reorder_level;
    }

    /**
     * Check if item is out of stock
     */
    public function isOutOfStock(): bool
    {
        return $this->stock <= 0;
    }

    /**
     * Get inventory value (stock * price)
     */
    public function getInventoryValue(): float
    {
        return $this->stock * $this->price;
    }

    /**
     * Check if item is expiring soon (within 30 days)
     */
    public function isExpiringSoon(): bool
    {
        if (!$this->expiry_date) {
            return false;
        }
        return now()->diffInDays($this->expiry_date, false) <= 30;
    }

    /**
     * Decrement stock and create log entry
     */
    public function decrementStock(int $amount, string $reason = ''): void
    {
        $this->stock -= $amount;
        $this->save();

        InventoryLog::create([
            'inventory_item_id' => $this->id,
            'delta' => -$amount,
            'reason' => $reason,
            'reference_type' => 'sale',
        ]);
    }

    /**
     * Increment stock and create log entry
     */
    public function incrementStock(int $amount, string $reason = ''): void
    {
        $this->stock += $amount;
        $this->save();

        InventoryLog::create([
            'inventory_item_id' => $this->id,
            'delta' => $amount,
            'reason' => $reason,
            'reference_type' => 'restock',
        ]);
    }

    public function updateStock(int $amount, string $reason = ''): void
    {
        $this->stock += $amount;
        $this->save();

        InventoryLog::create([
            'inventory_item_id' => $this->id,
            'delta' => $amount,
            'reason' => $reason,
            'reference_type' => $amount >= 0 ? 'restock' : 'sale',
        ]);
    }

    /**
     * Scope: Active items only
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: In stock items
     */
    public function scopeInStock($query)
    {
        return $query->where('stock', '>', 0);
    }

    /**
     * Scope: Low stock items
     */
    public function scopeLowStock($query)
    {
        return $query->where('stock', '>', 0)
            ->whereColumn('stock', '<=', 'reorder_level');
    }
}
