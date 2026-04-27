<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Appointment;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function overview()
    {
        $today = Carbon::today();

        // Get low stock items (below threshold)
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

        // Get top selling products (based on sales)
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

        // Get pending orders (confirmed appointments)
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

        // Get sales by payment type
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

        return response()->json([
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
        ]);
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
            'amount' => 'required|numeric|min:0',
            'reason' => 'required|string',
            'cashier_name' => 'required|string',
        ]);

        // Create refund record
        $refund = Sale::create([
            'id' => 'REF-' . time(),
            'amount' => $validated['amount'],
            'type' => 'refund',
            'payment_type' => 'refund',
            'transaction_id' => $validated['transaction_id'],
            'reason' => $validated['reason'],
            'cashier_name' => $validated['cashier_name'],
            'created_at' => now(),
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
            'transaction_id' => 'required',
        ]);

        // Create multi-payment record
        $payment = Sale::create([
            'amount' => $validated['total_amount'],
            'type' => 'multi_payment',
            'payment_type' => 'multi',
            'cash_amount' => $validated['cash_amount'],
            'card_amount' => $validated['card_amount'],
            'transaction_id' => $validated['transaction_id'],
            'created_at' => now(),
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
            'transaction_id' => 'required',
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
        $transaction = Sale::find($validated['transaction_id']);
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
        $requests = DB::table('booking_requests')
            ->select(
                'id',
                'customer_name',
                'request_type',
                'service_name',
                'request_date',
                'status'
            )
            ->where('status', 'approved')
            ->orderBy('request_date', 'desc')
            ->get();

        return response()->json($requests);
    }

    public function verifyPayment($id)
    {
        DB::table('booking_requests')
            ->where('id', $id)
            ->update(['status' => 'paid']);

        return response()->json(['message' => 'Payment verified successfully']);
    }
}
