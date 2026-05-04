<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class CustomerStoreController extends Controller
{
    public function checkout(Request $request)
    {
        $user = Auth::user();

        Log::info('Customer store checkout attempt', [
            'user_id' => $user?->id,
            'user_role' => $user?->role,
            'items_count' => count($request->input('items', [])),
            'total_amount' => $request->input('totalAmount') ?? $request->input('total_amount'),
        ]);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Please login again before placing your order.',
            ], 401);
        }

        if (strtolower((string) $user->role) !== 'customer') {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Only customer accounts can place store orders.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|integer',
            'items.*.product_id' => 'nullable|integer',
            'items.*.name' => 'required|string|max:255',
            'items.*.sku' => 'nullable|string|max:255',
            'items.*.qty' => 'nullable|integer|min:1',
            'items.*.quantity' => 'nullable|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'items.*.subtotal' => 'nullable|numeric|min:0',
            'items.*.line_total' => 'nullable|numeric|min:0',

            'totalAmount' => 'nullable|numeric|min:0',
            'total_amount' => 'nullable|numeric|min:0',
            'subtotal' => 'nullable|numeric|min:0',
            'discountAmount' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'discountApplied' => 'nullable|numeric|min:0',
            'discount_applied' => 'nullable|numeric|min:0',

            'paymentMethod' => 'nullable|string|max:255',
            'payment_method' => 'nullable|string|max:255',
            'paymentProof' => 'nullable|string|max:255',
            'payment_proof' => 'nullable|string|max:255',

            'orderId' => 'nullable|string|max:255',
            'order_id' => 'nullable|string|max:255',
            'referenceNumber' => 'nullable|string|max:255',
            'reference_number' => 'nullable|string|max:255',

            'customerName' => 'nullable|string|max:255',
            'customer_name' => 'nullable|string|max:255',
            'orderType' => 'nullable|string|max:255',
            'order_type' => 'nullable|string|max:255',
        ]);

        $validator->after(function ($validator) use ($request) {
            $total = $request->input('totalAmount') ?? $request->input('total_amount');

            if ($total === null) {
                $validator->errors()->add('total_amount', 'Total amount is required.');
            }

            $paymentMethod = $request->input('paymentMethod') ?? $request->input('payment_method');

            if (!$paymentMethod) {
                $validator->errors()->add('payment_method', 'Payment method is required.');
            }

            foreach ($request->input('items', []) as $index => $item) {
                $productId = $item['product_id'] ?? $item['id'] ?? null;

                if (!$productId) {
                    $validator->errors()->add("items.$index.product_id", 'Product ID is required.');
                }

                $quantity = $item['quantity'] ?? $item['qty'] ?? null;

                if (!$quantity) {
                    $validator->errors()->add("items.$index.quantity", 'Quantity is required.');
                }
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Order validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        try {
            DB::beginTransaction();

            $items = $request->input('items', []);
            $totalAmount = (float) ($request->input('totalAmount') ?? $request->input('total_amount') ?? 0);
            $subtotal = (float) ($request->input('subtotal') ?? $totalAmount);
            $discountAmount = (float) ($request->input('discountAmount') ?? $request->input('discount_amount') ?? 0);
            $discountApplied = (float) ($request->input('discountApplied') ?? $request->input('discount_applied') ?? 0);

            $paymentMethod = $request->input('paymentMethod') ?? $request->input('payment_method') ?? 'Online Payment';
            $paymentProof = $request->input('paymentProof') ?? $request->input('payment_proof');
            $orderNumber = $request->input('orderId') ?? $request->input('order_id') ?? $this->generateOrderNumber();
            $referenceNumber = $request->input('referenceNumber') ?? $request->input('reference_number') ?? $this->generateReferenceNumber();
            $customerName = $request->input('customerName') ?? $request->input('customer_name') ?? $user->name ?? 'Customer';
            $orderType = $request->input('orderType') ?? $request->input('order_type') ?? 'Pick-up';

            $computedSubtotal = 0;

            foreach ($items as $item) {
                $productId = $item['product_id'] ?? $item['id'];
                $quantity = (int) ($item['quantity'] ?? $item['qty'] ?? 1);
                $price = (float) ($item['price'] ?? $item['unit_price'] ?? 0);

                $inventoryItem = DB::table('inventory_items')
                    ->where('id', $productId)
                    ->first();

                if (!$inventoryItem) {
                    DB::rollBack();

                    return response()->json([
                        'success' => false,
                        'message' => "Item not found: {$item['name']}",
                    ], 422);
                }

                $availableStock = (int) ($inventoryItem->stock ?? $inventoryItem->quantity ?? 0);

                if ($availableStock < $quantity) {
                    DB::rollBack();

                    return response()->json([
                        'success' => false,
                        'message' => "Not enough stock for {$item['name']}. Available stock: {$availableStock}",
                    ], 422);
                }

                $computedSubtotal += $price * $quantity;
            }

            $orderData = [
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $this->setIfColumnExists($orderData, 'customer_orders', 'customer_id', $user->id);
            $this->setIfColumnExists($orderData, 'customer_orders', 'user_id', $user->id);
            $this->setIfColumnExists($orderData, 'customer_orders', 'customer_name', $customerName);
            $this->setIfColumnExists($orderData, 'customer_orders', 'customer_email', $user->email ?? null);

            $this->setIfColumnExists($orderData, 'customer_orders', 'order_number', $orderNumber);
            $this->setIfColumnExists($orderData, 'customer_orders', 'order_id', $orderNumber);
            $this->setIfColumnExists($orderData, 'customer_orders', 'reference_number', $referenceNumber);

            $this->setIfColumnExists($orderData, 'customer_orders', 'subtotal', $subtotal ?: $computedSubtotal);
            $this->setIfColumnExists($orderData, 'customer_orders', 'discount_amount', $discountAmount);
            $this->setIfColumnExists($orderData, 'customer_orders', 'discount_applied', $discountApplied);
            $this->setIfColumnExists($orderData, 'customer_orders', 'total_amount', $totalAmount);

            $this->setIfColumnExists($orderData, 'customer_orders', 'order_type', $orderType);
            $this->setIfColumnExists($orderData, 'customer_orders', 'payment_method', $paymentMethod);
            $this->setIfColumnExists($orderData, 'customer_orders', 'payment_proof', $paymentProof);
            $this->setIfColumnExists($orderData, 'customer_orders', 'payment_status', 'pending');
            $this->setIfColumnExists($orderData, 'customer_orders', 'status', 'pending');
            $this->setIfColumnExists($orderData, 'customer_orders', 'notes', 'Waiting for approval/confirmation.');

            if (!isset($orderData['total_amount']) && Schema::hasColumn('customer_orders', 'total')) {
                $orderData['total'] = $totalAmount;
            }

            $customerOrderId = DB::table('customer_orders')->insertGetId($orderData);

            foreach ($items as $item) {
                $productId = $item['product_id'] ?? $item['id'];
                $quantity = (int) ($item['quantity'] ?? $item['qty'] ?? 1);
                $price = (float) ($item['price'] ?? $item['unit_price'] ?? 0);
                $lineTotal = (float) ($item['line_total'] ?? $item['subtotal'] ?? ($price * $quantity));

                $itemData = [
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $this->setIfColumnExists($itemData, 'customer_order_items', 'customer_order_id', $customerOrderId);
                $this->setIfColumnExists($itemData, 'customer_order_items', 'order_id', $customerOrderId);

                $this->setIfColumnExists($itemData, 'customer_order_items', 'inventory_item_id', $productId);
                $this->setIfColumnExists($itemData, 'customer_order_items', 'product_id', $productId);

                $this->setIfColumnExists($itemData, 'customer_order_items', 'product_name', $item['name']);
                $this->setIfColumnExists($itemData, 'customer_order_items', 'name', $item['name']);
                $this->setIfColumnExists($itemData, 'customer_order_items', 'sku', $item['sku'] ?? null);

                $this->setIfColumnExists($itemData, 'customer_order_items', 'quantity', $quantity);
                $this->setIfColumnExists($itemData, 'customer_order_items', 'qty', $quantity);

                $this->setIfColumnExists($itemData, 'customer_order_items', 'price', $price);
                $this->setIfColumnExists($itemData, 'customer_order_items', 'unit_price', $price);

                $this->setIfColumnExists($itemData, 'customer_order_items', 'subtotal', $lineTotal);
                $this->setIfColumnExists($itemData, 'customer_order_items', 'line_total', $lineTotal);

                DB::table('customer_order_items')->insert($itemData);
            }

            DB::commit();

            Log::info('Customer store checkout submitted successfully', [
                'user_id' => $user->id,
                'customer_order_id' => $customerOrderId,
                'order_number' => $orderNumber,
                'reference_number' => $referenceNumber,
                'total_amount' => $totalAmount,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order submitted successfully. Waiting for approval.',
                'id' => $customerOrderId,
                'orderId' => $orderNumber,
                'order_id' => $orderNumber,
                'referenceNumber' => $referenceNumber,
                'reference_number' => $referenceNumber,
                'status' => 'pending',
                'payment_status' => 'pending',
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Customer store checkout failed', [
                'user_id' => $user?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => app()->environment('local')
                    ? $e->getMessage()
                    : 'Checkout failed. Please try again.',
            ], 500);
        }
    }

    public function orders(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Please login again.',
            ], 401);
        }

        if (strtolower((string) $user->role) !== 'customer') {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Only customer accounts can view customer store orders.',
            ], 403);
        }

        $orders = DB::table('customer_orders')
            ->where(function ($query) use ($user) {
                if (Schema::hasColumn('customer_orders', 'customer_id')) {
                    $query->orWhere('customer_id', $user->id);
                }

                if (Schema::hasColumn('customer_orders', 'user_id')) {
                    $query->orWhere('user_id', $user->id);
                }

                if (Schema::hasColumn('customer_orders', 'customer_email') && $user->email) {
                    $query->orWhere('customer_email', $user->email);
                }
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                $orderId = $order->id;

                $itemsQuery = DB::table('customer_order_items');

                if (Schema::hasColumn('customer_order_items', 'customer_order_id')) {
                    $itemsQuery->where('customer_order_id', $orderId);
                } elseif (Schema::hasColumn('customer_order_items', 'order_id')) {
                    $itemsQuery->where('order_id', $orderId);
                }

                $items = $itemsQuery->get();

                return [
                    'id' => $order->order_number ?? $order->order_id ?? $order->id,
                    'database_id' => $order->id,
                    'reference_number' => $order->reference_number ?? null,
                    'customer_name' => $order->customer_name ?? null,
                    'customer_email' => $order->customer_email ?? null,
                    'subtotal' => (float) ($order->subtotal ?? 0),
                    'discount_amount' => (float) ($order->discount_amount ?? 0),
                    'total_amount' => (float) ($order->total_amount ?? $order->total ?? 0),
                    'payment_method' => $order->payment_method ?? null,
                    'payment_proof' => $order->payment_proof ?? null,
                    'payment_status' => $order->payment_status ?? 'pending',
                    'status' => $order->status ?? 'pending',
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                    'items' => $items,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    private function setIfColumnExists(array &$data, string $table, string $column, $value): void
    {
        if (Schema::hasColumn($table, $column)) {
            $data[$column] = $value;
        }
    }

    private function generateOrderNumber(): string
    {
        return 'PAW-' . strtoupper(base_convert((string) time(), 10, 36)) . '-' . strtoupper(substr(md5((string) microtime(true)), 0, 4));
    }

    private function generateReferenceNumber(): string
    {
        return strtoupper(substr(md5(uniqid('', true)), 0, 12));
    }
}