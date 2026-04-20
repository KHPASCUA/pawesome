<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'cashier_id',
        'transaction_number',
        'type',
        'status',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'discount_code',
        'total_amount',
        'amount',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($sale) {
            if (empty($sale->transaction_number)) {
                $sale->transaction_number = 'TRX-' . strtoupper(uniqid());
            }
            // Keep amount in sync with total_amount for backward compatibility
            if (empty($sale->amount) && !empty($sale->total_amount)) {
                $sale->amount = $sale->total_amount;
            }
        });
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function calculateTotals(): void
    {
        $subtotal = $this->items->sum('total_price');
        $tax = $subtotal * 0.12; // 12% tax rate
        $discount = $this->discount_amount ?? 0;
        $total = max($subtotal + $tax - $discount, 0);

        $this->update([
            'subtotal' => $subtotal,
            'tax_amount' => $tax,
            'total_amount' => $total,
            'amount' => $total,
        ]);
    }

    public function markAsCompleted(): void
    {
        $this->update(['status' => 'completed']);
    }

    public function markAsCancelled(?string $reason = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'notes' => $reason ? $this->notes . ' [Cancelled: ' . $reason . ']' : $this->notes,
        ]);
    }
}
