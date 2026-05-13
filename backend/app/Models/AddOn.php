<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AddOn extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'add_on_type',
        'charge_type',
        'unit_price',
        'species_allowed',
        'size_allowed',
        'inventory_item_id',
        'quantity_per_unit',
        'status',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'species_allowed' => 'array',
        'size_allowed' => 'array',
        'status' => 'boolean',
    ];

    /**
     * Get booking add-ons for this add-on
     */
    public function bookingAddOns(): HasMany
    {
        return $this->hasMany(BookingAddOn::class);
    }

    /**
     * Get inventory item if linked
     */
    public function inventoryItem(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Scope for active add-ons
     */
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    /**
     * Scope for inventory item add-ons
     */
    public function scopeInventoryItems($query)
    {
        return $query->where('add_on_type', 'inventory_item');
    }

    /**
     * Scope for service add-ons
     */
    public function scopeServices($query)
    {
        return $query->where('add_on_type', 'service');
    }
}
