<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryMonthlyAudit extends Model
{
    protected $fillable = [
        'inventory_item_id',
        'audit_month',
        'system_stock',
        'actual_stock',
        'variance',
        'status',
        'reason',
    ];

    protected $casts = [
        'system_stock' => 'integer',
        'actual_stock' => 'integer',
        'variance' => 'integer',
    ];

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }
}
