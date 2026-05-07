<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use App\Models\Customer;
use Illuminate\Http\Request;

class PetController extends Controller
{
    private function currentCustomer(Request $request): ?Customer
    {
        $user = $request->user();

        if (!$user) {
            return null;
        }

        return Customer::where('user_id', $user->id)
            ->orWhere('email', $user->email)
            ->first();
    }

    private function customerOwnsPet(Request $request, Pet $pet): bool
    {
        $customer = $this->currentCustomer($request);

        return $customer && (int) $pet->customer_id === (int) $customer->id;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user && $user->role !== 'customer') {
            return response()->json([
                'pets' => Pet::with('customer')->latest()->get(),
            ]);
        }

        $customer = $this->currentCustomer($request);

        if (!$customer) {
            return response()->json([
                'pets' => [],
            ]);
        }

        $pets = Pet::where('customer_id', $customer->id)
            ->latest()
            ->get();

        return response()->json([
            'pets' => $pets,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'species' => 'required|string|max:255',
            'breed' => 'nullable|string|max:255',
            'age' => 'nullable|integer|min:0',
            'gender' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        $customer = Customer::firstOrCreate(
            ['email' => $user->email],
            [
                'user_id' => $user->id,
                'name' => $user->name ?? trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                'phone' => $user->phone ?? null,
                'address' => $user->address ?? null,
                'is_active' => true,
            ]
        );

        $pet = Pet::create([
            'customer_id' => $customer->id,
            'name' => $validated['name'],
            'species' => $validated['species'],
            'breed' => $validated['breed'] ?? null,
            'age' => $validated['age'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Pet added successfully.',
            'pet' => $pet,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $pet = Pet::findOrFail($id);

        if ($request->user()?->role === 'customer' && !$this->customerOwnsPet($request, $pet)) {
            return response()->json(['message' => 'Pet not found'], 404);
        }

        return response()->json(['pet' => $pet]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'species' => 'required|string|max:255',
            'breed' => 'nullable|string|max:255',
            'age' => 'nullable|integer|min:0',
            'gender' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $pet = Pet::findOrFail($id);

        if ($request->user()?->role === 'customer' && !$this->customerOwnsPet($request, $pet)) {
            return response()->json(['message' => 'Pet not found'], 404);
        }

        $pet->update($validated);

        return response()->json([
            'message' => 'Pet updated successfully',
            'pet' => $pet
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $pet = Pet::findOrFail($id);

        if ($request->user()?->role === 'customer' && !$this->customerOwnsPet($request, $pet)) {
            return response()->json(['message' => 'Pet not found'], 404);
        }

        $pet->delete();

        return response()->json(['message' => 'Pet deleted successfully']);
    }
}
