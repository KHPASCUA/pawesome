<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grooming;
use App\Models\Sale;
use App\Models\Payment;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
}
