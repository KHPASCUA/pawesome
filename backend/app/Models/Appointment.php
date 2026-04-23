<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id', 'pet_id', 'service_id', 'veterinarian_id', 'status',
        'scheduled_at', 'completed_at', 'price', 'notes', 'cancellation_reason'
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'reminder_sent_at' => 'datetime',
    ];

    // Status constants for consistency
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_NO_SHOW = 'no_show';

    /**
     * Valid statuses
     */
    public const VALID_STATUSES = [self::STATUS_PENDING, self::STATUS_APPROVED, self::STATUS_COMPLETED, self::STATUS_CANCELLED, self::STATUS_NO_SHOW];

    /**
     * Boot method for model-level validation
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($appointment) {
            // Validate status
            if (!in_array($appointment->status, self::VALID_STATUSES)) {
                $appointment->status = self::STATUS_PENDING;
            }

            // Ensure non-negative price
            $appointment->price = max(0, (float) $appointment->price);

            // Ensure scheduled_at is not in the past for new appointments
            if ($appointment->isDirty('scheduled_at') && $appointment->scheduled_at && $appointment->scheduled_at < now()) {
                // Allow if it's just being updated (not strict for rescheduling)
                // Only prevent on create
                if (!$appointment->exists) {
                    $appointment->scheduled_at = now()->addHour();
                }
            }
        });
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function veterinarian()
    {
        return $this->belongsTo(User::class, 'veterinarian_id');
    }

    // Check if appointment can be cancelled
    public function canBeCancelled(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_APPROVED]);
    }

    // Check if appointment can be rescheduled
    public function canBeRescheduled(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_APPROVED]);
    }

    // Check if appointment can be completed
    public function canBeCompleted(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }
}
