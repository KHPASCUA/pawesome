<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku',
        'barcode',
        'name',
        'category',
        'description',
        'stock',
        'stock_quantity',
        'reorder_level',
        'threshold',
        'price',
        'expiry_date',
        'status',
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'price' => 'decimal:2',
        'stock' => 'integer',
        'reorder_level' => 'integer',
        'threshold' => 'integer',
    ];

    /**
     * Valid category values
     */
    public const VALID_CATEGORIES = ['Food', 'Accessories', 'Grooming', 'Toys', 'Health', 'Services'];

    /**
     * Valid status values - standardized across system
     */
    public const VALID_STATUSES = ['active', 'inactive', 'discontinued'];

    /**
     * Boot method for model-level validation
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($item) {
            // Validate category
            if (!in_array($item->category, self::VALID_CATEGORIES)) {
                $item->category = 'Accessories'; // Default fallback
            }

            // Validate status
            if (!in_array($item->status, self::VALID_STATUSES)) {
                $item->status = 'active';
            }

            // Ensure non-negative values
            $item->stock = max(0, (int) $item->stock);
            $item->reorder_level = max(0, (int) $item->reorder_level);
            $item->price = max(0, (float) $item->price);

            // Auto-generate SKU if empty
            if (empty($item->sku)) {
                $item->sku = self::generateSKU($item->category);
            }
        });
    }

    /**
     * Generate unique SKU
     */
    private static function generateSKU(string $category): string
    {
        $prefix = strtoupper(substr($category, 0, 3));
        $random = strtoupper(substr(md5(uniqid()), 0, 4));
        $timestamp = date('ym');
        return "{$prefix}-{$random}{$timestamp}";
    }

    /**
     * Get stock movement logs
     */
    public function logs(): HasMany
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
     * Check if item is expiring soon (within 30 days)
     */
    public function isExpiringSoon(): bool
    {
        if (!$this->expiry_date) {
            return false;
        }
        $expiry = $this->expiry_date instanceof \Carbon\Carbon ? $this->expiry_date : \Carbon\Carbon::parse($this->expiry_date);
        return $expiry->diffInDays(now()) <= 30 && $expiry >= now();
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
        return $query->whereRaw('stock <= reorder_level')
                     ->where('stock', '>', 0);
    }

    /**
     * Scope: Out of stock items
     */
    public function scopeOutOfStock($query)
    {
        return $query->where('stock', 0);
    }

    /**
     * Get inventory value (stock * price)
     */
    public function getInventoryValue(): float
    {
        return $this->stock * $this->price;
    }

    /**
     * Decrement stock with logging
     */
    public function decrementStock(int $quantity, string $reason = 'Sale', string $referenceType = 'sale', ?int $referenceId = null): void
    {
        $this->decrement('stock', $quantity);

        InventoryLog::create([
            'inventory_item_id' => $this->id,
            'delta' => -$quantity,
            'reason' => $reason,
            'reference_type' => $referenceType,
        ]);
    }

    /**
     * Increment stock with logging
     */
    public function incrementStock(int $quantity, string $reason = 'Restock', string $referenceType = 'restock', ?int $referenceId = null): void
    {
        $this->increment('stock', $quantity);

        InventoryLog::create([
            'inventory_item_id' => $this->id,
            'delta' => $quantity,
            'reason' => $reason,
            'reference_type' => $referenceType,
        ]);
    }
}
