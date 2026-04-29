<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    protected $fillable = [
        'name',
        'category',
        'description',
        'stock',
        'reorder_level',
        'price',
        'status',
        'is_sellable',
    ];

    public function logs()
    {
        return $this->hasMany(InventoryLog::class);
    }
}
