<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use App\Models\ActivityLog;
use App\Services\WorkflowNotifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ServiceRequestController extends Controller
{
    private function formatRequest(ServiceRequest $item): array
    {
        return [
            'id' => $item->id,
            'customer' => $item->customer_name,
            'customer_name' => $item->customer_name,
            'email' => $item->customer_email,
            'customer_email' => $item->customer_email,
            'pet' => $item->pet_name,
            'pet_name' => $item->pet_name,
            'type' => $item->request_type,
            'request_type' => $item->request_type,
            'service_type' => $item->request_type,
            'service' => $item->service_name,
            'service_name' => $item->service_name,
            'date' => $item->request_date,
            'request_date' => $item->request_date,
            'time' => $item->request_time,
            'request_time' => $item->request_time,
            'notes' => $item->notes,
            'status' => $item->status,
            'payment' => $item->payment_status,
            'payment_status' => $item->payment_status,
            'created_at' => $item->created_at,
        ];
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:150',
            'customer_email' => 'nullable|email|max:150',
            'pet_name' => 'required|string|max:150',
            'service_type' => 'required|in:grooming,vet,hotel',
            'request_type' => 'required|in:grooming,vet,hotel',
            'service_name' => 'required|string|max:150',
            'request_date' => 'required|date',
            'request_time' => 'required|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $createData = [
            'request_type' => $validated['service_type'],
            'customer_name' => $validated['customer_name'],
            'pet_name' => $validated['pet_name'],
            'service_name' => $validated['service_name'],
            'request_date' => $validated['request_date'],
            'request_time' => $validated['request_time'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
            'payment_status' => 'unpaid',
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

        WorkflowNotifier::notifyEmail(
            $serviceRequest->customer_email,
            'Service Request Submitted',
            "Your {$serviceRequest->service_name} request is waiting for receptionist approval.",
            'info',
            'service_request',
            $serviceRequest->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Booking request submitted successfully.',
            'request' => $this->formatRequest($serviceRequest),
        ], 201);
    }

    public function receptionistRequests()
    {
        $requests = ServiceRequest::latest()
            ->get()
            ->map(fn ($item) => $this->formatRequest($item));

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

        $query = ServiceRequest::query();

        if (Schema::hasColumn('service_requests', 'customer_email')) {
            $query->where('customer_email', $email);
        } else {
            $query->whereRaw('1 = 0');
        }

        $requests = $query
            ->latest()
            ->get()
            ->map(fn ($item) => $this->formatRequest($item));

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
            'request' => $this->formatRequest($serviceRequest),
        ]);
    }
}
