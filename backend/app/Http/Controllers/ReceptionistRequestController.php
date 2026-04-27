<?php

namespace App\Http\Controllers;

use App\Models\ServiceRequest;
use Illuminate\Http\Request;

class ReceptionistRequestController extends Controller
{
    public function index()
    {
        $requests = ServiceRequest::latest()->get();

        return response()->json([
            'success' => true,
            'requests' => $requests
        ]);
    }

    public function pending()
    {
        $requests = ServiceRequest::where('status', 'pending')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'requests' => $requests
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'request_type' => 'required|string',
            'customer_name' => 'required|string|max:255',
            'pet_name' => 'nullable|string|max:255',
            'service_name' => 'required|string|max:255',
            'request_date' => 'nullable|date',
            'request_time' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $serviceRequest = ServiceRequest::create([
            ...$validated,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Request submitted successfully.',
            'request' => $serviceRequest
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $serviceRequest = ServiceRequest::findOrFail($id);
        $serviceRequest->status = $validated['status'];

        if ($validated['status'] === 'approved') {
            $serviceRequest->payment_status = 'pending';
        }

        if ($validated['status'] === 'rejected') {
            $serviceRequest->payment_status = 'unpaid';
        }

        $serviceRequest->save();

        return response()->json([
            'success' => true,
            'message' => 'Request status updated successfully.',
            'request' => $serviceRequest
        ]);
    }
}
