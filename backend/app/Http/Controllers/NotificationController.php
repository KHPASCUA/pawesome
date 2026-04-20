<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Notification::forUser($user->id);

        // Filter by read status
        if ($request->has('unread')) {
            $query->unread();
        }

        // Limit results
        $limit = max(1, min((int) $request->get('limit', 20), 50));
        $notifications = $query->recent($limit)->get();

        // Get unread count
        $unreadCount = Notification::forUser($user->id)->unread()->count();

        return response()->json([
            'notifications' => $notifications->map(fn (Notification $notification) => $this->formatNotification($notification)),
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Create a new notification (admin/system use)
     */
    public function store(Request $request): JsonResponse
    {
        /** @var User $actor */
        $actor = $request->user();

        if ($actor->role !== 'admin') {
            return response()->json(['message' => 'Only administrators can create notifications.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'nullable|in:success,warning,error,info',
            'related_type' => 'nullable|string',
            'related_id' => 'nullable|integer',
            'data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $notification = Notification::create([
            'user_id' => $request->user_id,
            'title' => $request->title,
            'message' => $request->message,
            'type' => $request->type ?? 'info',
            'related_type' => $request->related_type,
            'related_id' => $request->related_id,
            'data' => $request->data,
            'read' => false,
        ]);

        return response()->json([
            'message' => 'Notification created successfully',
            'notification' => $notification,
        ], 201);
    }

    /**
     * Mark a specific notification as read
     */
    public function markAsRead(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $notification = Notification::forUser($user->id)->findOrFail($id);
        $notification->markAsRead();

        $unreadCount = Notification::forUser($user->id)->unread()->count();

        return response()->json([
            'message' => 'Notification marked as read',
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        
        Notification::forUser($user->id)
            ->unread()
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => 'All notifications marked as read',
            'unread_count' => 0,
        ]);
    }

    /**
     * Clear/delete all notifications
     */
    public function clearAll(Request $request): JsonResponse
    {
        $user = $request->user();
        
        Notification::forUser($user->id)->delete();

        return response()->json([
            'message' => 'All notifications cleared',
            'unread_count' => 0,
        ]);
    }

    /**
     * Delete a specific notification
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $notification = Notification::forUser($user->id)->findOrFail($id);
        $notification->delete();

        $unreadCount = Notification::forUser($user->id)->unread()->count();

        return response()->json([
            'message' => 'Notification deleted',
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Get unread count only (for badge)
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();
        $count = Notification::forUser($user->id)->unread()->count();

        return response()->json(['unread_count' => $count]);
    }

    private function formatNotification(Notification $notification): array
    {
        return [
            'id' => $notification->id,
            'title' => $notification->title,
            'message' => $notification->message,
            'type' => $notification->type,
            'read' => $notification->read,
            'related_type' => $notification->related_type,
            'related_id' => $notification->related_id,
            'data' => $notification->data,
            'read_at' => optional($notification->read_at)?->toIso8601String(),
            'created_at' => optional($notification->created_at)?->toIso8601String(),
            'time' => optional($notification->created_at)?->diffForHumans() ?? 'Just now',
        ];
    }
}
