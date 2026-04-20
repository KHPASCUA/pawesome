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
        'name',
        'category',
        'description',
        'stock',
        'reorder_level',
        'price',
        'expiry_date',
        'status',
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'price' => 'decimal:2',
        'stock' => 'integer',
        'reorder_level' => 'integer',
    ];

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
        return $this->expiry_date->diffInDays(now()) <= 30 && $this->expiry_date >= now();
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
            'reference_id' => $referenceId,
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
            'reference_id' => $referenceId,
        ]);
    }
}
