<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::query();

        if (Schema::hasColumn('services', 'is_active')) {
            $query->where(function ($activeQuery) {
                $activeQuery
                    ->where('is_active', true)
                    ->orWhere('is_active', 1)
                    ->orWhereNull('is_active');
            });
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($searchQuery) use ($search) {
                $searchQuery
                    ->where('name', 'like', "%{$search}%");

                if (Schema::hasColumn('services', 'category')) {
                    $searchQuery->orWhere('category', 'like', "%{$search}%");
                }

                if (Schema::hasColumn('services', 'description')) {
                    $searchQuery->orWhere('description', 'like', "%{$search}%");
                }
            });
        }

        if (Schema::hasColumn('services', 'category')) {
            $query->orderBy('category');
        }

        $services = $query
            ->orderBy('name')
            ->get()
            ->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'category' => $service->category ?? 'Other',
                    'description' => $service->description ?? '',
                    'price' => (float) ($service->price ?? 0),
                    'duration_minutes' => (int) ($service->duration_minutes ?? $service->duration ?? 0),
                    'is_active' => isset($service->is_active) ? (bool) $service->is_active : true,
                    'created_at' => $service->created_at,
                    'updated_at' => $service->updated_at,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }

    public function store(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $payload = [
            'name' => $request->name,
            'price' => $request->price ?? 0,
        ];

        if (Schema::hasColumn('services', 'category')) {
            $payload['category'] = $request->category ?? 'Other';
        }

        if (Schema::hasColumn('services', 'description')) {
            $payload['description'] = $request->description ?? '';
        }

        if (Schema::hasColumn('services', 'duration_minutes')) {
            $payload['duration_minutes'] = $request->duration_minutes ?? 30;
        }

        if (Schema::hasColumn('services', 'is_active')) {
            $payload['is_active'] = $request->has('is_active') ? $request->boolean('is_active') : true;
        }

        $service = Service::create($payload);

        return response()->json([
            'success' => true,
            'message' => 'Service created successfully.',
            'data' => $service,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($request->has('name')) {
            $service->name = $request->name;
        }

        if ($request->has('price')) {
            $service->price = $request->price ?? 0;
        }

        if ($request->has('category') && Schema::hasColumn('services', 'category')) {
            $service->category = $request->category ?? 'Other';
        }

        if ($request->has('description') && Schema::hasColumn('services', 'description')) {
            $service->description = $request->description ?? '';
        }

        if ($request->has('duration_minutes') && Schema::hasColumn('services', 'duration_minutes')) {
            $service->duration_minutes = $request->duration_minutes ?? 30;
        }

        if ($request->has('is_active') && Schema::hasColumn('services', 'is_active')) {
            $service->is_active = $request->boolean('is_active');
        }

        $service->save();

        return response()->json([
            'success' => true,
            'message' => 'Service updated successfully.',
            'data' => $service,
        ]);
    }

    public function destroy($id)
    {
        $service = Service::findOrFail($id);

        if (Schema::hasColumn('services', 'is_active')) {
            $service->is_active = false;
            $service->save();

            return response()->json([
                'success' => true,
                'message' => 'Service deactivated successfully.',
            ]);
        }

        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service deleted successfully.',
        ]);
    }
}