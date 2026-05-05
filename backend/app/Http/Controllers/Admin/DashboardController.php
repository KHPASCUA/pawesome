<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Customer;
use App\Models\Appointment;
use App\Models\InventoryItem;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function overview()
    {
        $today = Carbon::today();
        
        return response()->json([
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'total_customers' => Customer::count(),
            'total_appointments' => Appointment::count(),
            'today_appointments' => Appointment::whereDate('scheduled_at', $today)->count(),
            'completed_appointments' => Appointment::where('status', 'completed')->count(),
            'total_revenue' => Sale::sum('amount'),
            'today_revenue' => Sale::whereDate('created_at', $today)->sum('amount'),
            'low_stock_items' => InventoryItem::whereColumn('stock', '<=', 'reorder_level')->count(),
            'appointments_by_status' => Appointment::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get(),
            'users_by_role' => User::selectRaw('role, COUNT(*) as count')
                ->groupBy('role')
                ->get(),
            'recent_users' => User::latest()->take(5)->get(),
            'recent_appointments' => Appointment::with(['customer', 'pet', 'service'])->latest()->take(5)->get(),
        ]);
    }

    public function stats()
    {
        return response()->json([
            'users_by_role' => User::selectRaw('role, count(*) as count')
                ->groupBy('role')
                ->get(),
            'appointments_by_status' => Appointment::selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->get(),
            'monthly_revenue' => Sale::selectRaw('MONTH(created_at) as month, SUM(amount) as total')
                ->whereYear('created_at', Carbon::now()->year)
                ->groupBy('month')
                ->get(),
        ]);
    }

    public function systemHealth()
    {
        $health = [
            'database' => $this->checkDatabaseHealth(),
            'backend' => $this->checkBackendHealth(),
            'filesystem' => $this->checkFilesystemHealth(),
            'memory' => $this->checkMemoryUsage(),
            'active_modules' => $this->getActiveModules(),
        ];
        
        return response()->json([
            'status' => 'healthy',
            'timestamp' => Carbon::now()->toISOString(),
            'health' => $health,
        ]);
    }

    private function checkDatabaseHealth()
    {
        try {
            \DB::connection()->getPdo();
            return [
                'status' => 'connected',
                'driver' => \DB::connection()->getConfig('driver'),
                'database' => \DB::connection()->getDatabaseName(),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    private function checkBackendHealth()
    {
        return [
            'status' => 'operational',
            'version' => app()->version(),
            'environment' => app()->environment(),
            'debug_mode' => config('app.debug', false),
            'timezone' => config('app.timezone', 'UTC'),
        ];
    }

    private function checkFilesystemHealth()
    {
        $storagePath = storage_path();
        $logsPath = storage_path('logs');
        
        return [
            'storage_writable' => is_writable($storagePath),
            'logs_writable' => is_writable($logsPath),
            'disk_usage' => disk_free_space('/') !== false,
            'storage_path' => $storagePath,
        ];
    }

    private function checkMemoryUsage()
    {
        $memoryUsage = memory_get_usage(true);
        $memoryLimit = ini_get('memory_limit');
        $parsedLimit = $this->parseMemoryLimit($memoryLimit);
        
        return [
            'current_usage' => $memoryUsage['real'],
            'peak_usage' => $memoryUsage['peak'],
            'limit' => $memoryLimit,
            'usage_percentage' => $parsedLimit > 0 ? round(($memoryUsage['real'] / $parsedLimit) * 100, 2) : 0,
        ];
    }

    private function parseMemoryLimit($limit)
    {
        $limit = strtolower($limit);
        $last = strtolower(substr($limit, -1));
        $value = (int) substr($limit, 0, -1);
        
        switch ($last) {
            case 'g': return $value * 1024 * 1024 * 1024;
            case 'm': return $value * 1024 * 1024;
            case 'k': return $value * 1024;
            default: return (int) $limit;
        }
    }

    private function getActiveModules()
    {
        return [
            'user_management' => true,
            'appointment_system' => true,
            'inventory_management' => true,
            'payment_processing' => true,
            'veterinary_services' => true,
            'hotel_management' => true,
            'reporting_system' => true,
            'notification_system' => true,
            'audit_logging' => true,
        ];
    }
}
