<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use App\Models\ActivityLog;
use App\Services\WorkflowNotifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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
            'payment_method' => $item->payment_method,
            'payment_reference' => $item->payment_reference,
            'payment_proof' => $item->payment_proof,
            'created_at' => $item->created_at,
        ];
    }

    public function store(Request $request)
    {
        // Map frontend field names to backend field names before validation
        $request->merge([
            'request_type' => $request->request_type ?? $request->service_type,
            'requested_date' => $request->requested_date ?? $request->preferred_date,
            'requested_time' => $request->requested_time ?? $request->preferred_time,
        ]);

        $validated = $request->validate([
            'customer_name' => 'required|string|max:150',
            'customer_email' => 'nullable|email|max:150',
            'pet_id' => 'nullable|integer|exists:pets,id',
            'pet_name' => 'required|string|max:150',
            'request_type' => 'required|string|max:150',
            'requested_date' => 'required|date|after_or_equal:today',
            'requested_time' => 'required|date_format:H:i',
            'notes' => 'nullable|string',
        ]);

        // Validate business hours
        $time = $validated['requested_time'];
        if ($time < '09:00' || $time > '18:00') {
            return response()->json([
                'message' => 'Selected time is outside shop opening hours. Please choose between 9:00 AM and 6:00 PM.',
            ], 422);
        }

        $createData = [
            'request_type' => $validated['request_type'],
            'customer_name' => $validated['customer_name'],
            'pet_name' => $validated['pet_name'],
            'service_name' => $validated['service_name'] ?? $validated['request_type'], // Use request_type as service_name fallback
            // Use requested_date/time as primary, fallback to preferred_date/time
            'request_date' => $validated['requested_date'] ?? $validated['preferred_date'],
            'request_time' => $validated['requested_time'] ?? $validated['preferred_time'],
            'preferred_date' => $validated['preferred_date'] ?? $validated['requested_date'] ?? null,
            'preferred_time' => $validated['preferred_time'] ?? $validated['requested_time'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ];

        if (Schema::hasColumn('service_requests', 'customer_email')) {
            $createData['customer_email'] = $validated['customer_email'] ?? null;
        }

        if (Schema::hasColumn('service_requests', 'pet_id') && !empty($validated['pet_id'])) {
            $createData['pet_id'] = $validated['pet_id'];
        }

        // Add customer_id if user is authenticated
        if (Auth::check()) {
            $createData['customer_id'] = Auth::id();
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

    public function uploadPaymentProof(Request $request, $id)
    {
        $validated = $request->validate([
            'payment_method' => 'nullable|string|max:255',
            'payment_reference' => 'nullable|string|max:255',
            'payment_proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $serviceRequest = ServiceRequest::findOrFail($id);

        // Only allow payment proof upload for approved requests
        if ($serviceRequest->status !== 'approved') {
            return response()->json([
                'message' => 'Payment proof can only be uploaded for approved requests.',
            ], 403);
        }

        // Store the uploaded file
        $path = $request->file('payment_proof')->store('payment_proofs', 'public');

        $serviceRequest->update([
            'payment_method' => $validated['payment_method'] ?? 'Online Payment',
            'payment_reference' => $validated['payment_reference'],
            'payment_proof' => $path,
            'payment_status' => 'pending',
        ]);

        // Notify cashier role
        $this->notifyRole(
            'cashier',
            'New Payment Proof Uploaded',
            'A customer uploaded payment proof for service request #' . $serviceRequest->id,
            'info',
            'service_request',
            $serviceRequest->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Payment proof uploaded successfully. Waiting for cashier verification.',
            'request' => $this->formatRequest($serviceRequest),
            'file_path' => $path,
        ]);
    }

    public function receipt(Request $request, $id)
    {
        $serviceRequest = ServiceRequest::findOrFail($id);

        if ($serviceRequest->payment_status !== 'paid') {
            return response()->json([
                'message' => 'Receipt is only available after payment verification.',
            ], 422);
        }

        return response()->json([
            'receipt' => [
                'receipt_number' => $serviceRequest->receipt_number,
                'request_id' => $serviceRequest->id,
                'customer_name' => $serviceRequest->customer_name,
                'customer_email' => $serviceRequest->customer_email,
                'pet_name' => $serviceRequest->pet_name,
                'service_type' => $serviceRequest->request_type ?? $serviceRequest->service_type,
                'total_amount' => $serviceRequest->total_amount ?? $serviceRequest->price ?? 500,
                'payment_method' => $serviceRequest->payment_method,
                'payment_reference' => $serviceRequest->payment_reference,
                'paid_at' => $serviceRequest->paid_at,
                'verified_by' => $serviceRequest->verified_by,
                'cashier_remarks' => $serviceRequest->cashier_remarks,
            ],
        ]);
    }

    private function notifyRole($role, $title, $message, $type = 'info', $relatedType = null, $relatedId = null, $data = [])
    {
        try {
            $users = \App\Models\User::where('role', $role)
                ->where('is_active', true)
                ->get();

            foreach ($users as $user) {
                \App\Models\Notification::create([
                    'user_id' => $user->id,
                    'role' => $role,
                    'title' => $title,
                    'message' => $message,
                    'type' => $type,
                    'related_type' => $relatedType,
                    'related_id' => $relatedId,
                    'data' => !empty($data) ? json_encode($data) : null,
                    'read' => false,
                ]);
            }
        } catch (\Throwable $e) {
            \Log::warning('notifyRole failed: ' . $e->getMessage());
        }
    }
}
