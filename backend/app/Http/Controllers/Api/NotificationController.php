<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user->role ?? null;
        $userId = $user->id;

        // Get notifications for user or their role
        $query = Notification::query()
            ->where(function ($q) use ($userId, $role) {
                $q->where('user_id', $userId)
                  ->orWhere('role', $role);
            })
            ->latest();

        $notifications = $query->limit(30)->get();
        $unreadCount = (clone $query)->where('read', false)->count();

        return response()->json([
            'success' => true,
            'notifications' => $notifications->map(fn ($n) => $this->formatNotification($n)),
            'unread_count' => $unreadCount,
        ]);
    }

    public function markAsRead(Notification $notification)
    {
        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read.',
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        $role = $user->role ?? null;
        $userId = $user->id;

        Notification::where(function ($q) use ($userId, $role) {
            $q->where('user_id', $userId)
              ->orWhere('role', $role);
        })->update([
            'read' => true,
            'read_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read.',
        ]);
    }

    private function formatNotification(Notification $notification): array
    {
        return [
            'id' => $notification->id,
            'title' => $notification->title,
            'message' => $notification->message,
            'type' => $notification->type,
            'read' => $notification->read,
            'user_id' => $notification->user_id,
            'role' => $notification->role,
            'related_type' => $notification->related_type,
            'related_id' => $notification->related_id,
            'data' => $notification->data,
            'read_at' => $notification->read_at?->toIso8601String(),
            'created_at' => $notification->created_at?->toIso8601String(),
            'time' => $notification->created_at?->diffForHumans() ?? 'Just now',
        ];
    }
}
