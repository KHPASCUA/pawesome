<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use Illuminate\Http\Request;

class PetController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $customer = \App\Models\Customer::where('user_id', $user->id)
            ->orWhere('email', $user->email)
            ->first();

        if (!$customer) {
            return response()->json([
                'pets' => [],
            ]);
        }

        $pets = \App\Models\Pet::where('customer_id', $customer->id)
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

        $customer = \App\Models\Customer::firstOrCreate(
            ['email' => $user->email],
            [
                'user_id' => $user->id,
                'name' => $user->name ?? trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                'phone' => $user->phone ?? null,
                'address' => $user->address ?? null,
                'is_active' => true,
            ]
        );

        $pet = \App\Models\Pet::create([
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

    public function show($id)
    {
        $pet = Pet::findOrFail($id);
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
        $pet->update($validated);

        return response()->json([
            'message' => 'Pet updated successfully',
            'pet' => $pet
        ]);
    }

    public function destroy($id)
    {
        $pet = Pet::findOrFail($id);
        $pet->delete();

        return response()->json(['message' => 'Pet deleted successfully']);
    }
}
