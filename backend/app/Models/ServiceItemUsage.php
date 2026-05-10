<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceItemUsage extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_type',
        'service_id',
        'appointment_id',
        'pet_id',
        'inventory_item_id',
        'batch_id',
        'quantity_used',
        'unit',
        'used_by',
        'notes',
    ];

    protected $casts = [
        'quantity_used' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Service type constants
    const SERVICE_VETERINARY = 'veterinary';
    const SERVICE_GROOMING = 'grooming';
    const SERVICE_BOARDING = 'boarding';
    const SERVICE_CASHIER = 'cashier';

    /**
     * Get the inventory item that was used
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the inventory batch that was used
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(InventoryBatch::class);
    }

    /**
     * Get the appointment where usage occurred
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(VetAppointment::class, 'appointment_id');
    }

    /**
     * Get the pet that received the service
     */
    public function pet(): BelongsTo
    {
        return $this->belongsTo(Pet::class);
    }

    /**
     * Get the user who recorded the usage
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'used_by');
    }

    /**
     * Scope for veterinary usage
     */
    public function scopeVeterinary($query)
    {
        return $query->where('service_type', self::SERVICE_VETERINARY);
    }

    /**
     * Scope for grooming usage
     */
    public function scopeGrooming($query)
    {
        return $query->where('service_type', self::SERVICE_GROOMING);
    }

    /**
     * Scope for boarding usage
     */
    public function scopeBoarding($query)
    {
        return $query->where('service_type', self::SERVICE_BOARDING);
    }

    /**
     * Scope for cashier usage
     */
    public function scopeCashier($query)
    {
        return $query->where('service_type', self::SERVICE_CASHIER);
    }
}
