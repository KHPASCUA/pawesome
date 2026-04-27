<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use Illuminate\Http\Request;

class PetController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['pets' => []]);
        }

        $pets = Pet::where('customer_id', $customer->id)->orderBy('created_at', 'desc')->get();
        return response()->json(['pets' => $pets]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'species' => 'required|string|max:50',
            'breed' => 'nullable|string|max:100',
            'age' => 'nullable|string|max:30',
            'gender' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
        ]);

        $user = auth()->user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['message' => 'Customer record not found'], 404);
        }

        $validated['customer_id'] = $customer->id;
        $pet = Pet::create($validated);

        return response()->json([
            'message' => 'Pet added successfully',
            'pet' => $pet
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
            'name' => 'required|string|max:100',
            'species' => 'required|string|max:50',
            'breed' => 'nullable|string|max:100',
            'age' => 'nullable|string|max:30',
            'gender' => 'nullable|string|max:20',
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
