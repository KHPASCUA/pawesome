<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;

class ServiceRequestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:150',
            'customer_email' => 'nullable|email|max:150',
            'pet_name' => 'required|string|max:150',
            'service_type' => 'required|in:grooming,vet,hotel',
            'service_name' => 'required|string|max:150',
            'request_date' => 'required|date',
            'request_time' => 'required|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $serviceRequest = ServiceRequest::create([
            ...$validated,
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking request submitted successfully.',
            'request' => $serviceRequest,
        ], 201);
    }

    public function receptionistRequests()
    {
        $requests = ServiceRequest::latest()
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'customer' => $item->customer_name,
                    'email' => $item->customer_email,
                    'pet' => $item->pet_name,
                    'type' => $item->service_type,
                    'service' => $item->service_name,
                    'date' => $item->request_date,
                    'time' => $item->request_time,
                    'notes' => $item->notes,
                    'status' => $item->status,
                    'payment' => $item->payment_status,
                    'created_at' => $item->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'requests' => $requests,
        ]);
    }

    public function customerRequests(Request $request)
    {
        $email = $request->query('email');

        if (!$email) {
            return response()->json([
                'success' => false,
                'message' => 'Customer email is required.',
            ], 400);
        }

        $requests = ServiceRequest::where('customer_email', $email)
            ->latest()
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'customer' => $item->customer_name,
                    'pet' => $item->pet_name,
                    'type' => $item->service_type,
                    'service' => $item->service_name,
                    'date' => $item->request_date,
                    'time' => $item->request_time,
                    'notes' => $item->notes,
                    'status' => $item->status,
                    'payment' => $item->payment_status,
                ];
            });

        return response()->json([
            'success' => true,
            'requests' => $requests,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected,rescheduled',
        ]);

        $serviceRequest = ServiceRequest::find($id);

        if (!$serviceRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Request not found.',
            ], 404);
        }

        $paymentStatus = $validated['status'] === 'approved'
            ? 'pending'
            : 'unpaid';

        $serviceRequest->update([
            'status' => $validated['status'],
            'payment_status' => $paymentStatus,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Request status updated successfully.',
            'request' => $serviceRequest,
        ]);
    }
}
