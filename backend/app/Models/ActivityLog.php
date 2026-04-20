<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'description',
        'category',
        'subcategory',
        'reference_type',
        'reference_id',
        'metadata',
        'ip_address',
        'user_agent',
        'status',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Log a user activity
     */
    public static function log($userId, $action, $description = null, $options = [])
    {
        return self::create([
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'category' => $options['category'] ?? 'general',
            'subcategory' => $options['subcategory'] ?? null,
            'reference_type' => $options['reference_type'] ?? null,
            'reference_id' => $options['reference_id'] ?? null,
            'metadata' => $options['metadata'] ?? null,
            'ip_address' => $options['ip_address'] ?? request()->ip(),
            'user_agent' => $options['user_agent'] ?? request()->userAgent(),
            'status' => $options['status'] ?? 'completed',
        ]);
    }

    /**
     * Log activity for the authenticated user
     */
    public static function logForAuthUser($action, $description = null, $options = [])
    {
        $userId = auth()->id();
        if (!$userId) {
            return null;
        }
        return self::log($userId, $action, $description, $options);
    }
}
