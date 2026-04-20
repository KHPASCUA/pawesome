<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * Get all activity logs with filtering
     */
    public function index(Request $request)
    {
        $query = ActivityLog::with('user');

        // Filter by category
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Filter by subcategory
        if ($request->has('subcategory') && $request->subcategory !== 'all') {
            $query->where('subcategory', $request->subcategory);
        }

        // Filter by user
        if ($request->has('user_id') && $request->user_id !== 'all') {
            $query->where('user_id', $request->user_id);
        }

        // Filter by action
        if ($request->has('action') && $request->action) {
            $query->where('action', 'like', '%' . $request->action . '%');
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Filter by search term
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%')
                  ->orWhere('reference_id', 'like', '%' . $search . '%');
            });
        }

        // Order by created_at desc (newest first)
        $query->orderBy('created_at', 'desc');

        // Paginate results
        $perPage = $request->get('per_page', 50);
        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * Get activity log statistics
     */
    public function statistics(Request $request)
    {
        $days = $request->get('days', 30);
        $since = now()->subDays($days);

        $stats = [
            'total_logs' => ActivityLog::where('created_at', '>=', $since)->count(),
            'by_category' => ActivityLog::where('created_at', '>=', $since)
                ->selectRaw('category, count(*) as count')
                ->groupBy('category')
                ->get(),
            'by_user' => ActivityLog::where('created_at', '>=', $since)
                ->whereNotNull('user_id')
                ->with('user:id,name,email,role')
                ->selectRaw('user_id, count(*) as count')
                ->groupBy('user_id')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
            'daily_activity' => ActivityLog::where('created_at', '>=', $since)
                ->selectRaw('DATE(created_at) as date, count(*) as count')
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Get a single activity log
     */
    public function show($id)
    {
        $log = ActivityLog::with('user')->find($id);

        if (!$log) {
            return response()->json(['message' => 'Activity log not found'], 404);
        }

        return response()->json($log);
    }

    /**
     * Get activity logs for a specific user
     */
    public function userLogs($userId, Request $request)
    {
        $query = ActivityLog::with('user')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc');

        $perPage = $request->get('per_page', 50);
        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * Get unique categories and subcategories for filters
     */
    public function filters()
    {
        $categories = ActivityLog::distinct()->pluck('category');
        $subcategories = ActivityLog::distinct()->pluck('subcategory');
        $actions = ActivityLog::distinct()->pluck('action');

        return response()->json([
            'categories' => $categories,
            'subcategories' => $subcategories->filter(),
            'actions' => $actions,
        ]);
    }
}
