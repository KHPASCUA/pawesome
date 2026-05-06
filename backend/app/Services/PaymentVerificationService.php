<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentVerificationService
{
    /**
     * Verify a payment (service_request or customer_order)
     * Returns array with standardized keys: success, message, payment_status, receipt_number
     */
    public function verify(string $type, int $id, $request)
    {
        try {
            if ($type === 'service_request' || $type === 'service') {
                $sr = DB::table('service_requests')->where('id', $id)->first();
                if (!$sr) return ['success' => false, 'message' => 'Service request not found', 'status' => 404];
                if (($sr->payment_status ?? 'unpaid') !== 'pending') {
                    return ['success' => false, 'message' => 'Only pending payment proofs can be verified', 'status' => 422, 'payment_status' => $sr->payment_status];
                }

                $receiptNumber = 'SR-REC-' . now()->format('YmdHis') . '-' . $id;

                DB::table('service_requests')->where('id', $id)->update([
                    'payment_status' => 'paid',
                    'paid_at' => now(),
                    'verified_by' => auth()->id(),
                    'cashier_remarks' => $request->input('cashier_remarks', 'Payment verified by cashier'),
                    'receipt_number' => $receiptNumber,
                ]);

                return ['success' => true, 'message' => 'Service request payment verified successfully.', 'payment_status' => 'paid', 'receipt_number' => $receiptNumber];
            }

            // default: customer_order
            $order = DB::table('customer_orders')->where('id', $id)->first();
            if (!$order) return ['success' => false, 'message' => 'Order not found', 'status' => 404];
            if ((($order->payment_status) ?? 'unpaid') !== 'pending') {
                return ['success' => false, 'message' => 'Only pending payment proofs can be verified', 'status' => 422, 'payment_status' => $order->payment_status ?? 'unpaid'];
            }

            $receiptNumber = $order->receipt_number ?? ('REC-' . now()->format('YmdHis') . '-' . $order->id);

            DB::table('customer_orders')->where('id', $id)->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
                'verified_by' => auth()->id(),
                'cashier_remarks' => $request->input('cashier_remarks'),
                'receipt_number' => $receiptNumber,
                'updated_at' => now(),
            ]);

            return ['success' => true, 'message' => 'Payment verified successfully', 'payment_status' => 'paid', 'receipt_number' => $receiptNumber];

        } catch (\Throwable $e) {
            Log::error('PaymentVerificationService::verify error - ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage(), 'status' => 500];
        }
    }

    public function reject(string $type, int $id, $request)
    {
        try {
            if ($type === 'service_request' || $type === 'service') {
                $sr = DB::table('service_requests')->where('id', $id)->first();
                if (!$sr) return ['success' => false, 'message' => 'Service request not found', 'status' => 404];
                if (($sr->payment_status ?? 'unpaid') !== 'pending') {
                    return ['success' => false, 'message' => 'Only pending payment proofs can be rejected', 'status' => 422, 'payment_status' => $sr->payment_status];
                }

                DB::table('service_requests')->where('id', $id)->update([
                    'payment_status' => 'rejected',
                    'rejected_by' => auth()->id(),
                    'rejected_at' => now(),
                    'rejection_reason' => $request->input('rejection_reason'),
                ]);

                return ['success' => true, 'message' => 'Service request payment rejected', 'payment_status' => 'rejected'];
            }

            $order = DB::table('customer_orders')->where('id', $id)->first();
            if (!$order) return ['success' => false, 'message' => 'Order not found', 'status' => 404];
            if ((($order->payment_status) ?? 'unpaid') !== 'pending') {
                return ['success' => false, 'message' => 'Only pending payment proofs can be rejected', 'status' => 422, 'payment_status' => $order->payment_status ?? 'unpaid'];
            }

            DB::table('customer_orders')->where('id', $id)->update([
                'payment_status' => 'rejected',
                'rejected_by' => auth()->id(),
                'rejected_at' => now(),
                'rejection_reason' => $request->input('rejection_reason'),
            ]);

            return ['success' => true, 'message' => 'Payment rejected', 'payment_status' => 'rejected'];

        } catch (\Throwable $e) {
            Log::error('PaymentVerificationService::reject error - ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage(), 'status' => 500];
        }
    }
}
