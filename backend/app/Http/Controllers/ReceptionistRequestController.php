<?php

namespace App\Http\Controllers;

use App\Models\ServiceRequest;
use App\Models\ActivityLog;
use App\Services\WorkflowNotifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ReceptionistRequestController extends Controller
{
    private function formatRequest(ServiceRequest $item): array
    {
        return [
            'id' => $item->id,
            'request_type' => $item->request_type,
            'service_type' => $item->request_type,
            'type' => $item->request_type,
            'customer_name' => $item->customer_name,
            'customer' => $item->customer_name,
            'customer_email' => $item->customer_email,
            'email' => $item->customer_email,
            'pet_name' => $item->pet_name,
            'pet' => $item->pet_name,
            'service_name' => $item->service_name,
            'service' => $item->service_name,
            'request_date' => $item->request_date,
            'date' => $item->request_date,
            'request_time' => $item->request_time,
            'time' => $item->request_time,
            'status' => $item->status,
            'payment_status' => $item->payment_status,
            'payment' => $item->payment_status,
            'notes' => $item->notes,
            'created_at' => $item->created_at,
        ];
    }

    public function index()
    {
        $requests = ServiceRequest::latest()->get()->map(fn ($item) => $this->formatRequest($item));

        return response()->json([
            'success' => true,
            'requests' => $requests
        ]);
    }

    public function pending()
    {
        $requests = ServiceRequest::where('status', 'pending')
            ->latest()
            ->get()
            ->map(fn ($item) => $this->formatRequest($item));

        return response()->json([
            'success' => true,
            'requests' => $requests
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'request_type' => 'nullable|string',
            'service_type' => 'nullable|string',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'pet_name' => 'nullable|string|max:255',
            'service_name' => 'required|string|max:255',
            'request_date' => 'nullable|date',
            'request_time' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:pending,scheduled,approved,rejected',
        ]);

        // Role-based status validation
        $user = $request->user();
        $status = 'pending'; // Default for customers
        
        if ($user && in_array($user->role, ['receptionist', 'admin'])) {
            $status = $validated['status'] ?? 'scheduled'; // Default to scheduled for receptionist/admin
        }

        $createData = [
            'request_type' => $validated['request_type'] ?? $validated['service_type'] ?? 'grooming',
            'customer_name' => $validated['customer_name'],
            'pet_name' => $validated['pet_name'] ?? null,
            'service_name' => $validated['service_name'],
            'request_date' => $validated['request_date'] ?? null,
            'request_time' => $validated['request_time'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => $status,
            'payment_status' => 'pending',
        ];

        if (Schema::hasColumn('service_requests', 'customer_email')) {
            $createData['customer_email'] = $validated['customer_email'] ?? null;
        }

        $serviceRequest = ServiceRequest::create($createData);

        WorkflowNotifier::notifyRole(
            'receptionist',
            'New Service Request',
            "{$serviceRequest->customer_name} submitted a {$serviceRequest->request_type} request.",
            'info',
            'service_request',
            $serviceRequest->id,
            ['customer_email' => $serviceRequest->customer_email]
        );

        return response()->json([
            'success' => true,
            'message' => 'Request submitted successfully.',
            'request' => $this->formatRequest($serviceRequest)
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

        WorkflowNotifier::notifyEmail(
            $serviceRequest->customer_email,
            'Service Request Updated',
            "Your {$serviceRequest->service_name} request is now {$validated['status']}.",
            $validated['status'] === 'rejected' ? 'error' : 'success',
            'service_request',
            $serviceRequest->id
        );

        ActivityLog::log(auth()->id(), 'service_request_' . $validated['status'], "Service request #{$serviceRequest->id} set to {$validated['status']}", [
            'category' => 'service_requests',
            'reference_type' => 'service_request',
            'reference_id' => $serviceRequest->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Request status updated successfully.',
            'request' => $this->formatRequest($serviceRequest)
        ]);
    }

    public function approve(Request $request, $id)
    {
        $serviceRequest = ServiceRequest::findOrFail($id);

        $serviceRequest->update([
            'status' => 'approved',
            'payment_status' => 'unpaid',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'receptionist_remarks' => $request->input('receptionist_remarks', 'Approved by receptionist'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Request approved successfully.',
            'request' => $this->formatRequest($serviceRequest),
        ]);
    }

    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
            'receptionist_remarks' => 'nullable|string|max:1000',
        ]);

        $serviceRequest = ServiceRequest::findOrFail($id);

        $serviceRequest->update([
            'status' => 'rejected',
            'rejected_by' => $request->user()->id,
            'rejected_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
            'receptionist_remarks' => $validated['receptionist_remarks'] ?? $validated['rejection_reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Request rejected successfully.',
            'request' => $this->formatRequest($serviceRequest),
        ]);
    }
}
