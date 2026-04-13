<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku',
        'name',
        'stock',
        'reorder_level',
        'price',
        'expiry_date',
    ];

    protected $casts = [
        'expiry_date' => 'date',
    ];
}
