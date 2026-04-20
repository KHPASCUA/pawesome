<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email',
        'action',
        'ip_address',
        'user_agent',
        'status',
        'failure_reason',
        'logged_out_at',
    ];

    protected $casts = [
        'logged_out_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Log a login attempt
     */
    public static function logLogin($userId, $email, $status = 'success', $failureReason = null)
    {
        return self::create([
            'user_id' => $userId,
            'email' => $email,
            'action' => 'login',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'status' => $status,
            'failure_reason' => $failureReason,
        ]);
    }

    /**
     * Log a logout
     */
    public static function logLogout($userId, $email)
    {
        $log = self::where('user_id', $userId)
            ->where('action', 'login')
            ->where('status', 'success')
            ->latest()
            ->first();

        if ($log && !$log->logged_out_at) {
            $log->update(['logged_out_at' => now()]);
        }

        return self::create([
            'user_id' => $userId,
            'email' => $email,
            'action' => 'logout',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'status' => 'success',
        ]);
    }
}
