<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\Pet;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatbotWorkflowController extends Controller
{
    public function bookingOptions(Request $request): JsonResponse
    {
        $user = $request->user();
        $customer = $user ? Customer::where('email', $user->email)->first() : null;
        $pets = $customer ? Pet::where('customer_id', $customer->id)->orderBy('name')->get(['id', 'name', 'species', 'breed']) : [];
        $services = Service::query()->orderBy('name')->get(['id', 'name', 'price']);

        return response()->json([
            'pets' => $pets,
            'services' => $services,
        ]);
    }

    public function createBooking(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || $user->role !== 'customer') {
            return response()->json(['message' => 'Only customer accounts can create chatbot bookings.'], 403);
        }

        $customer = Customer::where('email', $user->email)->first();
        if (!$customer) {
            return response()->json(['message' => 'Customer profile not found.'], 404);
        }

        $data = $request->validate([
            'pet_id' => 'required|integer',
            'service_id' => 'required|integer|exists:services,id',
            'scheduled_at' => 'required|date',
        ]);

        $pet = Pet::where('customer_id', $customer->id)->find($data['pet_id']);
        if (!$pet) {
            return response()->json(['message' => 'Selected pet does not belong to the current customer.'], 422);
        }

        $service = Service::findOrFail($data['service_id']);

        $appointment = Appointment::create([
            'customer_id' => $customer->id,
            'pet_id' => $pet->id,
            'service_id' => $service->id,
            'status' => 'scheduled',
            'scheduled_at' => $data['scheduled_at'],
            'price' => $service->price ?? 0,
        ]);

        return response()->json([
            'message' => 'Booking created successfully.',
            'appointment' => $appointment->load(['pet', 'service']),
        ], 201);
    }

    public function lookupAppointments(Request $request): JsonResponse
    {
        $data = $request->validate([
            'query' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $queryText = trim($data['query'] ?? '');
        $appointments = Appointment::query()->with(['customer', 'pet', 'service']);

        if ($user?->role === 'customer') {
            $customer = Customer::where('email', $user->email)->first();
            $appointments->where('customer_id', $customer?->id ?? 0);
        }

        if ($queryText !== '') {
            $appointments->where(function ($query) use ($queryText) {
                $query
                    ->where('status', 'like', "%{$queryText}%")
                    ->orWhereHas('customer', fn ($customerQuery) => $customerQuery->where('name', 'like', "%{$queryText}%"))
                    ->orWhereHas('pet', fn ($petQuery) => $petQuery->where('name', 'like', "%{$queryText}%"))
                    ->orWhereHas('service', fn ($serviceQuery) => $serviceQuery->where('name', 'like', "%{$queryText}%"));
            });
        }

        return response()->json(
            $appointments
                ->orderBy('scheduled_at')
                ->limit(10)
                ->get()
                ->map(function (Appointment $appointment) {
                    return [
                        'id' => $appointment->id,
                        'status' => $appointment->status,
                        'scheduled_at' => optional($appointment->scheduled_at)->toDateTimeString(),
                        'customer' => $appointment->customer?->name,
                        'pet' => $appointment->pet?->name,
                        'service' => $appointment->service?->name,
                        'price' => $appointment->price,
                    ];
                })
        );
    }

    public function searchInventory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'query' => 'required|string|max:255',
        ]);

        $queryText = trim($data['query']);

        return response()->json(
            InventoryItem::query()
                ->where(function ($query) use ($queryText) {
                    $query
                        ->where('name', 'like', "%{$queryText}%")
                        ->orWhere('sku', 'like', "%{$queryText}%")
                        ->orWhere('description', 'like', "%{$queryText}%");
                })
                ->orderBy('name')
                ->limit(10)
                ->get(['id', 'sku', 'name', 'stock', 'reorder_level', 'price', 'expiry_date'])
                ->map(function (InventoryItem $item) {
                    return [
                        'id' => $item->id,
                        'sku' => $item->sku,
                        'name' => $item->name,
                        'stock' => $item->stock,
                        'reorder_level' => $item->reorder_level,
                        'price' => $item->price,
                        'expiry_date' => optional($item->expiry_date)->toDateString(),
                    ];
                })
        );
    }
}
