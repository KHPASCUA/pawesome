<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class ReceptionistCustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::withCount('pets')
            ->latest()
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'phone' => $customer->phone,
                    'email' => $customer->email ?? 'N/A',
                    'address' => $customer->address ?? 'N/A',
                    'notes' => $customer->notes,
                    'joinDate' => $customer->created_at
                        ? $customer->created_at->format('Y-m-d')
                        : null,
                    'totalBookings' => 0,
                    'petsCount' => $customer->pets_count,
                ];
            });

        return response()->json([
            'success' => true,
            'customers' => $customers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'phone' => 'required|string|max:50',
            'email' => 'nullable|email|max:150',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $customer = Customer::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Customer created successfully.',
            'customer' => $customer,
        ], 201);
    }
}
