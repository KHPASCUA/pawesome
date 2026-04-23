<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'payment_number',
        'payment_method',
        'card_type',
        'card_last_four',
        'reference_number',
        'amount',
        'change_amount',
        'status',
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    /**
     * Valid payment methods
     */
    public const VALID_PAYMENT_METHODS = ['cash', 'credit_card', 'debit_card', 'gcash', 'maya', 'bank_transfer', 'check'];

    /**
     * Valid payment statuses
     */
    public const VALID_STATUSES = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];

    /**
     * Boot method for model-level validation
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (empty($payment->payment_number)) {
                $payment->payment_number = 'PAY-' . strtoupper(uniqid());
            }
        });

        static::saving(function ($payment) {
            // Validate payment method
            if (!in_array($payment->payment_method, self::VALID_PAYMENT_METHODS)) {
                $payment->payment_method = 'cash';
            }

            // Validate status
            if (!in_array($payment->status, self::VALID_STATUSES)) {
                $payment->status = 'pending';
            }

            // Ensure non-negative amounts
            $payment->amount = max(0, (float) $payment->amount);
            $payment->change_amount = max(0, (float) $payment->change_amount);

            // Ensure change_amount doesn't exceed amount
            if ($payment->change_amount > $payment->amount) {
                $payment->change_amount = $payment->amount;
            }
        });
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'paid_at' => now(),
        ]);
    }

    public function markAsFailed(?string $reason = null): void
    {
        $this->update([
            'status' => 'failed',
            'notes' => $reason,
        ]);
    }

    public function processRefund(): void
    {
        $this->update(['status' => 'refunded']);
    }
}
