<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Boarding extends Model
{
    use HasFactory;

    protected $fillable = [
        'pet_id',
        'customer_id',
        'hotel_room_id',
        'check_in',
        'check_out',
        'status',
        'total_amount',
        'payment_status',
        'notes',
        'special_requests',
        'reminder_sent_at',
        'emergency_contact',
        'emergency_phone',
        'confirmed_at',
        'actual_check_in',
        'actual_check_out',
    ];

    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'actual_check_in' => 'datetime',
        'actual_check_out' => 'datetime',
        'confirmed_at' => 'datetime',
        'reminder_sent_at' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Valid boarding statuses
     */
    public const VALID_STATUSES = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

    /**
     * Valid payment statuses
     */
    public const VALID_PAYMENT_STATUSES = ['pending', 'partial', 'paid', 'refunded'];

    /**
     * Boot method for model-level validation
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($boarding) {
            // Validate status
            if (!in_array($boarding->status, self::VALID_STATUSES)) {
                $boarding->status = 'pending';
            }

            // Validate payment status
            if (!in_array($boarding->payment_status, self::VALID_PAYMENT_STATUSES)) {
                $boarding->payment_status = 'pending';
            }

            // Ensure non-negative amount
            $boarding->total_amount = max(0, (float) $boarding->total_amount);

            // Ensure check_out is after check_in
            if ($boarding->check_in && $boarding->check_out) {
                $checkIn = $boarding->check_in instanceof \Carbon\Carbon 
                    ? $boarding->check_in 
                    : \Carbon\Carbon::parse($boarding->check_in);
                $checkOut = $boarding->check_out instanceof \Carbon\Carbon 
                    ? $boarding->check_out 
                    : \Carbon\Carbon::parse($boarding->check_out);
                
                if ($checkOut->lessThanOrEqualTo($checkIn)) {
                    $boarding->check_out = $checkIn->copy()->addDay();
                }
            }
        });
    }

    public function pet(): BelongsTo
    {
        return $this->belongsTo(Pet::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function hotelRoom(): BelongsTo
    {
        return $this->belongsTo(HotelRoom::class);
    }

    public function scopeCurrent($query)
    {
        return $query->whereIn('status', ['checked_in', 'confirmed'])
            ->where('check_out', '>=', now());
    }

    public function scopeCheckedIn($query)
    {
        return $query->where('status', 'checked_in');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeForDateRange($query, $start, $end)
    {
        return $query->whereBetween('check_in', [$start, $end])
            ->orWhereBetween('check_out', [$start, $end]);
    }

    public function calculateTotalAmount()
    {
        if (!$this->hotel_room_id || !$this->check_in || !$this->check_out) {
            return 0;
        }

        $days = $this->check_in->diffInDays($this->check_out);
        $days = max(1, $days);

        return $days * $this->hotelRoom->daily_rate;
    }

    public function confirm()
    {
        $this->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
    }

    public function checkIn()
    {
        $this->update([
            'status' => 'checked_in',
            'actual_check_in' => now(),
        ]);

        $this->hotelRoom?->update(['status' => 'occupied']);
    }

    public function checkOut()
    {
        $this->update([
            'status' => 'checked_out',
            'actual_check_out' => now(),
        ]);

        $this->hotelRoom?->update(['status' => 'available']);
    }
}
