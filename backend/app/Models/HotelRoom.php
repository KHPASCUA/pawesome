<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HotelRoom extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_number',
        'name',
        'description',
        'type',
        'size',
        'capacity',
        'daily_rate',
        'status',
        'amenities',
        'notes',
    ];

    protected $casts = [
        'amenities' => 'array',
        'daily_rate' => 'decimal:2',
    ];

    public function boardings(): HasMany
    {
        return $this->hasMany(Boarding::class);
    }

    public function currentBoarding()
    {
        return $this->boardings()
            ->whereIn('status', ['checked_in', 'confirmed'])
            ->where('check_out', '>=', now())
            ->first();
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeBySize($query, $size)
    {
        return $query->where('size', $size);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function isAvailableForDates($checkIn, $checkOut)
    {
        $conflicting = $this->boardings()
            ->whereIn('status', ['confirmed', 'checked_in'])
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->whereBetween('check_in', [$checkIn, $checkOut])
                    ->orWhereBetween('check_out', [$checkIn, $checkOut])
                    ->orWhere(function ($q) use ($checkIn, $checkOut) {
                        $q->where('check_in', '<=', $checkIn)
                            ->where('check_out', '>=', $checkOut);
                    });
            })
            ->exists();

        return !$conflicting;
    }
}
