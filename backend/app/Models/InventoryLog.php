<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryLog extends Model
{
    protected $fillable = [
        'inventory_item_id',
        'type',
        'quantity',
        'stock_before',
        'stock_after',
        'reference',
    ];

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }
}
