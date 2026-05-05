<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use App\Models\ActivityLog;
use App\Services\WorkflowNotifier;

class CustomerStoreController extends Controller
{
    public function checkout(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer',
            'items.*.name' => 'required|string',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'totalAmount' => 'required|numeric|min:0',
            'orderType' => 'required|string',
            'paymentMethod' => 'required|string',
            'paymentProof' => 'nullable|string',
            'paymentReference' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $orderData = [
                'customer_id' => $user->id,
                'total_amount' => $validated['totalAmount'],
                'order_type' => $validated['orderType'],
                'payment_method' => $validated['paymentMethod'],
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if (Schema::hasColumn('customer_orders', 'customer_email')) {
                $orderData['customer_email'] = $user->email;
            }
            if (Schema::hasColumn('customer_orders', 'customer_name')) {
                $orderData['customer_name'] = $user->name;
            }
            if (Schema::hasColumn('customer_orders', 'payment_status')) {
                $orderData['payment_status'] = 'unpaid';
            }
            if (!empty($validated['paymentReference']) && Schema::hasColumn('customer_orders', 'payment_reference')) {
                $orderData['payment_reference'] = $validated['paymentReference'];
            }

            // Create order (status = pending, stock NOT deducted yet)
            $order = DB::table('customer_orders')->insertGetId($orderData);

            // Process items (just record them, don't deduct stock yet)
            foreach ($validated['items'] as $item) {
                // Check stock availability only (for validation)
                $stockData = DB::table('inventory_items')
                    ->where('id', $item['id'])
                    ->first();

                if (!$stockData) {
                    throw new \Exception("Item not found: {$item['name']}");
                }

                if ($stockData->stock < $item['qty']) {
                    throw new \Exception("Not enough stock for {$item['name']}");
                }

                // Insert order item
                DB::table('customer_order_items')->insert([
                    'customer_order_id' => $order,
                    'inventory_item_id' => $item['id'],
                    'product_name' => $item['name'],
                    'quantity' => $item['qty'],
                    'price' => $item['price'],
                    'subtotal' => $item['qty'] * $item['price'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();

            WorkflowNotifier::notifyRole(
                'receptionist',
                'New Customer Order',
                "{$user->name} submitted order #{$order}.",
                'info',
                'customer_order',
                $order,
                ['customer_email' => $user->email, 'total_amount' => $validated['totalAmount']]
            );

            WorkflowNotifier::notifyUser(
                $user->id,
                'Order Submitted',
                "Order #{$order} was submitted and is waiting for receptionist approval.",
                'info',
                'customer_order',
                $order
            );

            return response()->json([
                'message' => 'Order submitted and waiting for approval.',
                'orderId' => $order,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function orders(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $orders = DB::table('customer_orders')
            ->where('customer_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                $items = DB::table('customer_order_items')
                    ->where('customer_order_id', $order->id)
                    ->get();

                $order->items = $items;
                $order->order_status = $order->status;
                $order->payment_status = $order->payment_status ?? 'unpaid';

                return $order;
            });

        return response()->json(['orders' => $orders]);
    }

    public function uploadPaymentProof(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'payment_method' => 'nullable|string|max:50',
            'payment_reference' => 'nullable|string|max:255',
            'payment_proof' => 'required|string',
        ]);

        $order = DB::table('customer_orders')
            ->where('id', $id)
            ->where('customer_id', $user->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $paymentStatus = $order->payment_status ?? 'unpaid';

        if ($order->status !== 'approved' || !in_array($paymentStatus, ['unpaid', 'rejected'], true)) {
            return response()->json([
                'message' => 'Payment proof can only be uploaded for approved orders with unpaid or rejected payment status.',
            ], 422);
        }

        $update = [
            'payment_method' => $validated['payment_method'] ?? $order->payment_method,
            'payment_proof' => $validated['payment_proof'],
            'payment_status' => 'pending',
            'updated_at' => now(),
        ];

        if (Schema::hasColumn('customer_orders', 'payment_reference')) {
            $update['payment_reference'] = $validated['payment_reference'] ?? null;
        }

        DB::table('customer_orders')->where('id', $order->id)->update($update);

        WorkflowNotifier::notifyUser(
            $user->id,
            'Payment Proof Submitted',
            "Payment proof for order #{$order->id} is under cashier verification.",
            'info',
            'customer_order',
            $order->id,
            ['payment_reference' => $validated['payment_reference'] ?? null]
        );

        WorkflowNotifier::notifyRole(
            'cashier',
            'Payment Needs Verification',
            "{$user->name} uploaded payment proof for order #{$order->id}.",
            'warning',
            'customer_order',
            $order->id,
            ['customer_email' => $user->email]
        );

        ActivityLog::log($user->id, 'payment_proof_uploaded', "Customer uploaded proof for order #{$order->id}", [
            'category' => 'payment',
            'reference_type' => 'customer_order',
            'reference_id' => $order->id,
        ]);

        return response()->json([
            'message' => 'Payment proof uploaded and waiting for cashier verification.',
            'order_id' => $order->id,
            'payment_status' => 'pending',
        ]);
    }

    public function receipt(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $order = DB::table('customer_orders')
            ->where('id', $id)
            ->where('customer_id', $user->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Receipt not found'], 404);
        }

        if (($order->payment_status ?? 'unpaid') !== 'paid') {
            return response()->json(['message' => 'Receipt is available only after cashier verification'], 422);
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
