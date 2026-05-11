<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grooming;
use App\Models\Sale;
use App\Models\Payment;
use App\Models\SaleItem;
use App\Services\GroomingInventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class GroomingController extends Controller
{
    public function index()
    {
        return response()->json([
            'appointments' => Grooming::with(['customer', 'pet'])
                ->latest()
                ->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'pet_id' => 'required|exists:pets,id',
            'service' => 'required|string|max:255',
            'appointment_date' => 'required|date',
            'appointment_time' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
            'amount' => 'nullable|numeric',
        ]);

        $validated['status'] = 'pending';

        $grooming = Grooming::create($validated);

        return response()->json([
            'message' => 'Grooming appointment created',
            'appointment' => $grooming
        ], 201);
    }

    public function updateStatus(Request $request, Grooming $grooming)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected,in_progress,completed,cancelled'
        ]);

        $oldStatus = $grooming->status;
        $grooming->update([
            'status' => $validated['status']
        ]);

        // Auto-create sale and payment when grooming is completed
        if ($validated['status'] === 'completed' && $oldStatus !== 'completed') {
            $cashierId = null;
            if (Auth::check()) {
                $cashierId = Auth::id();
            }

            $sale = Sale::create([
                'customer_id' => $grooming->customer_id,
                'cashier_id' => $cashierId,
                'type' => 'service',
                'status' => 'completed',
                'payment_type' => 'cash',
                'subtotal' => $grooming->amount,
                'tax_amount' => 0,
                'discount_amount' => 0,
                'total_amount' => $grooming->amount,
                'amount' => $grooming->amount,
                'notes' => "Grooming service: {$grooming->service} for pet ID {$grooming->pet_id}",
            ]);

            // Create sale item
            SaleItem::create([
                'sale_id' => $sale->id,
                'product_id' => null,
                'service_name' => $grooming->service,
                'quantity' => 1,
                'unit_price' => $grooming->amount,
                'total_price' => $grooming->amount,
            ]);

            // Create payment
            Payment::create([
                'sale_id' => $sale->id,
                'payment_method' => 'cash',
                'amount' => $grooming->amount,
                'status' => 'completed',
                'paid_at' => now(),
                'notes' => "Auto-generated payment for grooming service",
            ]);
        }

        return response()->json([
            'message' => 'Grooming status updated',
            'appointment' => $grooming
        ]);
    }

    /**
     * Record inventory usage for grooming (shampoos, conditioners, supplies)
     */
    public function recordInventoryUsage(Request $request, int $id)
    {
        $grooming = Grooming::findOrFail($id);
        
        // Check access - only staff/admin can record usage
        if (!in_array($request->user()?->role, ['admin', 'receptionist', 'veterinary', 'inventory'])) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to record inventory usage'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.inventory_item_id' => 'required|integer|exists:inventory_items,id',
            'items.*.quantity_used' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string|max:500',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $groomingInventoryService = new GroomingInventoryService();
            $result = $groomingInventoryService->recordInventoryUsage(
                $request->input('items'),
                $id,
                $grooming->pet_id,
                'Grooming supply usage',
                $request->user()?->id
            );
            
            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => $result['message'],
                    'usages' => $result['usages'],
                    'total_items' => $result['total_items'],
                    'processed_items' => $result['processed_items']
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'],
                    'errors' => $result['errors']
                ], 422);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to record inventory usage: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get inventory usage history for a grooming appointment
     */
    public function getInventoryUsageHistory(int $id)
    {
        $grooming = Grooming::findOrFail($id);
        
        try {
            $groomingInventoryService = new GroomingInventoryService();
            $history = $groomingInventoryService->getGroomingUsageHistory($id);
            
            return response()->json([
                'success' => true,
                'history' => $history,
                'grooming_id' => $id,
                'pet_id' => $grooming->pet_id
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch usage history: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get available inventory items for grooming usage
     */
    public function getAvailableInventoryItems()
    {
        try {
            $groomingInventoryService = new GroomingInventoryService();
            $items = $groomingInventoryService->getAvailableServiceItems();
            
            return response()->json([
                'success' => true,
                'items' => $items,
                'count' => count($items)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch available items: ' . $e->getMessage()
            ], 500);
        }
    }
}
