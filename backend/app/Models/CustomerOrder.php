<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomerOrder extends Model
{
    protected $table = 'customer_orders';

    protected $fillable = [
        'customer_id',
        'customer_email',
        'customer_name',
        'total_amount',
        'order_type',
        'payment_method',
        'payment_reference',
        'payment_proof',
        'status',
        'payment_status',
        'paid_at',
        'verified_by',
        'cashier_remarks',
        'receipt_number',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function customerUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(CustomerOrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'order_id');
    }
}
