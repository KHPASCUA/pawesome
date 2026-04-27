<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Boarding;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function storeBoardingPayment(Request $request, Boarding $boarding)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'method' => 'required|string|max:50',
            'reference_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $payment = Payment::create([
            'customer_id' => $boarding->customer_id,
            'boarding_id' => $boarding->id,
            'amount' => $validated['amount'],
            'method' => $validated['method'],
            'reference_number' => $validated['reference_number'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Payment submitted for cashier verification',
            'payment' => $payment,
        ], 201);
    }
}
