<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'telegram_chat_id',
        'notification_preferences',
    ];

    protected $casts = [
        'notification_preferences' => 'array',
    ];
}
