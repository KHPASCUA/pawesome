<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceRequest extends Model
{
    protected $fillable = [
        'customer_name',
        'customer_email',
        'customer_phone',
        'pet_name',
        'pet_type',
        'pet_age',
        'pet_breed',
        'request_type',
        'service_name',
        'request_date',
        'request_time',
        'preferred_time',
        'notes',
        'status',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason',
        'receptionist_remarks',
        'payment_status',
        'payment_method',
        'payment_reference',
        'payment_proof',
        'paid_at',
        'verified_by',
        'cashier_remarks',
        'receipt_number',
    ];
}
