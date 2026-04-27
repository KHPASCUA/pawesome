<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

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
        ]);

        try {
            DB::beginTransaction();

            // Create order (status = pending, stock NOT deducted yet)
            $order = DB::table('customer_orders')->insertGetId([
                'customer_id' => $user->id,
                'total_amount' => $validated['totalAmount'],
                'order_type' => $validated['orderType'],
                'payment_method' => $validated['paymentMethod'],
                'payment_proof' => $validated['paymentProof'] ?? null,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

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

            return response()->json([
                'message' => 'Order placed successfully',
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
            ->get();

        return response()->json($orders);
    }
}
