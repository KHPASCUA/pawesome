<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceRequest extends Model
{
    protected $fillable = [
        'request_type',
        'service_type',
        'customer_name',
        'customer_email',
        'pet_name',
        'service_name',
        'request_date',
        'request_time',
        'status',
        'payment_status',
        'notes',
    ];
}
