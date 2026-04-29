<?php

namespace App\Http\Controllers\Receptionist;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Pet;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function overview()
    {
        $today = Carbon::today();
        
        return response()->json([
            'today_appointments' => Appointment::whereDate('scheduled_at', $today)->count(),
            'pending_appointments' => Appointment::where('status', 'scheduled')->count(),
            'confirmed_appointments' => Appointment::where('status', 'confirmed')->count(),
            'completed_appointments' => Appointment::where('status', 'completed')->count(),
            'total_customers' => Customer::count(),
            'total_pets' => Pet::count(),
            'check_ins_today' => Appointment::whereDate('scheduled_at', $today)
                ->where('status', 'confirmed')->count(),
            'upcoming_appointments' => Appointment::with(['customer', 'pet', 'service'])
                ->where('scheduled_at', '>=', $today)
                ->whereIn('status', ['scheduled', 'confirmed'])
                ->orderBy('scheduled_at')
                ->limit(5)
                ->get(),
            'recent_customers' => Customer::latest()->take(5)->get(),
        ]);
    }

    public function appointments()
    {
        return response()->json(
            Appointment::with(['customer', 'pet', 'service'])
                ->orderBy('scheduled_at')
                ->get()
        );
    }

    public function customers()
    {
        return response()->json(
            Customer::with('pets')->get()
        );
    }

    // Customer Order Management
    public function orders()
    {
        $orders = DB::table('customer_orders')
            ->join('users', 'customer_orders.customer_id', '=', 'users.id')
            ->select('customer_orders.*', 'users.name as customer_name', 'users.email as customer_email')
            ->orderBy('customer_orders.created_at', 'desc')
            ->get();

        // Get order items for each order
        foreach ($orders as $order) {
            $order->items = DB::table('customer_order_items')
                ->where('customer_order_id', $order->id)
                ->get();
        }

        return response()->json($orders);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,paid,preparing,completed,rejected',
        ]);

        $user = Auth::user();
        $inventoryService = new InventoryService();

        $order = DB::table('customer_orders')->where('id', $id)->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $updateData = [
            'status' => $validated['status'],
        ];

        // If approving, set approved_by and deduct stock using centralized service
        if ($validated['status'] === 'approved' && $order->status === 'pending') {
            $updateData['approved_by'] = $user->id;

            // Get order items and deduct stock
            $orderItems = DB::table('customer_order_items')
                ->where('customer_order_id', $id)
                ->get();

            foreach ($orderItems as $item) {
                // Use centralized InventoryService for stock deduction
                $inventoryService->deductStock(
                    $item->inventory_item_id,
                    $item->quantity,
                    "Customer Order #{$id} approved by Receptionist",
                    'customer_order',
                    $id
                );
            }
        }

        // If rejecting, restore stock (if previously deducted)
        if ($validated['status'] === 'rejected' && $order->status === 'approved') {
            $orderItems = DB::table('customer_order_items')
                ->where('customer_order_id', $id)
                ->get();

            foreach ($orderItems as $item) {
                // Use centralized InventoryService to restore stock
                $inventoryService->addStock(
                    $item->inventory_item_id,
                    $item->quantity,
                    "Customer Order #{$id} rejected - stock restored",
                    'customer_order',
                    $id
                );
            }
        }

        DB::table('customer_orders')
            ->where('id', $id)
            ->update($updateData);

        return response()->json(['message' => 'Order status updated']);
    }

    // Appointment management
}
