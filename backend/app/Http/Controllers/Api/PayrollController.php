<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Notification;
use App\Models\Payroll;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PayrollController extends Controller
{
    /**
     * List all payroll records with optional filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payroll::with(['user', 'processor']);

        // Filter by pay period label
        if ($request->has('pay_period')) {
            $query->where('pay_period_label', $request->pay_period);
        }

        // Filter by date range
        if ($request->has('period_start') && $request->has('period_end')) {
            $query->where('pay_period_start', $request->period_start)
                  ->where('pay_period_end', $request->period_end);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->forUser($request->user_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        // Filter by department
        if ($request->has('department')) {
            $query->where('department', $request->department);
        }

        // Search by name or payroll_id
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('payroll_id', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $payrolls = $query->orderBy('pay_period_start', 'desc')->get();

        // Calculate summary statistics
        $summary = [
            'total_employees' => $payrolls->count(),
            'total_gross' => round($payrolls->sum('gross_pay'), 2),
            'total_net' => round($payrolls->sum('net_pay'), 2),
            'total_deductions' => round($payrolls->sum(function ($p) {
                return $p->sss_contribution + $p->philhealth_contribution + 
                       $p->pagibig_contribution + $p->tax_deduction + 
                       $p->deductions + $p->late_deductions + $p->absent_deductions;
            }), 2),
            'total_contributions' => round($payrolls->sum(function ($p) {
                return $p->sss_contribution + $p->philhealth_contribution + $p->pagibig_contribution;
            }), 2),
            'paid_count' => $payrolls->where('status', 'paid')->count(),
            'pending_count' => $payrolls->where('status', 'pending')->count(),
            'draft_count' => $payrolls->where('status', 'draft')->count(),
            'processing_count' => $payrolls->where('status', 'processing')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $payrolls,
            'summary' => $summary,
        ]);
    }

    /**
     * Generate payroll from attendance records for a date range
     */
    public function generate(Request $request): JsonResponse
    {
        if ($request->has('start_date') && !$request->has('period_start')) {
            $request->merge(['period_start' => $request->input('start_date')]);
        }

        if ($request->has('end_date') && !$request->has('period_end')) {
            $request->merge(['period_end' => $request->input('end_date')]);
        }

        $validated = $request->validate([
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
        ]);

        $startDate = $validated['period_start'];
        $endDate = $validated['period_end'];
        $periodLabel = Carbon::parse($startDate)->format('M d') . ' - ' . Carbon::parse($endDate)->format('M d, Y');

        // Get all employees (staff roles)
        $employees = User::whereIn('role', [
            'manager',
            'cashier',
            'receptionist',
            'veterinary',
            'inventory',
            'payroll',
            'staff',
            'groomer',
        ])->where('is_active', true)->get();

        $generated = [];
        $errors = [];

        foreach ($employees as $employee) {
            try {
                // Get attendance records for the period
                $attendanceRecords = Attendance::where('user_id', $employee->id)
                    ->whereBetween('date', [$startDate, $endDate])
                    ->get();

                // Calculate attendance metrics
                $presentDays = $attendanceRecords->whereIn('status', ['present'])->count();
                $lateDays = $attendanceRecords->where('status', 'late')->count();
                $earlyLeaveDays = $attendanceRecords->where('status', 'early_leave')->count();
                $absentDays = $attendanceRecords->where('status', 'absent')->count();

                $regularHours = $attendanceRecords->sum('total_hours');
                $overtimeHours = $attendanceRecords->sum('overtime_hours');

                // Get employee salary info
                $baseSalary = $employee->base_salary ?? 15000; // Default minimum
                $hourlyRate = $employee->hourly_rate ?? ($baseSalary / 160); // 160 hours per month

                // Calculate deductions
                $dailyRate = $baseSalary / 22; // 22 working days per month
                $lateDeductions = $lateDays * ($dailyRate * 0.1); // 10% per late
                $absentDeductions = $absentDays * $dailyRate;

                // Calculate earnings
                $overtimePay = $overtimeHours * ($hourlyRate * 1.5); // 1.5x for OT

                // Create or update payroll record
                $payroll = Payroll::updateOrCreate(
                    [
                        'user_id' => $employee->id,
                        'pay_period_start' => $startDate,
                        'pay_period_end' => $endDate,
                    ],
                    [
                        'pay_period_label' => $periodLabel,
                        'department' => $employee->department ?? 'Unassigned',
                        'position' => $employee->position ?? $employee->role,
                        'base_salary' => $baseSalary,
                        'hourly_rate' => round($hourlyRate, 2),
                        'working_days' => 22,
                        'present_days' => $presentDays,
                        'absent_days' => $absentDays,
                        'regular_hours' => round($regularHours, 2),
                        'overtime_hours' => round($overtimeHours, 2),
                        'overtime_pay' => round($overtimePay, 2),
                        'bonus' => 0,
                        'allowances' => 0,
                        'deductions' => 0,
                        'late_deductions' => round($lateDeductions, 2),
                        'absent_deductions' => round($absentDeductions, 2),
                        'status' => 'draft',
                        'processed_by' => auth()->id(),
                        'processed_at' => now(),
                    ]
                );

                // Auto-calculate the payroll
                $payroll->calculatePayroll();
                $payroll->save();

                $generated[] = $payroll->load('user');
            } catch (\Exception $e) {
                $errors[] = [
                    'user_id' => $employee->id,
                    'name' => $employee->name,
                    'error' => $e->getMessage(),
                ];
            }
        }

        // Send notifications after generation
        if (count($generated) > 0) {
            Notification::create([
                'role' => 'manager',
                'title' => 'Payroll Generated',
                'message' => 'Payroll has been generated for ' . $periodLabel . ' (' . count($generated) . ' employees).',
                'type' => 'info',
                'related_type' => 'payroll',
            ]);

            Notification::create([
                'role' => 'manager',
                'title' => 'Payroll Ready for Review',
                'message' => 'New payroll records are ready for review and approval.',
                'type' => 'success',
                'related_type' => 'payroll',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Payroll generated from attendance records.',
            'data' => $generated,
            'errors' => $errors,
            'summary' => [
                'generated_count' => count($generated),
                'error_count' => count($errors),
                'period_start' => $startDate,
                'period_end' => $endDate,
            ],
        ]);
    }

    /**
     * Approve payroll (change status from draft/processing to pending)
     */
    public function approve(Payroll $payroll): JsonResponse
    {
        if ($payroll->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot approve already paid payroll.',
            ], 422);
        }

        $payroll->update([
            'status' => 'pending',
            'processed_by' => auth()->id(),
            'processed_at' => now(),
        ]);

        $payroll->load('user');

        // Send notifications
        Notification::create([
            'role' => 'manager',
            'title' => 'Payroll Approved',
            'message' => 'Payroll for ' . ($payroll->user->name ?? 'employee') . ' has been approved.',
            'type' => 'success',
            'related_type' => 'payroll',
            'related_id' => $payroll->id,
        ]);

        Notification::create([
            'role' => 'cashier',
            'title' => 'Payroll Payment Required',
            'message' => 'Approved payroll for ' . ($payroll->user->name ?? 'employee') . ' is ready for payment.',
            'type' => 'warning',
            'related_type' => 'payroll',
            'related_id' => $payroll->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payroll approved successfully.',
            'data' => $payroll->load(['user', 'processor']),
        ]);
    }

    /**
     * Mark payroll as paid
     */
    public function markAsPaid(Payroll $payroll): JsonResponse
    {
        if ($payroll->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Payroll is already marked as paid.',
            ], 422);
        }

        $payroll->update([
            'status' => 'paid',
            'payment_date' => now(),
            'payment_method' => 'Bank Transfer', // Default, can be customized
            'processed_by' => auth()->id(),
            'processed_at' => now(),
        ]);

        $payroll->load('user');

        // Send notifications
        Notification::create([
            'role' => 'manager',
            'title' => 'Payroll Paid',
            'message' => 'Payroll for ' . ($payroll->user->name ?? 'employee') . ' has been marked as paid.',
            'type' => 'success',
            'related_type' => 'payroll',
            'related_id' => $payroll->id,
        ]);

        Notification::create([
            'user_id' => $payroll->user_id,
            'title' => 'Payslip Available',
            'message' => 'Your payroll has been marked as paid. You may now download your payslip.',
            'type' => 'info',
            'related_type' => 'payroll',
            'related_id' => $payroll->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payroll marked as paid.',
            'data' => $payroll->load(['user', 'processor']),
        ]);
    }

    /**
     * Get single payroll details
     */
    public function show(Payroll $payroll): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $payroll->load(['user', 'processor']),
        ]);
    }

    /**
     * Delete payroll record
     */
    public function destroy(Payroll $payroll): JsonResponse
    {
        if ($payroll->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete paid payroll records.',
            ], 422);
        }

        $payroll->delete();

        return response()->json([
            'success' => true,
            'message' => 'Payroll deleted successfully.',
        ]);
    }
}
