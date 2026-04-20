<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CustomersController extends Controller
{
    /**
     * List all customers with their pets
     */
    public function index(Request $request)
    {
        $query = Customer::with(['pets']);
        
        // Search by name or email
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }
        
        $customers = $query->orderBy('name')->paginate(20);
        
        return response()->json([
            'customers' => $customers->items(),
            'pagination' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'total' => $customers->total(),
            ]
        ]);
    }

    /**
     * Get single customer with full details
     */
    public function show($id)
    {
        $customer = Customer::with(['pets', 'pets.appointments', 'pets.boardings'])->find($id);
        
        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }
        
        return response()->json($customer);
    }

    /**
     * Create new customer
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:customers,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $customer = Customer::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'message' => 'Customer created successfully',
            'customer' => $customer
        ], 201);
    }

    /**
     * Update customer
     */
    public function update(Request $request, $id)
    {
        $customer = Customer::find($id);
        
        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:customers,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $customer->update($request->only(['name', 'email', 'phone', 'address', 'is_active']));

        return response()->json([
            'message' => 'Customer updated successfully',
            'customer' => $customer->fresh()
        ]);
    }

    /**
     * Delete customer
     */
    public function destroy($id)
    {
        $customer = Customer::find($id);
        
        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        // Check if customer has pets with appointments or boardings
        $hasActiveRecords = $customer->pets()->whereHas('appointments')->exists() ||
                           $customer->pets()->whereHas('boardings')->exists();
        
        if ($hasActiveRecords) {
            return response()->json([
                'message' => 'Cannot delete customer with active appointments or boardings'
            ], 422);
        }

        $customer->delete();

        return response()->json(['message' => 'Customer deleted successfully']);
    }

    /**
     * Get customer's pets
     */
    public function pets($id)
    {
        $customer = Customer::find($id);
        
        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        return response()->json($customer->pets()->with(['appointments', 'boardings'])->get());
    }

    /**
     * Add pet to customer
     */
    public function addPet(Request $request, $id)
    {
        $customer = Customer::find($id);
        
        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'species' => 'nullable|string|max:100',
            'breed' => 'nullable|string|max:100',
            'age' => 'nullable|integer|min:0',
            'gender' => 'nullable|string|in:male,female',
            'weight' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $pet = Pet::create([
            'customer_id' => $customer->id,
            'name' => $request->name,
            'species' => $request->species,
            'breed' => $request->breed,
            'age' => $request->age,
            'gender' => $request->gender,
            'weight' => $request->weight,
        ]);

        return response()->json([
            'message' => 'Pet added successfully',
            'pet' => $pet
        ], 201);
    }
}
