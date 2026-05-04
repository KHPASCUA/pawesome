<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryMonthlyAudit extends Model
{
    protected $fillable = [
        'inventory_item_id',
        'system_stock',
        'actual_stock',
        'variance',
        'audit_month',
        'status',
        'reason',
        'checked_by',
    ];

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }
}
