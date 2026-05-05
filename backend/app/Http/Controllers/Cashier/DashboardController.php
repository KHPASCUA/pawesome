<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Appointment;
use App\Models\InventoryItem;
use App\Models\ActivityLog;
use App\Services\WorkflowNotifier;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    private function overviewData(): array
    {
        $today = Carbon::today();

        $lowStockItems = InventoryItem::whereColumn('stock', '<=', 'threshold')
            ->where('stock', '>', 0)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'sku' => $item->sku,
                    'stock' => $item->stock,
                    'threshold' => $item->threshold,
                ];
            });

        $topSellingProducts = Sale::selectRaw('product_id, COUNT(*) as units_sold, SUM(amount) as revenue')
            ->whereNotNull('product_id')
            ->whereMonth('created_at', $today->month)
            ->groupBy('product_id')
            ->orderByDesc('units_sold')
            ->limit(5)
            ->get()
            ->map(function ($sale) {
                $product = InventoryItem::find($sale->product_id);
                return [
                    'id' => $sale->product_id,
                    'name' => $product ? $product->name : 'Unknown',
                    'units_sold' => $sale->units_sold,
                    'revenue' => $sale->revenue,
                ];
            });

        $pendingOrders = Appointment::where('status', 'confirmed')
            ->with(['pet', 'customer'])
            ->limit(5)
            ->get()
            ->map(function ($appointment) {
                $waitingTime = $appointment->scheduled_at
                    ? Carbon::parse($appointment->scheduled_at)->diffInMinutes(now()) . ' min'
                    : '0 min';
                return [
                    'id' => $appointment->id,
                    'customer' => $appointment->customer ? $appointment->customer->name : 'Guest',
                    'total' => $appointment->service ? $appointment->service->price : 0,
                    'waiting_time' => $waitingTime,
                ];
            });

        $salesByType = Sale::selectRaw('payment_type, COUNT(*) as count, SUM(amount) as total')
            ->whereDate('created_at', $today)
            ->groupBy('payment_type')
            ->get()
            ->map(function ($sale) {
                return [
                    'type' => $sale->payment_type ?? 'cash',
                    'count' => $sale->count,
                    'total' => $sale->total,
                ];
            });

        return [
            'today_sales' => Sale::whereDate('created_at', $today)->sum('amount'),
            'today_transactions' => Sale::whereDate('created_at', $today)->count(),
            'monthly_sales' => Sale::whereMonth('created_at', $today->month)->sum('amount'),
            'monthly_transactions' => Sale::whereMonth('created_at', $today->month)->count(),
            'pending_payments' => Appointment::where('status', 'confirmed')->count(),
            'completed_payments' => Sale::where('type', 'appointment')->count(),
            'recent_sales' => Sale::latest()->limit(10)->get(),
            'sales_by_type' => $salesByType,
            'low_stock_items' => $lowStockItems,
            'top_selling_products' => $topSellingProducts,
            'pending_orders' => $pendingOrders,
        ];
    }

    public function overview()
    {
        return response()->json($this->overviewData());
    }

    public function overviewWrapped()
    {
        return response()->json(['data' => $this->overviewData()]);
    }

    public function sales()
    {
        return response()->json(
            Sale::latest()->get()
        );
    }

    public function transactions()
    {
        return response()->json(
            Sale::latest()->limit(50)->get()
        );
    }

    public function history()
    {
        return $this->transactions();
    }

    public function searchTransactions(Request $request)
    {
        $query = $request->get('q', '');

        $transactions = Sale::where('id', 'like', "%{$query}%")
            ->orWhereHas('customer', function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%");
            })
            ->orWhere('amount', 'like', "%{$query}%")
            ->with(['customer'])
            ->limit(20)
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'customer' => $sale->customer ? $sale->customer->name : 'Guest',
                    'payment_type' => $sale->payment_type ?? 'cash',
                    'amount' => $sale->amount,
                    'date' => $sale->created_at->format('Y-m-d'),
                ];
            });

        return response()->json($transactions);
    }

    public function refund(Request $request)
    {
        $validated = $request->validate([
            'transaction_id' => 'required',
            'amount' => 'nullable|numeric|min:0',
            'refund_amount' => 'nullable|numeric|min:0',
            'reason' => 'required|string',
            'cashier_name' => 'required|string',
        ]);

        // Create refund record
        $refund = Sale::create([
            'amount' => $validated['amount'] ?? $validated['refund_amount'] ?? 0,
            'type' => 'refund',
            'status' => 'completed',
            'payment_type' => 'refund',
            'notes' => 'Refund for ' . $validated['transaction_id'] . ': ' . $validated['reason'],
        ]);

        return response()->json([
            'success' => true,
            'refund_id' => $refund->id,
        ]);
    }

    public function multiPayment(Request $request)
    {
        $validated = $request->validate([
            'cash_amount' => 'required|numeric|min:0',
            'card_amount' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'transaction_id' => 'nullable',
        ]);

        // Create multi-payment record
        $payment = Sale::create([
            'amount' => $validated['total_amount'],
            'type' => 'multi_payment',
            'status' => 'completed',
            'payment_type' => 'multi',
            'cash_amount' => $validated['cash_amount'],
            'card_amount' => $validated['card_amount'],
            'notes' => isset($validated['transaction_id']) ? 'Split payment for ' . $validated['transaction_id'] : null,
        ]);

        return response()->json([
            'success' => true,
            'transaction_id' => $payment->id,
        ]);
    }

    public function applyDiscount(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'transaction_id' => 'nullable',
        ]);

        // Simple discount logic - in production, check against discount codes table
        $discountAmount = 0;
        $discountPercent = 0;

        // Example discount codes
        switch (strtoupper($validated['code'])) {
            case 'DISCOUNT10':
                $discountPercent = 10;
                break;
            case 'SAVE20':
                $discountPercent = 20;
                break;
            case 'WELCOME':
                $discountPercent = 15;
                break;
        }

        // Get transaction amount
        $transaction = isset($validated['transaction_id']) ? Sale::find($validated['transaction_id']) : null;
        if ($transaction) {
            $discountAmount = ($transaction->amount * $discountPercent) / 100;
            $newTotal = $transaction->amount - $discountAmount;
        } else {
            $newTotal = 0;
        }

        return response()->json([
            'success' => true,
            'discount_amount' => $discountAmount,
            'new_total' => $newTotal,
        ]);
    }

    public function generateReceipt($id)
    {
        $transaction = Sale::with(['customer', 'items'])->find($id);

        if (!$transaction) {
            return response()->json(['error' => 'Transaction not found'], 404);
        }

        return response()->json([
            'transaction_id' => $transaction->id,
            'items' => $transaction->items ?? [],
            'total' => $transaction->amount,
            'date' => $transaction->created_at->format('Y-m-d H:i:s'),
            'customer' => $transaction->customer ? $transaction->customer->name : 'Guest',
            'payment_type' => $transaction->payment_type ?? 'cash',
        ]);
    }

    public function handover(Request $request)
    {
        $validated = $request->validate([
            'note' => 'required|string',
            'cashier_name' => 'required|string',
        ]);

        // Store handover note - in production, save to handovers table
        // For now, just return success
        return response()->json([
            'success' => true,
        ]);
    }

    public function endShift(Request $request)
    {
        $data = $request->validate([
            'cashier_name' => 'nullable|string',
            'shift_date' => 'nullable|date',
            'total_sales' => 'nullable|numeric|min:0',
            'total_transactions' => 'nullable|integer|min:0',
            'cash_collected' => 'nullable|numeric|min:0',
            'expected_cash' => 'nullable|numeric|min:0',
            'actual_cash' => 'nullable|numeric|min:0',
            'cash_difference' => 'nullable|numeric',
            'note' => 'nullable|string',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Shift report submitted successfully',
            'shift_report' => array_merge($data, [
                'id' => 'SHIFT-' . now()->format('YmdHis'),
                'submitted_at' => now()->toIso8601String(),
            ]),
        ]);
    }

    public function voidTransaction(Request $request)
    {
        $validated = $request->validate([
            'transaction_id' => 'required',
            'reason' => 'required|string',
            'cashier_name' => 'required|string',
        ]);

        // Find and void the transaction
        $transaction = Sale::find($validated['transaction_id']);
        if ($transaction) {
            $transaction->status = 'voided';
            $transaction->void_reason = $validated['reason'];
            $transaction->voided_by = $validated['cashier_name'];
            $transaction->voided_at = now();
            $transaction->save();
        }

        return response()->json([
            'success' => true,
        ]);
    }

    // Payment Verification Methods
    public function getPaymentRequests()
    {
        $orders = DB::table('customer_orders')
            ->where('status', 'approved')
            ->where('payment_status', 'pending')
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($order) {
                $items = DB::table('customer_order_items')
                    ->where('customer_order_id', $order->id)
                    ->get();

                return [
                    'id' => $order->id,
                    'payable_type' => 'customer_order',
                    'customer_name' => $order->customer_name ?? 'Customer #' . $order->customer_id,
                    'customer_email' => $order->customer_email ?? null,
                    'request_type' => 'Store Order',
                    'service_name' => 'Order #' . $order->id,
                    'items' => $items,
                    'amount' => $order->total_amount,
                    'payment_method' => $order->payment_method,
                    'payment_reference' => $order->payment_reference ?? null,
                    'payment_proof' => $order->payment_proof ?? null,
                    'request_date' => $order->updated_at,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status ?? 'pending',
                ];
            });

        return response()->json(['payments' => $orders]);
    }

    public function verifyPayment(Request $request, $id)
    {
        $order = DB::table('customer_orders')->where('id', $id)->first();

        if (!$order) {
            return response()->json(['message' => 'Payment request not found'], 404);
        }

        if (($order->payment_status ?? 'unpaid') !== 'pending') {
            return response()->json(['message' => 'Only pending payment proofs can be verified'], 422);
        }

        $receiptNumber = $order->receipt_number ?? ('REC-' . now()->format('YmdHis') . '-' . $order->id);

        // Note: Stock deduction should happen during receptionist order approval, not during payment verification
        // Cashier only updates payment status and generates receipt

        DB::table('customer_orders')
            ->where('id', $id)
            ->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
                'verified_by' => auth()->id(),
                'cashier_remarks' => $request->input('cashier_remarks'),
                'receipt_number' => $receiptNumber,
                'updated_at' => now(),
            ]);

        WorkflowNotifier::notifyUser(
            $order->customer_id,
            'Payment Verified',
            "Payment for order #{$id} was verified. Receipt: {$receiptNumber}.",
            'success',
            'customer_order',
            $id,
            ['receipt_number' => $receiptNumber]
        );

        ActivityLog::log(auth()->id(), 'payment_verified', "Cashier verified payment for order #{$id}", [
            'category' => 'payment',
            'reference_type' => 'customer_order',
            'reference_id' => $id,
            'metadata' => ['receipt_number' => $receiptNumber],
        ]);

        return response()->json([
            'message' => 'Payment verified successfully',
            'payment_status' => 'paid',
            'receipt_number' => $receiptNumber,
        ]);
    }

    public function rejectPayment(Request $request, $id)
    {
        $order = DB::table('customer_orders')->where('id', $id)->first();

        if (!$order) {
            return response()->json(['message' => 'Payment request not found'], 404);
        }

        if (($order->payment_status ?? 'unpaid') !== 'pending') {
            return response()->json(['message' => 'Only pending payment proofs can be rejected'], 422);
        }

        DB::table('customer_orders')
            ->where('id', $id)
            ->update([
                'payment_status' => 'rejected',
                'cashier_remarks' => $request->input('cashier_remarks'),
                'updated_at' => now(),
            ]);

        WorkflowNotifier::notifyUser(
            $order->customer_id,
            'Payment Rejected',
            "Payment proof for order #{$id} was rejected. Please resubmit a valid proof.",
            'error',
            'customer_order',
            $id,
            ['cashier_remarks' => $request->input('cashier_remarks')]
        );

        ActivityLog::log(auth()->id(), 'payment_rejected', "Cashier rejected payment for order #{$id}", [
            'category' => 'payment',
            'reference_type' => 'customer_order',
            'reference_id' => $id,
            'metadata' => ['cashier_remarks' => $request->input('cashier_remarks')],
        ]);

        return response()->json([
            'message' => 'Payment rejected',
            'payment_status' => 'rejected',
        ]);
    }

    public function customerOrderReceipt($id)
    {
        $order = DB::table('customer_orders')->where('id', $id)->first();

        if (!$order) {
            return response()->json(['message' => 'Receipt not found'], 404);
        }

        if (($order->payment_status ?? 'unpaid') !== 'paid') {
            return response()->json(['message' => 'Receipt is available only after payment verification'], 422);
        }

        $items = DB::table('customer_order_items')
            ->where('customer_order_id', $id)
            ->get();

        $verifiedBy = $order->verified_by
            ? DB::table('users')->where('id', $order->verified_by)->value('name')
            : null;

        return response()->json([
            'receipt' => [
                'order_id' => $order->id,
                'receipt_number' => $order->receipt_number,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'items' => $items,
                'total_amount' => $order->total_amount,
                'payment_method' => $order->payment_method,
                'payment_reference' => $order->payment_reference ?? null,
                'paid_at' => $order->paid_at,
                'verified_by' => $verifiedBy,
                'cashier_remarks' => $order->cashier_remarks,
            ],
        ]);
    }
}
