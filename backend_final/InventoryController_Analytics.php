<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryMonthlyAudit;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    // Existing methods...
    
    /**
     * Get audit analytics data for charts
     */
    public function getAuditAnalytics(Request $request)
    {
        $months = $request->query('months', 6); // Default to last 6 months
        
        $analytics = InventoryMonthlyAudit::with('item')
            ->where('audit_month', '>=', now()->subMonths($months)->format('Y-m'))
            ->orderBy('audit_month')
            ->get()
            ->groupBy('audit_month');
            
        $chartData = [];
        $totalStats = [
            'total_items' => 0,
            'total_checked' => 0,
            'total_matched' => 0,
            'total_discrepancies' => 0,
            'total_variance' => 0,
            'accuracy_rate' => 0
        ];
        
        foreach ($analytics as $month => $audits) {
            $monthStats = [
                'month' => $month,
                'total_items' => $audits->count(),
                'checked' => $audits->where('actual_stock', '!=', null)->count(),
                'matched' => $audits->where('status', 'matched')->count(),
                'discrepancies' => $audits->where('status', 'discrepancy')->count(),
                'variance' => $audits->sum('variance'),
                'accuracy_rate' => $audits->count() > 0 ? 
                    ($audits->where('status', 'matched')->count() / $audits->count()) * 100 : 0
            ];
            
            $chartData[] = $monthStats;
            
            // Accumulate totals
            $totalStats['total_items'] += $monthStats['total_items'];
            $totalStats['total_checked'] += $monthStats['checked'];
            $totalStats['total_matched'] += $monthStats['matched'];
            $totalStats['total_discrepancies'] += $monthStats['discrepancies'];
            $totalStats['total_variance'] += $monthStats['variance'];
        }
        
        $totalStats['accuracy_rate'] = $totalStats['total_checked'] > 0 ? 
            ($totalStats['total_matched'] / $totalStats['total_checked']) * 100 : 0;
        
        return response()->json([
            'success' => true,
            'data' => $chartData,
            'summary' => $totalStats
        ]);
    }
    
    /**
     * Get discrepancy reasons breakdown
     */
    public function getDiscrepancyReasons(Request $request)
    {
        $reasons = InventoryMonthlyAudit::where('status', 'discrepancy')
            ->whereNotNull('reason')
            ->where('reason', '!=', '')
            ->selectRaw('reason, COUNT(*) as count')
            ->groupBy('reason')
            ->orderBy('count', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $reasons
        ]);
    }
}
