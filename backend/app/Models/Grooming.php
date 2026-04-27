<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grooming extends Model
{
    protected $fillable = [
        'customer_id',
        'pet_id',
        'service',
        'appointment_date',
        'appointment_time',
        'notes',
        'amount',
        'status',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }
}
