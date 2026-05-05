<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryLog extends Model
{
    protected $fillable = [
        'inventory_item_id',
        'delta',
        'reason',
        'reference_type',
        'reference_id',
        'movement_type',
        'type',
        'quantity',
        'stock_before',
        'stock_after',
        'previous_stock',
        'new_stock',
        'reference',
        'performed_by',
        'role',
        'user_id',
        'details',
    ];

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
