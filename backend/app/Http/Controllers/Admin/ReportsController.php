<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\Pet;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ReportsController extends Controller
{
    public function sales()
    {
        return response()->json([
            'sales' => Sale::latest()->get(),
        ]);
    }

    public function summary()
    {
        $today = Carbon::today();
        $year = Carbon::now()->year;

        $dbDriver = DB::getDriverName();
        if ($dbDriver === 'sqlite') {
            $monthlyRevenue = Sale::selectRaw('CAST(strftime("%m", created_at) AS INTEGER) as month, SUM(amount) as total')
                ->whereRaw('strftime("%Y", created_at) = ?', [$year])
                ->groupBy('month')
                ->orderBy('month')
                ->get();
        } else {
            $monthlyRevenue = Sale::selectRaw('MONTH(created_at) as month, SUM(amount) as total')
                ->whereYear('created_at', $year)
                ->groupBy('month')
                ->orderByRaw('month')
                ->get();
        }

        $topServices = Appointment::selectRaw('service_id, COUNT(*) as count')
            ->with('service')
            ->groupBy('service_id')
            ->orderByDesc('count')
            ->limit(3)
            ->get()
            ->map(fn ($item) => [
                'service' => $item->service?->name ?? 'Unknown Service',
                'count' => $item->count,
            ]);

        $topCustomers = Appointment::selectRaw('customer_id, COUNT(*) as count')
            ->with('customer')
            ->groupBy('customer_id')
            ->orderByDesc('count')
            ->limit(3)
            ->get()
            ->map(fn ($item) => [
                'customer' => $item->customer?->name ?? 'Unknown Customer',
                'visits' => $item->count,
            ]);

        return response()->json([
            'status' => 'success',
            'timestamp' => now()->toIso8601String(),
            'data' => [
                'total_revenue' => Sale::sum('amount'),
                'today_revenue' => Sale::whereDate('created_at', $today)->sum('amount'),
                'total_transactions' => Sale::count(),
                'today_transactions' => Sale::whereDate('created_at', $today)->count(),
                'total_customers' => Customer::count(),
                'new_customers' => Customer::where('created_at', '>=', Carbon::now()->subMonth())->count(),
                'total_users' => User::count(),
                'total_appointments' => Appointment::count(),
                'completed_appointments' => Appointment::where('status', 'completed')->count(),
                'total_pets' => Pet::count(),
                'total_inventory_items' => InventoryItem::count(),
                'low_stock_items' => $this->lowStockCount(),
                'out_of_stock_items' => InventoryItem::where('stock', 0)->count(),
                'monthly_revenue' => $monthlyRevenue,
                'top_services' => $topServices,
                'top_customers' => $topCustomers,
            ],
        ]);
    }

    public function overview(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => $this->overviewMetrics($request),
                'recent_actions' => $this->recentActions($request),
            ],
        ]);
    }

    public function cashier(Request $request)
    {
        $orders = $this->customerOrdersBase($request);
        $rows = $this->customerOrdersBase($request)
            ->leftJoin('users as verifier', 'verifier.id', '=', 'customer_orders.verified_by')
            ->select([
                'customer_orders.id',
                'customer_orders.customer_id',
                'customer_orders.customer_email',
                'customer_orders.customer_name',
                'customer_orders.total_amount',
                'customer_orders.status',
                'customer_orders.payment_status',
                'customer_orders.payment_method',
                'customer_orders.payment_reference',
                'customer_orders.payment_proof',
                'customer_orders.receipt_number',
                'customer_orders.paid_at',
                'customer_orders.cashier_remarks',
                'customer_orders.created_at',
                DB::raw('COALESCE(verifier.name, customer_orders.verified_by) as verified_by_name'),
            ])
            ->latest('customer_orders.created_at')
            ->limit(250)
            ->get();

        $posRevenue = $this->dateRange(DB::table('sales'), $request)->sum('amount');
        $paidOrderRevenue = (clone $orders)->where('payment_status', 'paid')->sum('total_amount');

        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'total_revenue' => (float) $paidOrderRevenue + (float) $posRevenue,
                    'paid_orders' => (clone $orders)->where('payment_status', 'paid')->count(),
                    'pending_payment_proofs' => (clone $orders)->where('payment_status', 'pending')->count(),
                    'rejected_payment_proofs' => (clone $orders)->where('payment_status', 'rejected')->count(),
                    'refunds' => $this->tableExists('payments')
                        ? $this->dateRange(DB::table('payments')->where('status', 'refunded'), $request)->count()
                        : 0,
                    'pos_revenue' => (float) $posRevenue,
                ],
                'orders' => $rows,
                'transactions' => $this->salesRows($request),
            ],
        ]);
    }

    public function inventory(Request $request)
    {
        $items = $this->inventoryItemsBase($request);
        $logs = $this->inventoryLogsBase($request)
            ->leftJoin('inventory_items', 'inventory_items.id', '=', 'inventory_logs.inventory_item_id')
            ->select([
                'inventory_logs.id',
                'inventory_logs.inventory_item_id',
                DB::raw('COALESCE(inventory_items.name, "Unknown Item") as item_name'),
                DB::raw($this->columnSelect('inventory_logs', 'movement_type', 'inventory_logs.type', 'movement_type')),
                DB::raw($this->columnSelect('inventory_logs', 'quantity', 'ABS(inventory_logs.delta)', 'quantity')),
                DB::raw($this->columnSelect('inventory_logs', 'previous_stock', 'inventory_logs.stock_before', 'previous_stock')),
                DB::raw($this->columnSelect('inventory_logs', 'new_stock', 'inventory_logs.stock_after', 'new_stock')),
                'inventory_logs.reason',
                DB::raw($this->columnSelect('inventory_logs', 'performed_by', 'inventory_logs.user_id', 'performed_by')),
                'inventory_logs.created_at',
            ])
            ->latest('inventory_logs.created_at')
            ->limit(300)
            ->get();

        $stockValue = (clone $items)->sum(DB::raw('stock * price'));
        $topBrand = $this->topBrand($request);

        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'total_items' => (clone $items)->count(),
                    'low_stock_items' => $this->lowStockCount($request),
                    'out_of_stock_items' => (clone $items)->where('stock', '<=', 0)->count(),
                    'stock_value' => (float) $stockValue,
                    'stock_deductions' => $this->logMovementCount($request, 'deduct'),
                    'stock_restorations' => $this->logMovementCount($request, 'restore'),
                    'manual_adjustments' => $this->logMovementCount($request, 'adjust'),
                    'top_brand' => $topBrand ?: 'No brand data',
                ],
                'items' => $items->latest('created_at')->limit(300)->get(),
                'logs' => $logs,
                'fast_moving_products' => $this->fastMovingProducts($request),
            ],
        ]);
    }

    public function manager(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => array_merge($this->overviewMetrics($request), [
                    'inventory_value' => (float) $this->inventoryItemsBase($request)->sum(DB::raw('stock * price')),
                ]),
                'top_products' => $this->fastMovingProducts($request),
                'top_services' => $this->serviceBreakdown($request),
                'transactions' => $this->salesRows($request),
                'staff_activity' => $this->recentActions($request),
            ],
        ]);
    }

    public function veterinary(Request $request)
    {
        $appointments = $this->appointmentsBase($request);
        $completed = (clone $appointments)->where('status', 'completed')->count();
        $total = (clone $appointments)->count();
        $serviceBreakdown = $this->serviceBreakdown($request);

        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'completed_appointments' => $completed,
                    'scheduled_appointments' => (clone $appointments)->whereIn('status', ['approved', 'scheduled'])->count(),
                    'cancelled_appointments' => (clone $appointments)->where('status', 'cancelled')->count(),
                    'no_show_appointments' => (clone $appointments)->where('status', 'no_show')->count(),
                    'services_tracked' => count($serviceBreakdown),
                    'total_revenue' => (float) (clone $appointments)->where('status', 'completed')->sum('price'),
                    'completion_rate' => $total > 0 ? round(($completed / $total) * 100, 2) : 0,
                ],
                'appointments' => $this->appointmentRows($request),
                'service_breakdown' => $serviceBreakdown,
                'monthly_revenue' => (float) (clone $appointments)->where('status', 'completed')->sum('price'),
                'monthly_completed' => $completed,
                'period' => $this->periodLabel($request),
            ],
        ]);
    }

    public function customers(Request $request)
    {
        $customers = $this->customersBase($request);
        $customerUsers = $this->customerUsersBase($request);

        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'total_customers' => (clone $customers)->count() + (clone $customerUsers)->count(),
                    'new_customers' => (clone $customers)->where('created_at', '>=', now()->subMonth())->count()
                        + (clone $customerUsers)->where('created_at', '>=', now()->subMonth())->count(),
                    'active_customers' => $this->activeCustomerCount($request),
                    'total_bookings' => $this->appointmentsBase($request)->count(),
                    'total_orders' => $this->customerOrdersBase($request)->count(),
                    'grooming_sessions' => $this->serviceRequestCount($request, 'grooming'),
                    'vet_appointments' => $this->appointmentsBase($request)->count(),
                    'hotel_bookings' => $this->serviceRequestCount($request, 'hotel'),
                    'customer_spending' => (float) $this->customerOrdersBase($request)->where('payment_status', 'paid')->sum('total_amount'),
                ],
                'customers' => (clone $customers)->latest('created_at')->limit(250)->get(),
                'orders' => $this->customerOrdersBase($request)->latest('created_at')->limit(250)->get(),
            ],
        ]);
    }

    public function reception(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'pending_requests' => $this->serviceRequestsBase($request)->where('status', 'pending')->count()
                        + $this->customerOrdersBase($request)->where('status', 'pending')->count(),
                    'approved_requests' => $this->serviceRequestsBase($request)->whereIn('status', ['approved', 'scheduled'])->count()
                        + $this->customerOrdersBase($request)->where('status', 'approved')->count(),
                    'rejected_requests' => $this->serviceRequestsBase($request)->where('status', 'rejected')->count()
                        + $this->customerOrdersBase($request)->where('status', 'rejected')->count(),
                    'scheduled_services' => $this->appointmentsBase($request)->whereIn('status', ['approved', 'scheduled'])->count(),
                    'bookings_handled' => $this->appointmentsBase($request)->count() + $this->serviceRequestsBase($request)->count(),
                    'orders_approved' => $this->customerOrdersBase($request)->where('status', 'approved')->count(),
                ],
                'requests' => $this->serviceRequestsBase($request)->latest('created_at')->limit(250)->get(),
                'orders' => $this->customerOrdersBase($request)->latest('created_at')->limit(250)->get(),
                'requests_per_day' => $this->requestsPerDay($request),
                'receptionist_activity' => $this->recentActions($request, ['order', 'service_request', 'appointment']),
            ],
        ]);
    }

    private function overviewMetrics(Request $request): array
    {
        $orders = $this->customerOrdersBase($request);
        $paidOrders = $this->customerOrdersBase($request)->where('payment_status', 'paid');
        $salesRevenue = $this->dateRange(DB::table('sales'), $request)->sum('amount');

        return [
            'total_users' => User::count(),
            'active_customers' => $this->activeCustomerCount($request),
            'total_orders' => (clone $orders)->count(),
            'total_revenue' => (float) $paidOrders->sum('total_amount') + (float) $salesRevenue,
            'pending_approvals' => $this->customerOrdersBase($request)->where('status', 'pending')->count()
                + $this->serviceRequestsBase($request)->where('status', 'pending')->count(),
            'pending_payments' => $this->customerOrdersBase($request)->where('payment_status', 'pending')->count()
                + ($this->tableExists('payments') ? $this->dateRange(DB::table('payments')->where('status', 'pending'), $request)->count() : 0),
            'low_stock_items' => $this->lowStockCount($request),
            'completed_services' => $this->appointmentsBase($request)->where('status', 'completed')->count()
                + $this->serviceRequestsBase($request)->where('status', 'completed')->count(),
            'approved_orders' => $this->customerOrdersBase($request)->where('status', 'approved')->count(),
            'paid_orders' => $this->customerOrdersBase($request)->where('payment_status', 'paid')->count(),
            'rejected_orders' => $this->customerOrdersBase($request)->where('status', 'rejected')->count(),
        ];
    }

    private function customerOrdersBase(Request $request): Builder
    {
        if (!$this->tableExists('customer_orders')) {
            return DB::query()->fromSub('select null as id where 1 = 0', 'customer_orders');
        }

        $query = DB::table('customer_orders');
        $this->applyDateRange($query, $request, 'customer_orders.created_at');
        $this->applyExactFilter($query, $request, 'status', 'customer_orders.status');
        $this->applyExactFilter($query, $request, 'payment_status', 'customer_orders.payment_status');

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($nested) use ($search) {
                foreach (['customer_name', 'customer_email', 'receipt_number', 'payment_reference'] as $column) {
                    if (Schema::hasColumn('customer_orders', $column)) {
                        $nested->orWhere("customer_orders.$column", 'like', "%$search%");
                    }
                }
            });
        }

        return $query;
    }

    private function serviceRequestsBase(Request $request): Builder
    {
        if (!$this->tableExists('service_requests')) {
            return DB::query()->fromSub('select null as id where 1 = 0', 'service_requests');
        }

        $query = DB::table('service_requests');
        $this->applyDateRange($query, $request, 'service_requests.created_at');
        $this->applyExactFilter($query, $request, 'status', 'service_requests.status');

        $type = $request->query('type');
        if ($type && $type !== 'all') {
            $query->where(function ($nested) use ($type) {
                if (Schema::hasColumn('service_requests', 'request_type')) {
                    $nested->orWhere('request_type', $type);
                }
                if (Schema::hasColumn('service_requests', 'service_type')) {
                    $nested->orWhere('service_type', $type);
                }
            });
        }

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($nested) use ($search) {
                foreach (['customer_name', 'customer_email', 'pet_name', 'service_name'] as $column) {
                    if (Schema::hasColumn('service_requests', $column)) {
                        $nested->orWhere($column, 'like', "%$search%");
                    }
                }
            });
        }

        return $query;
    }

    private function appointmentsBase(Request $request): Builder
    {
        $query = DB::table('appointments');
        $this->applyDateRange($query, $request, 'appointments.created_at');
        $this->applyExactFilter($query, $request, 'status', 'appointments.status');

        return $query;
    }

    private function inventoryItemsBase(Request $request): Builder
    {
        $query = DB::table('inventory_items');
        $this->applyDateRange($query, $request, 'inventory_items.created_at');

        $category = $request->query('category');
        if ($category && $category !== 'all' && Schema::hasColumn('inventory_items', 'category')) {
            $query->where('category', $category);
        }

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($nested) use ($search) {
                foreach (['name', 'sku', 'brand', 'supplier'] as $column) {
                    if (Schema::hasColumn('inventory_items', $column)) {
                        $nested->orWhere($column, 'like', "%$search%");
                    }
                }
            });
        }

        return $query;
    }

    private function inventoryLogsBase(Request $request): Builder
    {
        $query = DB::table('inventory_logs');
        $this->applyDateRange($query, $request, 'inventory_logs.created_at');

        $type = $request->query('type') ?: $request->query('status');
        if ($type && $type !== 'all') {
            $query->where(function ($nested) use ($type) {
                foreach (['movement_type', 'type', 'reason'] as $column) {
                    if (Schema::hasColumn('inventory_logs', $column)) {
                        $nested->orWhere("inventory_logs.$column", 'like', "%$type%");
                    }
                }
            });
        }

        return $query;
    }

    private function customersBase(Request $request): Builder
    {
        $query = DB::table('customers');
        $this->applyDateRange($query, $request, 'customers.created_at');

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($nested) use ($search) {
                foreach (['name', 'email', 'phone'] as $column) {
                    if (Schema::hasColumn('customers', $column)) {
                        $nested->orWhere($column, 'like', "%$search%");
                    }
                }
            });
        }

        return $query;
    }

    private function customerUsersBase(Request $request): Builder
    {
        $query = DB::table('users')->where('role', 'customer');
        $this->applyDateRange($query, $request, 'users.created_at');

        return $query;
    }

    private function salesRows(Request $request)
    {
        return $this->dateRange(DB::table('sales'), $request)
            ->latest('created_at')
            ->limit(250)
            ->get();
    }

    private function appointmentRows(Request $request)
    {
        return $this->appointmentsBase($request)
            ->leftJoin('services', 'services.id', '=', 'appointments.service_id')
            ->leftJoin('customers', 'customers.id', '=', 'appointments.customer_id')
            ->leftJoin('pets', 'pets.id', '=', 'appointments.pet_id')
            ->leftJoin('users as vets', 'vets.id', '=', 'appointments.veterinarian_id')
            ->select([
                'appointments.id',
                'appointments.status',
                'appointments.scheduled_at',
                'appointments.completed_at',
                'appointments.price',
                'appointments.notes',
                DB::raw('COALESCE(services.name, "Unknown Service") as service_name'),
                DB::raw('COALESCE(customers.name, "Unknown Customer") as customer_name'),
                DB::raw('COALESCE(pets.name, "Unknown Pet") as pet_name'),
                DB::raw('COALESCE(vets.name, "Unassigned") as veterinarian_name'),
            ])
            ->latest('appointments.created_at')
            ->limit(250)
            ->get();
    }

    private function serviceBreakdown(Request $request): array
    {
        return $this->appointmentsBase($request)
            ->leftJoin('services', 'services.id', '=', 'appointments.service_id')
            ->select([
                DB::raw('COALESCE(services.name, "Unknown Service") as service_name'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(COALESCE(appointments.price, services.price, 0)) as revenue'),
            ])
            ->groupBy('service_name')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'service' => ['name' => $row->service_name],
                'service_name' => $row->service_name,
                'count' => (int) $row->count,
                'revenue' => (float) $row->revenue,
            ])
            ->all();
    }

    private function fastMovingProducts(Request $request): array
    {
        if (!$this->tableExists('customer_order_items')) {
            return [];
        }

        $query = DB::table('customer_order_items')
            ->join('customer_orders', 'customer_orders.id', '=', 'customer_order_items.customer_order_id')
            ->select([
                'customer_order_items.inventory_item_id',
                DB::raw('MAX(customer_order_items.product_name) as product_name'),
                DB::raw('SUM(customer_order_items.quantity) as quantity_sold'),
                DB::raw('SUM(customer_order_items.subtotal) as revenue'),
            ])
            ->groupBy('customer_order_items.inventory_item_id')
            ->orderByDesc('quantity_sold')
            ->limit(10);

        $this->applyDateRange($query, $request, 'customer_orders.created_at');

        return $query->get()->map(fn ($row) => [
            'inventory_item_id' => $row->inventory_item_id,
            'product_name' => $row->product_name,
            'quantity_sold' => (int) $row->quantity_sold,
            'revenue' => (float) $row->revenue,
        ])->all();
    }

    private function requestsPerDay(Request $request): array
    {
        if (!$this->tableExists('service_requests')) {
            return [];
        }

        $query = $this->serviceRequestsBase($request)
            ->select([
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total'),
            ])
            ->groupBy('date')
            ->orderBy('date');

        return $query->get()->map(fn ($row) => [
            'date' => $row->date,
            'total' => (int) $row->total,
        ])->all();
    }

    private function recentActions(Request $request, array $keywords = [])
    {
        if (!$this->tableExists('activity_logs')) {
            return [];
        }

        $query = DB::table('activity_logs')
            ->leftJoin('users', 'users.id', '=', 'activity_logs.user_id')
            ->select([
                'activity_logs.id',
                'activity_logs.action',
                'activity_logs.description',
                'activity_logs.created_at',
                DB::raw('COALESCE(users.name, activity_logs.user_id) as performed_by'),
                DB::raw('COALESCE(users.role, "system") as role'),
            ]);

        $this->applyDateRange($query, $request, 'activity_logs.created_at');

        if ($keywords) {
            $query->where(function ($nested) use ($keywords) {
                foreach ($keywords as $keyword) {
                    $nested->orWhere('activity_logs.action', 'like', "%$keyword%")
                        ->orWhere('activity_logs.description', 'like', "%$keyword%");
                }
            });
        }

        return $query->latest('activity_logs.created_at')->limit(50)->get();
    }

    private function lowStockCount(?Request $request = null): int
    {
        $query = DB::table('inventory_items');
        if ($request) {
            $this->applyDateRange($query, $request, 'created_at');
        }

        return (int) $query->whereColumn('stock', '<=', 'reorder_level')->count();
    }

    private function activeCustomerCount(Request $request): int
    {
        $query = $this->customerUsersBase($request);

        if (Schema::hasColumn('users', 'is_active')) {
            $query->where('is_active', true);
        }

        return (int) $query->count();
    }

    private function serviceRequestCount(Request $request, string $type): int
    {
        return $this->serviceRequestsBase($request)->where(function ($nested) use ($type) {
            if (Schema::hasColumn('service_requests', 'request_type')) {
                $nested->orWhere('request_type', $type);
            }
            if (Schema::hasColumn('service_requests', 'service_type')) {
                $nested->orWhere('service_type', $type);
            }
        })->count();
    }

    private function logMovementCount(Request $request, string $movement): int
    {
        $query = $this->inventoryLogsBase($request);

        return (int) $query->where(function ($nested) use ($movement) {
            foreach (['movement_type', 'type', 'reason'] as $column) {
                if (Schema::hasColumn('inventory_logs', $column)) {
                    $nested->orWhere($column, 'like', "%$movement%");
                }
            }

            if ($movement === 'deduct' && Schema::hasColumn('inventory_logs', 'delta')) {
                $nested->orWhere('delta', '<', 0);
            }
            if ($movement === 'restore' && Schema::hasColumn('inventory_logs', 'delta')) {
                $nested->orWhere('delta', '>', 0);
            }
        })->count();
    }

    private function topBrand(Request $request): ?string
    {
        if (!Schema::hasColumn('inventory_items', 'brand')) {
            return null;
        }

        $row = $this->inventoryItemsBase($request)
            ->whereNotNull('brand')
            ->where('brand', '!=', '')
            ->select('brand', DB::raw('COUNT(*) as total'))
            ->groupBy('brand')
            ->orderByDesc('total')
            ->first();

        return $row?->brand;
    }

    private function applyDateRange(Builder $query, Request $request, string $column): void
    {
        if ($from = $request->query('from')) {
            $query->whereDate($column, '>=', $from);
        }
        if ($to = $request->query('to')) {
            $query->whereDate($column, '<=', $to);
        }
    }

    private function dateRange(Builder $query, Request $request, string $column = 'created_at'): Builder
    {
        $this->applyDateRange($query, $request, $column);

        return $query;
    }

    private function applyExactFilter(Builder $query, Request $request, string $param, string $column): void
    {
        $value = $request->query($param);
        if ($value && $value !== 'all') {
            $query->where($column, $value);
        }
    }

    private function columnSelect(string $table, string $preferred, string $fallback, string $alias): string
    {
        if (Schema::hasColumn($table, $preferred)) {
            return "$table.$preferred as $alias";
        }

        return "$fallback as $alias";
    }

    private function tableExists(string $table): bool
    {
        return Schema::hasTable($table);
    }

    private function periodLabel(Request $request): string
    {
        $from = $request->query('from');
        $to = $request->query('to');

        if ($from || $to) {
            return trim(($from ?: 'Start') . ' to ' . ($to ?: 'Today'));
        }

        return now()->format('F Y');
    }
}
