<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;

class CashierPaymentController extends Controller
{
    public function index()
    {
        return response()->json([
            'payments' => Payment::with(['customer', 'boarding.pet', 'boarding.hotelRoom'])
                ->latest()
                ->get()
        ]);
    }

    public function verify(Payment $payment)
    {
        $payment->update([
            'status' => 'verified',
            'verified_at' => now(),
        ]);

        if ($payment->boarding) {
            $boarding = $payment->boarding;

            $totalPaid = $boarding->payments()
                ->where('status', 'verified')
                ->sum('amount');

            $paymentStatus = $totalPaid >= $boarding->total_amount
                ? 'paid'
                : 'partial';

            $boarding->update([
                'amount_paid' => $totalPaid,
                'payment_status' => $paymentStatus,
            ]);
        }

        return response()->json([
            'message' => 'Payment verified successfully',
            'payment' => $payment,
        ]);
    }

    public function reject(Payment $payment)
    {
        $payment->update([
            'status' => 'rejected',
        ]);

        return response()->json([
            'message' => 'Payment rejected',
            'payment' => $payment,
        ]);
    }
}
