<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role',
        'title',
        'message',
        'type',
        'read',
        'related_type',
        'related_id',
        'data',
        'read_at',
    ];

    protected $casts = [
        'read' => 'boolean',
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function related(): MorphTo
    {
        return $this->morphTo();
    }

    public function markAsRead(): void
    {
        if (!$this->read) {
            $this->update([
                'read' => true,
                'read_at' => now(),
            ]);
        }
    }

    public function markAsUnread(): void
    {
        if ($this->read) {
            $this->update([
                'read' => false,
                'read_at' => null,
            ]);
        }
    }

    public function scopeUnread($query)
    {
        return $query->where('read', false);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForRole($query, $role)
    {
        return $query->where('role', $role);
    }

    public function scopeForUserOrRole($query, $userId, $role)
    {
        return $query->where(function ($q) use ($userId, $role) {
            $q->where('user_id', $userId)
              ->orWhere('role', $role);
        });
    }

    public function scopeRecent($query, $limit = 20)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }
}
