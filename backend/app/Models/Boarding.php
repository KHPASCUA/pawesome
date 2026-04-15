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
        'total_amount' => 'decimal:2',
    ];

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
