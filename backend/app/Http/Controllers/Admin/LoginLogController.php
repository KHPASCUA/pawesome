<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoginLog;
use Illuminate\Http\Request;

class LoginLogController extends Controller
{
    /**
     * Get all login logs with filtering
     */
    public function index(Request $request)
    {
        $query = LoginLog::with('user');

        // Filter by action (login/logout)
        if ($request->has('action') && $request->action !== 'all') {
            $query->where('action', $request->action);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by user
        if ($request->has('user_id') && $request->user_id !== 'all') {
            $query->where('user_id', $request->user_id);
        }

        // Filter by search (email, name, or IP)
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', '%' . $search . '%')
                  ->orWhere('ip_address', 'like', '%' . $search . '%')
                  ->orWhereHas('user', function ($userQ) use ($search) {
                      $userQ->where('name', 'like', '%' . $search . '%');
                  });
            });
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Order by created_at desc (newest first)
        $query->orderBy('created_at', 'desc');

        // Paginate results
        $perPage = $request->get('per_page', 50);
        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * Get login log statistics
     */
    public function statistics(Request $request)
    {
        $days = $request->get('days', 30);
        $since = now()->subDays($days);

        $stats = [
            'total_logins' => LoginLog::where('created_at', '>=', $since)
                ->where('action', 'login')
                ->count(),
            'successful_logins' => LoginLog::where('created_at', '>=', $since)
                ->where('action', 'login')
                ->where('status', 'success')
                ->count(),
            'failed_logins' => LoginLog::where('created_at', '>=', $since)
                ->where('action', 'login')
                ->where('status', 'failed')
                ->count(),
            'unique_users' => LoginLog::where('created_at', '>=', $since)
                ->where('action', 'login')
                ->where('status', 'success')
                ->distinct('user_id')
                ->count('user_id'),
            'daily_logins' => LoginLog::where('created_at', '>=', $since)
                ->where('action', 'login')
                ->where('status', 'success')
                ->selectRaw('DATE(created_at) as date, count(*) as count')
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get(),
            'top_users' => LoginLog::where('created_at', '>=', $since)
                ->where('action', 'login')
                ->where('status', 'success')
                ->with('user:id,name,email,role')
                ->selectRaw('user_id, count(*) as count')
                ->groupBy('user_id')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Get recent login activity
     */
    public function recent(Request $request)
    {
        $limit = $request->get('limit', 20);

        $logs = LoginLog::with('user:id,name,email,role')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($logs);
    }

    /**
     * Get login logs for a specific user
     */
    public function userLogs($userId, Request $request)
    {
        $query = LoginLog::with('user')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc');

        $perPage = $request->get('per_page', 50);
        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * Get user's current sessions (active logins)
     */
    public function userSessions($userId)
    {
        $sessions = LoginLog::where('user_id', $userId)
            ->where('action', 'login')
            ->where('status', 'success')
            ->whereNull('logged_out_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($sessions);
    }
}
